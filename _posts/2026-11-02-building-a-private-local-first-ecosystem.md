---
title: "Building a More Private, Local-First Digital Ecosystem"
layout: post
categories: [Development, Homelab, Infrastructure, Linux, Security, OpenSource]
tags: [privacy, self-hosting, homelab, local-ai, offline-first, onixos, meshtastic]
comments: true
toc: true
---

I started looking at how much of my life I had left scattered across the internet. The answer was more than I expected. I found profiles on sites I had forgotten about, along with records and personal details that I did not remember deliberately publishing.

Some of that information had been supplied by me, sometimes without much thought. Some was visible through profiles and other public pages. A profile search with Junior AI helped me collect the results, identify pages that appeared to refer to me, and find the sites' exit or removal links. I went through those links and submitted the necessary requests. I now keep only a small number of profiles, including this site and a few accounts I may need later.

That search was a practical inventory, not proof that every copy of my information has disappeared. A removal request cannot guarantee that cached, copied, or independently republished material is gone. It did give me a clearer picture of the accounts I could control and a starting point for reducing what I leave behind.

## Moving more of my digital life closer to home

After working through the public profiles, I returned to an unfinished homelab and improved it. My goal is not to disconnect from the internet. It is to depend on fewer services for information, media, AI work, and basic communication, and to keep more of those capabilities on hardware I control.

These are the tools and systems that now make up that effort. They do different jobs, and they are not all privacy tools in the narrow sense. Some are for offline knowledge, some for media, and some for keeping communication possible when ordinary connectivity is unavailable.

## Knowledge that remains available offline

