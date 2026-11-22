---
slug: multi-vendor-mapping-eval
title: "Can a small local LLM map vendors we don't own?"
description: We generated Cisco and Nokia telemetry from their published YANG models and tested whether qwen3:8b could map it to OpenConfig.
authors: [nathan]
tags: [pipeline, mapping-llm, evaluation]
date: 2026-11-19
---

*Work from 2026-11-17 to 2026-11-19, on the telemetry pipeline's mapping LLM.*

## The problem

Our pipeline collects telemetry from network switches and translates it into
one shared model, [OpenConfig](https://openconfig.net/), so everything
downstream (the dashboard, history, anomaly detection) only has to understand
one schema. Every vendor names things its own way. A Cisco switch reports
`in-discards-64`, Nokia's SR Linux reports `statistics/in-discarded-packets`,
and OpenConfig calls both `in-discards`.

The translation is a **mapping**: a small declarative file that says "this
vendor field is that OpenConfig leaf, as this type". Writing mappings by hand
for every vendor and every data source doesn't scale, so a small local LLM
*proposes* one the first time the pipeline sees a new schema. A person reviews
and approves it, and from then on translating is a plain lookup. The LLM is
never on the hot path.

We've only tested this on SONiC switches, which we run as simulated switches
in containers. The whole point is multi-vendor support, though, and we don't
own any Cisco or Nokia hardware. So how do we know the LLM works for vendors
we can't plug in?

<!-- truncate -->

## Synthetic data from the vendors' own YANG

Vendors publish their data models as YANG files: Cisco's are in
[YangModels/yang](https://github.com/YangModels/yang), and Nokia's SR Linux
models are in
[nokia/srlinux-yang-models](https://github.com/nokia/srlinux-yang-models).
Those files have everything that matters for mapping: field names, nesting,
types, list keys and enum values.

So we wrote a generator, `pipeline.synth`. It reads a vendor's YANG and emits
raw telemetry records in exactly the shape our collector would publish. The
names, nesting, types and enums are real, and the values are made up. Values
are drawn independently, so "errors" can exceed "packets". That's fine,
because mapping is about names, types and structure, not about whether the
numbers add up.

## Eight test cases, each with a trap

Each eval case is a set of raw records plus an **answer key**: the mapping a
careful reviewer would approve. Each one is built around something a model
could plausibly get wrong.

| Case | Vendor | Data | The trap |
|---|---|---|---|
| port counters | SONiC | captured from our lab | 41 counters, half with no OpenConfig home |
| port state | SONiC | captured | a speed in Mb/s that must become an enum |
| interface stats | Cisco IOS XE | hand-built | wrapping 32-bit counters next to their 64-bit twins |
| CPU | Cisco IOS XE | hand-built | a whole-system figure, where OpenConfig wants `cpu[index=ALL]` |
| memory | Cisco IOS XE | generated | "free" sounds like OpenConfig's "available", but "available" means *installed* |
| LLDP neighbors | Cisco IOS XE | generated | a list inside a list, flag-style fields, Cisco's own enums |
| environment sensors | Cisco IOS XE | generated | one table holds temperatures, voltages and power, with units per row |
| interface stats | Nokia SR Linux | generated, **held out** | different naming (`-packets`), and a counter that shares OpenConfig's name but not its meaning |

The SR Linux case is **held out**. We never change the prompt or the code to
improve its score. It's our evidence that a fix made for the other cases
generalizes to a vendor nobody tuned for.

### Who wrote the answer keys?

Answer keys are never written by the model under test. That would be grading
its own homework. None of us knew Cisco's or Nokia's YANG well enough to write
the four new keys, so Claude (Anthropic's model, a different model from the
one being tested) drafted them. Then, as a second pass, Claude checked them
line by line against the source YANG at the exact versions the data came from.

That check was worth doing. One claim we doubted, that SR Linux's interface
`oper-state` has only `up`, `down` and `testing`, turned out to be right: a
second `oper-state` with 13 values exists in SR Linux's common types, but it
belongs to other objects. Every factual claim held up. The judgment calls are
written as comments in each key so they can be argued with.

Still, **no person has reviewed these four keys**, and the scores below should
be read that way.

## How we score

The model under test is **qwen3:8b**, a 4-bit model served by Ollama on a
laptop GPU (RTX 4070, 8 GB). The model never writes the mapping itself. It
answers small multiple-choice questions, and our code assembles the mapping
from the answers:

1. Which OpenConfig containers do these fields belong in?
2. For each leaf in each container, which field holds it, or none?
3. A field claimed by two leaves: which one is it?
4. For enums: which OpenConfig value is each raw value?

Each answer is constrained by a JSON schema that lists the only legal choices,
so the model can't invent a path that doesn't exist. Each case runs 3 times
and is scored per raw field: precision (of what it mapped, how much was right),
recall (of what the key maps, how much it found) and F1.

## Baseline results

| Case | Passed checker | Precision | Recall | F1 | Sec/run |
|---|---|---|---|---|---|
| IOS XE memory | 3/3 | 1.00 | 1.00 | **1.00** | 18 |
| IOS XE LLDP neighbors | 3/3 | 1.00 | 1.00 | **1.00** | 14 |
| SR Linux interfaces (held out) | 3/3 | 1.00 | 1.00 | **1.00** | 55 |
| IOS XE environment | 3/3 | 0.33 | 1.00 | **0.50** | 27 |
| IOS XE CPU | 2/3 | 1.00 | 0.83 | **0.89** | 6 |

(The other three cases didn't finish in this run. See "Lessons from the
laptop" below.)

**The good news is better than we expected.** On the SR Linux case, a vendor
nobody tuned for, qwen3:8b got all 22 mapped fields and both enums right, in
every run. It didn't fall for the memory trap. It handled LLDP's nested lists
and all of Cisco's chassis-ID and port-ID enum types.

**Two failures, and they're instructive.**

**Environment sensors: millivolts reported as degrees.** In all three runs the
model mapped the sensor `reading` to OpenConfig's `temperature/instant`. But
that table mixes temperature, voltage and power sensors, and the units are
right there in the samples it was shown (`celsius`, `millivolts`, `watts`).
Approve that mapping, and a 1007 mV voltage rail shows up on the dashboard as
1007 °C. Worse, the mapping passes our checker, because every value is a
valid number. This is exactly the failure a reviewer must catch, and exactly
the one a tired reviewer wouldn't.

**CPU: the wrong CPU.** IOS XE reports one CPU figure for the whole system.
OpenConfig says that belongs at `cpu[index=ALL]`. The model was offered both
`ALL` and `0` and picked `0`, meaning "CPU core 0", in every run that got that
far. One run instead chose a container that needs a component name, and this
record has no keys at all, so nothing could ever map there. We saw the same
`index=0` mistake back in October, and putting OpenConfig's own description of
`ALL` in the prompt didn't help then either.

## The fixes: let code decide what code can

This is a lesson we keep relearning: **small models follow names, not
instructions.** In October, every model mapped Cisco's wrapping 32-bit
counters instead of their 64-bit twins, even when the prompt said not to.
Writing the rule in code fixed it immediately. So this time we went straight
to code, with three rules that name no vendor:

1. **Only offer containers the record can fill.** If a container's path needs
   a list key (a component's name), and the record has nothing that fits it,
   don't offer that container. This removes the choice that can never work.
2. **Prefer OpenConfig's own name for "the whole thing".** When a record has
   no key for a list, the old code offered a made-up `0` next to OpenConfig's
   named values. Now `0` is offered only when OpenConfig names nothing. For
   CPUs it names `ALL`, so `ALL` is the only option, and nobody has to ask.
3. **Don't map readings when the units change from row to row.** If a field
   named like a unit (`sensor-units`) has more than one value in the samples,
   no leaf in fixed units (degrees, watts) is offered. The mapping format
   applies a leaf to every row, so it can't say "only for temperature rows".
   Holding the reading back is honest. A missing mapping is easy to add later,
   but a wrong one corrupts data.

### Plugging one hole exposed the next

The first version of rule 3 held back only the leaves that OpenConfig's YANG
gives units, such as `temperature/instant` in degrees Celsius. We re-ran the
eval, and the model, now denied `instant`, took the next number it could find
in the temperature container. It put the sensor's high-major threshold into
`temperature/alarm-threshold`, in every run. That leaf has no `units` in the
YANG, but it's a temperature all the same, so a voltage sensor's threshold
would still have shown up as degrees.

The second version holds back *every* number in a container that measures in
fixed units, not just the leaves that say so. The model is good at finding the
closest-looking slot. Telling it which slots are off-limits only works if
the rule describes what makes a slot wrong, not just the one slot it picked
last time.

The cost: a mixed sensor table's readings now go unmapped rather than mapped
correctly. Fixing that properly needs per-row conditions in the mapping
format ("for rows where units = celsius..."), which is on the list for a
future format version.

## Results after the fixes

Same model, same settings, all 8 cases, 3 runs each:

| Case | Before | After |
|---|---|---|
| IOS XE memory | 1.00 | 1.00 |
| IOS XE LLDP neighbors | 1.00 | 1.00 |
| IOS XE environment | 0.50 | 1.00\* |
| IOS XE CPU | 0.89 | **1.00** |
| IOS XE interface stats | not run | 1.00 |
| SONiC port counters | not run | 0.97 |
| SONiC port state | not run | 1.00 |
| SR Linux interfaces (held out) | 1.00 | **1.00** |

Every run of every case passed the checker except the environment case. The
CPU case now lands on `cpu[index=ALL]` in every run. The held-out SR Linux
case didn't move, which is what we hoped for: none of the three rules made
things worse for the vendor nobody tuned for.

\*The environment score needs an asterisk. The model now maps nothing at all
for that schema: it no longer maps readings wrongly, and it also stopped
mapping the one safe thing (each row is a `SENSOR` component). The answer key
accepts ignoring that field, so the score is a perfect 1.00. The honest
summary is **safe but not useful**. A reviewer gets an empty proposal and a
note that nothing could be mapped, which beats a confident wrong one.

The one remaining miss in SONiC port counters is the same as in October:
a newer SAI counter (`TX_TRIM_PACKETS`) left unmapped.

One side effect we didn't expect: for a record with no keys, like the CPU
one, rule 1 also shrank the first question from about 7,000 tokens to about
1,000, because most of OpenConfig's containers need a key the record can't
supply.

## Lessons from the laptop

Halfway through the first eval run the laptop shut itself off, several times.
It was running a GPU-heavy job on battery: charge fell from 45% to 22% in
about ten minutes. The eval only wrote its results at the very end, so each
shutoff lost the whole run. We now run it one case at a time, saving each
case's results as it finishes, and the run stops between cases if the laptop
is on battery below 15%.

Battery also skews timing. The same memory case, with identical prompts, took
18 seconds per run on battery and 5 seconds plugged in, because a laptop GPU
is throttled on battery. So the speed numbers between our two runs mostly
measure the power cable, not our changes.

## What's still missing

- **Real devices.** Synthetic data has real names and types but made-up
  values. SR Linux ships a free container image, so a live SR Linux switch in
  our lab, with a gNMI collector, is the obvious next step.
- **A person reviewing the generated answer keys.**
- **A bigger model**, if we can get a GPU with more memory. The eval makes
  comparing models a one-flag change.
- **Per-row conditions** in the mapping format, so a mixed sensor table can be
  mapped correctly instead of held back.

---

## Appendix: the details

- **Sources.** Cisco IOS XE models from YangModels/yang at commit `8b2414f`
  (`vendor/cisco/xe/2621`). SR Linux models from nokia/srlinux-yang-models at
  tag `v26.7.2`. OpenConfig from openconfig/public. Each case's `case.yaml`
  records the exact generator command and YANG revision.
- **Generator.** `python3 -m pipeline.synth <yang dir> <module> <path>
  --device ... --key ... --set ... --include ...`. It needs pyang. `--key`
  gives list entries realistic names, `--set` pins a value that matters per
  row (a sensor's units), and `--include`/`--exclude` narrow it to what a
  subscription would return.
- **Model settings.** Ollama 0.40.2, temperature 0, fixed seed, 3 runs per
  case. qwen3 runs with `reasoning_effort: none`: with "thinking" on, each
  answer takes about 30 times longer.
- **What the model sees.** Vendor field names and up to 3 sample values each,
  plus OpenConfig's descriptions. It never sees the vendor's own YANG
  descriptions. That's why mapping SR Linux's `carrier-transitions` to
  OpenConfig's is accepted. SR Linux counts only down-to-up changes, but
  nothing the model is shown says so.
- **Judgment calls in the new keys**, all written as comments in each
  `expected.yaml`:
  - *Memory:* each memory pool becomes a component named after the pool,
    because OpenConfig's system-wide memory isn't a list and three pools would
    overwrite each other there. Ignoring the pools entirely is accepted too.
  - *Environment:* each row is a sensor (`type: SENSOR`), and readings and
    thresholds are ignored because their units depend on the row.
  - *LLDP:* the capability flags are ignored, because the format can't turn a
    YANG "empty" flag into a boolean.
  - *SR Linux:* `admin-state` enable/disable maps to `admin-status` UP/DOWN.
- **Where it lives.** `telemetry-pipeline`: `pipeline/mapper.py` (proposer),
  `pipeline/synth.py` (generator), `eval/cases/` (cases and keys) and
  `docs/mapping.md` (the technical record, including October's findings).
