# [pip](https://pip.pypa.io/en/stable/)
```
2017.03.02  
[Django Girls Tutorial](https://tutorial.djangogirls.org/ko/)을 진행하며 pip 사용법이 궁금해서 정리  
```

## pip(pip installs packages)
* python package를 관리하는 패키지 관리자

## pip 설치
* python 2.7.9+, 3.4+에서 디폴트로 설치
```sh
# ubuntu
$ sudo apt-get install python-pip

# centos
$ sudo yum install python-pip
$ sudo yum install python-wheel
```

### pip 업데이트
```sh
# 2017.03.02 - v9.0.1
$ pip install -U pip
```

## pip 사용하기

### 패키지 설치
```sh
# latest version 가장 최근 버전 설치
$ pip install <package>

# specific version 특정 버전 설치
$ pip install <package>==<version>

# minimum version 
$ pip install [package]>=[versuin]

# requirements.txt사용
$ pip install -r requirements.txt
```

> #### requirements.txt사용  
> * 다른 환경에서도 동일한 패키지 설치할 때 유용
> * 패키지를 하나하나 설치하는 것보다, `requirements.txt`를 이용해 패키지 리스트를 관리하는게 더 좋다
> #### requirements.txt를 미리 만들지 못했을 경우
> ```sh
> # freeze로 requirements.txt를 생성
> $ pip freeze > requirements.txt
> ```

### 패키지 업데이트
```sh
$ pip install --upgrade <package>
```

### 패키지 삭제
```sh
$ pip uninstall <package>
```

### 설치한 패키지 리스트를
```sh
$ pip list
```

### 패키지 찾기
```sh
$ pip search "query"
```

> 참고  
[pip Docs](https://pip.pypa.io/en/stable/#)  
[예제로 배우는 Python 프로그래밍](http://pythonstudy.xyz/python/article/503-pip-%ED%8C%A8%ED%82%A4%EC%A7%80-%EA%B4%80%EB%A6%AC%EC%9E%90)