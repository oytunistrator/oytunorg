---
title: "Turning an Old PC into a QuantumEmulator"
layout: post
comments: true
toc: true
permalink: "/p/:title/"
categories:
- Programming
- Development
- Engineering
- Quantum Computing
- Open Source
tags:
- quantum-computing
- quantum-simulator
- quantum-emulator
- qiskit
- cirq
- pennylane
- python
- linux
---

Quantum computing usually enters the conversation through expensive hardware,
cryogenic systems, cloud accounts, and processor roadmaps. All of that is
interesting, but it is not where I wanted to start. Before sending a circuit to
a real quantum processor, I want to know what it is supposed to do, what the
measurements look like, and how quickly the result falls apart when noise is
introduced.

An ordinary computer is enough for that first round of questions.

I recently gave one of my old machines a second job. It has a Xeon E5620, 24 GB
of RAM, a 128 GB SSD, and an NVIDIA GT 1030. It was never a modern
workstation, and it is certainly not a quantum computer. Still, it is perfectly
usable for small experiments, so I turned it into what I call my
**QuantumEmulator**.

The name is deliberately a little ambitious. The machine is a local test bench
for circuits, noise models, package experiments, and performance limits. It is
not a replacement for quantum hardware.

That distinction matters. A quantum simulator is classical software that
calculates the evolution of a quantum circuit. It does not create
a physical superposition in the host computer's memory. It represents the
mathematics of qubits using vectors, matrices, decision diagrams, tensor
networks, or other classical data structures.

The word “simulator” covers more than one kind of tool. It can mean a circuit
engine, a teaching application, a compiler backend, or a package for general
quantum-physics calculations. I am interested in three practical questions:
**what does the simulator represent, what does it cost, and when is it the
right tool?**

## Simulator, emulator, and quantum hardware are different things

The words are sometimes used interchangeably, but they describe different
levels of a stack.

| Layer | What it does | Typical use |
| --- | --- | --- |
| Circuit simulator | Calculates an ideal or noisy circuit on a classical computer | Algorithm development and testing |
| Quantum emulator | Presents a hardware-like interface backed by a classical simulator | Pipeline testing before real hardware |
| Cloud simulator backend | Runs simulation on someone else's classical infrastructure | Larger experiments without local hardware |
| Quantum processor | Executes gates on physical qubits | Hardware experiments |

