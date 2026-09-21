---
title: "Retiring Old Hardware and Rebuilding Old Ideas"
layout: post
comments: true
toc: true
permalink: "/p/:title/"
categories:
- Programming
- Development
- Engineering
- Open Source
tags:
- bluejacket
- olanguage
- refactoring
- php
- golang
- onixos
- open-source
---

This week started with a small retirement and a surprisingly large amount of
refactoring.

I finally retired the old server that had been part of my development setup for
years. It was running on a Xeon E5620 with 24 GB of RAM, a 128 GB SSD, and an
NVIDIA GT 1030. It was never an impressive machine on paper, but it was useful
and dependable for a long time. That changed gradually. Voltage fluctuations,
hardware problems, and excessive heat made it a poor choice for anything that
needed to run continuously.

I did not throw it away. It is now a test machine in the corner. That is a more
honest job for it: temporary services, installation tests, experiments, and
failure scenarios where I do not mind restarting the whole system.

The hardware retirement also made me look at some old software with the same
question: is this still a foundation, or is it only being kept alive by habit?

## Bluejacket: preserving the useful parts of an old framework

Bluejacket is a very old PHP web framework of mine. The original code carries
the assumptions of an older PHP ecosystem: global-style classes, an old
autoloading approach, framework-owned implementations, and a large amount of
behaviour that is difficult to isolate.

I have retired the old server, but I have not deleted Bluejacket. Instead, I am
using it as a migration case study.

The current direction is a clear separation between the old implementation and
the new core. The legacy code remains under `Framework/Legacy/` as a reference
for compatibility and behaviour comparison. It is no longer part of the new
autoload API.

The modern core now targets PHP 8.2 and uses Composer PSR-4 autoloading. The
framework is also moving toward established components instead of maintaining a
private implementation for every problem:

- Symfony components for HTTP foundation, routing, console, dependency
  injection, events, cache, serializer, validation, and configuration.
- Doctrine DBAL for the database boundary.
- Twig for templates.
- PSR interfaces for containers, HTTP messages, middleware, logging, and
  simple caching.
- PHPUnit, PHPStan, and PHP-CS-Fixer for verification and code quality.

This is not a complete framework yet. That is important to say. The Composer
manifest can describe a good architecture long before the architecture is
actually finished. The next work is in the boundaries: request handling,
middleware, error responses, validation, sessions, CSRF protection, database
adapters, and a migration path for applications using the old API.

The first useful result is not a benchmark. It is a small application that can
dispatch a route and return a response through the new structure. That sounds
basic, but basic behaviour is exactly what should be made explicit before a
framework grows around it.

