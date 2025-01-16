---
title: 'Data Recovery and Disk Repair in Linux: A Comprehensive Guide'
layout: post
comments: true
categories:
- Linux
- Programming
- Bash
- Recovery
- Data
tags:
- linux
- programming
- bash
- recovery
- data
---

In the world of Linux, data recovery and dealing with faulty disks are crucial skills for any system administrator or power user. Disks can fail unexpectedly, leading to data loss, but with the right tools and procedures, it’s often possible to recover lost data and repair the disk. This guide will walk you through some essential practices, including backup strategies, data recovery tools, disk repair commands, and scripts for system maintenance.

1. Proactive Backup Strategies

The best way to handle data loss is to prevent it from happening in the first place. Regular backups are a critical aspect of any system maintenance routine. Here’s a simple bash script that can be used to automate backups of critical directories to an external disk:

```bash
#!/bin/bash

# Backup directories
SOURCE="/home /etc /var/www"
DESTINATION="/mnt/backup/$(date +%Y%m%d)"

# Ensure the backup directory exists
mkdir -p $DESTINATION

# Perform the backup using rsync
rsync -aAXv $SOURCE $DESTINATION

# Log the backup operation
echo "Backup completed on $(date)" >> /var/log/backup.log
```

2. Data Recovery Tools

In case of disk failure or accidental file deletion, several powerful tools are available for Linux to assist in data recovery:

* **TestDisk**: A versatile tool that can recover lost partitions and make non-booting disks bootable again. It's particularly useful for recovering deleted partitions and fixing partition tables.
* **PhotoRec**: Often used alongside TestDisk, PhotoRec specializes in recovering lost files, even from damaged disks. It can recover a wide variety of file types, including documents, photos, and archives.
* **ddrescue**: A tool designed to recover data from failed or failing drives. Unlike a simple dd command, ddrescue intelligently retries and logs the failed sectors, making multiple passes to recover as much data as possible.


To install these tools on a Debian-based system:

```bash
sudo apt-get install testdisk gddrescue
```

**3. Disk Repair Techniques**

When faced with disk corruption or bad sectors, Linux provides several utilities to diagnose and attempt repairs:

**fsck (File System Check):** The go-to command for checking and repairing file system errors on disks. Run the following command (ensure the partition is unmounted):

```bash
sudo umount /dev/sdX1
sudo fsck -y /dev/sdX1
```

**smartctl:** A tool from the smartmontools package, which allows you to monitor the health of your drives. It provides insights into the drive’s SMART data, which can predict imminent failures.

```bash
sudo smartctl -a /dev/sdX
```

**badblocks:** This command checks a disk for bad sectors. It’s useful when you suspect physical damage on the drive. The following command will scan for bad sectors and report them:

```bash
sudo badblocks -v /dev/sdX
```

**4. System Maintenance Scripts**

Regular maintenance can prevent many disk-related issues. The following bash script checks SATA and USB disks for physical defects, skipping other types of disks:

```bash
#!/bin/bash

# Identify SATA and USB disks
DISKS=$(lsblk -d -o NAME,TYPE | grep -E "disk" | awk '{print $1}')

for DISK in $DISKS; do
    # Skip non-SATA/USB disks
    if [[ $(cat /sys/block/$DISK/device/type) -ne 0 ]]; then
        echo "Skipping $DISK (Not a SATA or USB disk)"
        continue
    fi
    
    echo "Checking $DISK for bad blocks"
    sudo badblocks -sv /dev/$DISK > /var/log/badblocks_$DISK.log
done
```

This script scans all SATA and USB disks for bad sectors and logs the results. Regularly running this script as a cron job can help you monitor the health of your disks and take preemptive action before a failure occurs.

**5. Conclusion**

By incorporating these tools and scripts into your regular system maintenance routine, you can significantly reduce the risk of data loss and be well-prepared to recover from disk failures. Regular backups, combined with proactive monitoring and repair, form the backbone of a robust data protection strategy in Linux. Remember, the key to effective data recovery is preparation—always have backups, and be ready with the right tools when disaster strikes.
