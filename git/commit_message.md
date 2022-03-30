# [Git] How to write a git commit message
> date - 2022.03.27  
> keyword - git, commit message  
> commit message를 어떻게 작성하면 좋을까에 대해 정리

<br>

## Format of the commit message
```
<type> (<scope>): <subject>

<body>

<footer>
```

* example
```
fix(middleware): ensure Range headers adhere more closely to RFC

Add one new dependency, use `range-parser` (Express dependency) to compute range. It is more well-tested in the wild

Fixes #2310
```


<br>

## type
| Type | Description |
|:--|:--|
| feat | 사용자를 위한 새로운 기능 추가 |
| fix | 사용자를 위한 bug fix |
| docs | 문서화 관련 변경 |
| style | product code 변경이 없는 formatting 수정(누락된 세미콜론 추가 등) |
| refactor | product code refactoring <br>변수명 변경, package 구조 변경 등 |
| test | product code 변경 없이 누락된 테스트 추가 |
| chore | product code 변경 없이 기타 등등 작업 |
| ci | Affects CI(e.g. GitHub actions) |
| dep | Dependency update |


<br>

## scope
해당 변경이 project 전체에 영향을 미친다면 **생략 가능**
* init
* runner
* watcher
* config
* web-server



<br>

## message body
* 명령형, 현재형 사용
* 변경 이유와 기대 효과 기술


<br>

## message footer
* issue close시
  * Closes #201
  * Closes #201, #545, #923


<br>

## commit message
```
[#<issue number>][behavior(upper case)] message

## example
[#16][FIX] 개발 규칙 오타 수정
```

* 현재 시제 사용(e.g. Add feature not Added feature)
* 첫줄은 72문자 이하로 제한
* 첫줄 이후 자유롭게 기술

<br>

> #### commit message에 issue number를 붙이는 이유?
> 어떤 commit이 해당 issue로 인해 진행되고 있음을 tracking하기 위해서


<br>

## 추천 동사(personal)
| Type | Description |
|:--|:--|
| Add | 새로운 기능 또는 api 추가<br>e.g. Add API creating PDF |
| Remove | 제거<br>e.g. Remove unused local variables |
| Enhance | 기능 또는 성능의 향상<br>e.g. Enhance performance in select queries |
| Fix | 버그, 오타, 스타일의 수정<br>e.g. Fix typos in Javadoc, Fix styles for standards of Naver Corp |
| Upgrade | 라이브러리 버전 업그레이드<br>e.g. Uprade commons-dbcp to 2.3.1 |
| Document | 문서화 |
| Refactor | 리팩토링|
| Update | 다른 주변 상황에 맞추어서 갱신<br>e.g. Update README.md for 1.0 release |
| Polish | 잡다한 수정 묶음 (다른 적절한 문구가 없을 경우 사용) |


<br><br>

> #### Reference
> * [Git Commit Msg - Karma](http://karma-runner.github.io/2.0/dev/git-commit-msg.html)
> * [How to Write a Git Commit Message](https://item4.github.io/2016-11-01/How-to-Write-a-Git-Commit-Message/)
> * [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
