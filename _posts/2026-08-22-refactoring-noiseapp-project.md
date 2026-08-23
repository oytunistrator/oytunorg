---
title: "Refactoring NoiseApp: Adding Multi-Language Support & Feature Upgrades"
layout: post
categories: [Development, Web, NoiseApp, Architecture, OpenSource]
tags: [noiseapp, gurultudedektifi, refactoring, python, multi-language, open-source, i18n, twitter-api, mobile]
comments: true
---

Building a public-interest project to address urban noise pollution sounds rewarding on paper. You write the code, gather incident data, and give your community a voice to demand accountability. 

In practice, it means sifting through query logs, fighting file upload bugs late into the night, and tackling technical debt head-on to build something that lasts.

Over the past few weeks, I’ve been heads-down refactoring **NoiseApp**  the underlying platform powering [Gürültü Dedektifi](https://gurultudedektifi.com/). Today, I’m sharing what changed under the hood, why this refactor was long overdue, and what new features made the cut.

---

### Refining the Stack & Cleaning Up Tech Debt

When you work on a project over time, code rot is inevitable. In earlier iterations of NoiseApp, [Musa](https://x.com/musayazlik) and I collaborated closely on the frontend. While that got the platform off the ground, a mix of legacy frontend choices and backend tight-coupling eventually caught up with us.

As features grew, subtle bugs began surfacing  ranging from UI state sync issues to brittle API responses. Adding new features on top of these rough edges felt like walking through mud. I had two choices: keep patching over existing bugs or take full ownership of a proper refactor.

I stepped in as lead developer to clean up the debt, rewrite the problematic components, and establish a maintainable codebase.

---

### What Changed in the Refactor

This cycle wasn't about starting from a blank page  it was about modularizing existing workflows, eliminating UI/backend bugs, and adding long-awaited core capabilities:

#### 1. Native Multi-Language (i18n) Support
Noise pollution isn't localized to a single region or language. The platform now features proper internationalization support, decoupling user-facing strings from application logic to serve a broader audience seamlessly.

#### 2. Media Attachments for Incident Reporting
To improve report credibility, visual evidence is now part of the flow:
* **Photo Uploads:** Implemented file upload handling across both user reporting forms and the admin control panel.

#### 3. Automated Tweet Generation
Raising awareness requires getting data out into the public square. NoiseApp now includes built-in Twitter/X draft generation to quickly turn submitted reports into shareable social posts.

#### 4. Frontend & Report Loading Performance
Optimized report queries and frontend asset delivery, resulting in noticeably faster load times across dashboard views and public report pages.

---

### What's Next? Mobile App Development

With the web platform refactored and the core APIs cleaned up, we now have a solid foundation for expansion. The next major phase for NoiseApp will focus on **mobile development**, bringing incident reporting and real-time noise tracking directly to iOS and Android devices.

---

### Project Links & Git History

If you look at the commit log, it reflects focused execution: modularizing routes, resolving cross-stack bugs, and standardizing frontend components.

* **GitLab Repository:** [odznames / NoiseApp](https://gitlab.com/odznames/noiseapp)
* **Official Website:** [gurultudedektifi.com](https://gurultudedektifi.com/)
* **Twitter / X:** [@GurultuDedektif](https://x.com/GurultuDedektif)

Projects like this don't improve on feature requests alone  they move forward through execution. 

*Happy Hacking.*