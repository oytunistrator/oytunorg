# Oytun.org blog repository

## Scope

This repository is a Jekyll blog. Blog posts live in [`_posts/`](_posts/), and the
site metadata and publishing behavior are defined primarily by [`_config.yml`](_config.yml).

Read [`.agents/PROJECT_CONTEXT.md`](.agents/PROJECT_CONTEXT.md) before creating or
editing a post. The project-specific writing workflow is documented in
[`.agents/skills/generate-blog-post/SKILL.md`](.agents/skills/generate-blog-post/SKILL.md).

## Working rules

- Keep blog posts in English unless the user explicitly asks for another language.
- Stay inside the topic the user provides. Do not expand a focused article into an
  unrelated project update or generic tutorial.
- Treat source code, configuration, tests, documentation, and Git history as the
  evidence for technical claims. Never invent implementation details, benchmark
  results, timelines, quotes, or personal experiences.
- OnixOS and O Language repositories under `/home/ted/Workspace/onix` and
  `/home/ted/Workspace/olanguage` are external read-only references. Inspect them
  when relevant, but never modify them.
- Do not run Jekyll, builds, tests, package installation, deployment commands, or
  other project execution as part of the blog-writing workflow. Read-only file and
  Git-history inspection is allowed; Git commit/push is allowed only for the new
  post when the user has requested the full publishing workflow.
- Do not rewrite existing posts unless the user explicitly asks for an edit.
- Preserve unrelated working-tree changes. Before committing, verify that the
  commit contains only the intended new post and any explicitly requested changes.

## Post format

- Use the filename `YYYY-MM-DD-kebab-case-title.md` under `_posts/`.
- Start with Jekyll front matter. At minimum use `title`, `layout: post`,
  `comments: true`, and relevant `categories` and `tags`; add `toc: true` when the
  article is long enough to benefit from a table of contents.
- Use Markdown headings, fenced code blocks, links, and short explanatory sections.
- Match the author's technical voice: concrete, first-person where supported by
  evidence, direct, reflective, and engineering-oriented. Avoid polished
  marketing language, repetitive conclusions, empty throat-clearing, and obvious
  AI phrasing.
- Do not use typographic en dashes or em dashes in posts or generated prose. Prefer
  a period, comma, colon, parentheses, or a normal hyphen when it is grammatically
  appropriate.

## Git safety

The default branch is `main` and the repository tracks `origin/main`. Do not create
a branch or alter history unless explicitly requested. A normal post workflow may
create one focused commit and push it to the configured remote after reviewing the
diff and confirming that no unrelated files are included.
