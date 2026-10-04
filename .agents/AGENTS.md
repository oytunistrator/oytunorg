# Agent instructions for `.agents`

This directory contains project-local agent context and reusable skills for the
Oytun.org blog. The repository-level rules in [`../AGENTS.md`](../AGENTS.md) apply
to everything here.

## Files in this directory

- [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) records the current Jekyll structure,
  post conventions, and read-only external project references.
- [`skills/generate-blog-post/SKILL.md`](skills/generate-blog-post/SKILL.md) is the
  workflow for researching a user-selected topic and producing an English
  engineering blog post.

## Editing rules

- Keep the skill focused on this repository's blog-writing task; do not turn it
  into a general-purpose writing or software-development guide.
- Update `PROJECT_CONTEXT.md` only when the repository structure or writing
  conventions materially change.
- Keep external project paths as references. Never place generated files, commits,
  or fixes in `/home/ted/Workspace/onix` or `/home/ted/Workspace/olanguage`.
- Keep generated prose natural and human-sounding. Do not use typographic en or em
  dashes; use ordinary punctuation instead.
- Do not add helper scripts unless repeated deterministic work demonstrates that a
  script is necessary. The current workflow is intentionally read-only research
  plus one Markdown artifact.
