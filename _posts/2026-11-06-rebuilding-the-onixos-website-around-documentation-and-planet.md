---
title: "Rebuilding the OnixOS Website Around Documentation and Planet"
layout: post
categories: [Development, Linux, OnixOS, OLanguage, Web]
tags: [onixos, website, astro, planet, documentation, olang]
comments: true
toc: true
---

The OnixOS website now has to explain more than how to download a Linux distribution. It needs to help people choose an edition, install and maintain a system, understand the build and package repositories, and find out what is changing in O Language. It also needs to make community work visible.

I have been rebuilding the project's web presence around those needs. This pass changes the page structure and content as well as the visual design.

## The technology behind the site

The project site uses Astro, React, Markdown, and Sass. Astro owns page generation and the static routes. Most reference and project pages live as Markdown under `src/content/pages`; their front matter supplies the title, URL, section, description, ordering, and navigation labels. An Astro content collection validates those fields and a shared page template renders the route.

The configured output is static HTML, CSS, JavaScript, images, and JSON under `site/`. The documentation pages do not need an application server at request time, so they can be served by a static host. The generated routes use trailing slashes. The site content and the published output remain separate: we edit the Markdown and components, then generate the static directory from them.

React is used where a page needs interaction. The navigation adapts to smaller screens, closes sibling menus when another is opened, and marks the active section. The search opens as a dialog with a `Ctrl K` or `Command K` shortcut. It loads a JSON index generated from the Markdown pages and searches that content in the browser. This keeps search useful without adding a search server or a database.

The documentation template also carries the repeated navigation work. It creates breadcrumbs, section sidebars, previous and next page links, and a table of contents from each page's headings. Long references can be browsed by topic, while the mobile layout collapses those navigation elements instead of squeezing desktop columns onto a narrow screen.

The shared layout handles the less visible parts of a public site too: canonical URLs, Open Graph and Twitter cards, organization and website structured data, a skip link, and Matomo page analytics. The generated site includes a sitemap, `robots.txt`, and a search index. Contributor information is kept as data and rendered through a dedicated directory component.

## What the OnixOS documentation covers

The site now gives users and maintainers separate paths through the project. The user documentation covers editions, installation, package management, system configuration, and troubleshooting. The maintainer references cover repositories, package builds and inventory, the package-to-profile map, image profiles, profile development, and the build system.

The profile overview currently lists Core, KDE, GNOME, XFCE, Security, and Server. The KDE profile is a recent addition: the build system now registers it as an image target, and its profile uses the Calamares graphical installer while retaining `archinstall` as a fallback. The website includes a dedicated KDE profile page alongside the other profile references.

The surrounding profile work has also involved a practical boundary between a live image and an installed system. Recent changes move virtual-machine guest tools into live ISO filesystems instead of treating them as a general `onix-base` service. Core, GNOME, XFCE, Security, and Server profiles now have explicit guest detection. The Server installer setup was repaired, and its install path uses `pacstrap -K` so the target gets its own keyring rather than inheriting the host's.

Package maintenance is part of the same story. The graphics package dropped an unavailable `gtk-engine-murrine` dependency, and desktop profiles were updated to use packaged Dracula theme assets. Calamares install groups were completed. In the build system, package and profile sources are refreshed before use, and image logs record the selected profile revision. That revision matters when a profile is cloned from a moving branch: it gives the build record a specific source commit to investigate.

These details are why a profile reference cannot be written once and forgotten. The download page, profile table, package inventory, and build guide all describe different views of the same moving source tree. I am keeping them close to the package and profile repositories so a website edit does not quietly become a second, stale definition of OnixOS.

## O Language is documented as a working toolchain

The O Language area is more than a short introduction. It now has a practical guide and reference pages for syntax, tokens, types, commands, execution paths, modules, project files, package management, processes, databases, system APIs, web programming, and routing.

The language repository's August history shows the tools these pages need to explain. The `olang web` command group can initialize a framework project, run it, and create controllers, models, database connections, and routes. Route generation accepts an HTTP method, path, and controller, then validates those inputs before updating the project configuration. Follow-up changes centralized project loading so generated controllers, models, and connections are registered through one loader instead of being loaded by unrelated pieces of the scaffold.

The web runtime also grew a request model for handlers. A request can expose query values, submitted form data, headers, and route parameters. Handlers can receive route parameters directly, while request state is kept in an environment for that request. Response status, headers, and body can be set through the server response object. Those are concrete language and runtime features, not just labels in a navigation menu.

The new site guide explains the generated project layout, route configuration, and loader. The larger reference is explicit about where runtime support differs: the interpreter, bytecode VM, and experimental ELF compiler do not all support the same features. The examples are tied to runtime revision `eb2301c`, matching the OnixOS package snapshot recorded by the documentation. That pin makes the examples reproducible against a known source state and gives future documentation updates a clear comparison point.

The documentation project itself was reorganized into a progression from getting started, through advanced language and web topics, to an API reference. The editor extension work also widened access beyond Visual Studio Code: the repository documents use with Cursor, VSCodium, Code-OSS, and Zed. These are separate pieces of the O Language ecosystem, but together they make it easier to discover the language, learn it, edit it, and build a web project with it.

## Planet is integrated, but remains its own service

The refreshed OnixOS homepage includes three recent Planet entries. The dedicated [Planet page](https://onix-project.com/planet/) has a larger feed, author and date information, year archives, feed details, and links to each original article. Readers can subscribe through the RSS link too. The separate Planet site received its own interface refresh, and its cached feed API was hardened.

The separation is deliberate in the implementation. Astro generates the project pages as static files, but the Planet widget fetches JSON from `planet.onix-project.com/fetch.php` when a reader opens the page. The feed service is PHP and its source sits outside Astro's static output. That means the OnixOS site can publish reference pages as static output while Planet continues to refresh its feeds through its own service. Deploying a change to that PHP service is a separate operation from generating the Astro site.

Aggregating posts also means treating feed content as external input. The OnixOS frontend reconstructs descriptions from a limited set of HTML elements, rejects unsafe link protocols, and limits each excerpt to two paragraphs before linking to the original post. The feed can still be temporarily unavailable; the widget reports the problem and can present cached entries returned by Planet. This keeps the site useful when a source feed cannot be refreshed without pretending that the community posts are part of the static documentation build.

## The refresh is still in progress

The current source history shows the main page structure, documentation, search, Planet integration, and generated static output in place. Follow-up changes are still adjusting navigation, download guidance, homepage copy, and the layout of long documentation pages. I am also reviewing the technical text against the OnixOS and O Language repositories as those projects change.

There is a useful distinction between documenting a change and validating the software that uses it. The repository history records profile and installer fixes, but this article is not a Jenkins build report or a claim that each ISO has passed a boot test. Those require their own evidence. The site gives readers a map of the work and a place to follow it; the build and boot results still need to be judged on their own.

The point of the refresh is not to turn every project update into a homepage announcement. It is to give the distribution, its tools, and its community a coherent set of paths. A person looking for an installer, a maintainer comparing profiles, or a developer exploring O Language should be able to start from the same site and reach the source that explains the next step.
