# [Git] git credentials
> date - 2024.02.03  
> keyword - git, credentials  
> git credentials에 관련된 내용 정리  

<br>

## push/pull 등 사용시 매번 인증하지 않기
* credential.helper를 설정하여 인증 절차를 생략시킨다
* 기본적으로는 인증 정보(password 등)를 저장하지 않아 인증 필요시 매번 인증 정보가 필요하다

<br>

### credential cache에 저장
* 임시로 일정 시간(default. 15분) 동안 memory에 인증 정보를 저장
```sh
## default
$ git config credential.helper cache

## 1시간으로 설정
$ git config credential.helper 'cache --timeout=3600'
```

* `--global`을 사용하면 모든 git directory에 적용
```sh
$ git config credential.helper cache --global
```

* `${HOME}/.gitconfig` 사용시에도 모든 git directory에 적용
```sh
[credential]
	helper = cache
```

<br>

### credential store에 저장
* 인증 정보를 disk(${HOME}/.git-credentials)에 txt 파일로 저장하여 반영구적으로 인증 정보를 유지
* 인증 정보가 변경되면 수정이 필요하며 plain text로 저장되므로 주의가 필요하다
```sh
$ git config credential.helper store
```

* `${HOME}/.git-credentials` 확인
```sh
https://<id>:<password or personal access token>@github.com

## example - personal access token
https//jason:ghp_skfjskjdfksdljfi23fd@github.com
```


<br>

## 인증

### Git Credential Manager(GCM)로 Github 인증
* [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager)가 MFA 등을 포함한 인증을 관리해준다

```sh
$ brew install git
$ brew install --cask git-credential-manager
```

* 매번 번거로운 인증을 안하기 위해 Git Credential Manager를 credential.helper로 사용
```sh
## credential.helper config 제거
$ git config --unset-all credential.helper
$ git config credential.helper manager-core

## 기존 설정에 새 값을 추가하고 싶다면
$ git config --add credential.helper manager-core
```

* GCM 인증 정보 제거
```sh
$ git credential reject
```


<br>

### [GitHub CLI](https://cli.github.com)로 인증
```sh
$ brew install gh

$ gh auth login
```


<br>

### Personal Access Token(PAT) 사용
* PAT 생성
```
GitHub > setting > developer settings > personal access token(classic) > generate new token
```
* PAT는 생성시에만 알 수 있으므로 생성된 token을 잘 복사해 놓고, 이후 인증시 password 대신 사용


<br><br>

> #### Reference
> * [git-credential-cache](https://git-scm.com/docs/git-credential-cache)
> * [Git 도구 - Credential 저장소](https://git-scm.com/book/ko/v2/Git-%EB%8F%84%EA%B5%AC-Credential-%EC%A0%80%EC%9E%A5%EC%86%8C)
> * [Caching your GitHub credentials in Git](https://docs.github.com/en/get-started/getting-started-with-git/caching-your-github-credentials-in-git)
> * [git-ecosystem/git-credential-manager](https://github.com/git-ecosystem/git-credential-manager)
