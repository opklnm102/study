# [Git] gitignore
> date - 2018.12.16  
> keyword - git  
> gitignore에 대해 정리  

<br>

## gitignore란?
* remote repository에 필요 없는 파일들 무시할 때 사용
  * log
  * build 결과물
  * secret key
* [gitignore.io](https://www.gitignore.io/)에서 사용하는 환경 등으로 검색해서 쉽게 설정할 수 있다


<br>

### 디렉토리별로 적용된다
* module별로 gitignore를 관리할 수 있다
```
.
├── module1
│   ├── src
│   └── .gitignore  // module1에서 제외할 파일 설정
├── module2
│   ├── src
│   └── .gitignore  // module2에서 제외할 파일 설정
└── .gitignore  // project 공통에서 제외할 파일 설정
```

