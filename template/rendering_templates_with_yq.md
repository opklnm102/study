# [Template] Rendering templates with yq
> date - 2022.07.14  
> keyworkd - template, yaml, yq  
> yq로 template redering하는 방법 정리


## yq란?
* JSON 조작시 사용하는 CLI tool에는 [jq](https://stedolan.github.io/jq)가 있고, yaml에는 [yq](https://mikefarah.gitbook.io/yq)가 있다


<br>

## Install
* MacOS
```sh
$ brew install yq
```

* Docker
```sh
$ docker run --rm -v $(pwd):/workdir mikefarah/yq [command] [flags] [expression] FILE...
```

* bash function 사용
```sh
yq() {
  docker run --rm -i -v "${PWD}":/workdir mikefarah/yq "$@"
}
```


<br>

## Usage
### data 추출
```yaml
# template.yaml
a:
  b: hello world
```

```sh
## e - default command
$ yq '.a.b' template.yaml  # == yq e '.a.b' template.yaml
hello world
```

<br>

### stdin
* stdin을 사용하기 위해 `-` 사용
```sh
$ cat template.yaml | yq '.a.b' -
hello world
```

<br>

### Kubernetes Deployment image 찾기
* template.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

```sh
$ yq '.spec.template.spec.containers[0].image' template.yaml

$ cat template.yaml | yq '.spec.template.spec.containers[0].image' -

## result
nginx:1.14.2
```

<br>

### image tag replace
* `--inplace(-i)` 사용해 template.yaml의 image tag replace
```sh
$ yq -i '.spec.template.spec.containers[0].image = "nginx:1.14.3"' template.yaml
```

<br><br>

> #### Reference
> * [yq](https://mikefarah.gitbook.io/yq/)
> * [mikefarah/yq - GitHub](https://github.com/mikefarah/yq)
