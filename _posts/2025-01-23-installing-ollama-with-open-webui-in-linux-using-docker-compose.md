---
title: Installing Ollama with Open WebUI in Linux Using Docker Compose
layout: post
comments: true
toc: true
permalink: "/p/:title/"
categories:
categories:
- AI
- Programming
- OpenWebUI
- Linux
- Docker
- Ollama
tags:
- ai
- programming
- gpu
- cpu
- docker
- olama
- openwebui
- linux
- compose
- docker-compose
- debian
- archlinux
- arch
---

In this guide, we will walk through the installation of Ollama with Open WebUI on both **Debian** and **Arch Linux**. We will use **Docker Compose** instead of Docker to make the process smoother and more efficient.

---

### Arch Linux Setup

**1. Update and Install Dependencies:**

Begin by updating your system and installing the required dependencies. Open your terminal and run the following commands:

```bash
sudo pacman -Syu
sudo pacman -S nvidia-container-toolkit nvidia-utils docker docker-compose
```

**2. Verify NVIDIA Installation:**

Ensure that your NVIDIA drivers and utilities are properly installed:

```bash
nvidia-smi
```

**3. Install Ollama:**

To install Ollama, use the following script from Ollama's official site:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**4. Install Additional Dependencies (Optional):**

You might need additional dependencies, so run:

```bash
sudo pacman -S <package-name>
```

---

### Debian Setup

**1. Update and Install Dependencies:**

Update your system and install the required packages using the following commands:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nvidia-container-toolkit nvidia-utils docker docker-compose
```

**2. Verify NVIDIA Installation:**

Check if your NVIDIA drivers are working correctly by running:

```bash
nvidia-smi
```

**3. Install Ollama:**

Download and install Ollama using the following script:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**4. Install Additional Dependencies (Optional):**

You might need additional packages depending on your setup:

```bash
sudo apt install <package-name>
```

---

### Docker Compose Setup

Now that the dependencies are set up on both Debian and Arch Linux, we will configure Docker Compose for running Open WebUI and Ollama.

Create a `docker-compose.yml` file with the following content:

```yaml
services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:ollama
    container_name: open-webui
    ports:
      - "3000:8080"
    volumes:
      - ./data:/data
      - ollama:/root/.ollama
      - open-webui:/app/backend/data
    runtime: nvidia  # Ensures the container uses the GPU
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Adds a host entry for host.docker.internal
    restart: unless-stopped

  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=86400
    restart: unless-stopped

volumes:
  ollama:
  open-webui:
```

### Explanation of the `docker-compose.yml`:

- **open-webui**: This is the main service running the Open WebUI.
  - It uses the `ghcr.io/open-webui/open-webui:latest` image.
  - The port `3000` on the host is mapped to `8080` inside the container, making the web UI accessible.
  - Volumes are mounted to persist data and configuration across container restarts.
  - The `NVIDIA_VISIBLE_DEVICES` environment variable ensures the container has access to the GPU.
  
- **watchtower**: This service will monitor the Docker containers and automatically update them when a new version of the image is available.
  - The `WATCHTOWER_CLEANUP` variable ensures old images are cleaned up.
  - The `WATCHTOWER_POLL_INTERVAL` defines how often Watchtower checks for updates (86400 seconds = 1 day).

- **Volumes**: Data for Ollama and Open WebUI is persisted using Docker volumes `ollama` and `open-webui`.

### Running the Docker Compose Setup

Once you've created the `docker-compose.yml` file, navigate to its directory and run:

```bash
docker-compose up -d
```

This will start both the Open WebUI and Watchtower services in detached mode.

---

### Conclusion

By following these steps, you will have successfully installed Ollama with Open WebUI in a Docker Compose setup on both **Arch Linux** and **Debian**. This setup ensures your services are up-to-date and ready to be used for AI-based tasks with GPU support via NVIDIA.
