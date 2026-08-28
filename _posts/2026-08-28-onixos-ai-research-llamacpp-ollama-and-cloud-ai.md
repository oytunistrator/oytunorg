---
title: "OnixOS AI Research: What Llama.cpp, Ollama, and Cloud AI Taught Me"
layout: post
categories: [AI, OnixOS, Linux, LocalAI, CloudAI, Hardware]
tags: [onixos, ai, llama.cpp, ollama, localllm, cloudai, huggingface, cpu, gpu, vram, ram, optimization]
comments: true
toc: true
---

Artificial intelligence is often presented as a race to build the largest possible model. The larger the model, the more capable it is supposed to be; the more tokens a service sells, the more useful it is supposed to be. My own experiments have led me to a different conclusion.

The most important part of an AI system is not always the size of the model. It is the relationship between the model, the runtime, the hardware, and the way the whole system is configured. This article is about my AI research around OnixOS, but it is not limited to OnixOS. It is also a record of what I learned while comparing Ollama and Llama.cpp, investigating CPU/GPU runtimes, optimizing models locally, and looking more critically at Cloud AI services.

## From Ollama to Llama.cpp

I had experimented with Ollama before. It was a convenient way to download and run models, and it made local AI approachable. Over time, however, I began to run into practical limitations in my own workflow.

Model switching was not always as smooth as I wanted. Loading a new model, unloading the previous one, and dealing with model-related delays introduced friction. Hardware dependencies also became more visible as I tried different models and different systems. The simple interface was useful, but it sometimes hid the details that I needed to understand and control.

That was one of the reasons I moved to Llama.cpp, with several changes to fit my needs. This was not because Ollama was useless. Ollama is an excellent entry point and a useful abstraction layer. Llama.cpp gave me a lower-level view of model loading, runtime behavior, memory use, and hardware interaction. For my research, that control was more valuable than convenience alone.

## The difficult part was underneath the interface

My first transition to Llama.cpp did not solve everything immediately. I encountered problems during model loading, hardware incompatibilities, and mismatches between CPU and GPU runtimes. Some models behaved differently depending on the available backend, the selected compilation options, or the way layers were assigned to the GPU.

To make the system work reliably, I had to investigate these problems at a low level. I developed improvements and patches around model loading, runtime compatibility, and hardware handling. This work changed my understanding of local AI: a model that appears to be “too large” is not necessarily impossible to run, while a model that technically fits in memory can still create serious performance problems.

The size of a model is only one part of the equation. Loading strategy, quantization, context size, offloading, memory mapping, thread configuration, and backend compatibility can all change the result. A runtime that does not handle these details well may keep a system under unnecessary and continuous load, even when the model appears to be running successfully.

## Optimization matters more than raw model size

After working with Llama.cpp and my own patches, I started optimizing larger models instead of treating their original size as fixed. I reduced models to more practical configurations, cleaned unnecessary or problematic source material from incoming models automatically, and ran additional optimization on my own model.

The result was not simply a smaller file. It was a model that behaved more predictably in the runtime and placed less unnecessary pressure on the system. This distinction is important. A model can be compressed or adapted in a way that makes it easier to run, but the runtime still needs to understand how to use that model efficiently.

In my tests, many slow or resource-intensive experiences were not caused only by the model’s intelligence or parameter count. They were caused by optimization gaps between the model and the system running it. If those gaps are addressed, a model that initially looks impractical can become useful on a much more modest machine.

## AI models are not limited to VRAM and RAM alone

One of my broader conclusions is that AI models can run on a much wider range of hardware than common discussions suggest. VRAM and RAM are important constraints, but they are not the entire story.

The practical question is not simply, “How many gigabytes does this model require?” It is also:

- Which parts of the model are placed in VRAM, and which remain in system memory?
- Is the CPU or GPU backend compatible with the model and the runtime?
- Is the model quantized appropriately for the target system?
- Are the context length, batch size, and thread settings reasonable?
- Is the model performing unnecessary work because of a configuration or optimization problem?

Some models pass through these optimization steps well. Others do not. In the latter case, the system may work much harder than necessary, creating heat, latency, and memory pressure without delivering a proportional improvement in output quality. Proper runtime parameters and hardware compatibility can matter as much as the headline specifications.

