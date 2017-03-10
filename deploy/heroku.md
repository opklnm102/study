# [heroku](https://dashboard.heroku.com/apps)에 배포하기


## [heroku Architecture](https://devcenter.heroku.com/categories/heroku-architecture)


## heroku CLI Install
```sh
# Run this from your terminal.
# The following will add our apt repository and install the CLI:
$ sudo add-apt-repository "deb https://cli-assets.heroku.com/branches/stable/apt ./"
$ curl -L https://cli-assets.heroku.com/apt/release.key | sudo apt-key add -
$ sudo apt-get update
$ sudo apt-get install heroku

# 설치 확인
$ heroki --version 
```

## heroku 시작하기

### 1. 프로젝트 만들기
```sh
$ mkdir heroku-tutorial  # make project
$ git init  # git 초기화
```

### 2. heroku 로그인
```sh
$ heroku login

Enter your Heroku credentials.
Email: opklnm102@gmail.com
Password (typing will be hidden): 
Logged in as opklnm102@gmail.com
```

### 3. heroku 앱 만들기
```sh
$ heroku create <app name>  # heroku 앱 만들기
```

### 4. heroku 앱 정보 확인
```sh
$ heroku info <app name>

=== emocon170310
Addons:        heroku-postgresql:hobby-dev
Dynos:         web: 1
Git URL:       https://git.heroku.com/emocon170310.git
Owner:         opklnm102@gmail.com
Region:        us
Repo Size:     7 KB
Slug Size:     63 MB
Stack:         cedar-14
Web URL:       https://emocon170310.herokuapp.com/
```

### 5. git 연동 확인
```sh
$ git remote  # git 연동 확인

heroku
```

### 6. Deploy
```sh
$ git push heroku master
```

### 7. heroku 앱 확인
```sh
$ heroku open 
```

### 8. 로그 보기
```sh
$ heroku logs --tail
```

## heroku에 원격 명령 실행
* `$ heroku run <command>`
```sh
# heroku DB 초기화
$ heroku run python manage.py migrate
```
