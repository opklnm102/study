# [Linux] Check System Information
> date - 2019.06.22  
> keyword - ss, network  
> Linux version 및 CPU 등 시스템 정보 확인하기


<br>

## Linux version
```sh
$ cat /etc/os-release

NAME="Container Linux by CoreOS"
ID=coreos
VERSION=2023.5.0
VERSION_ID=2023.5.0
BUILD_ID=2019-03-09-0138
PRETTY_NAME="Container Linux by CoreOS 2023.5.0 (Rhyolite)"
ANSI_COLOR="38;5;75"
HOME_URL="https://coreos.com/"
BUG_REPORT_URL="https://issues.coreos.com"
COREOS_BOARD="amd64-usr
```


<br>

## Linux kernel version
```sh
$ cat /proc/version

Linux version 4.19.25-coreos (jenkins@ip-10-7-32-103) (gcc version 7.3.0 (Gentoo Hardened 7.3.0-r3 p1.4)) #1 SMP Sat Mar 9 01:05:06 -00 2019
```


<br>

## Kernel bit 수 확인
```sh
$ getconf WORD_BIT

32
```


<br>

## OS Kernel Architecture 확인
```sh
$ uname -m

x86_64
```

<br>

> #### uname - certain system information
> * -a - all information
> * -s - kernel name
> * -n - network node hostname
> * -r - kernel release
> * -v - kernel version
> * -m - machine HW name
> * -p - processor type
> * -i - HW platform
> * -o - OS


<br>

## CPU 정보 확인
```sh
$ cat /proc/cpuinfo

processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model		: 79
model name	: Intel(R) Xeon(R) CPU E5-2686 v4 @ 2.30GHz
stepping	: 1
microcode	: 0xb000037
cpu MHz		: 2300.168
cache size	: 46080 KB
physical id	: 0
siblings	: 4
core id		: 0
cpu cores	: 4
apicid		: 0
initial apicid	: 0
fpu		: yes
fpu_exception	: yes
cpuid level	: 13
wp		: yes
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ht syscall nx pdpe1gb rdtscp lm constant_tsc rep_good nopl xtopology cpuid pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm cpuid_fault invpcid_single pti fsgsbase bmi1 avx2 smep bmi2 erms invpcid xsaveopt
bugs		: cpu_meltdown spectre_v1 spectre_v2 spec_store_bypass l1tf
bogomips	: 4600.14
clflush size	: 64
cache_alignment	: 64
address sizes	: 46 bits physical, 48 bits virtual
power management:

processor	: 1
...
```


<br>

## Memory 정보 확인
```sh
$ cat /proc/meminfo

MemTotal:       16425396 kB
MemFree:         3084896 kB
MemAvailable:   11038552 kB
Buffers:          743548 kB
Cached:          6728528 kB
SwapCached:            0 kB
Active:          6997864 kB
...
```


<br>

## Disk 용량 확인
```sh
$ df -h

Filesystem       Size  Used Avail Use% Mounted on
/dev/xvda9        30G   12G   18G  60% /
/dev/xvda1       127M   97M   30M  77% /boot
```





