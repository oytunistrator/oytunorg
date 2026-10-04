---
title: "OnixOS Adds New Kubernetes, TV, and Mobile Profiles"
layout: post
categories: [Development, Linux, OnixOS, OpenSource]
tags: [onixos, profiles, kubernetes, plasma-bigscreen, plasma-mobile, qvm, olfdm, open-source]
comments: true
toc: true
---

OnixOS is gaining several profiles aimed at very different kinds of hardware and
workloads. The new [Kubernetes profile](https://gitlab.com/onix-os/onixos-profiles/onixos-k8s-edition)
targets an API-managed immutable runtime. The [TV profile](https://gitlab.com/onix-os/onixos-profiles/onixos-tv-edition)
packages Plasma Bigscreen into bootable disk images. The [Mobile profile](https://gitlab.com/onix-os/onixos-profiles/onixos-mobile-edition)
creates a Plasma Mobile base that can be adapted to several ARM devices.

These are not three desktop themes with different package lists. Each profile
defines a different boot artifact, management boundary, and hardware assumption.
That distinction is the most important part of this week's work.

## Why profiles are useful

An operating system profile is a practical way to keep a common base while
making the result specific to a purpose. A server image should not carry the
same interactive tools as a living-room image. A mobile image cannot assume
that a generic ARM kernel is enough to boot every phone. A Kubernetes worker
needs a different security boundary from a system intended for daily desktop
use.

The profiles make these decisions visible in source code. Their README files and
build definitions describe both the intended result and the remaining work. The
TODO documents make the unfinished parts explicit. That is healthier than
calling every generated image finished simply because a build script can produce
a file.

## OnixOS Kubernetes Edition

The Kubernetes profile is the most infrastructure-oriented of the three. It
has two roles:

* The `master` image provides an API-only maintenance and control-plane surface.
* The `worker` image is intended to host workloads and enroll through the master
  release and iPXE flow.

The runtime policy deliberately removes SSH, interactive shells, and package
managers from the target root. Kubernetes, Docker, Podman, KubeVirt, and libvirt
are represented through typed API and provider boundaries. They are not managed
by logging into the machine and running arbitrary shell commands.

The operator workflow is exposed through `oksctl`. A small configuration flow
looks like this:

```sh
oksctl gen secrets --management-endpoint https://master.example:7443 \
  --output-dir ./prod-pki
oksctl config init --endpoint https://master.example:7443 \
  --ca ./prod-pki/server-ca.crt \
  --cert ./prod-pki/admin.crt \
  --key ./prod-pki/admin.key
oksctl health
oksctl cluster status
oksctl workers list
```

The profile currently builds for `x86_64`. It emits role-specific raw images,
VM and cloud artifacts, platform manifests, and an iPXE bundle for the worker.
The repository is careful about the boundary between an artifact and a finished
deployment. The master does not yet publish release files or configure DHCP.
Cloud artifacts are marked as not provider-ready, while the installed-disk and
rollback path remain separate future work.

That honesty matters for an infrastructure profile. A generated `.img` file is
not the same thing as a validated Kubernetes cluster. The current profile has a
useful management contract, but its README and TODO list still identify the
parts that need hardware, provider, and end-to-end validation.

## OnixOS TV Edition

The TV profile takes a different approach. It is derived from the `core` profile
and starts Plasma Bigscreen automatically. The package selection includes Kodi,
VLC, media players, streaming tools, optical-media utilities, and Raspberry Pi
media packages where the architecture supports them.

The published artifact is a raw disk image, not an ISO. The current targets are:

| Target | Output |
| --- | --- |
| `x86_64` | UEFI and legacy BIOS images |
| `aarch64` | Raspberry Pi oriented UEFI image |

The default session user is `oltv`. The `oltv-config` tool is intended to make
the first boot usable without turning the profile into a general desktop
installer. It covers the user account, NetworkManager setup, optional
applications, audio, Bluetooth, display, media-player preferences, tuner
detection, and root filesystem expansion.

Persistent settings are stored on the writable boot partition and restored by
`oltv-config-restore.service` before SDDM starts. Existing configuration is not
silently replaced by the profile default. This is a small but important design
choice for a device that may be rebooted often and operated from a remote
control or a television screen.

The TV profile is still under development. For example, detecting a tuner under
`/dev/dvb` or `/dev/video*` is not the same as providing a complete live-TV
experience. A backend, channel scanning, EPG, recording, and hardware-specific
validation are still separate concerns. The profile's TODO document records
those limits instead of hiding them behind a long application list.

## OnixOS Mobile Edition

The Mobile profile is built around KDE Plasma Mobile and a Wayland session. It
includes touch-friendly input and SDDM autologin, together with the services
needed for networking, modems, Bluetooth, audio, power management, and cameras.
It also includes basic mobile KDE applications.

It declares three build architectures:

```text
x86_64   desktop or UEFI test hardware
aarch64  64-bit ARM phones and development boards
armv7h   32-bit ARM development boards and compatible devices
```

Each target produces a UEFI image and a compressed root filesystem archive.
The image is intentionally generic. A phone still needs its own kernel and
device tree, as well as matching firmware, bootloader layout, and partition
scheme. The profile does not claim that selecting `aarch64` automatically makes
every ARM phone bootable.

This is why the repository now has device profile records for hardware such as
the PinePhone, PinePhone Pro, Librem 5, and Samsung Galaxy S3. Those records
are a porting inventory and a place to describe device assumptions. They are
not a substitute for booting and validating each device.

## A note from the week behind the code

This work started in the middle of an ordinary winter week. We spent more time
indoors. While meeting friends at a cafe to talk about artificial intelligence
and networking, I started thinking about the Kubernetes profile.
The conversation also reminded me how easily technical discussions become a
discussion about money, status, and who is considered successful.

Some people treat visible consumption as proof of value. They praise wealth and
reduce every subject to a salary or a bank balance. They also look down on
anyone whose life does not follow that pattern. A person can live in a stable
situation without showing it off. They may prefer a simple life and still be
treated as if they are doing something wrong because they are not performing the
expected social role.

When we keep directing our resources toward small daily comforts and expensive
luxuries, it becomes harder to focus on long-term goals. We pay large companies
for short-lived comforts, while they turn those repeated payments into more
capital. If we do not use our resources carefully and leave room for a simpler
life, we can become trapped in the machinery of consumption. The temporary
pleasure of buying something can cost us time, savings, and the ability to work
toward what we actually want.

The more useful questions are different: What do I want to produce? What do I
want to learn? What do I genuinely want in my life, and which goals deserve my
limited time and resources? Spending our lives trying to keep up with somebody
else's luxury and display means spending our own future on a race we did not
choose.

This week also brought a financial crisis in which people lost money and
resources. I am not treating that as a reason to make a financial prediction.
It was a clear reminder that many services we depend on are controlled by
somebody else.
If a company changes its terms, freezes access, or shuts down a service, users
can be left with very little control over what they thought they owned or could
rely on. That is why I do not want to become completely dependent on expensive
products, convenient platforms, or any single provider. The more important
parts of life should remain under our own control. We should be able to keep
learning, saving, building, and choosing without depending entirely on one
provider.

I do not think everyone has to live according to somebody else's taste. A
simple life can leave room for maintaining a distribution, building software,
and following ideas that may not produce an immediate financial return. Buying
the most expensive thing available does not automatically make a person more
creative or more useful. Producing something, learning how it works, and
sharing the result are different kinds of value.

That is part of why I keep returning to open source work. It gives me a way to
spend time on systems that are concrete. The profile either declares a real
package, produces a real artifact, or exposes a real limitation. It is much
harder to sustain a status performance when the source code and the boot
behavior are both visible.

I have attended many events across Turkey over the years, but we could never
get a project mirror from the Linux Users Association (LKD). To me, that
reflects a broader problem in Turkey. Despite repeatedly applying for speaker
and trainer roles, I have often been met with more bureaucracy and labelled
inexperienced.
That response is connected to problems we experienced with distribution
maintainers in the past. The deeper problem is that bureaucracy makes it
difficult to take action.

Our experience abroad has been different. Most of the applications we made with
OnixOS were accepted, and the distribution is now listed on
[DistroWatch](https://distrowatch.com/table.php?distribution=onixos). That is
why I am putting more effort into this work here. The project can move forward
through visible artifacts and concrete technical work, even when local processes
keep adding friction.

## Two packages moving with the profiles

The profile work is happening alongside new OnixOS packages. Two of them are
particularly relevant to the current direction.

### QVM CLI

The [QVM CLI package](https://gitlab.com/onix-os/onixos-packages/qvm-cli)
provides a Go-based quantum simulator with a versioned QCore machine image and
a CPU state-vector backend. The documented local workflow separates project
validation, image creation, execution, and supervisor control:

```sh
qvm init
qvm validate
qvm build
qvm inspect --format json
qvm run --workers 2 --format json
```

The supervisor can also be started separately:

```sh
mkdir -p "$HOME/.local/share/qvm"
cd "$HOME/.local/share/qvm"
qvm serve
```

The current scope is intentionally CPU-first. GPU, distributed, and Docker
providers are not presented as already implemented. The package includes
systemd units and structured JSON contracts, which makes it a useful building
block for later OnixOS integration without pretending that a future provider
already exists.

### OLF Deployment Manager

The [OLF Deployment Manager package](https://gitlab.com/onix-os/onixos-packages/olf-deployment-manager)
is an O Language service for managing O Language web projects. Its current
configuration reads `OLFDM_PORT`, data, incoming, projects, public, and
template paths from `.env`. The checked-in default listens on port `10000` and
stores deployment state in separate data, incoming, and projects directories.

The service runs as the dedicated `olfdm` user through systemd. Its API already
has boundaries for project creation, health checks, lifecycle control, Git
source management, artifact uploads, and deployments. In other words, this is
not only a package containing a web page. It has a service account, persistent
state directories, migrations, and an operational lifecycle.

The repository's own documentation still describes the project as incomplete,
so I am treating it as an active package under development. Its practical use
today is to provide an OnixOS-packaged deployment surface for O Language
projects while the profile and service contracts continue to mature.

## What comes next

The three profiles do not share the same next milestone. Kubernetes needs more
provider and boot validation. TV needs real hardware matrices, safer first-run
credentials, and a fuller tuner and media-session story. Mobile needs more
device-specific kernels, firmware, boot paths, and end-to-end testing.

That is a good place for OnixOS to be. The new profiles make the intended use
cases concrete, while their TODO files keep the unfinished parts visible. The
next step is not to call them complete. It is to keep turning each profile's
assumptions into tested, documented behavior.

## Sources

- [OnixOS Kubernetes Edition](https://gitlab.com/onix-os/onixos-profiles/onixos-k8s-edition)
- [OnixOS TV Edition](https://gitlab.com/onix-os/onixos-profiles/onixos-tv-edition)
- [OnixOS Mobile Edition](https://gitlab.com/onix-os/onixos-profiles/onixos-mobile-edition)
- [QVM CLI package](https://gitlab.com/onix-os/onixos-packages/qvm-cli)
- [OLF Deployment Manager package](https://gitlab.com/onix-os/onixos-packages/olf-deployment-manager)
- [Fon krizi, Google News search](https://news.google.com/search?q=fon%20krizi&hl=tr&gl=TR&ceid=TR%3Atr)
- [OnixOS on DistroWatch](https://distrowatch.com/table.php?distribution=onixos)
