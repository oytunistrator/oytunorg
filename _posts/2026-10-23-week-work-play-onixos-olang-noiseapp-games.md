---
title: "A Week of Work and Play: OnixOS, O Language, NoiseApp, and Games"
layout: post
categories: [Development, AI, Linux, OnixOS, OLanguage, OpenSource]
tags: [onixos, plasma-mobile, olanguage, language-models, huggingface, noiseapp, android, beta]
comments: true
toc: true
---

This has been a week split between project work and play. OnixOS now has a mobile Linux profile, NoiseApp has an Android beta, O Language has web-project tooling, and I have continued updating language models and datasets on Hugging Face. I also spent time with several games while beginning to analyze assets and mechanics for a new project. These efforts solve different problems, so I want to describe what each one does today and where the work is still incomplete.

## OnixOS Mobile is a foundation for device ports

The [OnixOS Mobile profile](https://gitlab.com/onix-os/onixos-profiles/onixos-mobile-edition) adds a KDE Plasma Mobile session on top of the Arch and Arch Linux ARM profile. It configures a Wayland session, touch-friendly input, SDDM, networking, modem and Bluetooth services, audio, and power management.

The profile declares `x86_64`, `aarch64`, and `armv7h` build targets. It can produce a generic UEFI image and a root filesystem archive. Those artifacts are useful as a common base, but a CPU architecture does not make a phone bootable by itself. Each device still needs a suitable kernel, device tree, firmware, bootloader, and partition layout.

That distinction is visible in the device manifests. Generic UEFI hardware is marked buildable, while PinePhone, PinePhone Pro, and Librem 5 entries remain experimental. The Samsung Galaxy S III entry is still planned. Calls, camera, graphics acceleration, suspend, and other hardware behavior need device-level work and validation. This is a Linux mobile porting base, not a claim that every listed phone is ready for daily use.

## O Language tooling and its programming model

The O Language core repository's most concrete web-tooling work in the history I reviewed is from August. The web CLI can initialize a project, create components, and add typed routes. Project loading is centralized through a generated loader. This makes web applications easier to structure, but it is not a mobile UI framework.

The separate [O Language model](https://huggingface.co/oytunistrator/olang-language-model) is a 2B text-generation model for working with O Language. Its model card describes generating `.ola` programs, explaining and debugging code, and producing `.olm` modules or `.olp` package files. It also describes a documentation retrieval and tool layer, so the model weights alone are not the whole assistant workflow.

## NoiseApp has an Android beta

The [NoiseApp project](https://gitlab.com/odznames/noiseapp), also known as [Gürültü Dedektifi](https://gurultudedektifi.com/), now has an Expo and React Native mobile app connected to its API. The recent commits focus on practical flows: sign-in and registration, map-based reporting, complaint details and counts, navigation, theme handling, and clearer confirmation and loading states.

The complaint form can use the phone's location or let a person choose a point on the map. It can also attach optional audio evidence. The recorder asks for microphone permission when recording starts, limits a recording to 20 seconds, and displays an approximate input-level meter. That meter is device-dependent and is not a calibrated sound-pressure reading.

I have also been cleaning up the infrastructure around the app. The repository now documents an Android APK build and install path, and the recent history includes mobile API integration and production image workflow changes. A committed security-defaults update disables automatic Swagger document generation by default and allows credentials to be configured for protecting the documentation page. These are targeted maintenance changes, not evidence that every security issue has been audited or eliminated.

The Android app is still in beta. The current build configuration is for internal distribution, and the mobile project checklist still leaves Play Store publication open. I plan to prepare a store release after the beta work is further along.

## More model and dataset updates

I have also continued publishing model and dataset updates through my [Hugging Face profile](https://huggingface.co/oytunistrator). The work there covers a few separate domains:

- [NanoSIEM](https://huggingface.co/oytunistrator/nano-siem-model) is a compact model for Turkish and English cybersecurity and SIEM analysis. Its card frames the model around authorized findings, evidence boundaries, and retrieval for current facts. A related [dataset](https://huggingface.co/datasets/oytunistrator/nano-siem-dataset) supports retrieval and question answering.
- [AquaLLM](https://huggingface.co/oytunistrator/AquaLLM) focuses on aquarium questions. Its [dataset](https://huggingface.co/datasets/oytunistrator/AquaLLM-Dataset) currently lists 1,095 records about aquarium topics.
- The [O Language model](https://huggingface.co/oytunistrator/olang-language-model) and its [dataset](https://huggingface.co/datasets/oytunistrator/olang-dataset) cover Turkish and English examples for O Language programming, documentation, code generation, and debugging. The model card describes local formats and inference options alongside its intended use.

The model cards include local inference guidance and describe formats such as GGUF where available. Publishing a model and its dataset makes the artifacts easier to inspect and try; it does not, by itself, establish answer quality. Evaluation and retrieval quality remain separate work.

## A few games from the week

I wanted some space to think, and I have a new project in mind. I am using time with different games to start looking at their assets and mechanics. The project is still in the analysis stage. These are three games that stood out during the week, both as entertainment and as useful references.

- [Moral Dilemma: The Interview](https://store.steampowered.com/app/3364880/Moral_Dilemma_The_Interview/) is a surreal narrative adventure about interviewing for a job as a "Moral Dilemma Judge." The office is full of strange characters and rooms, and the interview itself mixes puzzles, absurd tests, and choices about difficult scenarios. It has multiple endings, so it works well if you enjoy story games that use humor and odd situations to make you stop and think.
- [Sanitarium](https://store.steampowered.com/app/284050/Sanitarium/) is a classic point-and-click psychological horror adventure. After a car crash, the main character wakes up in an asylum and has to work through its dark, puzzle-filled story. I am still playing it and have not managed to finish it yet. I recommend it if you like atmospheric, slower-paced adventure games.
- [CONTROL Ultimate Edition](https://store.steampowered.com/app/870780/CONTROL_Ultimate_Edition/) is a supernatural third-person action adventure set inside a shifting government bureau. I finished its two expansions, *The Foundation* and *AWE*, which are included in the Ultimate Edition.

I also finished a number of other games. My [Steam profile](https://steamcommunity.com/id/tedaryum/) is the place to follow the rest of that activity.

## What remains

The mobile work is at two different stages. OnixOS needs hardware-specific ports and real-device validation. NoiseApp has an Android beta, while public store publication remains future work. O Language's tooling and models continue to develop alongside those efforts, but they do not turn the operating-system profile or NoiseApp into one shared mobile stack.

The new project is still in analysis. I am reviewing assets and mechanics before moving into implementation. Keeping those boundaries explicit makes the progress easier to review: a generic image, a beta APK, a language model, and a project analysis are different deliverables, each with its own next step.