The Bluejacket source is private, but the framework repository is available on
[GitLab](https://gitlab.com/odznames/bluejacketframework).

## O Language web framework: a different centre of gravity

The O Language web framework is a different experiment. Bluejacket is a PHP
framework being modernized around standard ecosystem components. O Language is a
language project whose web tooling is being shaped around the language itself.

The current O Language web tooling can initialise a project, create controllers,
models, connections, and routes, and generate a small project structure. A web
project has familiar pieces such as `controllers`, `models`, `routes`,
`templates`, `public`, and `database`, but the application code is written in O
Language files rather than PHP or Go.

The runtime currently uses Go and Gin underneath. That gives the framework a
practical HTTP server, routing methods, static files, uploads, request data, and
response headers while the public programming model stays in O Language.

That creates an interesting comparison with Bluejacket:

| Concern | Bluejacket | O Language web framework |
| --- | --- | --- |
| Main goal | Modernise an existing PHP framework | Make web development a native language workflow |
| Runtime direction | PHP 8.2+, Symfony and PSR components | O Language evaluated by a Go/Gin runtime |
| Project creation | Composer package and CLI scaffolding | `web init`-style project generation and component creation |
| Compatibility problem | Old classes, namespaces, and application behaviour | Evolving language and framework conventions |
| Current engineering priority | Stable boundaries and migration | Useful primitives without hiding runtime behaviour |

Neither approach is automatically better. They solve different problems. A
framework such as Bluejacket needs to respect the ecosystem and applications it
already has. O Language has more freedom, but every missing convention becomes
part of the language and runtime design work.

I am especially interested in this difference because it changes how I evaluate
progress. In Bluejacket, replacing a private implementation with a PSR or
Symfony boundary is often progress even when it adds a dependency. In O
Language, adding a feature is only progress if it still feels natural in the
language and remains debuggable when it reaches the Go runtime.

## Four more projects moved out of the past

Bluejacket was not the only old idea I revisited. I also refactored four other
projects that had been sitting in my head for a long time. I cannot describe all
of them because of privacy constraints, but the reason for the work is simple:
software that is still expected to exist must eventually fit the current world.

This was not a cosmetic rewrite. The projects needed new structure, clearer
boundaries, and updated assumptions about deployment, dependencies, and
maintenance. In a few cases, starting again was cheaper than trying to preserve
every historical decision. In others, preserving the behaviour was important,
so the work became a controlled migration instead.

That distinction matters. “Refactor” can mean moving files until the tree looks
clean, or it can mean reducing the number of reasons the system can fail. I am
more interested in the second definition.

## OpenBook, NoiseApp, and Pendream

OpenBook received one of the more visible updates. Its structure is now clearer:
a Laravel 13 backend/API, a React and Vite frontend, and a Docker-based runtime.
The author workflow is becoming a real product flow rather than a collection of
book-related screens. An author can create a private draft, add ordered
sections, upload PDF, LaTeX, or ZIP sources, and publish a book when it is ready.
There is also an Open Library metadata import path for starting a book from
existing information.

The latest OpenBook work is documented in the
[OpenBook repository](https://gitlab.com/odznames/openbook).

NoiseApp has moved back to its original home, but the more important change is
inside the application. Recent work focused on startup and failure isolation:
the frontend should not be blocked by optional startup services, homepage data
loading should not deadlock, and one failing route should not turn into a full
application failure. The API load was reduced as part of that work as well.

These are not glamorous changes. They are the kind of changes users notice as
“the application feels less fragile”. NoiseApp is available at
[GitLab](https://gitlab.com/odznames/noiseapp).

Pendream is moving in a similar direction from the Python side. It is a Django
and Django REST Framework CMS with a custom React, Vite, Tailwind, and shadcn/ui
panel. The panel now covers pages, posts, media, taxonomy, menus, users, roles,
themes, and modules. The module registry tracks source changes and keeps a
changed module unavailable until it has been reviewed. That is a small but
useful safety boundary for a CMS that can change its own active features.

Pendream is open source through its [GitHub organisation](https://github.com/pendream).

## OnixOS and the build system

The platform work continued in OnixOS as well. The build system is not just a
collection of shell commands anymore; it is becoming a system with explicit
responsibilities and failure states.

Recent changes included better cleanup for interrupted package and ISO builds,
protection for Docker workers and staging ownership, and reporting for
incomplete architectures or source-fetch failures. The latest refactor also
clarified several public class interfaces while keeping historical names as
compatibility aliases. For example, the code can move toward clearer names such
as `Iso`, `SrcInfo`, and `SSHUploader` without breaking older integrations that
still use `ISO`, `SRCINFO`, or `SSH_Uploader`.

That is the same migration pattern I am applying to Bluejacket: improve the
internal design, but do not pretend that existing callers disappear because a
new class name looks better.

O Language and OnixOS are also connected at a more practical level. The language
needs reproducible builds, packages, and test environments; the operating system
needs tools and applications that are pleasant to build and maintain. A language
runtime, a web framework, and a distribution build system are different layers,
but they expose the same engineering question: where does responsibility live,
and what happens when that responsibility fails?

## What I am taking into next week

The old server is now a test machine. Bluejacket is a migration laboratory. O
Language is a place to explore a different application model. The other
refactored projects are reminders that unfinished ideas do not become easier to
maintain by waiting.

My priority for the next step is not to add a long list of features. It is to
make the boundaries executable: tests that describe the expected behaviour,
builds that report incomplete results honestly, and compatibility layers that
are temporary by design rather than permanent accidents.

That is probably the main lesson from this week's work. Retirement is not always
the end of a system. Sometimes it is the point where the system can finally be
used for what it is good at, while the next version is built with fewer excuses.

