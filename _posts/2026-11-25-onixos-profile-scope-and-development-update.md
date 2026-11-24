---
title: "OnixOS Profile Scope and Development Update"
layout: post
categories: [Development, Linux, OpenSource]
tags: [onixos, olanguage, open-source, profiles]
comments: true
toc: true
---

In working life, people love to say, “Look what I achieved.” They can talk about their own work without asking what others have experienced or how they reached their conclusions. Work then becomes an ego contest. Who has more money, who achieved more, who got further: while those questions take over, learning and making useful things move to the background.

I think one of our society's biggest problems is the shortage of people with deep experience in their fields. Instead of creating something original, we often copy ideas and then use them to compete with one another. I see an inferiority complex, selfishness, and the pursuit of personal gain at the root of this behavior. The spread of AI tools has added another risk: the urge to get faster results can push reading and deliberate learning aside. As it gets easier to hand a task to AI, it also gets easier to accept an answer without understanding it.

I believe a society that stops reading will eventually decline. I do not know when this pointless race will end. What I do know is that there has been serious progress on OnixOS, and I want to write about it. The rest of this post is about OnixOS, O Language, and how to contribute to the project.

## Why I am reducing the OnixOS profile set

I have created many OnixOS profiles for different uses. Developing each profile, keeping its packages compatible, and testing the resulting ISO or image from start to finish takes considerable time. Adding a profile is not just a matter of duplicating a package list. Its boot process, installation path, hardware assumptions, and first-boot behavior all need attention too.

It took me about three years to establish the core structure. Alongside changes in O Language, I think the system and `onix-build-system` have become more functional. The build system defines repository targets for architectures such as `x86_64`, `aarch64`, and `armv7h`. However, an architecture being available in the build system does not mean every profile is ready and validated for it. The current profile documentation says the standard installation profiles target x86_64. Other architectures require compatible profile manifests, packages, and device testing.

I am choosing to focus on modern architectures and profiles I can maintain instead of treating every idea for older hardware as a separate product. I have decided to retire or remove these profiles from the default development scope:

- `onixos-retro-edition`: I like retro systems, but I am prioritizing modern architectures.
- `onixos-floppy-edition`: The constraints of a floppy-focused profile no longer match the needs of current hardware and usage.
- ARM and Raspberry Pi editions: I may return to the mobile direction later, but it is on hold while I lack suitable test devices and validation capacity.
- TV Edition: I am focusing on the KDE Edition instead of maintaining a separate TV profile.
- Other unused or inactive profiles: I will review them and mark them deprecated where appropriate.

The standard profile list in the build system currently contains `core`, `kde`, `xfce`, `server`, `security`, and `gnome`. Keeping this list small makes it more realistic to review each profile's packages, installation path, and ISO behavior.

A few profiles are still under review:

- `onixos-k8s-edition`: If we cannot maintain the repository and system testing it requires, we may have to remove it. We can also evaluate Kubernetes use through the Server profile.
- `onixos-doomsay-edition`: A separate ISO profile seems less necessary now. The `onix-doomsay` command provides local access to some content for emergencies when there is no internet connection. I will first evaluate whether that use case covers the need for a separate profile.
- `onixos-mobile-edition`: It is on hold because I do not yet have a suitable test device.

This does not mean every profile source has been deleted. Some may remain experimental or outside active development. The goal is to maintain a core set that I can keep validating.

## Recent build and installation work