1. **[Project NOMAD](https://www.projectnomad.us/#how-it-works)** is an offline-first knowledge server. Its collection can include reference material, maps, and educational content, with an optional local AI assistant. I see it as a way to keep useful information available on a local network when an internet connection is not available. The AI is only one part of it; the local library is useful on its own.

2. **[Doomsday OS](https://github.com/cartesia-one/doomsday-os)** packages local AI and offline knowledge for portable or air-gapped use. Its project describes deployment options ranging from portable files to bootable images. I am including it as another approach to making a knowledge assistant less dependent on a live cloud service.

3. **[Internet-in-a-Box (IIAB)](https://internet-in-a-box.org/)** is a project for putting an offline library and learning resources on a local server or hotspot. It addresses a similar need to NOMAD from a community knowledge-library perspective: make selected resources available to nearby devices without requiring each one to fetch them from the wider internet.

These systems all depend on preparation. The content has to be selected and downloaded while the relevant sources are reachable, and local hardware still needs power, storage, and maintenance. “Offline” describes how the collection can be used after preparation, not how it appeared on the machine.

## Local AI, personal archives, and media

4. **[Disaster Radio](https://github.com/sudomesh/disaster-radio) and [Meshtastic](https://meshtastic.org/)** are separate off-grid radio projects. My small LoRa network is based on Meshtastic. The Disaster Radio repository describes a different, currently paused disaster-recovery mesh project, so I am listing it as a related reference rather than as part of my installation. A Meshtastic network can provide a separate path for short messages when cellular or internet connectivity is missing, within the limits of the devices, network coverage, power, and local radio rules. It is a backup communication channel, not a replacement for every form of emergency service.

5. **My local LLM setup** runs on a Junior AI server with several models, retrieval-augmented generation (RAG), and a larger local model. This gives me a place to experiment with AI and search my own material without making a cloud model the default for every task. A local model still needs careful handling: its answers can be wrong, and keeping data on my server does not automatically make the server secure.

   I also use **[ArchiveBox](https://archivebox.io/)** to preserve web pages and other online material in an archive I host. ArchiveBox can save pages and related material in durable formats. It is useful for references I want to retain, though an archive is a personal snapshot, not a substitute for the original source or a promise that every site can be captured completely.

6. **[Jellyfin](https://jellyfin.org/)** is my self-hosted media server. It lets me organize and stream my own media collection from my server to supported devices. That puts the library and the server under my administration instead of making a hosted streaming catalog the only way to reach it.

7. **OnixOS TV Edition** is the system I use for television and media work, including disc ripping. The profile is built around a TV interface and includes media tools such as Kodi and VLC, alongside optical-disc utilities. That gives this part of the setup a dedicated local environment rather than treating the television as only a client for online services.

8. **OnixOS is also the default operating system on my laptop.** I use it for day-to-day work and access to local repositories. In that sense, the local-first setup includes the machine I work on, not only the servers in the homelab.

9. **Radio and operator systems** provide another emergency communication option. They are separate from the small LoRa network and depend on their own equipment and operating requirements. I keep them as part of the broader preparedness setup rather than assuming one network or device will always be available.

10. **[CasaOS](https://casaos.zimaspace.com/)** helps manage self-hosted applications and services through a home-server interface. I use it for local multimedia work and as a convenient way to manage services around the homelab. The project now presents ZimaOS as its next-generation NAS operating system, but CasaOS remains the name of the system in this list and in my setup.

## Local control comes with local responsibility

Running a service at home changes who operates the infrastructure. It does not remove the work. I am responsible for updates, backups, access control, storage failures, and deciding which devices can reach each service. A private server can still be exposed through a weak password, an unsafe network configuration, or a lost backup. Local AI can still produce unreliable answers. Offline collections can become stale.

The same applies to privacy clean-up. Asking a site to remove a profile is one step, and reducing what I publish going forward is another. Neither step can guarantee that nothing remains in third-party archives or copies. The useful outcome is more modest: fewer accounts I no longer need, a clearer view of what is public, and more control over the services I use regularly.

## OnixOS and O Language are moving forward too

The homelab work is connected to my software projects, but the OnixOS and O Language changes have their own scope. One current focus in my OnixOS build-system development checkout is a standalone WebUI for repository and image jobs. It is intended to let operators start and follow jobs without Jenkins. It has Repos, Images, Settings, and Jobs panels. The current implementation uses the existing repository and image build components, keeps a serial queue with persistent job status and logs, and can run x86_64 jobs on the host or other configured architectures through Docker and QEMU workers. Image profiles are records with a name, Git URL, and build command, while repository and sync settings continue to use the build system's source configuration. The [build system repository](https://gitlab.com/onix-os/onix-build-system) contains the project and its evolving documentation.

This is still development work. As of this update, the project's changelog records syntax checks but no service installation or runtime repository and image job validation. There are also operational limits to keep visible: the service has no login form and is intended to stay on loopback unless a suitable access-control layer is added. Its installer grants the service account broad sudo privileges for existing build steps. That makes the WebUI useful to develop, but not something I would expose to a network without reviewing its deployment boundary first.

The recent [O Language](https://gitlab.com/olanguage/olang) work connects its web-project tools more tightly. The `olang web` commands can initialize and manage web projects, create components such as controllers and models, and run or stop a project. Typed route scaffolding and a shared project loader are part of the current implementation, and the CLI reports command progress. The companion [editor tooling](https://gitlab.com/olanguage/olanguage-vscode) now covers VS Code, Zed, Cursor, VSCodium, and Code-OSS, with shared syntax highlighting and snippets. These are developer tools and framework work; they do not yet imply a mature or stable application platform.

I am also working on a license for software intended to remain usable in local and battery-powered settings. That work is separate from the WebUI and language tooling, but it asks a related question: how much can we keep useful and under the user's control when a central service or continuous connection is not available?

For now, the homelab is a collection of useful pieces rather than a finished system. I have reduced a set of old public profiles, brought more services into a local environment, and made a small communication network for emergencies. OnixOS and O Language are progressing alongside it, with work still to validate and refine. The next step is to keep improving these systems, keep their limits visible, and avoid handing out more personal data by default.
