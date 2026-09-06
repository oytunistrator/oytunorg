---
title: "Open Source vs. Closed Source: The Difference Is More Than Seeing the Code"
layout: post
categories: [Development, Linux, OpenSource]
tags: [open-source, closed-source, licenses, software, engineering, onixos]
comments: true
---

Most people meet this subject through a sentence that is technically true but incomplete:

> “Open-source software is software whose code is public.”

That is a useful first step, but it is not the whole picture. A source repository can be visible while still forbidding you from reusing the code. A commercial company can build and sell open-source software. A free download can still be closed source. And an open-source project can be maintained by one person in their spare time, with no company, no employees, and no promise of support.

So let us start from the beginning, in plain language, and then look at it like engineers.

---

## The shortest possible explanation

Software is written by people. The human-readable instructions they write are called **source code**. A compiler or interpreter turns those instructions into the application you run.

With **closed-source** software, the owner gives you the finished application, but keeps the recipe private. You can use the product under the owner's terms. Usually you cannot inspect its internals, change it, publish a modified version, or redistribute it.

With **open-source** software, the source code is available under a license that gives people meaningful rights to use, study, modify, and redistribute it. The license is the important part. It transforms “here is some visible code” into “here are the rights and responsibilities attached to this code.”

Think of it this way:

| Question | Closed source | Open source |
| --- | --- | --- |
| Can I read how it works? | Usually no | Yes |
| Can I change it? | Usually no | Yes, within the license |
| Can I share my changed version? | Usually no | Often yes, with conditions |
| Who controls the roadmap? | Usually one owner or company | Maintainers and contributors; governance varies |
| Can the original owner disappear? | You may be stuck | The code can be continued by others, subject to its license |

This does **not** mean that open source is automatically better for every situation, or that closed source is automatically malicious. They are different models with different trade-offs. The important thing is to understand what you are receiving and what power you do—or do not—have.

---

## Source code is the recipe, not the meal

Imagine that a restaurant sells you a cake.

* A closed-source product is like receiving the cake. You can eat it, but the kitchen may not reveal the recipe, ingredients, or process.
* An open-source project is like receiving the cake **and** the recipe, measurements, kitchen notes, and permission to make your own version under stated rules.

The analogy has limits, but it reveals the essential engineering point: a binary program tells your computer what to do; source code gives humans the ability to understand, repair, adapt, and verify it.

If a program crashes, leaks data, behaves strangely, or no longer supports your hardware, source access changes the conversation. Instead of only asking the vendor for help, someone with the skill can investigate. They can locate the failure, suggest a patch, build a replacement, or create a fork.

A **fork** is simply an independent continuation of a project. It is not automatically hostile. Sometimes a fork exists because the original maintainers are inactive. Sometimes it exists because two groups have different technical goals. The ability to fork is a safety valve: no single maintainer, company, or bad decision has to be the permanent end of the software.

---

## “Public code” is not necessarily open source

This distinction causes a lot of confusion.

Putting code on GitHub or GitLab does not, by itself, make it open source. Without a license, normal copyright rules still apply. People may be able to look at the code, but they do not automatically have permission to copy it into their product, modify and publish it, or redistribute it.

There is also a category often called **source-available**. In that model, the source can be read, but the terms may prohibit commercial use, competing services, redistribution, or certain types of deployment. That can be a perfectly intentional business choice, but it is different from open source.

Engineers should ask two separate questions:

1. Can I access the source code?
2. What does the license allow me to do with it?

Only the second question tells you whether you can safely build on it.

---

## Why licenses matter so much

Copyright exists automatically when somebody creates original code in many jurisdictions. In practical terms, that means the author starts with exclusive control over copying, modifying, and distributing their work.

An open-source license is the author saying: “I keep my copyright, but I grant you specific permissions.” For an engineer, it answers a few practical questions:

* May we use this dependency in a commercial product?
* May we modify it?
* Must we publish our modifications when we distribute the product?
* Must we keep copyright and attribution notices?
* Do we need to preserve notices or share changes when we ship it?
* Can we safely combine it with the rest of our product?

Ignoring these questions because “the repository is public” is not engineering pragmatism. It is creating legal, operational, and supply-chain risk for later.

Licenses also protect users. They make permissions predictable. A developer in another country, years later, does not need to personally ask every original contributor for permission to repair a project. The license already defines the rules.

> A license is not decorative text at the bottom of a repository. It is the contract that makes collaboration at internet scale possible.

This is not a legal guide. For a company shipping a product, the safe rule is simple: keep a list of dependencies, read their licenses, and ask a qualified lawyer when a decision has real commercial risk.

---

## The major license families, in one practical map

There are many licenses, but you do not need to become a lawyer to understand the basic engineering choice. The question is usually: **how much freedom should downstream users keep when they receive my software?**

