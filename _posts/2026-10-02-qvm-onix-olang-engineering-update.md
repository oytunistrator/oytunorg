---
title: "Engineering the Boundary Between QVM, OnixOS, and O Language"
layout: post
categories: [Development, QuantumComputing, Linux, OnixOS, OLanguage, OpenSource]
tags: [qvm, quantum-simulation, qcore, qvfile, onixos, buildsystem, olang, compiler, web, open-source]
comments: true
toc: true
---

The recent work across QVM, OnixOS, and O Language has been guided by the same engineering question: where should a responsibility live, and how can the boundary be verified?

QVM is the execution layer for quantum programs. OnixOS is the distribution and release system that packages and publishes the surrounding ecosystem. O Language is the application and systems language that provides a practical development workflow on top of that platform. They are separate projects, but they are increasingly connected through explicit contracts, reproducible artifacts, and observable runtime behavior.

This article summarizes what changed and how the pieces work without turning the project history into a list of individual commits.

## QVM: a state VM for quantum programs

[QVM CLI](https://gitlab.com/oytunistrator/qvm-cli) is a Go-based quantum simulator. Its first implementation is deliberately a CPU reference backend using a state-vector representation. It is not a physical x86 or GPU instruction-set emulator. It executes quantum-machine instructions by applying state-vector kernels on a host device.

The important design decision is the separation between the source description and the execution engine. A QVFile describes machines and jobs. It does not directly produce CPU or GPU instructions. The pipeline is:

```text
QVFile
  -> parse and validate
  -> QVIR intermediate representation
  -> deterministic QCore machine image
  -> isolated State VM instance
  -> CPU or future device provider
```

QVFile is intentionally simple to locate: the canonical input is `./qvfile.qv` in the current directory. A job points to a relative `.qs` program, and validation checks the project structure, machine definitions, program paths, resource limits, and supported instruction set before execution begins.

The builder lowers the validated source into QVIR and then into a versioned `qcore.v1` machine image. The image carries its format and compiler identity, source hash, image checksum, machine metadata, instruction stream, constant pool, resource estimate, and source map. This gives the runtime a stable artifact to validate and execute instead of reinterpreting source code at every step.

The QCore layer is the virtualization boundary. It defines operations such as allocation, initialization, single- and two-qubit gates, measurement, reset, barriers, conditional jumps, and halt. The first CPU provider implements these operations against a `complex128` state vector. The provider abstraction keeps device discovery, precision, memory limits, supported operations, and fallback behavior outside the VM's core semantics.

Each shot receives an independent State VM context. Its amplitude state, classical memory, program counter, random source, execution counters, and limits are not shared with another shot. That isolation is necessary for both correctness and parallel scheduling. The state-vector model also makes memory growth explicit: a circuit with `n` qubits requires `2^n` amplitudes, so limits are checked before allocation rather than after the process is already under pressure.

The current CLI covers the whole local workflow:

```sh
qvm init
qvm validate
qvm build
qvm run --workers 2 --format json
```

`qvm run` can build a missing image, but it does not silently replace an existing malformed or checksum-invalid image. Source hashes, compiler identity, and image checksums are part of the validation path. A Bell-state acceptance flow is used as a compact end-to-end check: compile the program, execute shots, and verify the expected `00` and `11` distribution.

### Writing a QVFile

The QVFile format is intentionally a small project manifest. The file must be named `qvfile.qv` and placed in the current working directory. A minimal Bell-state project can look like this:

```json
{
  "name": "bell-lab",
  "version": 1,
  "machines": [
    {
      "id": "cpu-small",
      "backend": "state-vector",
      "instruction_set": "qcore.v1",
      "device": "cpu",
      "qubits": 2,
      "precision": "complex128",
      "max_steps": 10000
    }
  ],
  "jobs": [
    {
      "id": "bell-phi-plus",
      "machine": "cpu-small",
      "program": "programs/bell.qs",
      "shots": 16,
      "seed": 42
    }
  ]
}
```

This example follows the repository's [test/qvfile.qv fixture](https://gitlab.com/oytunistrator/qvm-cli/-/blob/main/test/qvfile.qv), with the corresponding [test/programs/bell.qs program](https://gitlab.com/oytunistrator/qvm-cli/-/blob/main/test/programs/bell.qs). The `.qs` file contains an OpenQASM 3 Bell circuit: it creates two qubits, applies `h` and `cx`, and measures them into two classical bits. The QVFile connects that program to a logical machine and a shot count. The loader rejects absolute program paths, paths that escape the project root, unsupported devices or instruction sets, duplicate identifiers, invalid qubit limits, and missing program files. This keeps project configuration separate from the QCore image produced by `qvm build`.

QVM also has a separate supervisor lifecycle. `qvm serve` starts a local Unix-socket control plane and uses the current directory as its runtime root; it does not require a QVFile just to start the supervisor. A later `run` or detached `boot` request loads the QVFile lazily. Detached control, active `ps`, and `stop` require a live supervisor health response, so a stale socket or PID file is not treated as proof that a service is running.

This separation makes the lifecycle easier to reason about:

```text
source project       runtime control plane
qvfile.qv            qvm serve
programs/*.qs        Unix socket and PID state
build/validate       boot, ps, stop
```

The project currently targets a CPU reference implementation. GPU execution, distributed execution, noise models, density matrices, and other backends are separate future provider or product scopes. Keeping them outside the initial VM prevents the first implementation from hiding its semantics behind hardware-specific code.

## OnixOS: turning the platform into a reproducible build graph

[OnixOS](https://gitlab.com/onix-os/onix-build-system) is the system layer around these projects. The recent work focused less on adding another package and more on making the build graph explicit: sources, architectures, profiles, repositories, workers, and publication paths should be declared and validated independently.

The build system keeps repository sources in configuration rather than hardcoding them in the implementation. The architecture matrix currently describes native `x86_64`, Docker-backed `aarch64`, Docker-backed `armv7h`, and a visible but disabled `armv6h` entry until a suitable worker image is available. The distinction matters: an unsupported architecture remains documented, but it does not accidentally create a Jenkins stage.

Repository and ISO jobs are separated by architecture and run through bounded stages. The native path uses the host worker, while ARM work is delegated to prepared Docker/QEMU workers. Architecture values are passed explicitly to the build code, and the default architecture is bounded to `x86_64` where a direct command needs a safe default. This prevents a missing parameter from expanding a focused operation into an unintended multi-architecture release.

The ISO profile matrix was also expanded. In addition to the standard `core`, `gnome`, `xfce`, and `security` profiles, the build system now understands additional standalone profiles such as:

```text
onixos-retro-edition
```

The profile workspace also contains two additional platform directions that are worth calling out:

- [OnixOS Retro Edition](https://gitlab.com/onix-os/onixos-profiles/onixos-retro-edition) — a profile focused on older hardware and a retro-oriented desktop experience.
- [OnixOS Floppy](https://gitlab.com/onix-os/onixos-profiles/onixos-floppy) — a deliberately playful profile that asks how far the distribution idea can be pushed toward floppy-era constraints.

These profiles live alongside the other OnixOS profile definitions. Keeping them as profiles, rather than embedding their package and boot decisions into the build-system code, allows the same release machinery to operate on different product roles.

### A new direction: OnixOS K8S Edition

The [OnixOS K8S Edition](https://gitlab.com/onix-os/onixos-profiles/onixos-k8s-edition) is a new immutable distribution direction for container and orchestration workloads. Its focus is not limited to Kubernetes itself: Docker and Podman are part of the intended operational toolbox, while Kubernetes provides the cluster-oriented layer for deployments that need scheduling, service discovery, and node management. The immutable model is intended to keep the base operating system controlled and reproducible, with application and workload changes handled through images, containers, and declarative configuration rather than ad hoc changes to the host.

This makes the profile different from a general-purpose desktop or server image. The goal is to provide a practical immutable base for experimenting with containers locally, moving workloads between Docker and Podman, and preparing OnixOS for Kubernetes-centered environments. Keeping this work in a dedicated profile also lets us evolve its package set, defaults, and operational tooling without changing the behavior of the core OnixOS editions.

Firmware was moved into an explicit `onix-firmware` repository definition backed by an AUR package list. The current list includes `aic94xx-firmware`, `ast-firmware`, `upd72020x-fw`, and `wd719x-firmware`. The build system can therefore treat firmware as a repository with its own source list and synchronization result instead of hiding it inside an unrelated package stage.

Targeted repository publication was tightened as well. A command that names one repository now builds and synchronizes that repository for the selected architecture, checks that a publishable database exists, and reports a failure when the expected output is missing. Profile access was also moved to the SSH repository URL used by the release workflow. These are operational details, but they define the difference between “a package command returned” and “a repository is actually consumable by an ISO build.”

The build system now includes [QVM CLI](https://gitlab.com/oytunistrator/qvm-cli) in the OnixOS base package list. That does not make QVM part of the kernel or the distribution's virtualization mechanism; it makes the quantum simulator available as a normal packaged tool inside the platform. The boundary remains clear: QVM provides the state-machine runtime, while OnixOS provides packaging, profiles, repositories, and release automation.

## O Language: from language implementation to application workflow

[O Language](https://gitlab.com/olanguage/olang) is a Go-implemented, system-oriented functional programming language used in the OnixOS ecosystem. Its implementation contains the expected language layers—lexer, parser, AST, evaluator, compiler, bytecode, VM, builtins, and REPL—but the latest work concentrated on the developer workflow around those components.

The largest addition is a dedicated web project command group. A project can now be initialized, run, extended, synchronized, and packaged through commands such as:

```sh
olang web init my-project
olang web run
olang web create controller users
olang web create model user
olang web create connection main
olang web create route post /users users
olang web install
olang web update
olang web artifact build/project
```

The web manager creates a conventional project structure for controllers, configuration, models, connections, routes, templates, public assets, libraries, and database files. It uses a `proc.ops` entry point to run a project and a `library.olp` manifest to describe dependencies. Generated files are created only when they are missing, so scaffolding does not overwrite application code that a developer has already edited.

The route generator moved from an example-file generator toward a typed command interface. It validates the HTTP method, requires a path beginning with `/`, accepts a controller name, and writes the route into the application configuration. The result is not a new hidden routing language; it is a small, predictable bridge from a CLI command to the existing O Language web model.

The runtime work addresses the other side of the same problem: generated applications must fail predictably. Web handlers can receive request-scoped data such as the request itself, query parameters, form values, route parameters, headers, and response state. Request state is kept per request rather than in global mutable data, which is important once a web application handles concurrent requests.

Values crossing the Go and O Language boundary are normalized before they reach builtins, object methods, or the VM stack. An empty host value should become a language-level null or a useful language error. It should not become a Go nil-pointer panic that exposes an implementation detail to the application developer. Tests cover the compiler, evaluator, VM, web manager, route generation, scaffolding, library loading, and artifact creation.

The documentation work follows the same direction. O Language documentation now describes the language model, command-line workflow, package format, project structure, and web development in one navigable documentation area. A feature is more complete when a developer can discover its intended workflow without reconstructing it from source code.

## One engineering pattern across three projects

Although QVM, OnixOS, and O Language operate at different layers, the recent changes share a common pattern:

- QVM separates source programs, machine images, VM state, and device providers.
- OnixOS separates package sources, architectures, profiles, repository publication, and ISO assembly.
- O Language separates project loading, generated application structure, request context, and runtime values.

In each case, the useful result is not merely another feature. It is a boundary with a testable contract. A QVM image can be checked before execution. An OnixOS repository can be checked before an ISO consumes it. An O Language project can be scaffolded without destroying existing files, and a missing runtime value can become a language error.

That is the direction I want to preserve as these projects grow. Hardware-specific execution, more architectures, richer web applications, and additional language tooling will all increase complexity. The answer is not to hide that complexity. It is to keep the interfaces explicit, keep artifacts identifiable, and make failure visible at the layer that owns it.

## References

- [QVM CLI](https://gitlab.com/oytunistrator/qvm-cli) — QVFile, QVIR, QCore machine images, State VM, and lifecycle commands.
- [OnixOS Build System](https://gitlab.com/onix-os/onix-build-system) — package repositories, architecture workers, profiles, ISO builds, and publication.
- [O Language](https://gitlab.com/olanguage/olang) — language runtime, compiler, VM, web project tooling, and package workflow.
- [OnixOS repositories and documentation](https://gitlab.com/onix-os) — the wider platform ecosystem.
- [Quantum Time and the Trajectory of a Qubit](https://oytun.org/p/quantum-time-and-the-trajectory-of-a-qubit/) — background on the conceptual side of quantum state evolution.
- [Turning an Old PC into a Quantum Emulator](https://oytun.org/p/turning-an-old-pc-into-a-quantum-emulator/) — practical context for CPU-based quantum simulation.
- [Homelab Update and What Is IPFS?](https://oytun.org/p/homelab-update-and-what-is-ipfs/) — related infrastructure and self-hosting context.

*The goal is simple: make the system easier to build, easier to inspect, and harder to misunderstand.*