For example, Cirq provides a `Simulator` for local circuit simulation and also
describes a Quantum Virtual Machine that exposes a hardware-like interface and
noise models. The virtual machine is still classical software; its value is
that the application workflow can be tested before it is sent to a processor.
See the [Cirq simulation documentation](https://quantumai.google/cirq/simulate)
and the [Cirq Quantum Virtual Machine guide](https://quantumai.google/cirq/simulate/quantum_virtual_machine).

My QuantumEmulator is in the same practical category. It is a named setup, not
a new physical device and not a claim that an old Xeon has become a quantum
computer.

## The first engineering limit is memory

The simplest general-purpose method is state-vector simulation. An `n`-qubit
pure state has (2^n) complex amplitudes. If each amplitude is stored as a
double-precision complex number, a rough memory estimate is:

```text
memory ≈ 16 × 2^n bytes
```

That grows quickly:

| Qubits | Approximate state-vector memory |
| ---: | ---: |
| 20 | 16 MB |
| 25 | 512 MB |
| 30 | 16 GB |
| 35 | 512 GB |
| 40 | 16 TB |

These are only storage estimates. The simulator also needs working memory,
temporary buffers, circuit data, and time to apply gates. A density matrix is
more expensive again because it represents (2^n \times 2^n) elements. This is
why “how many qubits can it simulate?” is not a meaningful question without
also specifying the circuit, representation, precision, noise model, and
available RAM.

This is the first lesson my old computer keeps giving me: do not begin by
chasing a large qubit number. Begin with circuits small enough to inspect and
verify. A transparent five-qubit experiment is more useful than a mysterious
benchmark with a larger number attached to it.

## Preparing the QuantumEmulator on Linux

I use a separate Python environment so that quantum packages do not interfere
with unrelated projects. On a Debian- or Ubuntu-based system:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip build-essential

python3 -m venv ~/venvs/quantum-emulator
source ~/venvs/quantum-emulator/bin/activate

python -m pip install --upgrade pip wheel
```

For the first local setup, I install three different styles of tooling. I keep
the Python packages in the virtual environment and the native projects under a
separate source directory. That makes it clear which files came from PyPI and
which ones came directly from a project's Git repository.

```bash
python -m pip install qiskit qiskit-aer
python -m pip install cirq qsimcirq
python -m pip install pennylane

mkdir -p ~/src/quantum-emulator
cd ~/src/quantum-emulator
```

The exact dependency versions will change over time, so a repeatable project
should record them after installation:

```bash
python -m pip freeze > quantum-emulator-requirements.txt
```

The provenance is intentionally simple:

| Component | Installation source | Why it is in the QuantumEmulator |
| --- | --- | --- |
| Qiskit Aer | PyPI package `qiskit-aer` | General circuits, noise models, and backend-style execution |
| Cirq | PyPI package `cirq` | Circuit construction and Google-style simulation workflows |
| qsim | PyPI package `qsimcirq` | Faster C++ state-vector simulation through Cirq |
| PennyLane | PyPI package `pennylane` | Differentiable circuits and hybrid optimization |
| QuEST | [Source repository](https://github.com/QuEST-Kit/QuEST) | Native C simulation and a small C API |
| Quantum++ | [Source repository](https://github.com/vsoftco/qpp) | Header-only C++ experiments |
| MQT DDSIM | [Source repository](https://github.com/cda-tum/mqt-ddsim) | Decision-diagram-based simulation and analysis |
| Quirk | [Browser application](https://algassert.com/quirk) | Fast visual experiments without a local installation |

The Python packages come from the Python Package Index through `pip`. The
native projects are pulled from their public repositories because their main
value is the source and the C++ interface, not only a prebuilt command. I do
not mix all of these into one production environment; they are comparison
points for the same small circuits.

### Building a native simulator from source

The Python backends are convenient, but I also wanted to see what a native
simulator feels like. QuEST is a good first example because its API is small
and its implementation is close to the concepts being measured.

```bash
cd ~/src/quantum-emulator
git clone https://github.com/QuEST-Kit/QuEST.git
cd QuEST
cmake -S . -B build
cmake --build build --parallel "$(nproc)"
```

The exact build options can change, so I check the repository's current
`README` and CMake configuration before adding GPU or MPI support. On an old
machine, the conservative CPU build is a useful baseline. It tells me what the
hardware can do without introducing CUDA, driver, or distributed-runtime
variables.

For a header-only C++ experiment with Quantum++, the setup is smaller:

```bash
cd ~/src/quantum-emulator
git clone https://github.com/vsoftco/qpp.git quantum-plus-plus
sudo apt install -y libeigen3-dev libomp-dev
```

The repository can then be included from a small C++ program. A minimal
`bell.cpp` looks like this:

```cpp
#include <iostream>
#include "qpp.h"

int main() {
    using namespace qpp;

    ket psi = mket({0, 0});
    psi = gt.H * psi;
    psi = gt.CNOT * psi;

    std::cout << disp(psi) << '\\n';
    return 0;
}
```

Compile it by pointing the compiler at the cloned headers and Eigen:

```bash
g++ -std=c++17 -O2 \\
  -I "$HOME/src/quantum-emulator/quantum-plus-plus" \\
  -I /usr/include/eigen3 \\
  bell.cpp -o bell
./bell
```

The point of this example is not that C++ is automatically faster. The point
is that the simulator becomes easier to inspect. I can see where the state is
allocated, which operations are matrix multiplications, and when the code
starts consuming more memory than the old machine can comfortably provide.

### Installing the decision-diagram route

The dense state-vector model is not the only option. For circuits with useful
repetition or structure, a decision-diagram simulator can use a more compact
representation. MQT DDSIM is a practical project to try in this category.

```bash
cd ~/src/quantum-emulator
git clone https://github.com/cda-tum/mqt-ddsim.git
cd mqt-ddsim
python -m pip install .
```

After installation, I test it with a small OpenQASM circuit rather than with a
large random circuit. That makes it possible to compare the output against
Qiskit Aer and find an ordering or measurement mistake early. The project
documentation should be used for the current command-line interface because
native quantum tools evolve faster than a blog post.

### A PennyLane example for hybrid experiments

PennyLane is useful when the simulator is not only executing a circuit but also
participating in an optimization loop. This example calculates the expectation
value of a two-qubit Bell state:

```python
import pennylane as qml


device = qml.device("default.qubit", wires=2)


@qml.qnode(device)
def bell_expectation():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))