| License family | Practical summary | Main idea |
| --- | --- | --- |
| MIT / BSD | Reuse it almost anywhere; keep the license and credit notices. | Maximum reuse |
| Apache-2.0 | Similar freedom to MIT, with extra patent and notice language. | Business-friendly reuse |
| MPL-2.0 | If you publish changes to MPL files, publish those files' source too. | Share improvements to that part |
| LGPL | Common for libraries: applications can often use the library, while library changes stay open. | Keep the library free |
| GPL | If you distribute a modified combined program, recipients get its corresponding source too. | Strong share-alike |
| AGPL | Like GPL, but adds a source-sharing expectation for modified software offered over a network. | Share-alike for services |

The summary is deliberately short. Exact obligations can depend on how the software is combined and delivered, so read the actual license before shipping a product.

---

## A license does not give you everything

Open-source licenses concern permission to use the code. They do not erase every other right or responsibility.

For example:

* **Trademark:** You may be able to fork the code, but not call your version by the original project’s name or use its logo. Apache-2.0 explicitly does not grant trademark permission.
* **Data:** An application may be open source while the user data, hosted model, training data, or service database is private.
* **Hosted service:** Being able to run the code does not mean you receive the production infrastructure, accounts, security keys, operational knowledge, or customer data.
* **Support and warranty:** Most open-source licenses provide software “as is.” Open source is not a promise that somebody will fix your issue by Monday morning.
* **Third-party components:** A repository can contain code under multiple licenses. The top-level license is not magic permission for every file inside it.

This is why a responsible project includes a clear `LICENSE` file, copyright notices where appropriate, dependency metadata, and documentation. Clarity is kindness to future users and contributors.

---

## Closed source is not automatically bad

It is tempting to turn this topic into a moral cartoon: open source equals good; closed source equals evil. Reality is more useful than that.

Closed-source development can fund a dedicated support team, user research, polished design, compliance work, infrastructure, and long-term product management. A company may need to protect a commercial advantage. Some customers also prefer one accountable vendor, a formal contract, a service-level agreement, and a single support channel.

But closed source concentrates power. If the owner changes the price, changes the terms, removes a feature, ends a product, blocks a region, or stops supporting your hardware, users have fewer technical exits. They cannot legally take the code and continue the product themselves.

Open source distributes that power more widely. It does not guarantee that a project will be healthy, friendly, secure, or well-funded. It gives the community the *ability* to inspect, improve, and continue the work. Whether people actually do so depends on time, skill, governance, and care.

---

## An open-source project is not automatically a company

This needs to be said clearly because people often see a name, logo, website, and release page and assume there is an organization behind them.

There may not be.

An open-source project can be:

* one person learning and building after work;
* a loose group of volunteers;
* a research effort that later attracts users;
* a project sponsored by a company but open to outside contributions;
* a foundation with formal governance; or
* a company-owned project with public code and commercial services around it.

These are very different things. The source code may be open in all of them, while funding, governance, support obligations, trademarks, and decision-making can be completely different.

Calling a volunteer project a “company” creates unfair expectations. A maintainer may receive demands for immediate support, feature deadlines, enterprise-level reliability, or explanations that would be reasonable from a paid vendor but impossible for a person donating their evenings.

The honest mental model is this:

> A project is a body of work and a collaboration space. A company is a legal and economic organization. Sometimes they overlap; often they do not.

The people maintaining a project are not an invisible support department. They are human beings. Good open-source communities respect that through clear issue reports, reproducible bug reports, patient discussion, documentation improvements, testing, donations when appropriate, and contributions that reduce work instead of merely creating demands.

---

## Open source is the accumulated result of human work

Modern software is not made from nothing. A Linux distribution, for example, stands on layers of work: a kernel, compilers, libc, shell tools, packaging tools, cryptography, graphics drivers, desktop software, documentation, bug reports, translations, testing, and years of research.

When we say “open source,” we should not imagine a pile of free files appearing by magic. We should imagine research, experiments, failed patches, review comments, late-night debugging, community disagreement, maintenance, and people choosing to leave their work available for others to learn from.

That inheritance is incredibly powerful. A new developer does not need to reinvent a compiler to understand compilers, build a kernel to learn systems programming, or create a distribution from a blank disk to learn package management. They can read, run, question, change, and build on real work.

This creates a compounding effect:

1. Someone solves a problem and publishes the solution.
2. Someone else studies it, uses it, and finds a limitation.
3. They improve it or build something new with it.
4. Their improvement becomes a starting point for another person.

That is not only efficient. It is educational. The source is a living textbook, but one with consequences: you can compile it, test your theory, send a patch, and see whether the idea survives contact with reality.

---

## What it does for a person’s skills

Open source gives people a public workshop. You do not need permission from a university, a large company, or a hiring manager to begin learning from real software.

For a beginner, the first contribution might be correcting a typo or documenting an installation problem. That is valuable: it teaches the repository workflow, issue discussion, pull requests or merge requests, review, and release discipline.

