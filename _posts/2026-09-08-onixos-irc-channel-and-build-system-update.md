---
title: "OnixOS Is on IRC: A New Channel, an AI Bot, and a More Reliable Build System"
layout: post
categories: [Development, Linux, OnixOS, Community, BuildSystem]
tags: [onixos, irc, community, ai, bot, buildsystem, jenkins, multiarch, aur, arch-linux]
comments: true
---

OnixOS now has an IRC channel.

That may sound like a small community update next to ISO builds, package repositories, and CI work, but it is not separate from the technical work. A distribution needs a place where people can ask a question while they are testing an image, report a broken package without opening a formal ticket first, or simply follow what is happening. IRC is still very good at that: it is lightweight, open, easy to access from almost any system, and it does not require a large platform between the community and its conversations.

The IRC server is **`irc.onix-project.com`** on port **`6697`**, with TLS enabled. Connect with SSL/TLS turned on in your IRC client.

- **`#general`** is the place for introductions, general OnixOS discussion, user questions, and community conversation.
- **`#development`** is for build-system work, packaging, ISO profiles, bug reports, patches, logs, and deeper technical discussion.

Both channels are open to anyone interested in OnixOS, whether you are building the distribution, testing an image, maintaining a package, or just curious about the project. They are meant to be technical rooms, but not intimidating ones. Short questions are welcome. So are build logs, package reports, ideas, and the kind of small observations that often become real fixes later.

## Choosing an IRC client

IRC does not require a particular application. Use the client that fits the way you work, then create a server entry with `irc.onix-project.com`, port `6697`, and TLS/SSL enabled. Join `#general`, `#development`, or both once the connection is established.

