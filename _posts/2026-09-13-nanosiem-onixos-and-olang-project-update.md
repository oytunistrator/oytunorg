---
title: "Introducing NanoSIEM: A Local Security Model for Practical Analysis"
layout: post
categories: [Development, AI, Cybersecurity, Linux, OnixOS, OLanguage, OpenSource]
tags: [nanosiem, siem, cybersecurity, rag, local-ai, huggingface, onixos, olanguage, buildsystem, multiarch]
comments: true
toc: true
---

Recently, most of my time has gone into NanoSIEM, a security-focused AI model and retrieval system that can run locally. I have also made a few updates to the OnixOS and O Language repositories, but NanoSIEM is the main subject here.

The project is still changing, so I am not going to present it as a finished product. The more useful thing to describe is how it is being built: which data goes into retrieval, which data is allowed into training, what the model should refuse to guess, and how I am testing the local workflow.

## NanoSIEM: a small model with a deliberately narrow job

[NanoSIEM](https://huggingface.co/oytunistrator/nano-siem-model) is a cybersecurity RAG, SIEM analysis, and local GGUF model project. The goal is to make security information easier to query locally without pretending that a language model is a scanner, an incident responder, or a legal authority.

The implementation is being developed in the `csap-ai-model` workspace. It is designed around a 1B–8B instruct model, although the current profile is aimed at the smaller end of that range. This is mainly a hardware decision. I want to be able to train and test the model on a realistic CUDA machine, not only on a large server that is unavailable during normal development.

The model is paired with a [public dataset on Hugging Face](https://huggingface.co/datasets/oytunistrator/nano-siem-dataset). I am keeping the source and retrieval metadata with each record. The ingestion code also keeps retrieval material separate from examples that are suitable for training.

For example, a current CVE or a legal document belongs in the retrieval corpus first. It can be cited when answering a question, but it should not automatically become a training example. If unreviewed records are used for SFT, it becomes difficult to tell whether an answer is based on a checked fact or just a pattern learned from the data.

## RAG first, training second

NanoSIEM treats retrieval and supervised fine-tuning as separate parts of the system.

The full corpus is used for RAG. It includes security advisories and structured material from NVD, CISA KEV, CWE, ATT&CK, OWASP, NIST, and authorized tooling documentation. I also added an offline legal baseline with Turkish and international documents. This gives the legal ingestion step a known starting point and means it does not have to download those documents every time.

The SFT dataset is smaller. It is built from reviewed records and curated scenarios so the model can learn response behavior: explain a finding, mention uncertainty, ask for missing context, and stay within an authorized defensive scope. I do not want it to memorize a security database that will be outdated as soon as the next advisories arrive.

The pipeline writes a manifest and validates the normalized JSONL data. Stable IDs, deduplication, jurisdiction, retrieval dates, and provenance are part of the data format. For legal questions, the system should point out missing country, date, facts, or institutional role instead of filling those gaps with an assumption.

The same rule applies to technical questions. A port, banner, or scanner result is an observation; it is not automatically a vulnerability or a compromise. NanoSIEM can discuss Nmap, Nuclei, Semgrep, TShark, YARA, osquery, and Metasploit in an owned asset, lab, or authorized assessment. It should help interpret evidence and plan a safe validation step, not assume permission for an unknown target.

## Making the local model easier to operate

I have also been spending time on the build itself, because the model is not very useful if rebuilding it is an improvised process.

QLoRA training is kept on CUDA for the supported profile, and the memory settings are tuned for a smaller GPU. The conversion path produces a GGUF model for local `llama.cpp` use, with `Q4_K_M` as the practical default when model size matters. A larger base model remains possible when the hardware and evaluation results justify it, but the project does not treat “larger” as an automatic improvement.

The Hugging Face upload path was tightened as well. Model and dataset uploads run sequentially, repository README files are preserved, and the upload script avoids putting credentials into the Makefile or command history. Only the intended current model output and its checksum are published; old local GGUF files are not silently uploaded as part of a release.

The goal is to make the same process work again a week later: prepare the data, train, convert to GGUF, check the output, upload it, and run a local query without remembering a collection of undocumented exceptions.

## A short OnixOS update

The latest [OnixOS Build System](https://gitlab.com/onix-os/onix-build-system) changes are a smaller part of this update. The repositories were updated to address a few practical release issues: deterministic pacman cache cleanup, verification of the published repository before an ISO build, a duplicated ISO sync path, and a Docker worker failure caused by `sudo` setuid assumptions.

The ISO pipeline now checks that the public repository exposes the expected database and package before `archiso` starts. The release flow also keeps architecture stages serial, so repository metadata is synchronized in a predictable order. The AUR mirror helper was updated with locking, throttled requests, retries, and per-package failure reporting.

These changes are background infrastructure for NanoSIEM and the other security tools that may eventually be distributed through OnixOS.

## O Language and the surrounding ecosystem

The [O Language project](https://gitlab.com/olanguage/olang) also received repository updates. Centralized project loading, typed route scaffolding, and safer handling of empty values continue to improve the application environment around the platform.

The web framework changes now have centralized project loading and typed route scaffolding, while the runtime handles values crossing the Go and O Language boundary more predictably. Empty values are normalized into language-level errors instead of becoming host-language nil-pointer failures. Tests were added around the compiler, evaluator, VM, and web components to keep these changes from turning into regressions hidden behind a working demo.

It is not the focus of this post, but it helps keep the surrounding development environment predictable.

## What comes next

The next step for NanoSIEM is evaluation with reviewed scenarios: CVE explanations, SIEM event interpretation, evidence boundaries, and questions where asking for more context is the correct answer. I will look at retrieval quality and response time together with model output; a single benchmark score would not tell me enough.

For OnixOS, the priority remains observable release behavior. Repository publication, worker setup, ISO profiles, and synchronization need to agree about the same architecture and the same paths. A clean static check is useful, but the final proof is still a complete build job that finishes with the expected artifacts and logs.

For NanoSIEM, the immediate goal is simple: make a small local model that gives useful security answers, shows where those answers came from, and admits when the available information is not enough. The surrounding repository and language work will continue, but the model is where the next round of testing will happen.

*More updates will follow as NanoSIEM moves through evaluation and the next OnixOS build runs provide new evidence.*
