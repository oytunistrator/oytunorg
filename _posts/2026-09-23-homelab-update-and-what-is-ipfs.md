---
title: "Homelab Update (September 23, 2026) and What Is IPFS?"
layout: post
comments: true
toc: true
permalink: "/p/:title/"
categories:
- Homelab
- Infrastructure
- Networking
- Engineering
- Open Source
tags:
- homelab
- xcp-ng
- docker
- virtualization
- ipfs
- networking
- self-hosting
- infrastructure
---

My homelab has changed substantially over the last year. This was not a
single hardware upgrade. It was a gradual redesign driven by a simple question:
which machine should be responsible for which workload?

The previous setup had several systems doing jobs they were not particularly
well suited for. Some machines were powerful enough but inefficient. Others
were still useful, but only as test systems. A few devices were being kept
because they had once been important, not because they still had a sensible
role.

The current layout is more deliberate. Production workloads run on a proper
virtualisation host. Development work is isolated on another server. Repeated
services are distributed across a small Docker cluster. The public-facing web
layer has its own machine, and the firewall is separate from all of them.

This is the current state of the lab.

## Production virtualisation server

The main production host is an XCP-ng server based on a Dell PowerEdge R740xd.
It is the machine that carries the most important virtual machines and the
services that should remain available even when I am working on another part of
the environment.

Its current configuration is:

| Component | Specification |
| --- | --- |
| Server | Dell PowerEdge R740xd |
| CPUs | 2 × Intel Xeon Gold 6248R |
| Memory | 1 TB RAM |
| Storage | SanDisk SN670, 61.2 TB |
| GPU | 2 × NVIDIA RTX A5000 |
| Hypervisor | XCP-ng |

The processors were upgraded to two Xeon Gold 6248R units. The point of that
upgrade was not to make the server look impressive on a specification sheet.
The host needs to run several virtual machines concurrently, and CPU capacity
becomes important when background jobs, storage operations, application
services, and development environments overlap.

The 1 TB memory configuration gives the host enough room to keep multiple
virtual machines active without treating every workload as a scheduling
problem. Memory is particularly useful here because virtualisation becomes
much less pleasant when the host is constantly reclaiming memory or pushing
workloads into swap.

The 61.2 TB SanDisk SN670 pool is the other major part of the system. It gives
the production environment a large local storage boundary for virtual machine
disks, application data, and services that need predictable access. Capacity
alone does not make storage a backup, so I still treat this as primary storage,
not as a complete disaster-recovery plan.

The two RTX A5000 cards are available to workloads that can make practical use
of GPU access. They are also useful for experiments that need more than CPU
resources. Keeping them in the production host means the hardware can be
assigned to a virtual machine when required instead of having to rebuild the
environment around a separate workstation.

In day-to-day use, both the production and development servers are also part of
my testing workflow. I use them for simple hardware tests, network-related
experiments, and infrastructure checks. Software usually moves from
development to production through the same environment: I test it on the
development server first, then deploy and verify it on production. This gives
me a practical Dev-to-Prod path instead of treating production as an entirely
separate and untested target.

## Development virtualisation server

The development host is an older XCP-ng server. I call it `dev-server`, and it
is intentionally separate from the production machine.

Its configuration is:

| Component | Specification |
| --- | --- |
| CPU | Intel Xeon E5-2650 v2 |
| Memory | 64 GB RAM |
| Storage | 4 TB SSD + 4 TB HDD |
| GPU | NVIDIA GTX 1660 6 GB |
| Additional GPU | NVIDIA GT 710 1 GB |
| Hypervisor | XCP-ng |

This machine is not competing with the production host. Its value is isolation.
I can test operating-system changes, deployment ideas, virtual machines, and
failure scenarios without putting the production environment at risk.

I also moved old disks into this server and use them as a kind of storage
dumpster. More precisely, it is a controlled place for disks that are old,
slow, mismatched, or not trustworthy enough to become part of primary storage.
The current collection includes:

- 3 × 2 TB HDD
- 2 × 1 TB HDD

These disks came from older servers. They are useful for temporary data,
installation media, disposable test environments, and experiments where data
can be recreated. They are not the place for the only copy of anything
important. The purpose of this layer is to make old hardware useful without
pretending that it has the reliability of a new storage array.