- **[KVIrc](https://www.kvirc.net/)** is a powerful graphical IRC client and a particularly good choice for people who want more than a basic chat window. It offers a traditional IRC layout, extensive configuration, scripting, themes, aliases, and automation. It is a solid option for regular users who want to tailor the client around their workflow.
- **[Konversation](https://apps.kde.org/konversation/)** is the simplest starting point for someone who wants a normal graphical desktop client. It has a clear server and channel interface, supports TLS, and is a natural fit for KDE and other Linux desktops.
- **[WeeChat](https://weechat.org/)** is a fast, terminal-based client for users who spend much of their day in a shell. It is highly configurable, supports TLS and SASL, and works well over SSH or inside a terminal multiplexer such as `tmux`.
- **[Irssi](https://irssi.org/)** is another modular terminal client. It is a good fit for users who prefer a minimal text interface and want to build their own workflow with themes, scripts, and a persistent shell session.
- **[Quassel IRC](https://www.quassel-irc.org/)** is useful when you want a graphical client with an optional persistent core. The core can remain connected on a server while one or more desktop clients attach to it later, so messages are not lost simply because the desktop application is closed.
- **[The Lounge](https://thelounge.chat/)** is a self-hosted web IRC client. It is a good option for people who want an always-connected session, browser access from more than one device, or a responsive interface that can be installed as a progressive web app.

There are many other capable IRC clients, including mobile and browser-based options. The choice comes down to preference: KVIrc and Konversation for a desktop interface, WeeChat or Irssi for the terminal, and Quassel or The Lounge when persistent connections matter. The connection details remain the same. The only important security setting is to use the TLS endpoint on port `6697`, rather than falling back to an unencrypted connection.

## Register your nickname before joining

The OnixOS channels are for registered users. Please register and identify your nickname before joining `#general` or `#development`. This keeps automated spam, disposable identities, and drive-by abuse out of the rooms, while leaving the channels open to people who want to participate in good faith.

After connecting to the server, register the nickname you want to use with NickServ:

```text
/msg NickServ REGISTER <password> <email-address>
```

Use a unique password and an email address you can access. NickServ will normally send a verification message or provide further instructions; complete that step before treating the account as registered. Never paste your password into a public channel.

On later connections, identify with your registered nickname before joining the OnixOS channels:

```text
/msg NickServ IDENTIFY <password>
```

Many clients can perform this automatically through their server-account or NickServ-password settings. Configure the client to connect using TLS to `irc.onix-project.com` on port `6697`, then add your NickServ password only in the client’s private account settings. Do not use an auto-join rule for the channels until the client is configured to identify first.

Users who enter the OnixOS channels without a registered and identified nickname will be banned. This is an intentional channel policy, not a technical accident. If you are new to IRC or have trouble completing registration, connect first, register your nickname, and then join the channel. Once you are identified, `#general` and `#development` will be available normally.

## An AI model is now connected as an IRC bot

The channel also has a new participant: an AI model connected through an IRC bot.

The intention is not to replace the people in the channel or to turn support into a black box. The bot is there to make the room more useful when someone needs a quick first answer. It can help explain an OnixOS concept, point a user toward the relevant part of a build workflow, summarize a technical discussion, or give a starting point for troubleshooting.

IRC is a particularly interesting place for this kind of integration. Conversations are compact and immediate, so the bot has to be useful without taking over the channel. A good answer in IRC is often not an essay; it is a clear explanation, a command to try, or the right question to ask next. The human side still matters most, especially when the problem depends on a real machine, an incomplete log, or project context that a model cannot infer safely.

There is another practical benefit. Community knowledge tends to become scattered across old messages, issue trackers, private chats, and the memory of whoever happened to be online. An assistant that can help newcomers orient themselves gives regular contributors more time for the work that actually needs human judgement: reviewing a patch, reproducing a failure, or deciding how a feature should behave.

The bot should be treated as an assistant, not an authority. It can be wrong, particularly with version-specific package or build advice. Commands that change a system, remove files, or publish packages still deserve the same care they would receive in any technical channel: read them, understand them, and verify them against the current project source.

## The build system work behind the community update

While the IRC channel was being prepared, `onix-system-build` also received a substantial round of engineering work. The visible result is a cleaner release process; the important part is how the pipeline now handles failure, architecture boundaries, and the hand-off from a repository build to an ISO build.

The recent changes were not a cosmetic reorganization. They address the failure modes that appear once a distribution is built for several architectures and published through automated infrastructure: a job accidentally doing work for the wrong architecture, one failed package hiding the rest of the failures, an ISO build starting before its repository is visible to users, or CI retaining huge work directories instead of the evidence needed to debug a failure.

## Repository and ISO pipelines now have separate responsibilities

The first major change is a deliberate split between repository and ISO work.

`Jenkinsfile.repobuild` owns repository releases. It cleans the workspace, builds packages, updates repository metadata, and synchronizes each architecture in order. `Jenkinsfile.isobuild` owns ISO production. It prepares only the workers required by the enabled profiles, builds a profile, and synchronizes that profile before moving to the next one.

That separation removes a dangerous implicit dependency from the old shape of the workflow. An ISO job no longer repeats repository work just because it happens to run after it. A repository job no longer needs to understand ISO profile state. Each pipeline has one outcome, one set of logs, and one place to investigate when it fails.

The command-line interface was simplified in the same direction. Maintenance and test functionality that used to live in separate entry scripts was moved behind `build.py`. Cleaning is now `python build.py clean`, and launching an image through QEMU is `python build.py qemu <iso path>`. Keeping the public entry points together makes both local use and Jenkins jobs less fragile.

## Multi-architecture builds are explicit at every stage

The repository pipeline now treats `x86_64`, `aarch64`, and `armv7h` as separate release stages instead of treating multiarch as a loop hidden inside one opaque job.

`x86_64` is built by the native, unprivileged `pkgctl --clean` worker on the Jenkins host. The ARM architectures are prepared and built through their Docker/QEMU workers. Jenkins provides a fixed `TARGET_ARCH` value to each stage and passes it as `--arch`; it is not a free-form build parameter. This is a small design decision with a large operational effect: an architecture cannot be changed accidentally by an empty environment variable or a badly configured job.

The stages are still serialized. That is intentional. Repository publishing changes shared state, so running several architecture releases in parallel can create races around metadata, synchronization, or lock files. A serial sequence is easier to observe and makes the order of publication explicit: native packages first, then the ARM workers and their repository builds.

The ISO side applies the same principle. It reads the architecture declared by each `profiledef.sh`, creates only the ARM workers actually required by those profiles, and skips unsupported architectures rather than trying to force them through the pipeline. This prevents the build host from doing unnecessary container preparation and reduces load during an ISO release.

ARM package handling was tightened as well. ARM builds use `makepkg` in their worker environment, while the native path continues to use the host's packaging tooling. The distinction matters because the two paths do not have the same execution environment or assumptions about available tools.

## An ISO build now checks the public repository before it starts

One of the most important reliability improvements is a repository preflight step in the ISO pipeline.

Before `archiso` begins to build profiles, Jenkins fetches the published `onix-base` repository database from the public repository endpoint. It checks that the database contains an `onix-base` package entry, reads the package filename from the database, and then confirms that the package file itself can be downloaded.

This is more than a connectivity check. A repository sync can complete on the build server before a CDN edge or public mirror exposes the new database and package files. Without the preflight, an ISO job could begin against a stale or incomplete repository and fail much later with a misleading package-resolution error. The new check turns that into an early, specific failure: the release repository is not ready yet.

## Failures are visible without stopping useful work

Package builds can fail for reasons that are unrelated to the rest of a release: an upstream source may disappear, a checksum may need updating, or one architecture may expose a packaging bug that another does not. The pipeline now records package failures, streams command output while the build is running, and continues with the remaining packages, repositories, and architectures.

That does not make failures disappear. Jenkins marks the final result as **UNSTABLE**, so the release status remains honest. The difference is that a failed package no longer prevents the system from collecting the rest of the useful information. A maintainer can see the full set of failures from one run instead of repairing the first error, rerunning the job, and discovering the next one afterwards.

The logging layer was simplified around that goal. Build output is streamed rather than held back until a command exits, and failures are reported with package-level context. A skipped package is distinguished from an actual failure, so optional or intentionally unavailable work does not look like a broken release.

## Cleaner workspaces and better diagnostics

Distribution builds leave behind awkward state: root-owned output files, mounted `archiso` trees, package caches, and global locks that may have been created by a privileged invocation. The Jenkins checkout stages now handle that state explicitly before obtaining a fresh source tree.

They stop builds that belong to the current workspace, unmount nested stale mount points, remove the bounded workspace contents, and repair ownership and permissions on the build lock. This avoids a familiar CI failure where a clean checkout cannot begin because a previous `sudo` build left files or mounts behind.

At the end of a job, Jenkins archives logs and state files instead of archiving full build trees or multi-gigabyte ISO artifacts. The release files are synchronized by the pipeline itself; CI retains the material that helps diagnose a problem without filling storage with redundant output.

Each ISO profile work tree is also cleaned before it is built. Repository setup that is specific to a profile, including Chaotic-AUR setup, stays profile-local instead of leaking into unrelated profiles. These details are easy to overlook, but they make repeated builds much more deterministic.

## A new AUR mirror helper

The build system now includes a dedicated helper for mirroring the packages listed in `sources/aur.list` into the `onix-os/onixos-aur-packages` GitLab group.

It is designed for a scheduled Jenkins job rather than an interactive command. The helper reads and validates the package list, creates a public GitLab project for a package when necessary, maintains a mirror clone of the upstream AUR repository, and pushes an exact mirror to GitLab, including tags and deleted upstream references.

The less visible details are deliberate:

- A lock prevents two scheduled runs from mirroring the same package set at the same time.
- AUR Git requests are serialized and spaced 30 seconds apart, avoiding a burst of requests against AUR.
- Transient AUR and GitLab failures retry with separate exponential-backoff schedules.
- One failed package is reported but does not stop the rest of the package list from being mirrored.

At the current size of the list, a complete pass can take hours. That is an acceptable trade-off for a conservative mirror that respects the upstream service and produces a clear result at the end of the run.

## Where this leaves OnixOS

The IRC channel gives OnixOS a more direct place to talk with users and contributors. The AI bot makes that room easier to approach, provided its answers are treated as starting points and checked when they affect a real system.

At the same time, the build work makes the project less dependent on invisible assumptions. Architectures are named explicitly. Repository and ISO releases have clear boundaries. Public package availability is checked before images are built. Failures stay visible without throwing away the rest of a release run. AUR source mirrors can be maintained steadily instead of through manual, one-off work.

That is the kind of progress that does not always show up in a screenshot, but it is what makes a distribution easier to maintain, easier to debug, and safer to evolve.

*See you on IRC.*