print(bell_expectation())
```

The expected value should be close to `1.0`. That is a different kind of test
from the Qiskit histogram: it checks an observable rather than a sampled bit
distribution. When I later add a parameter and an optimizer, the same circuit
can become a small variational experiment without changing the machine.

Qiskit Aer is a high-performance simulator package with ideal and noisy
execution modes. Its `AerSimulator` supports methods such as state vector,
density matrix, stabilizer, unitary, and matrix-product-state simulation,
depending on the circuit and configuration. The [Aer documentation](https://qiskit.github.io/qiskit-aer/)
and its [simulator API reference](https://qiskit.github.io/qiskit-aer/stubs/qiskit_aer.AerSimulator.html)
are the right places to check current options.

Cirq includes Python simulators for pure-state and mixed-state circuits. For
larger state-vector workloads, Google's qsim project provides a C++ simulator
with gate fusion, vectorization, and multithreading. The [Cirq simulator guide](https://quantumai.google/cirq/simulate/simulation)
explains the built-in options, while the [qsim documentation](https://quantumai.google/qsim)
describes the performance-oriented backend.

PennyLane is useful when the circuit is part of an optimization or machine
learning workflow. Its built-in devices include `default.qubit`,
`default.mixed`, `lightning.qubit`, Clifford, and tensor-network simulators.
The [PennyLane device documentation](https://docs.pennylane.ai/en/stable/introduction/circuits.html)
lists the current device model and installation details.

## A first circuit with Qiskit Aer

The smallest useful test is a Bell state. A Hadamard gate creates a
superposition on the first qubit; a controlled-NOT correlates the second
qubit with it. Measuring the circuit should produce mostly `00` and `11`.

Create `bell.py`:

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


circuit = QuantumCircuit(2, 2)
circuit.h(0)
circuit.cx(0, 1)
circuit.measure([0, 1], [0, 1])

simulator = AerSimulator(method="statevector")
result = simulator.run(circuit, shots=1_000, seed_simulator=42).result()

print(result.get_counts())
```

Run it with:

```bash
python bell.py
```

The exact counts vary slightly because measurement is sampled, but the result
should look similar to:

```text
{'00': 493, '11': 507}
```

This is a good first test because it checks installation, gate application,
measurement, sampling, and reproducibility through a seed. It also catches a
mistake I see often in introductory examples: treating one output as if it were
the answer. A quantum circuit describes a probability distribution. The shot
count tells us how closely our sample follows it.

## Adding noise instead of pretending hardware is perfect

An ideal state-vector simulator is excellent for debugging. It is not a model
of a real processor. Physical devices have gate errors, readout errors,
decoherence, connectivity restrictions, calibration drift, and finite coherence
times.

Aer can run a circuit with an explicit noise model. A minimal example uses a
depolarizing error on the single- and two-qubit gates:

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error


noise_model = NoiseModel()
one_qubit_error = depolarizing_error(0.01, 1)
two_qubit_error = depolarizing_error(0.03, 2)

noise_model.add_all_qubit_quantum_error(one_qubit_error, ["h"])
noise_model.add_all_qubit_quantum_error(two_qubit_error, ["cx"])

circuit = QuantumCircuit(2, 2)
circuit.h(0)
circuit.cx(0, 1)
circuit.measure([0, 1], [0, 1])

