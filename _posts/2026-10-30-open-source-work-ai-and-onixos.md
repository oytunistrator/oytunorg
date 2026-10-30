---
title: "Open Source, Work, AI, and the Next OnixOS Release"
layout: post
categories: [Development, AI, Linux, OnixOS, OLanguage, OpenSource]
tags: [open-source, work, ai, onixos, olanguage, aquallm, noiseapp]
comments: true
toc: true
---

Work is supposed to give people a way to build a life. Too often, it becomes a struggle to earn enough money while somebody else captures most of the value. I have crossed many paths in my working life, and I keep meeting people who treat knowledge as an opportunity to extract more from someone, ignore their contribution, or pull them deeper into a system they no longer question.

The latest wave of artificial intelligence adds another layer to that pressure. The public conversation is full of promises, but the infrastructure and attention are concentrating around a small number of cloud AI providers and hardware suppliers. That is my reading of the current direction, not a market analysis. Many other companies and workers are left trying to decide how much of their work should depend on services they do not control. The technology may be useful, but dependence can grow faster than understanding.

Open source is one practical way to regain some control. It lets people inspect software, adapt it, and keep working when a vendor changes direction. It does not automatically make work fair, pay maintainers, or remove the need for reliable infrastructure. Still, shared source and shared tools give us a better starting point than accepting every product as an untouchable service.

That belief is part of why I keep working on OnixOS and the projects around it. The work is slow, and the software is not finished. What follows is a snapshot of where those efforts stand and what remains uncertain.

## OnixOS is preparing for a new release structure

The OnixOS build system has recently gained a clearer path for both named releases and development images. The intended workflow builds tagged revisions as releases and builds the current main revision as a development image. Release names are carried into the artifact paths and metadata. Development images are identified from the build-system commit, so an image can be tied back to the source revision that produced it.

The output is organized under `output/<release>/<profile>/<architecture>/`. Each profile gets release information and a `README.txt` alongside its image artifacts. This makes the result easier to identify and review after it leaves the build job.

We have also prepared separate repositories for the build system, package sources, community packages, and profiles. The pipeline publishes distinct base, community, kernel, and firmware package channels from those configured sources. Keeping source projects apart makes their boundaries visible. The build configuration lists which repositories and profiles take part in the current pipeline. At the moment, the active image profiles include Core, GNOME, XFCE, TV, Mobile, and Server.

The new versioning and image layout are now being put in place, but that does not mean every development image is ready to use. The recent development versions have not yet been fully tested. There may be bugs, and a build artifact still needs to be checked on the target hardware before it can be treated as a working release. The immediate task is to validate the pipeline and the images it produces, then use the results to fix what fails.

Anyone who wants to try the current development releases can find them at [pub.onix-project.com](https://pub.onix-project.com/). These images are for evaluation, and may still contain bugs.

## O Language is becoming part of the platform workflow

O Language is a system-oriented functional language with its own compiler, bytecode, virtual machine, package format, and command-line tools. The recent work in its repository focused on web project tooling: commands for setting up projects, generating typed routes, and loading a project through a shared loader. Earlier runtime work also exposed request-scoped information to web handlers and converted missing host values into language-level errors.

The language package has also been updated in the OnixOS package sources. That connection matters to me: a language becomes more useful when people can develop with it and install it as part of a platform, rather than treating its repository as an isolated experiment. There is still a long way between adding a package and having a mature ecosystem, but this is a concrete step toward making the tools available together.

## AquaLLM is being improved through its data and retrieval path

AquaLLM is a Turkish question-and-answer project about aquarium and ornamental fish care. The latest updates expanded the reviewed, source-backed aquarium material, improved coverage of care questions, and adjusted retrieval and inference behavior to make answers more stable.

The data workflow deliberately excludes synthetic placeholder records and keeps source URLs with reviewed web answers. This is useful discipline for a small model: training data affects what the model can answer, while retrieval can bring relevant material closer to the question. Neither step proves that every answer is correct. Aquarium health questions in particular need careful limits, and the project documentation says the model should not diagnose disease.

## NoiseApp's phone and watch work is close to a usable milestone

NoiseApp has grown from its web and API project into a set of phone, Wear OS, and desktop clients. The phone app supports the main reporting and account flows, while the watch app can use a session shared from the phone and record a noise measurement summary for transfer. Recent Wear work focused on making measurement and profile screens fit small and differently shaped displays.

The mobile repository now documents build and installation workflows for Android and Wear OS, as well as an iOS build path. The latest Wear notes record 66 passing release unit tests, a clean lint run, checks across several emulator screen shapes, and installation on a physical Galaxy Watch 6 Classic. That is meaningful progress, and the phone and watch apps feel close to a substantial milestone. The iOS path and wider release distribution have their own platform requirements, so I am treating them as separate work.

## The work is part of the argument

These projects do not prove that open source will solve exploitation at work. They show something smaller and more practical: people can build operating systems, language tools, models, and applications whose source and decisions can be inspected. Someone can learn from them, report a problem, or continue the work without waiting for a distant vendor to grant access.

But publishing code is only the start. Projects need maintainers, documentation, testing, hardware, time, and a way to share responsibility. If we expect people to sustain open tools while giving all the money and attention to closed platforms, the imbalance will reproduce itself in another form. Open source deserves support as work, not only praise as an idea.

For OnixOS, the next useful measure of progress is not another announcement. It is a tested development image, clear release artifacts, and honest reports about the machines where they work. For the projects around it, it is the same discipline: make the source available, keep the limits visible, and give people enough information to decide whether a tool is ready for them.

That is the kind of work I want to keep doing. It will not free anyone by itself, but it gives us tools we can understand and improve together.

## Project links

- [OnixOS Build System](https://gitlab.com/onix-os/onix-build-system)
- [OnixOS package sources](https://gitlab.com/onix-os/onixos-packages)
- [OnixOS community packages](https://gitlab.com/onix-os/onixos-community-packages)
- [OnixOS profiles](https://gitlab.com/onix-os/onixos-profiles)
- [O Language](https://gitlab.com/olanguage/olang)
- [AquaLLM](https://gitlab.com/oytunistrator/AquaLLM)
- [NoiseApp](https://gitlab.com/odznames/noiseapp)
