# [Template] Rendering templates with mo
> date - 2022.07.14  
> keyworkd - template, mustache  
> mo를 이용해 bash에서 mustache로 template rendering하는 방법을 정리

<br>

## Install
* [Dockerfile](https://github.com/tests-always-included/mo/blob/master/Dockerfile)으로 container image 생성하여 사용


<br>

## Usage
### file로 template, key-value 전달
* values.conf
```
NAME=opklnm102
```

* template.mo
```yaml
data:
  nginx.conf: |
    user {{NAME}}
```

```sh
$ docker run --rm -it -v $(pwd):/opt --env-file ./values.conf opklnm102/mo template.mo > result.yaml
```

* result
```yaml
data:
  nginx.conf: |
    user opklnm102
    worker_processes 10;
```

```sh
$ docker run --rm -it -v $(pwd):/opt -e NAME=opklnm102 opklnm102/mo template.mo > result.yaml
```

<br>

### stdin으로 template 전달, 환경 변수로 key-value 전달
```sh
$ NAME=opklnm102
$ echo "Hello {{NAME}}" | docker run --rm -i -v $(pwd):/opt -e NAME=${NAME} opklnm102/mo
```

<br>

### key 없을 때 template
```
{{^KEY}} empty key {{/KEY}}
```

<br>

### key가 있을 떄 template
```
{{#KEY}} exist key {{/KEY}}
```


<br><br>

> #### Reference
> * [tests-always-included/mo](https://github.com/tests-always-included/mo)
> * [mustache - Logic-less templates](https://mustache.github.io)