This does not mean that hardware limits are imaginary. A model still needs enough resources to perform its work. It means that “not enough VRAM” should not always be the end of the investigation. With the right memory strategy, CPU/GPU distribution, quantization, and runtime tuning, local execution can be possible in situations where a default setup would fail or perform badly.

## The Cloud AI question

These experiments also changed how I look at Cloud AI. Cloud services are convenient, powerful, and often the fastest way to access a capable model. But convenience can make the underlying economics and optimization choices less visible.

My impression from using and testing different systems is that some Cloud AI companies expose very large models without doing enough optimization for the workloads they offer. In some cases, the model is delivered primarily as a larger product with a higher token ceiling, rather than as a carefully optimized system trained and tuned for a specific purpose.

This creates a familiar pattern: the model is large, the operation is expensive, and the user is encouraged to consume more tokens. When the model itself has not been optimized adequately, the cost is not necessarily buying better results. It may be paying for inefficiency, infrastructure overhead, or a product design built around maximum usage.

I have also become skeptical of usage limits presented by Cloud AI services. At certain times, daily, weekly, or monthly token limits can be increased dramatically in ways that feel designed to encourage subscriptions and increase billing. From the user’s perspective, the limit is not just a technical measurement; it becomes part of the sales model. This makes it difficult to know whether the price reflects genuine computational needs or an incentive to consume more.

I am not claiming that every Cloud AI provider behaves the same way. Cloud infrastructure has real costs, and hosted models can provide capabilities that are difficult to reproduce locally. My point is that users should distinguish between model capability, runtime efficiency, and pricing strategy. A higher token allowance does not automatically mean a better-optimized AI system.

## Open models make the comparison possible

The encouraging part is that many models are accessible as open-source or openly distributed projects through platforms such as [Hugging Face](https://huggingface.co/). This makes it possible to compare local and cloud execution instead of accepting a provider’s default experience as the only option.

In my own tests with models obtained from these kinds of repositories, I found that the critical details were often the execution parameters and their compatibility with the target system. Once those details were identified correctly, a model could be optimized for the hardware it was meant to run on and then used again through the runtime.

This makes local AI more than an offline alternative. It becomes a research environment. You can observe memory behavior, change the backend, compare quantization levels, test context sizes, and understand what the model is actually doing. You are no longer limited to a provider’s interface, token policy, or infrastructure decisions.

## Tooling creates a better relationship with models

Good tooling has been just as important as the models themselves. Tools that expose runtime settings, model metadata, logs, loading behavior, and hardware usage make it easier to understand what is happening. They also make it easier for us to communicate with models more effectively, because we can choose the right context, the right parameters, and the right workflow instead of treating the model as a black box.

With the right tooling, I found that local systems can operate a wide range of models across different VRAM and RAM configurations. This does not eliminate the need for experimentation. It makes experimentation practical and repeatable.

For OnixOS, this kind of work is particularly meaningful. An operating system is not only a place where applications run; it is also the layer that determines how hardware, processes, memory, and runtimes cooperate. AI research therefore fits naturally into the broader OnixOS effort. Understanding local inference helps reveal what an operating system needs to do well: manage resources, provide compatible runtimes, expose useful diagnostics, and avoid imposing unnecessary overhead.

## What I take away from this research

My journey from Ollama to Llama.cpp started with model switching and loading delays, but it became a much wider investigation into how AI systems really work. Low-level runtime problems led to patches. Those patches led to model optimization. Optimization led to a better understanding of hardware limits. That understanding led to more questions about Cloud AI pricing, token restrictions, and the difference between model size and actual usefulness.

The main lesson is simple: the model is only one component of an AI system. The runtime, the hardware, the parameters, the training and optimization process, and the business model around the service all matter.

Local AI will not replace every cloud workflow. Cloud AI remains valuable when scale, collaboration, or access to specialized infrastructure is important. But open models and capable runtimes give us another choice: we can test, optimize, and understand the systems we use.

That is the direction I want to continue exploring with OnixOS and my AI research. The future of AI should not be measured only by how large a model is or how many tokens a service can sell. It should also be measured by how efficiently, transparently, and intelligently that model works on the systems people actually own.

