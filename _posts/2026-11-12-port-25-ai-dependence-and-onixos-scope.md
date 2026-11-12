---
title: "Port 25, AI Dependence, and the Value of Keeping Systems in Scope"
layout: post
categories: [Development, AI, Linux, OnixOS, OLanguage, OpenSource]
tags: [smtp, email, ai, onixos, olanguage, open-source, infrastructure]
comments: true
toc: true
---

I have been thinking about three problems that look unrelated at first. A home internet connection may prevent a server from sending mail directly. People may accept an AI answer without checking the documentation or the source. An operating system project may accumulate more editions than it can maintain well.

Each problem is partly about control. Who controls the network path, who is responsible for checking a claim, and which parts of a project are worth supporting? I want to explain what I have seen with SMTP in Turkey, what a mail relay does, why I think AI should remain a tool, and why we have narrowed the default OnixOS profile set.

## Port 25 is still part of how mail servers talk

SMTP uses different paths for message submission and server-to-server delivery. A mail application or a server submitting a message to a provider normally connects to a submission service on port 587, or uses implicit TLS on port 465. That service can authenticate the sender and apply its own submission rules. Mail servers relaying messages to recipient domains still use TCP port 25. The IETF describes this separation in [RFC 6409](https://datatracker.ietf.org/doc/html/rfc6409): submission normally uses port 587, while message relay continues over port 25. [RFC 8314](https://datatracker.ietf.org/doc/html/rfc8314) describes TLS for mail submission and access.

That distinction explains why changing my mail server's outbound connection from port 25 to 587 does not make direct server-to-server delivery work. Port 587 is not a replacement port that arbitrary recipient MX servers are expected to accept. It is for submitting mail to a provider or another configured submission server. That server then relays the message onward.

In my current experience in Turkey, direct outbound TCP connections to remote mail servers on port 25 are blocked on the internet connections I have tried, including Superonline. I have contacted ISP support about the problem. The answer I received was effectively, “we are using that port,” followed by no technical explanation or working remedy. That response does not tell me whether the provider is applying a network filter, reserving the port for its own service, or referring to a modem setting. It leaves a customer who has done the basic checks without a path to resolution. I cannot speak for every Turkish provider or every subscriber, but this is the support experience I want to document. Port 25 filtering is also documented in other countries and cloud networks. The part I am describing from Turkey is the connection and support experience I have encountered here.

ISPs and cloud providers commonly block outbound port 25 to reduce spam and abuse from compromised customer devices. [Spamhaus recommends restricting end-user networks](https://www.spamhaus.org/faqs/port-25-general-questions/) from making direct outbound connections on port 25, and [AWS](https://docs.aws.amazon.com/repost.aws/knowledge-center/ec2-port-25-throttle) and [Google](https://docs.cloud.google.com/compute/docs/tutorials/sending-mail) document their own default restrictions on some cloud services. The rationale is real: if an infected machine can deliver mail directly to thousands of remote servers, it can quickly damage the reputation of a shared network or address range. But a broad default can also prevent a legitimate operator from running a server, even when the customer has a static IP and can manage authentication, abuse handling, and mail reputation.

This is a trade-off, not a technical law. A provider can apply policy to a particular plan, IP, or account, and can offer a documented exception process. A service that sells a static IP but silently keeps required mail traffic blocked leaves the customer with an unclear product boundary. The provider should say which ports are filtered, whether the rule applies to incoming or outgoing traffic, and how a legitimate server operator can request an exception.

### A practical way to diagnose outbound port 25

I would first test the network connection itself, separate from the mail server's queue and delivery configuration. Find a real MX host for a destination domain, then try TCP port 25 from the machine that is supposed to send mail:

```sh
dig +short MX example.net
nc -vz mx.example.net 25
```

Replace `mx.example.net` with one of the MX hostnames returned by the first command. A successful TCP connection confirms that a route and listener answered, but it does not prove that the server will accept the message. An SMTP banner or STARTTLS negotiation can be checked with `openssl s_client -starttls smtp -connect mx.example.net:25 -crlf`. A timeout is different from an SMTP rejection: a rejection means the connection reached a mail server and the response should be investigated in the SMTP logs.

I would then repeat the connection test against more than one recipient MX and check the same machine through another internet connection, such as a phone hotspot. Before blaming the ISP, check the server's outbound firewall and any router firewall rules. If port 25 fails only on one uplink while the same machine reaches the test hosts through another uplink, that is strong evidence of filtering on the first network path. If it fails everywhere, investigate the server firewall, routing, or destination before opening an ISP ticket.

For the support request, include the customer WAN address, date and time, destination MX hostname and IP, the fact that the failure is **outbound TCP port 25**, and the test result. Ask specifically whether an anti-spam rule is filtering that traffic and whether the static address can be exempted. If support replies that “we are using that port,” ask them to clarify whether they mean outbound filtering on the subscriber line, a service listening on the modem, or an inbound port-forwarding restriction. Ask for the rule's direction, the device or network layer applying it, the applicable plan terms, and escalation to the network team if first-line support cannot answer. Keep inbound TCP port 25 as a separate question. If support says it has removed a rule, repeat the same test and save the result. “The port is open” is ambiguous unless both sides agree on direction, destination, and the point in the network where the test is made.

If the ISP will not allow direct outbound port 25, use an authenticated relay on a port the ISP permits, usually 587 with STARTTLS or 465 with TLS. This lets the local MTA hand messages to a provider that has its own delivery path. In Postfix, the core settings look like this:

```ini
# /etc/postfix/main.cf
relayhost = [smtp.example.net]:587
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_tls_security_options = noanonymous
smtp_tls_security_level = encrypt
```

The square brackets tell Postfix to connect to that relay host directly instead of looking up its MX records. The credential file must use the same host and port:

```text
# /etc/postfix/sasl_passwd
[smtp.example.net]:587 SMTP_USERNAME:SMTP_PASSWORD
```

Keep that file readable only by root, build the indexed map with `postmap /etc/postfix/sasl_passwd`, then reload Postfix. The relay provider's hostname, SMTP username, and key replace the example values. Check the provider's setup instructions for its TLS mode and credential format. Postfix documents this authenticated relay pattern in its [Small/Home Office guide](https://www.postfix.org/SOHO_README.html). After configuring it, send a test message and check both the Postfix logs and the relay provider's activity or bounce records. Do not treat a successful connection to the relay as proof that the recipient accepted the message.

If inbound mail also needs to reach a home server, an outbound relay alone will not solve that part. First ask for a public IPv4 address if the router is behind carrier grade NAT, reserve a stable local address for the mail server, configure a port forward for inbound TCP 25, and make sure the server firewall permits it. Then test from a separate network and verify the domain's MX and address records. If the ISP blocks inbound port 25 or cannot provide a public address, use a hosted mailbox or an inbound MX gateway that can forward mail over a supported connection. A VPS is another option, but confirm its inbound and outbound SMTP policy and reverse DNS before migrating mail there.

## Port forwarding, DNS, and outbound filtering are separate things

I have seen port forwarding discussed as if it can solve every mail server connectivity problem. It cannot. A port-forwarding rule on a router directs inbound connections from the public network to a device on the local network. It does not open outbound TCP port 25, set up public DNS, or assign a public address to the customer.

For a self-hosted mail server, there are several independent checks:

1. **Outbound delivery:** Can the server establish a TCP connection to a known remote MX host on port 25? If not, check the server firewall, router, and ISP path separately, then ask the ISP to confirm its outbound SMTP policy.
2. **Inbound delivery:** Does the domain's MX record point to the intended mail host, and does that host resolve to the right public address? Is the server listening on port 25, and can a connection from outside reach it?
3. **Public address and NAT:** Does the router actually have the public IPv4 address, or is it behind carrier grade NAT? The IETF reserves `100.64.0.0/10` for shared address space used in provider networks. If the router's WAN address is in that range, or otherwise differs from the public address seen from outside, a local port-forward rule may not be sufficient. Ask the ISP for a public address or a supported inbound path.
4. **Mail identity and reputation:** Does the domain have correctly configured MX, SPF, DKIM, and DMARC records? Can the provider set reverse DNS for the sending IP? Do recipient services accept mail from that address range?

DNS resolution and port forwarding are not the same operation. MX records tell remote senders where to deliver mail. A forward rule only maps an incoming connection through a router. If a hostname resolves to an unexpected address, inspect the authoritative DNS records, resolver cache, and domain configuration. Changing a modem rule will not correct a wrong MX or A/AAAA record.

There is also a real question of control over ISP supplied equipment. Broadband Forum's residential gateway requirements include support for TR-069, a standard for remote management of customer premises equipment. Remote configuration is a supported capability in residential gateways; that does not prove that a particular ISP changed a particular customer's port-forward rules. If a setting keeps changing, record the router configuration, WAN address, firmware version, and the time of the change, then ask the provider whether its management system is applying a profile. That creates evidence instead of leaving the customer and support team to guess.

## What a relay does, and what it does not do

A relay, also called a smarthost, is a mail server that accepts a message from an authorized sender and forwards it to the recipient's mail server. My server connects to the relay over an authenticated submission connection, usually on port 587 or 465. The relay then performs delivery to the recipient's MX over port 25.

The flow looks like this:

```text
My application or mail server
        | SMTP submission with authentication, port 587 or 465
        v
Mail relay provider
        | SMTP server-to-server delivery, port 25
        v
Recipient's mail server
```

This is a practical workaround for outbound port 25 filtering. It is not a workaround for every self-hosted mail requirement. A relay handles outgoing mail. If I also want to receive mail directly at home, I still need inbound delivery to work, a public DNS path, an address with usable reputation, and an MX destination. An inbound filtering service can accept mail on its own public servers and then forward it to a home server over a supported path, but that is a separate product and configuration.

There are three reasonable approaches, depending on what I am trying to operate:

- **Transactional relay:** Use an SMTP relay or email API for application messages such as account verification, alerts, and password resets. This is usually the least work if I do not need to host user inboxes.
- **Hosted mailboxes:** Let a mail hosting provider handle the mail domain, inbound delivery, spam filtering, and user mailboxes. This is a better fit for a small business that needs dependable addresses rather than a mail-server project.
- **Self-hosted mail:** Run the MTA and mailbox stack myself, but first confirm that the ISP permits the required inbound and outbound paths, provides or allows suitable IP and reverse DNS, and does not place the address on a poor reputation range. A relay may still be part of this design.

These options are not interchangeable. A transactional relay is not a mailbox host. A cheap mailbox plan may not be intended for bulk or automated mail. A VPS advertised as a mail server does not guarantee that its network allows direct SMTP on port 25. Check the provider's policy before moving a domain or changing DNS.

## Relay and hosted mail options to compare

Pricing and account limits change, so I am linking to provider pages rather than treating these figures as permanent. Published prices are generally in US dollars and may not include tax, foreign exchange, or local payment costs.

| Service | Useful for | Published entry point when checked | Details to check |
| --- | --- | --- | --- |
| [Amazon SES](https://aws.amazon.com/ses/pricing/) | Low-volume or larger application sending with usage-based pricing | Its current Essentials page lists $0.16 per 1,000 emails in the first volume tier. The pricing page also describes an à-la-carte option. | Account verification, region-specific limits, sandbox status, domain authentication, attachment and data charges. SES supports submission over ports 465 and 587. |
| [Brevo SMTP](https://developers.brevo.com/docs/smtp-integration) | A simple SMTP relay for transactional messages, with marketing features available separately | Free accounts have a daily sending allowance, currently listed as 300 messages per day after approval. | Approved account status, sender and domain authentication, daily limits, and whether its features match the sending use case. SMTP supports ports 587, 465, and 2525. |
| [Resend](https://resend.com/pricing) | Developer focused transactional mail through SMTP or API | Free tier lists 3,000 messages per month with a 100-per-day limit; the Pro plan is listed at $20 per month for 50,000. | Domain and sender verification, daily limits, overage settings, and whether the workflow needs SMTP or an API. |
| [Postmark](https://postmarkapp.com/pricing/) | Transactional mail where message activity and operational visibility matter | Free Developer tier lists 100 emails per month; Basic is listed at $15 per month for 10,000. | The free tier is intended for testing and small projects. Separate transactional and broadcast streams may matter for the design. |
| [Zoho Mail](https://www.zoho.com/mail/zohomail-pricing.html) | Hosted mailboxes on a custom domain | Mail Lite is listed from $1 per user per month when billed annually. Zoho says its free plan is available only in selected data centers. | Availability for the account's region, annual billing, storage, client access, and whether a separate transactional service is needed. |

The price alone does not tell me whether a provider is a good fit. I would compare deliverability controls, bounce and complaint handling, suppression lists, message retention, support response, data location, sender verification, daily caps, and migration costs. For a small application, SES can be inexpensive per message but may involve more account and configuration work. Brevo or Resend may be quicker to set up. A mailbox service such as Zoho solves a different problem from any of those relays.

## A narrower OnixOS profile set is easier to maintain

The same question of scope has come up in OnixOS. We have had profiles for distinct hardware and product directions, but keeping every edition in the default build group adds packaging, image, documentation, and support work. The [current build-system profile list](https://gitlab.com/onix-os/onix-build-system/-/blob/main/sources/profiles.list) contains six entries: `core`, `server`, `kde`, `xfce`, `security`, and `gnome`.

The profile changes also make a distinction between the main OnixOS set and corporate editions. Raspberry Pi and Mobile, TV, and Kubernetes editions were moved into the corporate group. The Retro Edition was retired. Kubernetes functionality is represented as a server role in the Server profile, while the Kubernetes edition itself sits with the corporate work. The change is about narrowing the default set and placing specialized editions in the group intended to hold them. It does not mean the work is complete or that every specialized profile has disappeared from the source repositories.

Recent build-system work reflects that maintenance focus. The image pipeline now selects named profiles from its configured list, and work on the repository workers has focused on publishing successful partial outputs independently when another build fails. KDE has been registered alongside the existing priority profiles. Those are changes in source and pipeline behavior, not proof that every resulting image has been tested on real hardware. Image readiness still needs build and boot evidence.

O Language work has followed a similarly practical path. The language repository's web tooling added commands for managing web projects, route scaffolding, progress reporting, and a centralized project loader. Related documentation was reorganized around the current CLI and web workflow, while the `olf` repository now serves as a small framework example with routes, controllers, templates, and assets. Work in the O Language model repository also refined the training data to retain valid O Language code and improve dataset quality. Those commits describe concrete steps in tooling and documentation. They do not make the language ecosystem or its model mature by themselves.

The value of reviewing project history is not to turn an article into a list of commit subjects. It is to see the direction: maintain the core profiles, move specialized editions into a clearer group, make web project setup more consistent, and improve the source material used by the model. The implementation details and current profile configuration are in the [OnixOS profiles repository](https://gitlab.com/onix-os/onixos-profiles), the [OnixOS build system](https://gitlab.com/onix-os/onix-build-system), and the [O Language repositories](https://gitlab.com/olanguage/olang).

## AI can help with a problem, but it cannot own the investigation

The other kind of scope creep I see is in how people use AI. Around me, some people have moved from asking AI for help to treating its answers as final authority. They skip the documentation, do not inspect the source, and accept an explanation without checking whether it applies to the system in front of them.

That is a risky way to troubleshoot. A confident answer can still be wrong, can leave out a constraint, or can describe a different version of the software. [NIST's Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) calls this kind of output “confabulation” and explains that a model can present false information confidently, including invented reasoning or citations. It also identifies automation bias and over-reliance as risks in human-AI interactions. That is not an argument for avoiding AI. It is a reason to keep the evidence and the decision with the person doing the work.

When I use AI to investigate an issue, the useful next steps are still ordinary engineering steps: identify the exact error, check the relevant documentation and source, reproduce the smallest case, inspect the logs, and verify the proposed change against the actual environment. AI can help find a relevant setting, summarize a long file, or suggest hypotheses. A hypothesis is a place to investigate, not the investigation itself. A [systematic review of 106 human-AI experiments](https://www.nature.com/articles/s41562-024-02024-1) found that results vary by task; on average the combined teams outperformed humans alone, but not the better of human-only or AI-only performance. That result is not a verdict on every tool or future workflow. It is a useful reminder to ask whether assistance is improving the task at hand, rather than assuming that adding AI automatically improves it.

This also matters in infrastructure. If SMTP delivery fails, an AI answer might suggest changing a router's port-forward rule. But if the failure is outbound port 25 filtering, that rule cannot fix it. If inbound mail fails because the connection is behind carrier grade NAT, changing DNS alone will not create a public route. A useful diagnosis starts by separating those mechanisms and checking each one.

AI and quantum computing are both active areas of research and development, and both attract claims that outrun what a particular tool or experiment can demonstrate. I am interested in them, including local model work and quantum simulation, but neither needs to become the center of every decision. I want AI to reduce friction and help me think. I do not want it to replace documentation, curiosity, or responsibility for what I publish and operate.

The same principle applies to an operating system project. Keep the parts that can be maintained, move specialized work into a clear boundary, and say what has and has not been verified. Whether the subject is a mail server, a language tool, or an AI answer, progress depends on understanding the mechanism and checking it against reality.

## References

- [Spamhaus: Port 25 general questions](https://www.spamhaus.org/faqs/port-25-general-questions/)
- [RFC 6409: Message Submission for Mail](https://datatracker.ietf.org/doc/html/rfc6409)
- [RFC 8314: TLS for Email Submission and Access](https://datatracker.ietf.org/doc/html/rfc8314)
- [RFC 6598: Shared Address Space for Carrier Grade NAT](https://www.rfc-editor.org/rfc/rfc6598.html)
- [Broadband Forum residential gateway requirements](https://rg-device-requirements.broadband-forum.org/)
- [Postfix Small/Home Office relay configuration guide](https://www.postfix.org/SOHO_README.html)
- [NIST AI 600-1: Generative Artificial Intelligence Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [When combinations of humans and AI are useful: a systematic review and meta-analysis](https://www.nature.com/articles/s41562-024-02024-1)
- [Google Cloud SMTP egress restrictions](https://docs.cloud.google.com/compute/docs/tutorials/sending-mail)
- [AWS SES SMTP troubleshooting](https://docs.aws.amazon.com/ses/latest/dg/troubleshoot-smtp.html)