simulator = AerSimulator(noise_model=noise_model)
compiled = transpile(circuit, simulator)
result = simulator.run(compiled, shots=1_000, seed_simulator=42).result()

print(result.get_counts())
```

This is not a calibration-accurate model of a particular quantum processor.
It is a controlled experiment: as the error probabilities increase, the Bell
correlation should degrade. Aer also supports creating a basic noise model from
backend properties; see the [Aer noise-model documentation](https://qiskit.github.io/qiskit-aer/apidocs/aer_noise.html).

## The same idea with Cirq and qsim

The Cirq version is deliberately small:

```python
import cirq


q0, q1 = cirq.LineQubit.range(2)
circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key="result"),
)

simulator = cirq.Simulator()
print(simulator.run(circuit, repetitions=1_000, seed=42))
```

Use `simulate()` when debugging the internal state vector. Use `run()` when
you want the simulator to behave more like hardware and return measurement
samples. Cirq documents this difference explicitly in its [basic simulation guide](https://quantumai.google/cirq/start/basics).

If the circuit is state-vector friendly and the built-in simulator becomes too
slow, the qsim backend can often be substituted without changing the circuit:

```python
import qsimcirq

qsim_simulator = qsimcirq.QSimSimulator()
print(qsim_simulator.run(circuit, repetitions=1_000, seed=42))
```

The backend is still limited by classical memory. qsim's own documentation
notes that available RAM becomes the practical constraint as the number of
qubits grows.

## A wider map of quantum simulator projects

The ecosystem is much larger than the three Python installations above. Some
projects are complete simulation engines; others are compilers, circuit
editors, research libraries, or teaching tools. They should not all be judged
by the same benchmark.

### High-performance and systems-oriented tools

- [Intel Quantum Simulator](https://github.com/intel/intel-qs), formerly
  associated with qHiPSTER, is designed around full-state simulation on
  multicore and distributed systems. MPI is important here because the state
  can be divided between several machines.
- [QuEST](https://quest.qtechtheory.org/) is a C-based toolkit for state-vector
  and density-matrix simulation. It is a good candidate when Python overhead is
  not wanted and the same circuit needs to move from a laptop to a cluster.
- [Qrack](https://vm6502q.readthedocs.io/) is a C++ gate simulator intended to
  be embedded in other applications. Its integrations with Qiskit, ProjectQ,
  SimulaQron, and PennyLane make it interesting as a backend rather than only
  as a standalone program.
- [Quantum++](https://github.com/vsoftco/qpp) is a header-only C++17 library
  using Eigen and optional OpenMP. It is a compact choice for developers who
  want to inspect the data structures and build their own experiment around a
  small dependency surface.
- [QuIDDPro](https://vlsicad.eecs.umich.edu/BK/QuIDDPro/) and
  [QDD](https://thegreves.com/qdd/) explore decision-diagram representations.
  They can compress repeated structure that would be wasteful in a dense
  matrix, although the worst-case complexity does not disappear.
- [MQT DDSIM](https://github.com/cda-tum/mqt-ddsim) is another decision-diagram
  simulator, developed as part of the Munich Quantum Toolkit. It is especially
  relevant when simulation is part of circuit analysis and verification.

### Compilers, languages, and circuit transformation

- [staq](https://github.com/softwareQinc/staq) works directly with OpenQASM
  syntax trees. That makes it useful for source-to-source transformations,
  gate rewriting, and circuit compilation without throwing away the original
  program structure.
- [Scaffold/ScaffCC](https://github.com/epiqc/ScaffCC) treats quantum software
  as a compilation problem. Its toolchain can lower programs, schedule them,
  and expose resource estimates such as time and area.
- [QCL](https://tph.tuwien.ac.at/~oemer/qcl.html) approaches quantum
  programming as a high-level language problem, with syntax closer to
  conventional procedural languages than to a purely mathematical notebook.
- [Qubiter](https://github.com/artiste-qb-net/qubiter) focuses on decomposing
  unitary operations into elementary gates and examining the resulting circuit.
- [LIQUi|>](https://www.microsoft.com/en-us/research/project/liqui/) combines a
  language, compiler passes, scheduling, and simulation in one research
  environment. It is a useful example of how a simulator can sit inside a
  larger software architecture.
- [Quantomatic](https://quantomatic.github.io/) takes a different route: it is
  a diagrammatic reasoning and rewriting environment, useful when circuit
  equivalence matters as much as execution.

### Visual and browser-based tools

- [Quantum Programming Studio](https://quantum-circuit.com/) provides a visual
  circuit editor and export paths to several quantum frameworks. It is useful
  for checking an idea before writing a full implementation.
- [Qubit Workbench](https://elyah.io/) and [QCAD](https://qcad.osdn.jp/) are
  GUI-oriented environments for building circuits and observing state changes.
- [Quantum Computer Emulator](https://www.compphys.org/quantum-computer-emulator/)
  focuses on hardware-style emulation and experimental conditions rather than
  only displaying an ideal state vector.
- [Quantum Fog](https://www.ar-tiste.com/quantum-fog.html), [SimQubit](https://sourceforge.net/projects/simqubit/),
  [Q-Kit](https://sites.google.com/site/qkitproject/), and
  [jQuantum](https://jquantum.sourceforge.net/) are useful examples of GUI or
  teaching-oriented projects. They are valuable for visual reasoning even when
  they are not the right choice for a large benchmark.
- [Quirk](https://algassert.com/quirk) runs in a browser and requires no local
  installation. I would use it to understand a small circuit, then move the
  same experiment into Qiskit, Cirq, or another programmable backend.
- [quantum-circuit](https://github.com/Qiskit/quantum-circuit) and
  [jsqis](https://github.com/quantastica/quantum-circuit) represent the
  JavaScript side of the ecosystem. They are useful when the circuit editor or
  visualisation needs to live inside a web application.

### Domain-specific and language-specific packages

- [libquantum](https://www.libquantum.de/) is a C library that covers quantum
  registers as well as time evolution under Hamiltonians. It is closer to a
  small numerical foundation than a modern cloud SDK.
- [QWalk](https://www.cos.ufrj.br/~jpaulo/qwalk/) and
  [sqct](https://github.com/quantumlib/sqct) focus on narrower problems: quantum
  walks and single-qubit circuit synthesis respectively. A specialised tool
  can be a better engineering choice than a general framework when the problem
  already has a clear shape.
- Julia users can look at [QSWalk.jl](https://github.com/QuantumBFS/QSWalk.jl),
  [QuantumOptics.jl](https://qojulia.org/),
  [QuantumWalk.jl](https://github.com/QuantumBFS/QuantumWalk.jl), and
  [Yao.jl](https://github.com/QuantumBFS/Yao.jl). These cover stochastic walks,
  open quantum systems, spatial-walk models, and general quantum programming.
- The Mathematica, MATLAB, and Octave ecosystem includes
  [QuantumUtils](https://github.com/QuantumUtils/QuantumUtils),
  [QETLAB](https://qetlab.com/), [QLib](https://www.tau.ac.il/~quantum/qlib/),
  and [QUBIT4MATLAB](https://bird.szfki.kfki.hu/~toth/quantum/). These are often
  a good fit for symbolic work, entanglement tests, matrix calculations, and
  research notebooks.
- [Quantum.NET](https://github.com/quantum-circuit/quantum-circuit) is a small
  .NET-oriented example of the same idea: expose qubits and gates through the
  host language instead of forcing every experiment into Python.

This list is not a recommendation to install everything. In fact, installing
everything would make the QuantumEmulator harder to maintain. The point is to
show that “quantum simulator” describes several engineering roles. I would
start with one general-purpose backend, one alternative representation, and
one visual tool. That is enough to compare results without turning the machine
into a dependency museum.

## Where other simulator families fit

There is no single “best” simulator. The internal representation should follow
the experiment.

**State-vector simulators** are the general-purpose default. They are easy to
understand and work well for small and medium ideal circuits, but their memory
cost grows exponentially with the number of qubits.

**Density-matrix simulators** are useful when mixed states and general noise
must be represented directly. The price is a much larger state representation.

**Stabilizer simulators** can be extremely efficient for circuits dominated by
Clifford operations. They are not a universal replacement for a state-vector
simulator, but they are excellent for error-correction experiments and large
structured circuits.

**Decision-diagram simulators** compress repeated structure in the quantum
state or circuit. MQT DDSIM is a current example of a simulator based on
decision diagrams; the [MQT handbook](https://mqt.readthedocs.io/en/latest/)
describes its role in the Munich Quantum Toolkit.

**Tensor-network simulators** exploit limited entanglement or favourable
circuit geometry. They can handle some circuits that are difficult for a dense
state vector, but their performance depends heavily on topology and
entanglement rather than qubit count alone.

**Teaching and visual tools** such as [Quirk](https://algassert.com/quirk)
are valuable for understanding gates and measurement. They are not intended to
replace a performance-oriented backend, and that is perfectly fine. A tool
does not need to scale to be useful.

## How I benchmark the old machine

I do not use one headline number for the QuantumEmulator. When I compare two
runs, I write down the things that can actually explain the difference:

1. Circuit width and depth.
2. Simulator method and numeric precision.
3. Number of shots.
4. Peak resident memory.
5. Wall-clock execution time.
6. Whether the result is ideal or noisy.
7. Whether the output was checked against a second simulator.

For a reproducible local test, I keep the circuit, package versions, seed, and
hardware details next to the result. A simple Linux measurement looks like
this:

```bash
/usr/bin/time -v python bell.py
```

The output is more informative than “it ran successfully”. It tells me whether
the experiment is CPU-bound, memory-bound, or spending most of its time in
Python overhead. On an old machine, that distinction matters. A smaller
optimized circuit can be more useful than a larger circuit that causes the
system to swap.

## The limit of the QuantumEmulator

The QuantumEmulator is a development environment, not evidence of quantum
advantage. It can validate circuit logic, compare algorithms, explore noise,
teach the mechanics of gates, and prepare code for a hardware backend. It
cannot reproduce every property of a physical processor unless the physical
device model is known and implemented correctly.

That is why I prefer to describe it plainly: an old classical computer running
quantum software. The name is a reminder of what the machine is for, not an
attempt to make the hardware sound more powerful than it is.

The next step after local testing is usually a backend interface, not a bigger
marketing number. If the circuit survives ideal simulation, noisy simulation,
resource checks, and cross-validation, it is ready for a more realistic target.
That target may be another local simulator, a distributed simulator, or a real
quantum processor.

## Final thoughts

The most useful thing about quantum simulators is not that they let us pretend
to own a quantum computer. It is that they make the assumptions visible.

We can see the state representation. We can measure memory growth. We can
inject errors deliberately. We can compare an ideal circuit with a noisy one.
We can learn exactly where a classical machine stops being practical.

That is enough reason to reuse an old computer for the job. My Xeon system is
not going to compete with a quantum-computing laboratory. It does not need to.
It is a quiet, local place to ask better questions, break a circuit, change a
noise parameter, and run the experiment again. For me, that is what turning an
old PC into a QuantumEmulator really means.

## References and further reading

- [Qiskit Aer documentation](https://qiskit.github.io/qiskit-aer/)
- [AerSimulator API reference](https://qiskit.github.io/qiskit-aer/stubs/qiskit_aer.AerSimulator.html)
- [Aer noise models](https://qiskit.github.io/qiskit-aer/apidocs/aer_noise.html)
- [Cirq simulation documentation](https://quantumai.google/cirq/simulate/simulation)
- [Cirq Quantum Virtual Machine](https://quantumai.google/cirq/simulate/quantum_virtual_machine)
- [Google qsim](https://quantumai.google/qsim)
- [Quantum Studio](http://www.quantum-studio.net/)
- [PennyLane circuit and device documentation](https://docs.pennylane.ai/en/stable/introduction/circuits.html)
- [Munich Quantum Toolkit handbook](https://mqt.readthedocs.io/en/latest/)
- [Quirk browser-based circuit simulator](https://algassert.com/quirk)
