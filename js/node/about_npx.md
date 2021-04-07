# [Node.js] About npx
> date - 2021.04.08  
> keyworkd - node.js, npm, npx  
> node에서 `npx create-react-app test-app`같은 명령어 실행시 사용하는 npx에 대해 정리  

<br>

## NPX란?
* [npm(node package module)의 v5.2.0](https://github.com/npm/npm/releases/tag/v5.2.0)에 추가
* node package를 실행하는 tool로 CLI tool 및 기타 실행 파일 등을 쉽게 사용할 수 있다
* PATH 설정 등 npm과 관련된 추가 설정들을 제거하여 단순화

<br>

### 동작
1. 실행할 package가 실행 가능한 경로에 있는지 확인(e.g. project repository)
2. 있다면 실행
3. 없다면 최신 package 설치 후 실행 후 package 제거


<br>

## Use case

### local로 설치된 tool을 npm run script 없이 사용할 때
* npm은 grunt 등의 설치 도구를 global이 아닌 project별로 설치하도록 발전했고, 사용하기 위해서는 package.json의 `scripts`에 작성해야 하는 번거로움이 존재
* `alias npmx=PATH=$(npm bin):$PATH`를 설정하거나
* 아래처럼 full path로 실행하거나
```sh
$ ./node_modules/.bin/sample-package
```

* `scripts`에 추가 후 실행
```json
// package.json
{
  "scripts": {
    "sample-package": "./node_modules/.bin/sample-package"
  }
}

// run
$ npm run sample-package
```

* 위의 과정들 없이 `npx`로 간단히 실행 가능
```sh
$ npx sample-package
```
* [shell-auto-fallback](https://www.npmjs.com/package/npx#shell-auto-fallback)를 사용하면 더 편하게 가능

<br>

### 자주 사용하지 않는 커맨드 사용시
* `create-react-app` 같이 자주 사용하지 않는 것들을 `npx`를 사용하면 실행시 최신 버전으로 설치 후 제거되기 때문에 최신 버전 사용을 위해 신경쓸 필요가 없고, local storage 관리에 효율적
* `npm install -g [package name]`로 설치되는 global module과 격리되어 versioning 이슈에 자유로워진다

```sh
$ npx npm-check
...

$ npx -p cowsay -- cowsay "hello"  # or npx cowsay "hello" 
npx: installed 10 in 1.058s
 _______
< hello >
 -------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||

```

<br>

### 다른 버전의 node.js로 명령 실행
* `nvm` 없이 `node` package를 사용해 다양한 버전의 node.js에서 실행 가능
```sh
$ npx node@12 -v
v12.21.0

npx -p node@14 -- node -v
v14.16.0
```

<br>

### gist에 기반한 script 실행
* GitHub gist로 공유된 script를 실행할 수 있다
```sh
$ npx https://gist.github.com/zkat/4bc19503fe9e9309e2bfaa2c58074d32  # zkat/index.js
npx: installed 1 in 3.884s
yay gist
```


<br><br>

> #### Reference
> * [Yes, it’s npx, not npm — the difference explained](https://medium.com/javascript-in-plain-english/yes-its-npx-not-npm-the-difference-explained-58cbb202ec33)
> * [npm(node package module)의 v5.2.0](https://github.com/npm/npm/releases/tag/v5.2.0)
> * [shell-auto-fallback](https://www.npmjs.com/package/npx#shell-auto-fallback)
