# [Linux] Solving the cannot execute binary file: Exec format error
> date - 2023.06.10  
> keyworkd - linux, exec format  
> 64bit os에서 32bit binary 실행시 발생한 에러 해결 방법 정리  

<br>

## Requirement

### Dependency
* [eclipse-temurin:17-jdk](https://hub.docker.com/_/eclipse-temurin)


<br>

## Issue
* container 내부에서 binary 실행시 에러 발생
```sh
$ ./binary
./binary: cannot execute binary file: Exec format error

## 위와 비슷한 에러
./binary: No such file or directory
ERROR: /lib/ld-linux.so.2: bad ELF interpreter: No such file or directory
```

<br>

## Why?
* [eclipse-temurin:17-jdk](https://hub.docker.com/_/eclipse-temurin)은 Ubuntu 22.04.2 LTS (Jammy Jellyfish)를 base image로 사용
* architecture와 binary를 살펴봤을 때 x86_64에서 32bit로 만들어진 binary를 실행할 수 없기 때문에 발생한 에러

### architecture 확인
```sh
$ dpkg --print-architecture
amd64
```
* 아래 명령어 중 하나로 bit 확인
```sh
$ getconf LONG_BIT
64

$ uname -m 
x86_64
```

<br>

### binary 정보 확인
* `readelf` 이용
```sh
$ readelf -a <binary> | grep ELF
ELF Header:
  Class:                             ELF32

$ readelf -a <binary> | grep NEEDED
 0x00000001 (NEEDED)                     Shared library: [libc.so.6]
```

* `file` 이용
```sh
$ file <binary>
<binary>: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.2.5, not stripped

## file이 없다면 설치
$ apt update && apt install -y file
```

* `objdump` 이용
```sh
$ objdump -p ./<binary>

./<binary>:     file format elf32-i386

Program Header:
    PHDR off    0x00000034 vaddr 0x08048034 paddr 0x08048034 align 2**2
         filesz 0x000000e0 memsz 0x000000e0 flags r-x
  INTERP off    0x00000114 vaddr 0x08048114 paddr 0x08048114 align 2**0
         filesz 0x00000013 memsz 0x00000013 flags r--
    LOAD off    0x00000000 vaddr 0x08048000 paddr 0x08048000 align 2**12
         filesz 0x00038424 memsz 0x00038424 flags r-x
    LOAD off    0x00038440 vaddr 0x08081440 paddr 0x08081440 align 2**12
         filesz 0x00007924 memsz 0x0000818c flags rw-
 DYNAMIC off    0x0003faa8 vaddr 0x08088aa8 paddr 0x08088aa8 align 2**2
         filesz 0x000000c8 memsz 0x000000c8 flags rw-
    NOTE off    0x00000128 vaddr 0x08048128 paddr 0x08048128 align 2**2
         filesz 0x00000020 memsz 0x00000020 flags r--
   STACK off    0x00000000 vaddr 0x00000000 paddr 0x00000000 align 2**2
         filesz 0x00000000 memsz 0x00000000 flags rwx

Dynamic Section:
  NEEDED               libc.so.6
  INIT                 0x0804960c
  FINI                 0x080797ac
  HASH                 0x08048148
  STRTAB               0x08048bf8
  SYMTAB               0x080484a8
  STRSZ                0x00000529
  SYMENT               0x00000010
  DEBUG                0x00000000
  PLTGOT               0x08088b80
  PLTRELSZ             0x00000248
  PLTREL               0x00000011
  JMPREL               0x080493c4
  REL                  0x0804925c
  RELSZ                0x00000168
  RELENT               0x00000008
  VERNEED              0x0804920c
  VERNEEDNUM           0x00000001
  VERSYM               0x08049122

Version References:
  required from libc.so.6:
    0x0d696913 0x00 05 GLIBC_2.3
    0x09691f72 0x00 04 GLIBC_2.1.2
    0x0d696911 0x00 03 GLIBC_2.1
    0x0d696910 0x00 02 GLIBC_2.0
```


<br>

## Resolve

### 1. architecture에 맞는 binary로 변경한다
* 64bit binary가 있으면 별도의 설정 없이 제일 쉽게 해결할 수 있는 방법
```sh
$ file <binary>
<binary>: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.4.0, not stripped
```


### 2. 32bit binary를 실행할 수 있는 환경 설정
* 64bit binary가 없다면 32bit를 실행할 수 있는 library들을 설치해준다
```sh
$ dpkg --add-architecture i386

$ dpkg --print-foreign-architectures
i386

$ apt update && apt install -y libc6-i386
```
* 설치 확인
```sh
$ apt list --installed | grep libc6-i386

$ apt policy libc6-i386
libc6:i386:
  Installed: 2.35-0ubuntu3.1  # here
  Candidate: 2.35-0ubuntu3.1
  Version table:
 *** 2.35-0ubuntu3.1 500
        500 http://archive.ubuntu.com/ubuntu jammy-updates/main i386 Packages
        100 /var/lib/dpkg/status
     2.35-0ubuntu3 500
        500 http://archive.ubuntu.com/ubuntu jammy/main i386 Packages
```



<br>

### x86_64? i386?
| CPU | Description |
| i386(Intel 80386) | Intel에서 개발한 32bit x86 CPU |
| x86_64(amd64) | AMD에서 개발한 64bit x86 CPU<br>에뮬레이션 없이 Intel의 x86 지원 |


<br>

## Conclusion

* springfox의 최신 버전은 2020-07-14에 릴리즈된 3.0.0으로 관리가 되지 않는 프로젝트로 보여 장기적인 관점에서 springdoc로 변경하는게 더 나아보인다


<br><br>

> #### Reference
> * [Solving the “bad ELF interpreter” Error](https://www.baeldung.com/linux/bad-elf-interpreter)
> * [bash: file: command not found. How to install file](https://www.cyberciti.biz/faq/bash-file-command-not-found-how-to-install-file/)
