---
name: generate-blog-post
description: Create a focused, evidence-based English engineering blog post for this Jekyll site's `_posts/` directory from a user-selected topic. Use when the user wants research, drafting, and publication of a new post; do not use for unrelated copywriting or editing an existing post.
---

# Generate a blog post

Create one new Oytun.org post from the topic the user gives you. The finished post
should sound like a technically experienced human documenting real work: specific,
measured, readable, and willing to state constraints. The user owns the topic and
the final scope.

Read these project references before acting:

- [`../../../AGENTS.md`](../../../AGENTS.md) for repository-wide rules.
- [`../../PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) for Jekyll conventions,
  post style, and external project paths.

## Workflow

### 1. Establish the topic boundary

Extract the exact subject, intended audience, and any angle supplied by the user.
If the subject is narrow, keep the article narrow. Do not turn a request about one
feature into a broad history of OnixOS, O Language, or open source.

Use a small outline before drafting. A useful engineering outline normally answers:

1. What problem or question is this post addressing?
2. What was changed, observed, or learned?
3. How does the relevant system work?
4. What constraints, trade-offs, or failure modes matter?
5. What remains out of scope or is still future work?

Do not force every section when the topic does not need it.

### 2. Research only what supports the topic

For topics involving the author's projects, inspect only the relevant repositories
and paths:

- `/home/ted/Workspace/onix` for OnixOS work, especially the exact nested repository
  such as `onix-build-system`, a package repository, or a profile repository.
- `/home/ted/Workspace/olanguage/olang` and related documentation repositories for
  O Language implementation and workflow details.

Use read-only inspection of source, configuration, tests/fixtures, documentation,
and Git history. Prefer current implementation evidence over summaries. Use commit
history to understand chronology and intent, not to copy a commit list into the
article. Check the exact nested repository before interpreting its log.

Never modify, stage, commit, or push anything in those external workspaces.

Do not run Jekyll, a build, tests, package installation, deployment, or a project
command. If a command is useful as an example in the article, confirm its shape from
the repository's documentation/source and avoid presenting unverified output as a
result.

### 3. Draft like an engineer, not a content generator

Write the article in English unless the user requests otherwise. Use the author's
first-person perspective only for experiences supported by the prompt or evidence.
Explain mechanisms and boundaries rather than decorating the article with hype.

Required writing qualities:

- start with the concrete problem, observation, or engineering question;
- explain architecture and behavior with precise nouns and useful examples;
- include code, configuration, diagrams-as-text, or command examples only when they
  clarify the topic;
- state limitations and uncertainty plainly;
- distinguish implemented behavior, observed project history, interpretation, and
  future work;
- use varied sentence length and natural transitions.
- write with ordinary punctuation so the prose feels natural and personal; never
  use typographic en dashes or em dashes in the article.

Avoid:

- generic openings such as “in today's rapidly evolving world”;
- claims of massive, revolutionary, perfect, or production-ready results without
  direct evidence;
- invented benchmarks, user numbers, timelines, conversations, or emotions;
- repeating the introduction in the conclusion;
- stuffing keywords or adding unrelated sections merely to make the post longer;
- mentioning that an AI wrote, researched, or optimized the article.

When a sentence would normally use a typographic dash, rewrite it with a period,
comma, colon, parentheses, or a normal hyphen where appropriate. Review the final
post for typographic dashes before committing.

### 4. Create the Jekyll post

Write exactly one new Markdown file under `_posts/` using:

`YYYY-MM-DD-kebab-case-title.md`

Use the current date from the task context unless the user provides a publication
date. Do not overwrite an existing post. Use front matter compatible with this
repository, normally:

```yaml
---
title: "Specific and Human-Sounding Title"
layout: post
categories: [Development, Engineering]
tags: [engineering, open-source]
comments: true
toc: true
---
```

Choose categories and tags that already fit the site's vocabulary where practical.
Do not add a category or tag solely for search-engine optimization. Keep the title
accurate to the actual article.

Before publication, inspect the new file as a whole for:

- valid opening and closing front matter;
- a filename/title that agree;
- factual claims that can be traced to the prompt or read-only research;
- links and code fences that are complete;
- no accidental draft notes, placeholders, or unrelated edits.

### 5. Commit and push the post

The user has requested the normal publication workflow for generated posts. After
reviewing the diff, stage only the new post, create one focused commit with a clear
message such as `docs: add <short topic> article`, and push the current branch to
its configured remote. Do not amend, reset, rebase, force-push, or change branches.

Before the commit, verify that unrelated working-tree changes remain unstaged and
that the commit contains only the intended post. If the working tree, remote, or
credentials make a safe push impossible, preserve the post and report exactly what
was completed and what remains; do not broaden the task to repair the environment.

## Completion report

Report the created post path, its title, the evidence sources consulted, and the
commit/push result. Mention that no build or test was run because the project
workflow intentionally excludes them for article writing. If any claim was left
uncertain, call it out instead of hiding the uncertainty.