For an engineer, it can become a place to practice skills that are hard to learn from tutorials alone:

* reading an unfamiliar codebase before changing it;
* reducing a vague bug into a reproducible test case;
* explaining technical choices clearly to people with different backgrounds;
* accepting review without treating feedback as a personal attack;
* designing for users you will never meet;
* maintaining code after the exciting first release; and
* seeing how operating systems, libraries, tools, documentation, and communities connect.

The contribution does not have to be code. Testing, translations, accessibility work, design, triage, documentation, package maintenance, community moderation, and answering questions are all part of the engineering system. Software succeeds when the whole system works, not when one person writes clever code in isolation.

Open source also builds a more honest portfolio. A public commit is not a magic employment certificate, but it can show how a person thinks: the problem they chose, the trade-offs they documented, how they respond to review, and whether they can make a small improvement reliably. That is much more meaningful than claiming “expert” in a profile without evidence.

---

## What it does for engineering and society

The value is not only personal.

**Auditability:** People can inspect how a program works. That does not guarantee security—open code can contain severe bugs—but it allows independent review instead of requiring blind trust.

**Repairability:** A user, institution, or community can fix a problem when the original author is unavailable. This matters for old hardware, scientific tools, public infrastructure, and long-lived archives.

**Reproducibility:** In research and technical work, visible code and build instructions make it easier to test claims and reproduce results.

**Independence:** Organizations can avoid being completely trapped by a vendor. They may still buy support, but they retain the option to hire another provider, maintain a fork, or bring work in-house.

**Interoperability:** Open implementations and open standards make it easier for systems to talk to one another. Users are less likely to be locked into a single product just to access their own work.

**Shared capability:** A student with a modest computer can learn from the same code that runs in serious infrastructure. Access does not solve every inequality, but it lowers a very real barrier.

There is a responsibility hidden inside this freedom. Public code can be reused by good actors and bad actors. Maintainers can burn out. Security bugs can be visible before they are fixed. Funding can be uneven. Open source is not a utopia; it is a practical social and technical system that needs respectful participation.

---

## Why I build OnixOS in the open

OnixOS is a personal engineering project, not a company pretending to be a corporation. It is the result of curiosity, research, iteration, mistakes, and a desire to understand a Linux distribution all the way down to its moving parts.

I work on OnixOS openly because I do not want the project to be a black box that asks people to trust my decisions without being able to inspect them. If I make a packaging choice, redesign a build step, or make an architectural mistake, the work can be examined and discussed. Someone can learn from it, challenge it, test it, or build a different direction from it.

That does not mean I promise enterprise support, unlimited time, or instant answers. Like many open-source projects, OnixOS has human limits. A release name and a website do not turn a personal project into a staffed company. The project grows through real work: investigating problems, writing code, reviewing changes, testing builds, documenting decisions, and learning continuously.

For me, this is the point. Open source is not only a distribution method. It is a way of saying that the learning journey, the technical decisions, and the ability to continue the work should not be locked inside one person’s machine.

If OnixOS helps somebody understand how a Linux distribution is assembled, encourages them to submit their first patch, or gives them the confidence to build their own system, then the project has already created value beyond the code itself.

---

## A practical checklist before using an open-source project

Before you depend on a project—especially in a product—slow down and check these basics:

1. **Read the license.** Do not guess from the repository host or the word “free.”
2. **Check whether the project is active.** Look at releases, issues, security fixes, and maintainer communication.
3. **Understand the maintenance model.** Is it a solo project, a community, a foundation, or a vendor-backed project?
4. **Check its dependencies.** Your legal and security obligations include more than the top-level repository.
5. **Preserve notices.** Keep the required license, copyright, and attribution material in your distributions.
6. **Plan for updates.** Open source removes some lock-in, but it does not remove your responsibility to patch vulnerable dependencies.
7. **Give back when you can.** A useful bug report, documentation fix, test result, or financial contribution can be as valuable as code.

---

## Final summary

Open source is not simply “free software” and not simply “code on the internet.” It is a legal and collaborative framework that gives people the ability to inspect, use, modify, and redistribute software under clear rules.

Closed source gives an owner more control over the product. Open source gives users and communities more ability to understand and continue the work. Neither model automatically determines quality, security, kindness, or business success. But the difference in freedom, repairability, transparency, and long-term independence is real.

Licenses make that freedom durable. They define what can be reused, what must be preserved, and when improvements must be shared. Projects are made by people, not by logos. And an open-source project should be judged with that human reality in mind—not as a faceless company, but as a shared body of research, labour, learning, and care.

That is why open source matters to me, and why I build OnixOS in the open.

---

### Further reading

* [Open Source Initiative: MIT License](https://opensource.org/license/mit)
* [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
* [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html)
* [GNU LGPL v3](https://www.gnu.org/licenses/lgpl-3.0.en.html)
* [GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.en.html)
* [Mozilla Public License 2.0 FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)