## The new Docker cluster

The Docker cluster is completely new. It consists of four Lenovo ThinkCentre
M910q systems. I bought the machines specifically for this role and added a
1 TB HDD to each one.

Each node has:

| Component | Specification |
| --- | --- |
| Nodes | 4 × Lenovo ThinkCentre M910q |
| Memory | 8 GB RAM per node |
| System storage | 256 GB SSD per node |
| Additional storage | 1 TB HDD per node |
| Runtime | Docker-based cluster |

The cluster is now complete. The four machines are connected to each other and
services run in a way that allows work to be distributed and scaled behind the
scenes. I generally expose services through the web layer and route requests
through a proxy to the appropriate Docker workload.

Using four ThinkCentre M910q systems also gives me a modest saving compared
with keeping larger, older systems running for the same container workloads.
The saving is not dramatic enough to call it a major financial optimisation,
but the machines use less space and generally require less power. Across a
long-running homelab, that difference is still worthwhile.

This arrangement gives me a useful separation of concerns. The proxy does not
need to know how every service is implemented. A service can be moved to
another node, replicated, or restarted without changing the public entry point
for the application.

The cluster is not intended to be a replacement for the production
virtualisation server. It is a focused platform for containerised services. The
small nodes are easier to replace individually, and four modest machines give
me more operational flexibility than one larger desktop with everything packed
into it.

## Web server

The web server is an Intel NUC Pro with the following configuration:

| Component | Specification |
| --- | --- |
| Memory | 32 GB RAM |
| Storage | 8 TB SSD |
| Role | Web-facing services and entry point |

I keep the web layer separate because it is the boundary between the internal
lab and the services exposed to users. It is a natural place for the reverse
proxy, routing rules, TLS termination, and other HTTP-related responsibilities.

This separation also makes the rest of the environment easier to reason about.
The Docker nodes can focus on running services, while the web server focuses on
receiving requests and forwarding them to the correct destination.

## Firewall

The firewall runs on a Beelink Mini with:

| Component | Specification |
| --- | --- |
| Memory | 8 GB RAM |
| Storage | 256 GB SSD |
| Role | Network boundary and firewall |

It is a small system, but that is appropriate for its job. A firewall does not
need to be combined with the web server, the Docker cluster, or the
virtualisation hosts. Keeping it independent means that a problem in an
application workload does not automatically become a problem in the network
boundary.

## The new NAS: QNAP TS-216G

The old Xeon system is no longer responsible for NAS duties. I moved that role
to a QNAP TS-216G and gave the storage a clearer boundary of its own. The NAS
now contains two 32 TB hard disks configured as a mirror, or RAID 1.

The QNAP configuration is:

| Component | Specification |
| --- | --- |
| Model | QNAP TS-216G |
| Drive bays | 2 × 3.5-inch SATA |
| Storage | 2 × 32 TB HDD |
| RAID layout | RAID 1 / mirror |
| Usable capacity | Approximately one disk's capacity |
| Memory | 4 GB onboard RAM |
| CPU | ARM quad-core Cortex-A55, 2.0 GHz |
| Network | 1 × 2.5GbE + 1 × 1GbE |
| Operating system | QTS |

In a mirror, both disks contain the same data. This means that a single disk
failure should not immediately make the volume unavailable; the failed disk can
be replaced and the array can be rebuilt. The trade-off is that two 32 TB disks
do not provide 64 TB of usable space. The usable capacity is roughly the
capacity of one disk, before filesystem and system overhead.

RAID 1 is useful for availability, but it is not a backup. Accidental deletion,
filesystem corruption, malware, or a problem that affects both disks can still
destroy the data. I therefore treat the QNAP as the central NAS and file
access point, while keeping separate copies of important data where necessary.

The TS-216G is a small two-bay system, but it is a better fit for this role than
the old Xeon machine. It uses considerably less power, occupies less space, and
does not require a general-purpose workstation platform just to serve files.
Its 2.5GbE interface is also useful for faster transfers inside the local
network, while the additional 1GbE port is available for a separate network
path or management use.

