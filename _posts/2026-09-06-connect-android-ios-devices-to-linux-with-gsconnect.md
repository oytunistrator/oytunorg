---
title: "Connect Android and iOS Devices to Linux with GSConnect"
layout: post
comments: true
toc: true
categories: [Linux, GNOME, Arch Linux, Mobile]
tags: [linux, gnome, gsconnect, kde-connect, android, ios, arch-linux, networking]
---

Moving a file between a phone and a Linux desktop should not require email, a USB cable, or a third-party cloud account. On a GNOME-based Linux system, **GSConnect** speaks to the KDE Connect application on a phone over the local network. It brings clipboard sharing, notifications, file transfer, media controls, and remote input into one workflow.

This article targets GNOME desktops. Plasma users should install and use `kdeconnect` directly rather than GSConnect. GSConnect is a complete GNOME Shell implementation of the KDE Connect protocol, with Nautilus integration and support for Chromium and Firefox. Do not run it alongside the KDE Connect desktop application: the GNOME Extensions page explicitly says that GSConnect will not work with KDE Connect installed.[^gsconnect]

## Architecture: local network, not a cable

The setup has two endpoints:

1. The GSConnect extension running inside GNOME Shell on Linux.
2. The KDE Connect application running on the phone.

When both endpoints can reach the same local network, they discover one another, the user confirms a pairing request, and a trust relationship is established. Traffic moves directly between the devices. The Android app description states that data is sent through the local network rather than the Internet or a KDE server, and is protected with end-to-end TLS encryption.[^android]

This distinction matters: GSConnect is not a USB phone-mounting tool. The devices need a shared Wi-Fi network, or an Ethernet/Wi-Fi setup on the same local subnet with discovery allowed by the access point. Guest networks and AP/client isolation commonly prevent discovery.

## Android and iOS: one protocol, different capability sets

Android provides the most complete GSConnect experience. Common uses include shared clipboard, sending files and URLs, desktop notification mirroring, SMS and call notifications, a virtual touchpad/keyboard, media-player controls, and wireless access to phone files.[^android]

An official KDE Connect app is also available for iPhone and iPad. Its App Store listing includes shared clipboard, file and URL sharing, a virtual touchpad and keyboard, presentation remote control, and remote commands.[^ios] iOS, however, has stricter background-execution and system-permission rules than Android. Do not assume Android capabilities such as SMS access, call history, broad notification mirroring, or persistent filesystem access will be available on iOS. Check the plugin screens in both the phone app and GSConnect device settings for the capabilities actually exposed by your version.

On either platform, evaluate permissions by feature. Android, for example, may require notification access for notification forwarding and accessibility access for remote input.[^android] Disabling unused plugins reduces both unnecessary permissions and attack surface.

## Installing GSConnect on Arch Linux

For GNOME on Arch Linux, GSConnect is packaged in the AUR as `gnome-shell-extension-gsconnect`. First, make sure the system is current and that a GNOME session is available:

```sh
sudo pacman -Syu
sudo pacman -S gnome-shell gnome-extensions
```

Then install the extension through your preferred AUR helper. This example uses `yay`:

```sh
yay -S gnome-shell-extension-gsconnect
```

If you do not use `yay`, inspect the package's `PKGBUILD` on the AUR and build it through the normal `makepkg -si` workflow. Inspecting an AUR build recipe is not ceremony: its build steps execute on your machine.

After installation, enable the extension through the GNOME Extensions application or from a terminal using its UUID:

```sh
gnome-extensions enable org.gnome.Shell.Extensions.GSConnect
gnome-extensions list --enabled
```

On a Wayland session, the familiar `Alt`+`F2`, then `r` GNOME Shell restart does not apply. Log out and back in if the extension does not appear. Once it is enabled, the GSConnect menu is available from the top bar, where devices can be discovered and pairing requests accepted.

> On a non-GNOME desktop, `kdeconnect` is available in the official Arch repositories. ArchWiki recommends GSConnect instead of `kdeconnect` for better GNOME integration.[^archwiki]

## Pairing the devices

1. Connect the phone and computer to the same trusted local network.
2. Install the official KDE Connect application from Google Play on Android or the App Store on iPhone/iPad.[^android][^ios]
3. Open GSConnect from GNOME's top bar and KDE Connect on the phone.
4. Send a pairing request from either device and accept it on the other.
5. Enable only the plugins you need and choose a destination directory for received files.

Pairing normally survives reboots. Removing the mobile application, clearing GSConnect data, or unpairing from either endpoint requires a new confirmation.

