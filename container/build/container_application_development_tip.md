# [Container] Container application development tip
> date - 2022.07.28  
> keyworkd - container, development  
> container기반 application을 개발하기 위한 tip을 정리

<br>

## container image build
* source code repository에 Dockerfile을 함께 관리
  * COPY, ADD로 파일 참조 가능
  * project/module root에 저장
* container image를 만들기 위한 별도의 script를 작성
  * container image 생성을 컴파일, test와 분리
  * 언어, framework에 따라 달라질 수 있는 환경 설정 단계를 개발과 분리하여 전체 프로세스를 자동화하는데 용이하게한다
  * Makefile 추천
* 설정들은 환경변수로 전달  
* container image에 개발에 필요한 dependency를 포함시키지 않는다
  * Node.js의 경우 `npm install --production` 또는 `NODE_ENV=production` 사용
  * multi-stage build 추천


<br>

## Log
* container에서 발생하는 로그는 stdout, stderr로 출력
  * log를 disk에 저장하여 불필요한 disk I/O를 발생시키지 않도록하자
  * container 외부의 log collector가 stdout, stderr을 통해 수집
  * Kubernetes에서는 stdout, stderr로 보내진 log를 관리해준다
* kubectl logs시 container의 host에 설정된 timezone 기반으로 timestamp 출력
  * `kubectl logs —timestamps`


<br>

## Security
### root 시용 X
* root 대신 container 전용 user 사용
```dockerfile
RUN useradd --create-home -s /usr/sbin/nologin -u 1000 app
WORKDIR /home/app
USER app
```
* result
```sh
app:x:1000:1000::/home/app:/usr/sbin/nologin
```
