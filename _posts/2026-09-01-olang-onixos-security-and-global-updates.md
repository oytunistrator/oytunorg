---
title: "From O Language to OnixOS: A Detailed Record of Recent Work"
layout: post
categories: [Development, Linux, OnixOS, OLanguage, Security, OpenSource]
tags: [olang, olanguage, onixos, web, compiler, deployment, ai, multiarch, odesk, spamassassin, blocklist, security, open-source]
comments: true
toc: true
---

The past few weeks have been unusually busy across the O Language and OnixOS ecosystem. What started as a set of focused changes in the language runtime and web framework grew into a broader effort covering documentation, application deployment, operating-system packaging, desktop usability, local AI tooling, email security, and network blocklists.

This post is a detailed record of that work. It is based on the git history of the projects I have been working on under the O Language and OnixOS workspaces, together with the recent changes in my [custom SpamAssassin ruleset](https://github.com/oytunistrator/spamassassin-custom-list) and the [global blocklist project](https://gitlab.com/odznames/global-blocklist). The goal is not to present isolated commits as if they were unrelated features. The more interesting story is how these projects are beginning to form a coherent platform.

## The larger direction

There is a common idea behind nearly all of these changes: make the system more explicit, observable, and repeatable.

In O Language, that means a web project should have a clear structure, a request should have its own context, and a runtime failure should become a useful language error instead of a host-language panic. In OnixOS, it means a build should state its target architecture, repository failures should be visible, and a package or ISO should be produced from a controlled environment. In security tooling, it means authentication signals should be interpreted carefully, generated lists should be deduplicated, and installation should not overwrite an administrator's configuration.

The projects are different, but the engineering principle is the same: remove hidden assumptions before they become operational problems.

## O Language: moving from a language core to a development workflow

The main [O Language repository](https://gitlab.com/olanguage/olang) has existed for years and contains the familiar pieces of a language implementation: lexer, parser, AST, evaluator, compiler, bytecode, virtual machine, builtins, REPL, and operating-system integrations. The recent work focused on making those pieces more useful for real applications.

### A web project CLI

The most visible addition is a dedicated web project command group. A developer can now initialize and manage a project through commands such as:

```sh
olang web init my-project
olang web run
olang web create controller home
olang web create model user
olang web create connection database
olang web create route get /users users
olang web install
olang web update
olang web artifact build/project
```

The CLI creates a conventional project layout for controllers, configuration, models, connections, routes, templates, public assets, libraries, and database-related code. It can also generate a project from a custom framework source, execute the project's `proc.ops` entry point, manage libraries, and package the result as an artifact.

This is important because a language becomes much easier to adopt when the first ten minutes are predictable. Developers should not have to reverse-engineer the expected directory structure from an example application or manually connect every part of a framework before they can see a page running.

### Typed routes and request context

The web tooling also gained typed route scaffolding. A route can be created with an HTTP method, a URL path, and a controller, while the generator validates the method and makes sure the path begins with `/`. Route parameters such as `/users/:id` can be passed to handlers as named arguments, while the older request representation remains available for compatibility.

The runtime now gives handlers a request-scoped server value. It exposes the request, query parameters, form data, route parameters, headers, and response state. A handler can therefore set a response body, status, or header without depending on global mutable state.

That request scope matters in a concurrent server. One request must not accidentally replace the environment of another request. The implementation work also covered both evaluated and compiled server handlers, so the feature is not limited to one execution path.

### Safer nil handling

Another less visible but important improvement was the treatment of empty values crossing between Go and O Language. Values are now normalized before reaching object methods, builtins, compiler paths, or the virtual machine stack. An empty host value becomes a language-level null value, and trying to call an empty value produces a language error instead of a nil-pointer panic.

This kind of fix is foundational. Runtime errors should describe a problem in the O Language program. They should not expose an implementation accident in the host language. Tests were added around builtins, compiler behavior, normalization, and VM handling to make the boundary safer.

## The web framework and documentation grew together

The [O Language web framework](https://gitlab.com/olanguage/web/framework) gained a centralized loader and a foundational project example. The loader brings project startup into one place, which makes the CLI workflow and the framework runtime agree about how an application is assembled.

The documentation was reorganized in the [central O Language documentation repository](https://gitlab.com/olanguage/docs). The old scattered structure was replaced with a progressive learning path: first installation and the first program, then language basics, project files, APIs, runtime topics, web development, routing, and database usage. Web and system APIs were separated more clearly, deprecated material was removed, and the framework guide was moved into the central wiki.

The documentation changes also corrected practical details such as code formatting, project file conventions, loader behavior, debug output, route scaffolding, and database setup. The point is not only to have more pages. It is to keep the documentation close to the current implementation so that a new developer can follow the intended workflow instead of discovering it from outdated examples.

## O Language AI: building a model around the language itself

The [O Language AI model package](https://gitlab.com/onix-os/onixos-packages/olang-ai-model) became one of the most active parts of the workspace. The project now treats the language's own documentation as a primary source for dataset and retrieval work.

The pipeline was expanded to crawl documentation, create records for every documentation section, support GitLab documentation as a source, and fall back to a web dataset when a hosted dataset is empty. It became more aware of dataset locations and formats, and it added hardware-aware training configuration, project virtual-environment support, 4-bit model loading, evaluation-strategy compatibility, and automatic detection of GGUF conversion tools.

The training data was cleaned and expanded across documentation chunks. The model was taught to prioritize O Language code generation, handle multilingual programming workflows, understand O Language artifact formats and file tools, and use runtime tooling modes. Retrieval context was tightened so that answers are grounded in O Language material rather than being loosely associated with it.

The publishing side also matured. GGUF artifacts can be exported and uploaded separately, model files are uploaded in smaller batches, incompatible Xet behavior is disabled, merged artifacts are excluded from uploads, and Hugging Face authentication is handled before publishing. A `llama-cli` target was added so the model can be exercised through a local command-line path.

This is a useful example of the relationship between language design and AI tooling. A programming model is only as reliable as the material used to ground it. By using the actual language documentation, examples, project conventions, and runtime details, the model can become a practical assistant for the ecosystem rather than a generic coding model that happens to know a little about O Language.

## OnixOS build engineering: multi-architecture work became operational

The [OnixOS build system](https://gitlab.com/onix-os/onix-build-system) has a much longer history, but the recent period concentrated on multi-architecture builds, isolated package environments, repository publication, and ISO generation. Hundreds of commits in the repository reflect how many small assumptions are involved in a real distribution build.

The build system gained architecture-aware repository and ISO flows, per-architecture chroots, QEMU-backed non-native Docker builds, architecture-specific `makepkg.conf` handling, and support for `x86_64_v2` and `x86_64_v3` targets. Package builds are kept isolated, dependencies are resolved inside the correct environment, and build outputs, logs, staging directories, repositories, and ISOs are kept under a predictable output layout.

The Jenkins pipeline was repeatedly tightened. Repository and ISO stages were separated, builds were made linear and gated, repository synchronization happens before selecting ISO architectures, and each architecture is handled explicitly. The pipeline now prints ISO build logs, exposes profile build failures, cleans stale workers and orphaned build processes, prepares reusable QEMU workers, and avoids accidental re-entry or relative-path reuse of stale workspaces.

There was also a deliberate change in defaults. Targeted commands such as ISO, synchronization, repository, upload, and signing operations default to `x86_64` when no architecture is supplied, while CI refuses an empty architecture parameter. This combination keeps direct use bounded and makes automated jobs declare their intent.

The ISO path was refined to build profiles inside their workspace, honor the architectures declared by profiles, mark direct profile builds, publish profile-defined versioned filenames, and disable optional ISO chroot behavior by default. The base package set was updated to include the growing ecosystem around OnixOS, including OLF Deployment Manager, OnixOS Isolated VM, ODesk, the O Language package, and the new installer.

The result is not merely a faster build. It is a build that gives a more trustworthy answer to the question, “What exactly was built, for which architecture, from which sources, and with which result?”

## Packaging the platform

The package repositories turned a number of projects into installable OnixOS components. Recent package work included:

- [O Language](https://gitlab.com/onix-os/onixos-packages/olang), with PKGBUILD updates and a version derived from git state.
- [OnixOS Isolated VM](https://gitlab.com/onix-os/onixos-packages/onixos-isolated-vm), with layered profiles and overlay-based storage.
- [OLF Deployment Manager](https://gitlab.com/onix-os/onixos-packages/olf-deployment-manager), with the deployment dashboard and runtime lifecycle fixes.
- [Onix AI Core](https://gitlab.com/onix-os/onixos-packages/onix-ai-core), with the AI server/client package and a hardened Arch system service.
- [Onix AI GUI](https://gitlab.com/onix-os/onixos-packages/onix-ai-gui), with IDE and desktop extensions and configurable localization.
- [OnixOS CLI Installer](https://gitlab.com/onix-os/onixos-packages/onixos-cli-installer), with a curses wizard, selectable installation groups, unattended profile installs, and completed profile package selections.
- Kernel variants, Calamares, ODesk, XFCE utilities, and the other base and desktop packages needed to assemble a usable system.

The repositories also received MIT license and Onix OS Core Team attribution updates. These may look administrative compared with runtime features, but clear ownership, licensing, and package boundaries matter when a collection of experiments starts becoming a distributable operating system.

## Isolated environments and deployment

The [OnixOS Isolated VM project](https://gitlab.com/onix-os/onixos-packages/onixos-isolated-vm) moved from an early sandbox concept toward a more complete layered runtime. It introduced profile volumes, interactive shells, custom profile initialization, a GTK client, and an IPC server. Later changes replaced the initial SquashFS-centered storage approach with a kernel overlayfs layout and separated isolated products, sources, and build outputs more cleanly.

The runtime now works to recover profile sessions and stale overlay work directories, map system files correctly into the root, preserve the image lower layer while using an overlay upper layer, and keep the root filesystem in the main package. The pacman keyring overlay was seeded as part of making the environment more usable. These changes address the lifecycle problems that appear after the first successful launch: cleanup, recovery, packaging, and repeatable startup.

The [OLF Deployment Manager](https://gitlab.com/onix-os/onixos-packages/olf-deployment-manager) received a similarly practical set of changes. The dashboard was modernized with a React-based interface, project tables, project detail views, light and dark themes, system resource metrics, English localization, status badges, and the detected Olang version. Project operations gained safer form handling, unique deployment IDs, Git update support, deletion checks, runtime process and port tracking, and deployment activity logging.

The runtime can now launch projects through their `proc` command expression, track their processes and previews, and open previews on the configured deployment port. Missing deployment records and directories are handled more deliberately, while action toasts and confirmation dialogs make destructive operations clearer in the UI.

Together, the isolated VM and deployment manager provide two sides of the same goal: a project should be possible to start, observe, stop, recover, and remove without leaving behind an ambiguous state.

## ODesk and the desktop experience

The [ODesk desktop](https://gitlab.com/onix-os/applications/odesk) went through a concentrated usability and rendering pass. The work included a hybrid, configuration-driven shell theme, a new aqua desktop concept, centralized palettes, system fonts and icon-theme fallbacks, rounded surfaces, and a more stable startup surface.

The final fixes concentrated on the details users notice immediately: popup menus staying above the desktop surface, search and system icons returning, frame borders rendering correctly, workspace switching, icon labels and window controls aligning, and shell windows remaining inside the display bounds. Taskbar flicker was fixed, shell surfaces were made more reliable to repaint, and compositor behavior was stabilized. Tiling-related behavior was added as well.

An Arch Linux desktop session installer now provides X11 and Wayland session entries together with installation and uninstall scripts. That makes ODesk easier to test and use outside a custom image, which is a necessary step if the desktop is to become part of an ordinary distribution workflow.

## SpamAssassin: treating trust as a layered decision

The [spamassassin-custom-list repository](https://github.com/oytunistrator/spamassassin-custom-list) is a drop-in custom ruleset for `/etc/spamassassin`. It combines DNSBL and URIBL reputation, SPF/DKIM/DMARC signals, body and header heuristics, composite meta rules, editable lists, and Turkish-language spam detection. Bayesian learning is disabled by default, so the behavior is explicit and inspectable.

One of the most important changes was removing broad whitelists for consumer and major global mail providers. A message from Gmail, Outlook, or another large provider can still be unwanted, and a valid SPF, DKIM, or DMARC result only proves something about authentication and domain alignment. It does not prove that the recipient asked for the message. The ruleset now treats authentication as evidence, not as an automatic allow-list.

The rules also cover a recognizable advance-fee and fake-business pattern: bulk-purchase language, wire-transfer or payment terms, catalog requests, foreign-business wording, free-mail senders, and undisclosed recipients. These signals are combined in a meta rule so that one ordinary word does not become a false positive by itself.

The latest detection work focuses on fake delivery-status messages. Some spam messages imitate Microsoft-style bounce notifications and use an empty `Return-Path`, missing `Date` or `Message-Id` headers, delivery-failure template language, hidden text, and an urgent “confirm to continue” request. The new `META_FAKE_BOUNCE` rule looks for a combination of these signals and assigns a high score. A sample message and test-script entry were added so the behavior can be checked with `spamassassin --lint` and the included test suite.

The installation model was also made safer. The repository lives in its own subdirectory and `install.sh` creates a small include file, `zz_oytun_custom_list.cf`, rather than copying over existing configuration. Removing that include disables the ruleset without requiring a rollback of unrelated administrator settings. Numeric file prefixes keep the loading order stable, from local configuration and plugins through DNS reputation, authentication, content rules, lists, scoring, and final actions.

## Global blocklists: making the data pipeline safer

The [global blocklist project](https://gitlab.com/odznames/global-blocklist) reads firewall and Suricata logs from IPFire over SSH and produces two artifacts: a custom IP blocklist and an AbuseIPDB bulk-report CSV. The generated blocklist is then distributed back to IPFire through GitLab.

The recent work reorganized the project around environment-driven configuration, a Makefile, documentation, a local Python virtual environment, and clearer SSH behavior. It supports SSH keys and password fallback, caches a password only in memory for a run, handles non-standard SSH ports, and provides strict-host-key-checking options.

The log processing path was hardened as well. Private and reserved addresses are excluded automatically, Cloudflare ranges can be excluded through the example configuration, invalid exclusion entries no longer cause a type error, and diagnostics explain how exclusions were loaded. Gzip handling was changed to avoid a segmentation-fault-prone path and to iterate compressed streams correctly.

The generated data is deduplicated across runs: IPs already present in `customlist.txt` are not repeated in the AbuseIPDB report, and merging with the existing list avoids duplicate entries. These are small data-quality protections, but they matter when a list is consumed automatically by a firewall or submitted to an abuse-reporting service.

## What has changed in the way I work

Looking at all of these histories together, I see a shift from adding isolated capabilities to building boundaries between capabilities.

The O Language web CLI gives applications a standard entry point. The loader and request-scoped context make that entry point safer at runtime. The documentation repository explains it. OLF can deploy and observe it. The OnixOS package and build systems can distribute it. The isolated VM can provide a controlled environment for it. The AI model pipeline can help people learn and use it. The mail and network security projects apply the same preference for explicit, layered signals to a different class of operational problem.

The common lesson is that reliability does not come from one large feature. It comes from many boundaries behaving clearly:

- a missing architecture must not silently expand a build;
- a missing runtime value must not become a host panic;
- an authenticated sender must not automatically become a trusted sender;
- a failed deployment must not leave an invisible process behind;
- a generated blocklist must not accumulate duplicates;
- a model must not be considered grounded merely because it was trained on loosely related text.

## What comes next

There is still significant work ahead. The build system will continue to need testing across architectures and profiles. O Language needs more production web examples, broader runtime coverage, and continued documentation synchronization. OLF and the isolated VM need more lifecycle testing. The AI model needs evaluation against real O Language tasks, not only dataset and packaging checks. SpamAssassin rules need ongoing review against false positives and new campaigns, while the blocklist pipeline needs continued attention to source quality and reporting thresholds.

But the direction is encouraging. O Language is gaining a coherent application workflow. OnixOS is gaining a more disciplined build and packaging foundation. The desktop, deployment, isolation, AI, mail, and network projects are becoming parts of the same practical ecosystem.

That is the real summary of this period: not simply that many commits were made, but that the projects are becoming easier to build, easier to understand, safer to operate, and more useful together.

*Happy hacking.*
