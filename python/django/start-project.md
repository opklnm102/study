# Django startproject

## Project 만들기
```sh
$ django-admin startproject <project name> <location>

# example. mysite project make current directory
$ dango-admin startproject mysite .
```

### 생성된 프로젝트 구조
```
mysite/
   ├── manage.py
   └── mysite
       ├── __init__.py
       ├── settings.py
       ├── urls.py
       └── wsgi.py
```
* 상위 mysite
   * 프로젝트 관련 디렉토리
   * 파일을 모으는 역할
   * 특별한 의미를 가지고 있지 않기 때문에 이름을 변경해도 상관없음
   * 보통 `settings.py`의 `BASE_DIR`로 지정
* manage.py
   * `django의 명령어 처리`역할
   * 사이트 관리를 도와준다
   * 다른 설치 작업 없이, 웹 서버 시작 가능
* 하위 mysite
   * 프로젝트의 `실제 python package`
* __init__.py
   * python package로 인식시키는 역할
* settings.py - 프로젝트 설정 파일
* urls.py - `urlresolver`가 사용하는 패턴 목록을 포함하는 파일
* wsgi.py - 웹 서버를 `WSGI 규격`으로 연동하기 위한 파일

> #### ubuntu에서 tree 디렉토리 구조 출력하기
> ```sh
> $ apt-get install tree
> $ tree -a -L 2
> ```

### 설정 변경
#### TimeZone 수정
```python
# mysite/settings.py

# before
TIME_ZONE = 'UTC'

# after
TIME_ZONE = 'Asia/Seoul'
```

#### 정적파일 경로 추가
```python 
# mysite/settings.py
# 파일 끝에 추가
STATIC_URL = '/static'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
```

### DB 설정
* `mysite/settings.py`에 이미 설정 존재
```python 
# mysite/settings.py

# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
```
* DB 생성
```sh
$ python manage.py migrate
```
```
# before
mysite/
   ├── db.sqlite3  # 생성됨
   ├── manage.py
   └── mysite
       ├── __init__.py
       ├── settings.py
       ├── urls.py
       └── wsgi.py
```

### The development server
```sh
# 127.0.0.1:8000
$ python manage.py runserver

# port 지정
$ python manage.py runserver 8000

# ip, port 지정
$ python manage.py runserver 0.0.0.0:8000

> runserver의 자동변경 기능  
개발 서버는 요청이 들어올 때마다 자동으로 python코드를 다시 불러온다  
코드 변경사항을 적용하기위해 서버를 재시작할 필요 없다  
그러나 파일 추가 등의 일부 동작은 자동으로 인식하지 못하므로 재시작해야 한다


> 참고
[Django Girls Tutorial](https://tutorial.djangogirls.org/ko/django_start_project/#)  
[Django docs - en](https://docs.djangoproject.com/en/1.10/)
[Django docs - ko](http://django-document-korean.readthedocs.io/ko/master/#)