## Arch networking and firewall configuration

The KDE Connect family uses the `1714-1764` range over both UDP and TCP for discovery and data connections.[^kdeconnect][^archwiki] A default Arch installation with no active firewall may need no extra rule. If you restrict incoming traffic with `ufw`, `firewalld`, or `nftables`, allow this range **only on a trusted local-network interface**.

### UFW

```sh
sudo ufw allow in on wlan0 to any port 1714:1764 proto tcp
sudo ufw allow in on wlan0 to any port 1714:1764 proto udp
```

`wlan0` is only an example. Check the real interface name with `ip link`; on a wired desktop it might be `enp5s0`. Constraining the rule to the LAN interface is safer than exposing these service ports on every network.

### firewalld

```sh
sudo firewall-cmd --permanent --zone=home --add-port=1714-1764/tcp
sudo firewall-cmd --permanent --zone=home --add-port=1714-1764/udp
sudo firewall-cmd --reload
```

Confirm that `home` is assigned to the intended trusted LAN interface:

```sh
firewall-cmd --get-active-zones
```

### nftables

If you maintain your own `inet filter` table, add the equivalent of these rules to the `input` chain **before** its final reject rule:

```nft
iifname "wlan0" tcp dport 1714-1764 accept
iifname "wlan0" udp dport 1714-1764 accept
```

Add the rules to the appropriate persistent structure in `/etc/nftables.conf`, and validate syntax before applying it with `sudo nft -c -f /etc/nftables.conf`. Do not blindly add a rule to a live firewall: inspect the existing table and chain layout first with `sudo nft list ruleset`.

## Troubleshooting: why is the device missing?

Avoid toggling plugins at random. Verify the integration one layer at a time:

1. **Connectivity:** Are both endpoints on the same IP network? Is there a guest Wi-Fi, VLAN, client-isolation, or VPN issue?
2. **Discovery:** Does the firewall permit the required range over both TCP and UDP? On a host with several network cards, did you permit the correct interface?
3. **Application:** Is GSConnect enabled? Does `gnome-extensions list --enabled` include it? Is the Android/iOS app open and allowed to use the local network?
4. **Pairing:** Remove a stale pair at both endpoints and request a new one. On networks that block broadcasts, KDE Connect for Android can add a device by IP address; ArchWiki also suggests refreshing the device list and using IP-based addition when a phone is not found.[^archwiki]

If the issue began after a GSConnect update, check extension compatibility with your GNOME Shell release. The GNOME Extensions page lists each extension version alongside the supported Shell versions.[^gsconnect] This is especially useful on Arch, where updates arrive quickly.

## Security and operational notes

Use GSConnect on networks you trust, such as your home or office LAN. Pairing approval is the first barrier against arbitrary local users sending content to the desktop, but it is still sensible to keep remote commands, clipboard sync, and remote input disabled on public Wi-Fi. Remove paired devices that are no longer in use.

Clipboard synchronization deserves special care on development machines where passwords, API keys, and tokens are copied. KDE Connect for Android offers an option to avoid synchronizing sensitive clipboard content.[^android] Enabling it and limiting sharing permissions per plugin turns a merely working installation into a maintainable one.

## Conclusion

The GNOME and GSConnect combination is a comprehensive Android integration layer and a useful local-network bridge for iOS within Apple's platform limits. On Arch Linux, the essentials are to install the extension carefully from the AUR, use GSConnect alone on GNOME, allow TCP and UDP `1714-1764` only in the appropriate trusted firewall zone, and grant only the permissions your workflow needs. With those pieces in place, routine phone-to-desktop work becomes wireless, account-independent, and unobtrusive.

## Sources

[^gsconnect]: [GSConnect — GNOME Shell Extensions](https://extensions.gnome.org/extension/1319/gsconnect/)
[^android]: [KDE Connect — Google Play](https://play.google.com/store/apps/details?id=org.kde.kdeconnect_tp&hl=tr)
[^ios]: [KDE Connect — App Store](https://apps.apple.com/us/app/kde-connect/id1580245991)
[^archwiki]: [KDE — ArchWiki](https://wiki.archlinux.org/title/KDE#KDE_Connect)
[^kdeconnect]: [KDE Connect — official project site](https://kdeconnect.kde.org/)

Further reading: [LinuxConfig's GSConnect guide for GNOME](https://linuxconfig.org/how-to-use-gsconnect-for-android-integration-in-gnome) and [It's FOSS's introduction to GSConnect](https://itsfoss.com/gsconnect/).