The drive bays are hot-swappable, which makes disk replacement less disruptive.
The QNAP also gives the storage role its own management interface and storage
services instead of making the old test workstation responsible for file
sharing. The official [QNAP TS-216G specifications](https://www.qnap.com/en/product/ts-216g)
list the device's two-bay design, ARM processor, onboard memory, and network
interfaces.

## Power protection and UPS layout

The servers and network equipment are not connected directly to the wall. I
use two UPS units to keep the infrastructure running through short power
interruptions and to give the systems enough time to shut down cleanly when a
longer outage occurs.

The production and development servers are connected to a 5 kVA UPS. These are
the two systems with the largest power draw and the most important virtual
machines, so they share the higher-capacity unit.

The Docker cluster, web server, modem, and firewall use the other UPS capacity,
which is divided into two units:

| Equipment | UPS capacity |
| --- | ---: |
| Modems, firewall, and web server | 2 kVA |
| Docker cluster | 1 kVA |

The separation is intentional. The network path remains powered independently
from the container nodes, while the production and development virtualisation
hosts have their own larger power boundary. This does not turn the homelab into
a full data-centre power system, but it prevents every small interruption from
becoming an immediate shutdown event. In the current setup, the UPS units can
keep the infrastructure powered for approximately 5 to 12 hours during a power
cut, depending on the active load and which services are running. That range is
not a promise for every possible workload; it is the practical operating range
I observe across the homelab.

The UPS units also help with power efficiency in the way the infrastructure is
operated. They do not create electricity or make the servers consume less than
their hardware requires, but they prevent repeated hard shutdowns, emergency
restarts, and unnecessary recovery cycles during unstable power. They also
provide a more stable power path for the equipment. In practice, this reduces
wasted energy and avoids the extra consumption caused by bringing several
servers and services back up after every short interruption.

## The electronics and experiment workstation

One of the oldest systems in the lab used to be my NAS server. It had once
worked inside the cabinet and contained a 4 TB HDD. After moving the NAS role
to the QNAP, I moved the remaining hardware into a small case and turned it
into a compact workstation for electronics, repair work, and physical hardware
testing.

Its current hardware is:

| Component | Specification |
| --- | --- |
| Motherboard | X58-Pro, a Chinese-market board |
| CPU | Intel Xeon E5620 at 2.6 GHz |
| Storage | 128 GB SSD |
| GPU | NVIDIA GT 1030 2 GB |
| Former role | NAS server |
| Current role | Electronics workstation, quantum simulator, and experiment machine |

I have now retired it from regular infrastructure work. It is no longer a NAS,
and I do not consider it suitable for an always-on production role. However,
old hardware can still be valuable when the cost of failure is low. The small
workstation is now part of my physical test bench. I use it for simple
electronics tests, repair work, and experiments involving real hardware.

I also use the bench to make practical use of equipment that I already had.
There are two Arduino Uno boards, several soldering tools, and other small
electronics items on the desk. This gives me a place to test a circuit, repair
a component, inspect a board, or verify a physical device without touching the
production environment.

The same workstation is also useful for small quantum experiments through
classical simulation. These simulations are limited by the old Xeon and the
available memory, but that is not a problem for small tests. The objective is
to understand the circuit, validate an idea, and explore the behaviour of a
simulation rather than to compete with modern compute hardware.

That is a better ending for the system than forcing it to remain a critical
storage server. It still provides a useful environment for testing ideas, but
its failure no longer threatens the rest of the homelab.

## The portable machines

The remaining systems are my laptops.

The laptop I use for daily work is a Lenovo 15IRH10:

- 16 GB RAM
- 13th Gen Intel Core i5-13420H
- 512 GB SSD
- 256 GB SSD

It is the practical machine for everyday development, administration, writing,
and general work. The two SSDs provide a convenient split between the operating
environment and additional working space.

For games and graphics-heavy work, I use an ASUS ROG Strix Scar 18:

- Intel Core i9-13980HX, 13th generation
- NVIDIA RTX 4090
- 32 GB RAM
- 1 TB + 1 TB SSD

This machine is deliberately separate from the homelab. It is a portable
workstation for games and local experiments, not a replacement for the
production server or the Docker cluster.

## What I sold and why

The cleanup was as important as the new hardware. I sold equipment that no
longer justified its space, power consumption, maintenance, or operational
complexity:

- TerraMaster F2-210
- 2 × Dell PowerVault MD1420
- An older Dell PowerEdge R740xd
- One of the 5 kVA UPS units
- Other unused hardware from around the house
- 32U Lande rack cabinet

Some of the systems I sold had remained from older client work. They were
useful at the time, but I no longer had a practical reason to keep them in my
own infrastructure. Once their projects were finished and the hardware was no
longer needed for support or testing, selling them was more sensible than
letting them occupy space and consume power indefinitely.

The older PowerEdge R740xd should be understood as a previous unit, not the
current production server described above. Keeping multiple large rack servers
made sense only while they had clearly different jobs. Once the production and
development roles were reorganised, the spare unit became a large, loud, and
space-consuming piece of equipment with a shrinking reason to exist.

The PowerVault MD1420 units had a similar problem. They are capable storage
enclosures, but capability is not the same as usefulness in a small home
environment. They require space, power, suitable connectivity, and a workload
that actually benefits from them. My newer storage layout made those
dependencies unnecessary.

The TerraMaster NAS was convenient when I needed a small dedicated storage
box. Later, its capacity and performance were no longer a good match for the
rest of the lab. Keeping it would have meant maintaining another independent
storage system for a role that had already moved elsewhere.

The 32U Lande cabinet was the most visible thing to remove. It was useful when
the homelab was built around rack-mounted equipment, but it also occupied an
entire section of the room. I wanted to clear the old room completely and make
the environment easier to live with, not merely replace one full cabinet with a
newer version of the same problem.

This is the less glamorous part of infrastructure work: sometimes the right
upgrade is deleting a dependency, selling a device, and getting the space back.

## So, what is IPFS?

IPFS stands for InterPlanetary File System. Despite the name, it is not a
single storage server and it is not a cloud provider. It is a collection of
protocols for addressing, finding, and transferring content over a
peer-to-peer network.

The most important difference from a conventional web URL is how data is
identified. A normal URL usually describes where a resource can be found:

```text
https://example.com/releases/application.tar.gz
```

An IPFS address is based on the content itself. The resulting identifier is a
CID, or Content Identifier. A CID is derived from a cryptographic hash of the
content, so changing the content produces a different CID. The CID identifies
what the data is, while the network finds a node that can provide it.

The [IPFS documentation on content addressing](https://docs.ipfs.tech/concepts/content-addressing/)
explains this distinction in detail. It is useful because the identity of the
data is no longer tied to one server or one path on one server.

## How an IPFS request works

At a high level, the process looks like this:

1. A file or directory is added to an IPFS node.
2. The content is split into blocks and represented as a content-addressed
   structure.
3. The node produces a CID for the resulting content.
4. Other nodes use the CID to locate a provider for those blocks.
5. The blocks are transferred between peers and reconstructed locally.

This is why the same CID can be useful even if the content is copied to
multiple machines. The identifier describes the content, not the machine that
happens to serve it today.

Directories are also represented as linked data structures. If one file inside
a directory changes, the root CID changes as well. Older versions can still be
referenced by their previous CIDs as long as at least one node keeps them
available.

## IPFS is not automatic permanent storage

This is the most important limitation to understand. Adding a file to IPFS
does not magically guarantee that it will remain available forever.

An IPFS node may cache data temporarily. If no node keeps the data, the network
cannot retrieve it later. Pinning is the mechanism used to tell a node that a
particular CID should be retained. A pin can be local, or it can be managed by
a remote pinning service.

The [IPFS pinning documentation](https://docs.ipfs.tech/concepts/persistence/)
describes the difference between persistence, permanence, and pinning. In
practical terms, important data should be pinned on more than one independent
node and should still have ordinary backups.

IPFS does not replace the 3-2-1 backup principle. A pinned copy is one part of a
storage strategy, not a substitute for snapshots, offline copies, or tested
restores.

## Why IPFS fits a homelab

IPFS is interesting in a homelab because it makes storage and distribution
explicit. Instead of asking only “which server hosts this file?”, I can ask:

- What is the content's CID?
- Which nodes currently pin it?
- Can another node retrieve it independently?
- What happens when the original web server is offline?
- Can a deployment be verified by comparing the expected CID?

That model is useful for static websites, release artifacts, documentation,
large public datasets, installation media, and files that should be mirrored
without changing their identity.

For example, a release archive can be published through a normal web server
and also added to IPFS. The web server remains convenient for ordinary users,
while the CID gives a verifiable reference to the exact bytes of that release.
If the archive is mirrored to another node, the mirror does not need a new
identity for the same content.

## IPFS does not remove every central point

The marketing description of IPFS can make it sound as if every part of the
system is automatically decentralised. The real design is more nuanced.

Content discovery, gateway access, pinning, DNS, user interfaces, and the
machines that keep data online can still be concentrated. A public gateway may
be operated by one organisation. A pinning service may be the only place where
a project has stored its data. A domain name may still point users to one
gateway.

IPFS gives the architecture useful building blocks, but the operator still has
to design redundancy. Multiple pins, independent nodes, reachable peers,
monitoring, and tested recovery procedures are what turn a protocol into a
reliable service.

It is also not a privacy system. Publicly addressing content makes the CID
discoverable, and unencrypted content should be treated as public. Sensitive
data needs encryption before it is added, along with careful control of the
keys. IPFS provides content addressing and transfer; it does not decide who is
allowed to read the bytes.

## How I see IPFS in this setup

The current homelab gives me several places where IPFS could fit naturally:

- The production host can provide stable virtual machines and storage for an
  IPFS node.
- The Docker cluster can run repeatable IPFS-related services and gateways.
- The development server can be used for testing, indexing, and disposable
  experiments.
- The old experiment machine can remain isolated from anything important.
- The web server can expose selected content through a conventional gateway.

The important point is that IPFS does not need to replace the entire existing
environment. It can be added as another distribution and verification layer.
The homelab can continue to use ordinary storage, virtual machines, containers,
and HTTP while IPFS handles content-addressed copies of the data for which that
model is useful.

## Running IPFS on Docker

The simplest way to run IPFS in this environment is to use Kubo, the reference
IPFS implementation, as a Docker service. The official image is published as
`ipfs/kubo`. I would start with one node on the Docker cluster and keep its
repository on persistent storage.

The following is a minimal `compose.yaml`:

```yaml
services:
  ipfs:
    image: ipfs/kubo:latest
    container_name: ipfs
    restart: unless-stopped
    volumes:
      - ipfs_staging:/export
      - ipfs_data:/data/ipfs
    ports:
      - "4001:4001"
      - "4001:4001/udp"
      - "127.0.0.1:5001:5001"
      - "127.0.0.1:8080:8080"

volumes:
  ipfs_staging:
  ipfs_data:
```

The two volumes are important. `/export` is a convenient place to exchange
files with the container, while `/data/ipfs` contains the node repository,
configuration, identity, blockstore, and pins. Without persistent storage, the
node would lose its state when the container is recreated.

The `4001` ports are used for peer-to-peer communication. The API on `5001` is
bound to localhost because it can control the node and must not be exposed to
the public internet. The gateway on `8080` is also bound locally so that the
existing web server or reverse proxy can decide how it is exposed.

The service can be started with:

```bash
docker compose up -d
docker compose logs -f ipfs
```

After the container is running, I can check the node identity and add a file:

```bash
docker exec ipfs ipfs id
docker cp ./manual.pdf ipfs:/export/manual.pdf
docker exec ipfs ipfs add /export/manual.pdf
```

The last command prints the CID. That CID is the reference to the exact
version of `manual.pdf`. I can then explicitly pin it and read it back through
the local gateway:

```bash
docker exec ipfs ipfs pin add <CID>
curl http://127.0.0.1:8080/ipfs/<CID>/manual.pdf -o downloaded-manual.pdf
```

For a directory, `ipfs add -r` creates a root CID for the complete directory
tree:

```bash
docker cp ./release ipfs:/export/release
docker exec ipfs ipfs add -r /export/release
```

The root CID can be published through the web server or stored in a release
record. When the release changes, the root CID changes as well, which makes it
possible to distinguish two versions without relying only on a mutable
filename.

Running one Kubo container on one Docker node is useful for learning and for a
small internal service, but it is not yet a highly available IPFS deployment.
If I want the same content pinned on several nodes, each node needs its own
persistent repository and the pins need to be coordinated. Docker scheduling
alone does not replicate IPFS blocks. For that kind of setup, IPFS Cluster or
another explicit pin-management layer is required.

The official [Kubo repository](https://github.com/ipfs/kubo) publishes the
official `ipfs/kubo` images and installation guidance. I would use a specific
release tag for a production deployment instead of relying permanently on
`latest`, then update it deliberately after checking the release notes.

## A smaller lab with clearer boundaries

The new arrangement is not the largest system I have owned. It is a better
system for the work I actually do.

The production server has the capacity for serious virtualisation. The old
XCP-ng server gives development and failure testing a safe place. The four
ThinkCentre nodes provide a small but scalable Docker platform. The NUC handles
the web boundary, and the Beelink keeps the network boundary separate. The
retired machines still have value as experimental hardware, but they no longer
pretend to be production infrastructure.

That is also the useful lesson behind IPFS. A system becomes easier to operate
when identity, storage, distribution, and responsibility are explicit. A CID
does not tell me that a file is safe forever. A server specification does not
tell me that a workload belongs on that server. In both cases, the engineering
work is in defining the boundaries and then verifying that the boundaries match
reality.

## How IPFS references are used

An IPFS reference normally contains the `/ipfs/` path followed by a CID. For
example:

```text
/ipfs/bafybeigdyrzt5examplecid
```

The CID in this example is only illustrative. A real reference is much longer
and is generated from the actual content. The important part is that the path
points to a specific version of the content. If the file changes, the CID also
changes, so the old reference still identifies the old bytes.

In a browser, the reference is commonly used through an IPFS gateway:

```text
https://ipfs.io/ipfs/<CID>/manual.pdf
```

The gateway accepts the HTTP request, locates the content through IPFS, and
returns the file to the browser. The browser does not need to run a local IPFS
node for this form of access. A self-hosted gateway can be used in the same way
with a domain controlled by the operator.

The same CID can also be used directly by an IPFS-aware application or command
line client. Conceptually, the application asks for the content identified by
the CID rather than asking one fixed server for one fixed path. This makes the
CID useful in release manifests, documentation, package metadata, static site
deployments, and references between content-addressed objects.

There is also a distinction between a fixed CID and a name that points to a
changing CID. IPNS is commonly used for the latter. An IPNS name can continue
to represent the latest version of a website or directory, while the content
behind it changes over time. The IPNS name is stable; each published version
still has its own CID.

This gives IPFS references two useful patterns:

| Reference type | Meaning | Suitable use |
| --- | --- | --- |
| `/ipfs/<CID>` | One exact, immutable content version | Release archive, checksum-like reference, historical document |
| `/ipns/<name>` | A mutable name that resolves to a current CID | Website, updated documentation, continuously published content |

For example, a software release can be published under its CID so users can
verify the exact release, while a project homepage can be published through an
IPNS name so the address does not need to change for every update. In both
cases, availability still depends on nodes or pinning services keeping the
underlying content available.

In a homelab, I can expose selected content through my own gateway, keep the
content pinned on one or more nodes, and use the CID in deployment or release
records. The normal web server can remain the convenient public entry point,
while the IPFS reference provides a content-based identity and an independent
way to retrieve the same data.

## IPFS references

- [What is IPFS?](https://docs.ipfs.tech/concepts/what-is-ipfs/)
- [How IPFS works](https://docs.ipfs.tech/concepts/how-ipfs-works/)
- [Content Identifiers (CIDs)](https://docs.ipfs.tech/concepts/content-addressing/)
- [Persistence, permanence, and pinning](https://docs.ipfs.tech/concepts/persistence/)
- [Pin files with IPFS](https://docs.ipfs.tech/how-to/pin-files/)
- [Kubo GitHub repository and Docker image information](https://github.com/ipfs/kubo)
