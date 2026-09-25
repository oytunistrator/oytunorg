---
title: "Quantum and Time: Thinking in Trajectories Rather Than Snapshots"
layout: post
comments: true
toc: true
permalink: "/p/:title/"
categories:
- Quantum Computing
- Physics
- Engineering
- Science
tags:
- quantum-computing
- qubit
- quantum-mechanics
- time-evolution
- bloch-sphere
- quantum-measurement
- quantum-tunnelling
- quantum-simulation
---

Quantum computing is often introduced with a compact sentence: a qubit can be
`0`, `1`, or a superposition of both. That sentence is useful, but it can also
make a qubit sound like a number that is waiting to choose its final value.

I want to look at the same subject from a different angle: **a qubit is not
only a value; it is a state moving through time**. The value we eventually
read is one observation of that state, taken in a chosen measurement basis.

This article is the conceptual companion to [Turning an Old PC into a
QuantumEmulator](https://oytun.org/p/turning-an-old-pc-into-a-quantumemulator/),
which approaches quantum computing from the practical side of classical
simulation.

This is not a replacement for quantum mechanics. It is a conceptual and
engineering model for asking better questions about the relationship between
quantum state, motion, interruption, measurement, and time.

## A necessary correction: qubit, not “quantum number”

The standard term is **qubit**, short for *quantum bit*. A physical qubit may
be encoded in an ion, an electron spin, a superconducting circuit, a photon,
or another quantum system. In an ion-trap implementation, for example, two
internal energy levels can serve as the computational basis states
`|0⟩` and `|1⟩`.

That does not mean that an ion contains an ordinary integer such as `10`.
There are several different things that can be called a “value” in an
experiment:

| Symbol | Engineering meaning |
| --- | --- |
| `Q` | The prepared quantum state or the input data encoded into one or more qubits |
| `U(t)` | The controlled time evolution applied to the state |
| `M` | The measurement basis and measurement operation |
| `Qres` | A classical result produced by the measurement |

If `10` is part of the input, it normally needs to be encoded into a register
of several qubits. A single qubit has two computational-basis outcomes. It can
have continuously varying probability amplitudes, but that is not the same as
storing the classical integer `10` in one qubit.

This distinction is important because it prevents an attractive metaphor from
turning into an incorrect physical claim.

## Superposition is a state, not a spinning coin

An ideal single-qubit pure state can be written as

```text
|ψ⟩ = α|0⟩ + β|1⟩
```

where `α` and `β` are complex amplitudes and

```text
|α|² + |β|² = 1.
```

The probabilities of obtaining `0` or `1` in the computational basis are
`|α|²` and `|β|²`. The amplitudes also contain relative phase information.
That phase is what allows quantum states to interfere; a classical mixture
with the same two probabilities does not behave in the same way.

The Bloch sphere is a useful representation of a single qubit. Up to a global
phase, the state may be parameterised as

```text
|ψ⟩ = cos(θ/2)|0⟩ + exp(iφ) sin(θ/2)|1⟩.
```

Here, `θ` and `φ` identify a point on the sphere. Quantum gates can be
visualised as rotations of that point around the `X`, `Y`, and `Z` axes. This
is the precise part of the “the ion starts moving” intuition. The movement is
not an ion randomly choosing a number in ordinary three-dimensional space. It
is the evolution of a quantum state in its state space.

The [IBM Quantum introduction to superposition and the Bloch sphere](https://quantum.cloud.ibm.com/learning/en/modules/quantum-mechanics/superposition-with-qiskit)
also makes an important distinction: the evolution under ideal gates is
deterministic and reversible, while the result of a measurement is
probabilistic.

## Q input, state evolution, and Qres

The notes that motivated this article can be expressed as a pipeline:

```text
Q input → superposition and controlled evolution → Qres
```

For an engineer, the pipeline becomes more useful when each arrow has a
precise meaning.

### 1. Q input: prepare a state

We begin with an initial state `|ψ(0)⟩`. It may be a basis state, such as
`|0⟩`, or a state prepared by an earlier circuit. For multiple qubits, the
state lives in a larger tensor-product space, so the input may represent an
encoded integer, an image feature, a physical configuration, or an algorithmic
intermediate state.

### 2. Evolution: specify the clock and the control

In a continuous description, a time-dependent Hamiltonian `H(t)` determines
the evolution:

```text
|ψ(t)⟩ = U(t)|ψ(0)⟩
U(t) = T exp(-i/ħ ∫ H(τ)dτ)
```

`T` indicates time ordering when the Hamiltonian at different times does not
commute with itself. In a circuit description, the same idea is represented by
a sequence of gates, each with a duration and an order. The circuit diagram
often hides the physical clock, but the hardware does not: pulses have
durations, qubits have coherence times, and control electronics introduce
latency and error.

### 3. Qres: measure a state

At the end, we do not simply look at the qubit and read the number that was
already there. We choose an observable or measurement basis. In the usual
computational basis, the measurement produces `0` or `1` with probabilities
given by the state amplitudes. Repeating the same experiment many times gives
an empirical distribution.

The result is therefore better described as

```text
Qres = measurement(state at time t, chosen basis)
```

It is not generally a deterministic function such as `10! % 8`. A factorial
or modulo result can certainly be computed by a quantum circuit, but only if a
particular circuit encodes that arithmetic. It does not arise merely because
a qubit has rotated eight times.

## A one-qubit time-evolution example

Consider a qubit prepared in `|0⟩`. Apply a continuous rotation generated by a
Hamiltonian proportional to the Pauli `Y` operator:

```text
H = (ħΩ/2) σᵧ
```

After a time `t`, the state is

```text
|ψ(t)⟩ = cos(Ωt/2)|0⟩ + sin(Ωt/2)|1⟩.
```

If we measure in the computational basis, the probability of observing `1`
is

```text
P(1 at t) = sin²(Ωt/2).
```

This gives the “rotation until a limit” idea a testable form. The limit is not
an arbitrary integer that forces the state to return a remainder. It is a
physical or algorithmic condition: a target angle, a target probability, a
maximum pulse duration, a decoherence budget, or a measurement time.

For example, if the goal is to maximise the probability of `1`, we can choose
the first time near `Ωt = π`. If the goal is to estimate `Ω`, we can sample at
several known times and fit the observed probabilities. The clock is now part
of the experiment rather than an invisible detail.

This also explains why one isolated run does not reveal the full trajectory.
Measurement returns one outcome. To reconstruct the trajectory, we prepare
many equivalent systems, measure them at controlled times, and estimate the
state through repeated observations.

## What does an interruption do?

“Stopping” a quantum process can mean several different operations, and they
must not be conflated:

1. **Pause the control sequence.** The external drive is disabled, but the
   system may still evolve under its natural Hamiltonian.
2. **Measure the system.** The measurement changes the state and produces a
   classical record.
3. **Reset the system.** The state is deliberately brought back to a known
   state, usually with an irreversible interaction with the environment.
4. **Apply feedback.** A measurement result is used to select a later control
   operation.
5. **Introduce noise or loss.** The environment changes the state without
   giving us a useful classical result.

In other words, an interruption is not automatically a harmless checkpoint.
It is an interaction. In a real device, the detector, control pulse, trap, and
environment all become part of the experiment.

Repeated measurement can even change the transition dynamics. Under suitable
conditions, frequent measurements can suppress transitions, a phenomenon
known as the quantum Zeno effect. More general measurements can produce richer
“Zeno dynamics” inside a projected subspace. This is close to the intuition
that an observation can keep a system on one family of trajectories, but it
does not mean that a human preference selects whichever result is desired.

For a mathematical discussion, see [Quantum Zeno dynamics: mathematical and
physical aspects](https://arxiv.org/abs/0903.3297). The experimental details
depend on the measurement model, coupling, and time scale.

## Tunnelling is a physical coupling, not a route switch

The word “tunnelling” is useful in the original intuition, but it needs a
physical interpretation. Quantum tunnelling occurs when a wavefunction has a
non-zero amplitude to cross a classically forbidden potential barrier. A
common engineering model is a particle or excitation coupled between two
potential wells:

```text
|L⟩ ↔ |R⟩
```

The coupling between the wells determines the transition rate and the
resulting interference. Changing the barrier height, the energy offset, or the
coupling changes the probability of finding the system in either well.

For a trapped-ion experiment, the “position” can refer to a motional state,
while the qubit may be encoded in internal energy levels. Those are related
degrees of freedom, but they are not automatically the same thing. Moving an
ion through a trap is not automatically moving a logical qubit through a
quantum circuit.

There are real experiments in which tunnelling dynamics of ions or atoms are
controlled and measured. For example, [a trapped-ion quantum tunnelling rotor
experiment](https://www.nature.com/articles/ncomms4868) describes tunnelling
between configurations of an ion structure in an effective multi-well
potential. The experiment works because the potential, confinement, cooling,
and measurement procedure are specified—not because a state is assigned to an
arbitrary new tunnel after an unwanted rotation.

The engineering translation of “move the ion into another tunnel” is therefore:

```text
change H(t) or the coupling → evolve for a controlled interval → measure
```

That is a powerful operation, but it is constrained by the Hamiltonian and the
hardware. It cannot be used to guarantee any desired answer without paying the
cost in control energy, time, noise, and measurement statistics.

## Why the classical computer comparison is useful

A classical program normally has explicit state, explicit instructions, and a
clock provided by the processor. If we write:

```text
limit = 8
input = 10
```

we can define exactly what `10` means, count iterations, stop at `8`, and
return a deterministic value unless the program includes randomness.

A quantum experiment needs the same discipline, but the state is not just a
register containing an integer. A useful specification includes at least:

| Question | Quantum implementation |
| --- | --- |
| What is the input? | Initial state, encoded register, or density matrix |
| What moves it? | Hamiltonian, pulse sequence, or gate circuit |
| What is the time scale? | Pulse durations, delays, clock reference, coherence time |
| What is an interruption? | Measurement, reset, feedback, or environmental interaction |
| What is the output? | Observable, measurement basis, samples, and error bars |
| How is correctness checked? | Calibration, repeated shots, simulation, and comparison with a model |

Without these definitions, a statement such as “the qubit keeps rotating until
it reaches the right result” is an interesting metaphor but not yet an
algorithm. To turn it into an algorithm, we need a target observable, a
controlled evolution, a stopping or measurement rule, and a way to distinguish
success from statistical fluctuation.

## A more precise version of the proposed model

The original idea can be retained as a state-machine-like abstraction:

```text
Q      = prepared quantum state
SP     = coherent superposition and phase evolution
T      = physical time and control schedule
I      = an interruption or measurement channel
Qres   = classical measurement record
```

Then a single run can be represented as:

```text
Qres ~ Measure(I[U(T) Q])
```

The symbol `~` is intentional. It says that the result is sampled according to
the quantum state and the measurement rule. If we repeat the run, we obtain a
distribution rather than a list of unrelated numbers. Those numbers may look
unrelated in a single shot, but their frequencies can reveal amplitudes,
phases, expectation values, and correlations.

This model also gives “time” a concrete role. Time is not merely the number of
loops performed by a processor. It is the parameter that orders interactions
and changes the state through the system's Hamiltonian. A classical computer
can simulate this time evolution with discrete steps, but the simulation's
step counter is not automatically physical time. To map one to the other, we
must define the system's frequency, pulse calibration, sampling interval, and
error model.

## The alternative view: absence is not the same as non-existence

There is a philosophical insight behind the original notes that is worth
keeping, provided it is stated carefully:

> Not seeing a state in a particular measurement is not the same as proving
> that the state had no physical description before the measurement.

Quantum mechanics does not allow us to replace evidence with desire. A state
that is not observed in one basis may have a non-zero amplitude in another
basis, or it may have been destroyed by decoherence, reset, or measurement.
The correct response is to change the experimental question, choose an
appropriate basis, repeat the preparation, and compare the observations with a
model.

That is the useful meaning of “lifting the curtain”. We do not see reality by
wanting a particular result. We see more of it by designing a measurement that
can distinguish competing explanations.

## Conclusion: follow the trajectory, then trust the measurement

The most productive way to connect quantum mechanics and time is to stop
thinking of the qubit as a hidden classical number waiting to be revealed.
Think of it as a state with amplitudes and phases, evolving under a controlled
physical law. Gates and fields change the trajectory. Measurements interrupt
it and create classical records. Tunnelling is a consequence of coupling and
potential structure. Time determines how long the system has to evolve, how
much control can be applied, and how much noise can accumulate.

The alternative perspective is still valuable: reality may contain structure
that a particular observation does not expose. But the scientific version of
that idea ends with a question, not a conclusion:

**What measurement, at what time, in what basis, would allow us to tell the
difference?**

That question turns an imaginative picture of a rotating ion into something an
engineer can model, an experimentalist can test, and a reader can reproduce.

## In Summary (An Alternative Perspective)

> Saying that something is not there does not prove that it is not there. It
> may only mean that we do not want to see it there. Yet it continues to turn
> there, in its own time. Because we do not want it, we may never see what is
> there. When we choose to, the energy curtain between us parts, and the
> wavelength begins to reflect back to us.
>
> Therefore, lift the curtain before your eyes. Look at reality from the other
> side as well. Then you will see the truth.
