---
title: Essential and Lesser-Known Linux/Unix Tools Every Developer Should Know
layout: post
comments: true
categories:
- Linux
- Programming
- Bash
tags:
- linux
- programming
- bash
---

In the world of Linux/Unix, there are a variety of well-known tools and commands, ranging from those that are commonly used to more niche and obscure utilities that can be extremely powerful for advanced users. Here's a brief overview of the most widely used and the lesser-known but intriguing tools, explained from the perspective of a developer.
Widely Known Tools and Their Uses

**1. ls**

Purpose: Lists directory contents.

Example Usage: 

```bash
ls -alh
```

This command lists all files (including hidden files) with human-readable file sizes in a long listing format.

**2. grep**

Purpose: Searches for patterns in files.

Example Usage: 

```bash
grep -r "pattern" /path/to/directory 
```

Recursively searches for "pattern" in all files within the specified directory.

**3. awk**

Purpose: A programming language for text processing.

Example Usage: 

```bash
awk '{print $1}' file.txt
```

Prints the first column from the file.

**4. sed**

Purpose: Stream editor for modifying files.

Example Usage: 

```bash
sed 's/old/new/g' file.txt 
```

Replaces all instances of "old" with "new" in the file.

**5. find**

Purpose: Searches for files and directories.

Example Usage: 

```bash
find /path -name "*.txt" 
```

Finds all .txt files under the specified directory.

**6. tar**

Purpose: Archives files.

Example Usage: 

```bash
tar -czvf archive.tar.gz /path/to/files 
```

Creates a compressed tarball of the specified files.

**7. curl**

Purpose: Transfers data from or to a server using various protocols.

Example Usage: 

```bash
curl -O https://example.com/file.zip 
```

Downloads a file from a URL.

**8. ps**

Purpose: Displays information about running processes.

Example Usage: 

```bash
ps aux | grep my_process 
```

Finds all processes matching "my_process."

**9. chmod**

Purpose: Changes file permissions.

Example Usage: 

```bash
chmod +x script.sh 
```

Adds execute permissions to a script.

**10. top**

Purpose: Displays system resource usage, including CPU and memory.

Example Usage: 

```bash
top 
```

Opens a real-time view of system resource usage.

**Lesser-Known Yet Powerful Tools**

**1. strace**

Purpose: Traces system calls made by a program.

Example Usage:

```bash
strace -p <pid> 
```

Attaches to a process by PID and logs its system calls. This is particularly useful for debugging or investigating process behavior.

**2. htop**

Purpose: An interactive process viewer.

Example Usage: 

```bash
htop
```

A more user-friendly alternative to top with an interactive interface, including CPU and memory usage visualization.

**3. ncdu**

Purpose: Disk usage analyzer with an ncurses interface.

Example Usage: 

```bash
ncdu /path/to/dir 
```

Analyzes disk usage and provides a navigable, interactive interface to view disk space consumption.

**4. tldr**

Purpose: Simplified man pages.

Example Usage: 

```bash
tldr
```

ls Provides a concise, example-based summary of the ls command (useful for quick reference).

**5. lsof**

Purpose: Lists open files and the processes using them.

Example Usage: 

```bash
lsof -i :8080 
```

Lists processes using the network port 8080.

**6. jq**

Purpose: Command-line JSON processor.

Example Usage: 

```bash
cat file.json | jq '.key' 
```

Extracts the value of .key from the JSON file.

**7. inotifywait**

Purpose: Waits for file system events.

Example Usage: 

```bash
inotifywait -m /path/to/dir 
```

Monitors changes in a directory and outputs events such as file modifications or deletions.

**8. asciinema**

Purpose: Records and shares terminal sessions.

Example Usage: 

```bash
asciinema rec 
```

Starts recording a terminal session, which can be shared later online.

**9. zsh**

Purpose: A powerful shell with advanced features.

Example Usage: 

```bash
zsh
```

Launches the zsh shell, which offers superior auto-completion, globbing, and scripting features compared to bash.

**10. fd**

Purpose: A fast alternative to find.

Example Usage: 

```bash
fd "*.txt"
```

A faster, simpler alternative to find that supports fuzzy searching and other advanced features.
The Art of Combining Tools

The power of the Unix philosophy lies in the ability to combine small, simple tools to achieve complex results. For example:

**Searching and modifying files:**

```bash
grep -rl "pattern" /path/to/dir | xargs sed -i 's/old/new/g'
```

**Network monitoring:**

```bash
netstat -tuln | grep ":80"
```

**Disk usage analysis:**

```bash
du -sh * | sort -rh | head -n 10
```

**Conclusion**

Whether you are a novice or an experienced developer, these tools form the backbone of system administration, programming, and debugging in Linux/Unix. While the commonly known tools like grep, ls, and ps are essential, the lesser-known utilities like strace, jq, and inotifywait can offer tremendous value in complex scenarios. Knowing when and how to combine them allows you to accomplish tasks more efficiently and gain deeper insight into system behavior.
