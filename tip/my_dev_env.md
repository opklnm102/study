# [Tip] 개발 환경 구축
> date - 2018.09.30  
> keyword - development environment  
> 현재 사용하는 개발 관련 도구들을 정리  

<br>

## Chrome 확장 프로그램
* [JSON Formatter](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa)
  * Chrome에서 JSON을 볼 때 읽기 쉽게 구조화해서 출력
* [Octotree](https://chrome.google.com/webstore/detail/octotree/bkhaagjahfmjljalopjnoealnfndnagc)
  * GitHub Repository의 파일들을 트리구조로 보여주어 소스 코드 리뷰시 편하다
* [TabCloud](https://chrome.google.com/webstore/detail/tabcloud/npecfdijgoblfcgagoijgmgejmcpnhof)
  * Save and restore window sessions over time and across multiple computers
  * 현재 사용하고 있는 tab을 cloud에 저장해 여러 컴퓨터에서 공유할 때 유용
* [OneTab](https://chrome.google.com/webstore/detail/onetab/chphlpgkkbolifaimnlloiipkdnihall)
  * tab 내용을 local 저장할 때 사용
  * Chrome 캐시 제거시 저장된 tab이 삭제된다
* [ZenHub for GitHub](https://chrome.google.com/webstore/detail/zenhub-for-github/ogcgkffhplmphkaahpmffcafajaocjbd)
  * ZenHub – Project Management Inside GitHub
  * Github에서 ZenHub를 사용할 수 있게 해준다
* [ModHeader](https://chrome.google.com/webstore/detail/modheader/idgpnmonknjnojddfkpgkljpfnnfcklj)
  * Modify request and response headers
  * Chrome에서 http request, response시 header에 원하는 값을 넣을 수 있다
* [Send Anywhere (For Gmail/Slack)](https://chrome.google.com/webstore/detail/send-anywhere-for-gmailsl/amjmjholfoknokffkiolahocokcaecnc)
* [Evernote Web Clipper](https://chrome.google.com/webstore/detail/evernote-web-clipper/pioclpoplcdbaefihamjohnefbikjilc)
  * 웹 컨텐츠를 evernote로 스크랩하기 위해 사용

<br>

## 유용한 Web Service
* [JSON Formatter & Validator](https://jsonformatter.curiousconcept.com/)
  * JSON 구조에 맞춰서 정렬해준다
* [JSON Pretty Print](http://jsonprettyprint.com/)
  * JSON 구조에 맞춰서 정렬해준다
* [World Clock & Time Converter](https://www.worldtimebuddy.com/)
  * 여러 timezone의 시간 비교시 유용
* [Epoch Unix Time Stamp Converter](https://www.unixtimestamp.com/)
  * 현재 시간을 unix timestamp로 변환할 때 유용

<br>

## dev tool

### [brew](https://brew.sh/)
* macOS 사용자를 위한 package manager
* Command Line Tools for Xcode, Homebrew-Cask도 자동 설치

### [iTerm2](https://www.iterm2.com/downloads.html)
* 홈페이지에서 설치

### zsh
```sh
$ brew install zsh
```

### [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)
* 매뉴얼따라 설치

### tree
```sh
$ brew install tree
```

#### Usage
```
.
├── Apps
├── CONTRIBUTING.md
├── Docker
│   └── README.md
├── Git
│   ├── README.md
│   └── gitignore.md
└── Go
    └── README.md
```

```sh
$ tree -L 1

.
├── Apps
├── CONTRIBUTING.md
├── Cpp
├── Docker
├── Git
└── Go

5 directories, 1 files
```


### Docker
```sh
$ brew cask install docker
```
* Application의 Docker App 실행
  * 상단바에 docker가 실행된다

### Docker compose
```sh
$ brew install docker-compose
```

### [Source Tree](https://www.sourcetreeapp.com/)



> #### Reference
> * [macOS Setup Guide](https://sourabhbajaj.com/mac-setup/)
