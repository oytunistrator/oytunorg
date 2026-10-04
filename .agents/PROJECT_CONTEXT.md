# Oytun.org project context

## Repository purpose

Oytun.org is a personal Jekyll blog covering engineering, Linux, open source,
programming, AI, infrastructure, science, and occasional life or business topics.
The site is configured with the Chirpy theme and publishes posts from `_posts/`.

## Important paths

| Path | Role |
| --- | --- |
| `_posts/` | Published blog posts in Jekyll Markdown format. |
| `_tabs/` | Static site pages such as About, archives, categories, and tags. |
| `_config.yml` | Site identity, theme, post defaults, permalink, comments, and TOC settings. |
| `_includes/` | Reusable Jekyll template fragments. |
| `assets/` | Images, favicons, and other static assets. |
| `_plugins/posts-lastmod-hook.rb` | Jekyll post metadata hook. |
| `.agents/skills/generate-blog-post/` | Project-local blog-generation skill. |

## Current post conventions

The normal post shape is:

```yaml
---
title: "A Clear, Specific Title"
layout: post
categories: [Development, Linux, OpenSource]
tags: [engineering, linux, open-source]
comments: true
toc: true
---
```

`toc: true` is common in longer technical posts but is not mandatory for short
articles. Existing posts use both inline arrays and YAML lists for categories and
tags; prefer the concise inline form unless the list is long. The site default
permalink is `/p/:title/`, so a post normally does not need to repeat it.

Filenames use the publication date followed by a lowercase kebab-case slug. The
date should come from the current user-provided context when a new post is created;
do not guess a historical date or reuse an existing filename.

## Editorial direction

Technical posts are primarily written in English and should feel like an engineer
explaining work to another engineer. Favor:

- a clear problem or question;
- concrete architecture, constraints, trade-offs, and failure modes;
- examples grounded in the inspected repositories or the author's stated
  experience;
- explicit boundaries between what is implemented, what was observed, and what is
  a future direction;
- first-person reflection only when it is supported by the available project
  history or the user's prompt.

Avoid generic AI introductions, inflated claims, invented metrics, fake quotations,
repeated summaries, and claims that a feature is production-ready unless the
evidence supports that wording. Keep the chosen topic as the article's boundary.
Do not use typographic en dashes or em dashes in generated prose. Prefer ordinary
punctuation such as periods, commas, colons, parentheses, or a normal hyphen.

## External engineering references

These paths are outside this repository and are read-only research sources:

- `/home/ted/Workspace/onix` - the wider OnixOS workspace. Relevant nested
  repositories commonly include `onix-build-system`, `packages/qvm-cli`, and
  profiles under `profiles/`.
- `/home/ted/Workspace/olanguage` - the O Language workspace. The main language
  implementation is `/home/ted/Workspace/olanguage/olang`; related documentation
  and tooling live in sibling repositories.

When a topic touches these projects, inspect the relevant repository's README,
source/configuration, tests or fixtures, and recent Git history. Because the
workspace contains nested repositories and generated/build directories, identify
the exact repository before reading its history. Do not treat an old README or a
commit message as proof when current source/configuration contradicts it.

## Research and publication boundary

The blog workflow may use read-only filesystem inspection and Git history to gather
facts. It must not run builds, tests, Jekyll, package installation, deployment, or
project commands merely to write an article. If the article needs a command example,
derive it from documentation or source and label assumptions clearly.

Only the new post belongs in the normal publication commit. Existing posts, external
repositories, generated site output, dependencies, and unrelated user changes are
out of scope.