I think most profiles are approaching basic stability, but this is not a completed acceptance test. There are fewer open items on the [GitLab board](https://gitlab.com/groups/onix-os/-/boards#/), and some are still being tested.

The installation paths have also progressed. Source-level issues in `calamares-onix`, the graphical installer, have been addressed. The Core CLI installer and Server installer can prepare an installation based on selected options. The Server installer adjusts packages, services, and bootloader setup according to those selections. Source checks and fixes alone do not prove that an installation completes successfully on real or virtual hardware. I am continuing to run and verify these flows in installation attempts.

Recent fixes include locale generation in the Core live environment, running the Calamares finalization step inside the target system root, and locale generation in the CLI installer. These may look like small details, but they matter when keeping the live environment separate from the installed system.

One of my next goals is to prepare the `2612-ELTS` release. I do not consider it ready to publish until a few more tests are complete. The remaining work is tracked on the [onix-build-system milestone page](https://gitlab.com/onix-os/onix-build-system/-/milestones/1#tab-issues).

## O Language and development tools

O Language is a separate project that I develop alongside OnixOS packaging and system tools. The latest commits visible in my local O Language checkout are from August 2026. Work in that period included centralizing the web project loader, adding typed route scaffolding, and showing command progress. These features show development not only in the language syntax and runtime, but also in project creation and the development workflow.

OnixOS and O Language have distinct roles. O Language develops its own language and toolchain. OnixOS provides an environment where those tools can be packaged, included in profiles, and used on the system. The build system brings package sources, architecture targets, profiles, and image production together. Being part of the same project does not mean every part is equally complete or has reached the same level of testing.

There are also useful examples in the package set. The active base package list includes `olang`, `qvm-cli`, `onix-doomsay`, `onix-updater`, and `onix-ai-gui`. `onix-doomsay` recently received work on its split-pane terminal interface, search shortcuts, and mouse and keyboard input. `qvm-cli` is the packaged quantum simulator, while the `olang` package brings the language toolchain into the repository. These are separate tools that can be maintained and delivered through the same package build process; they do not need a dedicated operating system profile for each one.

## How to start developing a profile

I have already published [profile development documentation](https://onix-project.com/docs/profile-development/) for people who want to learn profile or package development. I am including the basic path here as well, both to avoid repeating the same explanations and to give contributors a concrete starting point.

As an example, clone the [Core profile](https://gitlab.com/onix-os/onixos-profiles/core):

```bash
git clone https://gitlab.com/onix-os/onixos-profiles/core.git
cd core
make build
```

The `build` target in the profile's `Makefile` runs the profile build script with `sudo`. That script calls `mkarchiso` to produce an ISO. You need a suitable Arch-based build environment, the required tools, network access, and enough disk space. Showing this command is not a claim that I ran a new ISO build while preparing this post.

When inspecting a profile, do not look only at `packages.x86_64`. `profiledef.sh` declares the architecture and boot modes; `pacman.conf` selects the repositories; `airootfs/` contains files and services added to the live system; and `syslinux/` and `efiboot/` contain boot entries for the relevant modes. Before adding a package, check that the package exists in the configured repositories and supports the profile's architecture.

For package development, the [Arch Linux PKGBUILD guide](https://wiki.archlinux.org/title/PKGBUILD) is a good starting point. A `PKGBUILD` is a Bash build description read by `makepkg`. It defines the package name and version, license, architecture, dependencies, source files, and packaging steps. A simplified recipe looks like this:

```bash
pkgname=example-package
pkgver=1.0.0
pkgrel=1
pkgdesc="Short package description"
arch=('x86_64')
url="https://example.org/project"
license=('MIT')
depends=('bash')
source=("$pkgname-$pkgver.tar.gz::https://example.org/$pkgname-$pkgver.tar.gz")
sha256sums=('replace-with-the-real-source-archive-sha256')

build() {
  cd "$srcdir/$pkgname-$pkgver"
  ./configure --prefix=/usr
  make
}

package() {
  cd "$srcdir/$pkgname-$pkgver"
  make DESTDIR="$pkgdir" install
}
```

This is only a teaching skeleton. Adapt it to the actual source archive, build system, and supported architectures of the package. In an appropriate Arch build environment, these commands verify the source, build a local package, and generate `.SRCINFO` metadata:

```bash
makepkg --verifysource
makepkg --syncdeps --cleanbuild
makepkg --printsrcinfo > .SRCINFO
```

A package archive produced locally is not automatically published in an OnixOS repository. The package project must be selected by the build system and pass through the repository build process. Likewise, successfully building a profile locally does not prove that its image works on real hardware or that its installation path is correct. The profile documentation recommends reviewing the architecture, package compatibility, live system files, and boot modes together.

## Working alone and the testing load

I also need to add that some of the developers who were with us will no longer be part of the team. We do not currently have enough active developers, so I have to continue solo. System testing can take longer as a result.

In my current workflow, a complete repository build takes about 26 to 48 hours, and ISO or image builds can take 8 to 12 hours. Afterward, I have to boot each resulting profile and manually check basic stability and installation behavior. These are not guaranteed timings for every build. They are my current experience and vary with the selected targets and the workload at the time.

We previously announced on the forum that we were looking for developer support. Some people who joined the team could not dedicate enough time or contribute regularly, so I had to reduce the team. As a result, I am carrying most of the development work alone. This directly affects the project's testing capacity and the pace at which we can introduce profiles.

Anyone who wants to contribute can contact the core team through the forum's [OnixOS development and contributor support thread](https://forum.onix-project.com/d/9-onix-os-gelistirme-sureci-icin-dev-ekibi-ve-katkici-destegi/2) or the Telegram groups. The documentation above is a starting point for people who want to learn profile or package development. A small contribution that is completed and maintained is more valuable than another profile idea by itself.

The next step for OnixOS is to validate the profiles we already have against real installation and usage scenarios, rather than adding more profiles. Narrowing the scope is a technical decision I made to establish a sustainable maintenance routine and close the remaining tests before `2612-ELTS`.

## References

- [OnixOS profile development documentation](https://onix-project.com/docs/profile-development/)
- [OnixOS package build documentation](https://onix-project.com/docs/package-builds/)
- [OnixOS build system profile list](https://gitlab.com/onix-os/onix-build-system/-/blob/main/sources/profiles.list)
- [OnixOS build system architecture configuration](https://gitlab.com/onix-os/onix-build-system/-/blob/main/sources/architectures.conf)
- [Core profile source](https://gitlab.com/onix-os/onixos-profiles/core)
- [Core profile Makefile](https://gitlab.com/onix-os/onixos-profiles/core/-/blob/main/Makefile)
- [OnixOS base package source list](https://gitlab.com/onix-os/onix-build-system/-/blob/main/sources/base.list)
- [Calamares Onix package](https://gitlab.com/onix-os/onixos-packages/calamares-onix)
- [OnixOS CLI installer package](https://gitlab.com/onix-os/onixos-packages/onixos-cli-installer)
- [OnixOS Server profile and installer](https://gitlab.com/onix-os/onixos-profiles/server)
- [O Language repository](https://gitlab.com/olanguage/olang), with commits for [centralized web project loading](https://gitlab.com/olanguage/olang/-/commit/eb2301c), [typed route scaffolding](https://gitlab.com/olanguage/olang/-/commit/c5451b2), and [command progress output](https://gitlab.com/olanguage/olang/-/commit/866a79c)
- Package examples: [onix-doomsay](https://gitlab.com/onix-os/onixos-packages/onix-doomsay), [qvm-cli](https://gitlab.com/onix-os/onixos-packages/qvm-cli), and [olang](https://gitlab.com/onix-os/onixos-packages/olang)
- [OnixOS GitLab issue board](https://gitlab.com/groups/onix-os/-/boards#/)
- [2612-ELTS milestone issues](https://gitlab.com/onix-os/onix-build-system/-/milestones/1#tab-issues)
- [OnixOS developer and contributor support thread](https://forum.onix-project.com/d/9-onix-os-gelistirme-sureci-icin-dev-ekibi-ve-katkici-destegi/2)
- [ArchWiki PKGBUILD guide](https://wiki.archlinux.org/title/PKGBUILD)
