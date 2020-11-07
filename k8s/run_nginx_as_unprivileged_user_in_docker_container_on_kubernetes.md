# [k8s] Run nginx as unprivileged user in Docker container on Kubernetes
> date - 2020.11.08  
> keyworkd - docker, non-root container, nginx  
> Kubernetes에서 non-root(unprivileged) user로 nginx docker container를 생성하는 방법에 대해 정리  

<br>

## Kubernetes에서 nginx:1.17.9-alpine non root로 실행하기
1. `/etc/passwd`에서 nginx uid 확인
```sh
$ cat /etc/passwd

...
nginx:x:101:101:nginx:/var/cache/nginx:/sbin/nologin
```

2. nginx uid로 container 실행하기 위해 `securityContext` 사용
```yaml
apiVersion: apps/v1
kind: Deployment
...
spec:
  template:
    spec:
      securityContext:  # here
        runAsUser: 101
        runAsGroup: 101
        fsGroup: 101
        runAsNonRoot: true
      containers:
        ...
```

<br>

### Issue 1. user directive and /var/cache/nginx/... permission denied
* root user 및 /var/cache/nginx의 filesystem permission 이슈
```sh
2020/11/06 10:00:36 [warn] 1#1: the "user" directive makes sense only if the master process runs with super-user privileges, ignored in /etc/nginx/nginx.conf:1
nginx: [warn] the "user" directive makes sense only if the master process runs with super-user privileges, ignored in /etc/nginx/nginx.conf:1
2020/11/06 10:00:36 [emerg] 1#1: mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)
nginx: [emerg] mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)
```

#### Resolve
* [Running nginx as a non-root user](https://github.com/docker-library/docs/tree/master/nginx#running-nginx-as-a-non-root-user)를 참고하여 nginx configuration을 수정
```nginx
user nginx;  # delete
  http {
    # 추가
    client_body_temp_path /tmp/client_temp;
    proxy_temp_path       /tmp/proxy_temp_path;
    fastcgi_temp_path     /tmp/fastcgi_temp;
    uwsgi_temp_path       /tmp/uwsgi_temp;
    scgi_temp_path        /tmp/scgi_temp;
  }
```

<br>

### Issue 2. 80 port permission denied
* 80 port는 root user permission 필요
```sh
2020/11/07 06:36:09 [emerg] 1#1: bind() to 0.0.0.0:80 failed (13: Permission denied)
nginx: [emerg] bind() to 0.0.0.0:80 failed (13: Permission denied)
```

#### Resolve
* 8080 port를 사용
```nginx
  http {
    server {
      listen 80 default_server;  # 8080으로 수정
    }
  }
```

<br>

### Issue 3. /var/run/nginx.pid permission denied
* `nginx.pid` 파일의 filesystem permission 이슈
```sh
2020/11/07 06:48:09 [emerg] 1#1: open() "/var/run/nginx.pid" failed (13: Permission denied)
nginx: [emerg] open() "/var/run/nginx.pid" failed (13: Permission denied)
```

#### Resolve
* nginx configuration의 `pid directive`를 수정
```nginx
pid /var/run/nginx.pid;  # pid  /tmp/nginx.pid; 로 수정
```

<br>

### Result
* master, worker process는 nginx user로 실행
```sh
$ ps -ef | grep 'nginx'
    1 nginx     0:00 nginx: master process nginx -g daemon off;
    6 nginx     0:00 nginx: worker process
```

* 사용한 Kubernetes manifest 설정
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  template:
    spec:
      securityContext:  # here
        runAsUser: 101
        runAsGroup: 101
        fsGroup: 101
        runAsNonRoot: true
      containers:
      - name: nginx
        image: nginx:1.17.9-alpine
        ports:
        - name: web-port
          containerPort: 8080  # here
        volumeMounts:
          - name: nginx-default-config
            mountPath: /etc/nginx/nginx.conf
            subPath: nginx.conf
            readOnly: true
      volumes:
        - name: nginx-default-config
          configMap:
            name: nginx-default-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-default-config
data:
  nginx.conf: |
    worker_processes  1;

    error_log /dev/stderr warn;
    pid        /tmp/nginx.pid;  # here

    events {
        worker_connections  1024;
    }

    http {
        include       /etc/nginx/mime.types;
        default_type  application/octet-stream;

        # here
        client_body_temp_path /tmp/client_temp;
        proxy_temp_path       /tmp/proxy_temp_path;
        fastcgi_temp_path     /tmp/fastcgi_temp;
        uwsgi_temp_path       /tmp/uwsgi_temp;
        scgi_temp_path        /tmp/scgi_temp;

      server {
        listen 8080 default_server;  # here
        server_name _;

        location = /health {
          access_log off;
          return 200 'alive';
          add_header Content-Type text/plain;
        }
      }
    }
---
apiVersion: v1
kind: Service
metadata:
  name: nginx
  annotations:
    alb.ingress.kubernetes.io/healthcheck-path: /health
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 8080  # here
    protocol: TCP
---
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: nginx-ingress
spec:
  rules:
    - host: nginx.example.com
      http:
        paths:
          - path: /*
            backend:
              serviceName: nginx
              servicePort: 80
```


<br>

## nginxinc/nginx-unprivileged image를 사용
* Official unprivileged Nginx image인 [nginxinc/nginx-unprivileged](https://hub.docker.com/r/nginxinc/nginx-unprivileged)를 사용하면 더 간단하다
* Official Nginx image와의 차이점
  * default Nginx listen port is **8080**
  * default Nginx **user directive removed**
  * default Nginx pid file **/tmp/nginx.pid**
  * Change `*_temp_path` variable to `/tmp/*`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  template:
    spec:
      securityContext:  # here
        runAsUser: 101
        runAsGroup: 101
        fsGroup: 101
        runAsNonRoot: true
      containers:
      - name: nginx
        image: nginxinc/nginx-unprivileged:1.19.4-alpine  # here
        securityContext:  # here
          runAsUser: 101
          runAsGroup: 101
          runAsNonRoot: true
        ports:
        - name: web-port
          containerPort: 8080
        volumeMounts:
          - name: nginx-default-config
            mountPath: /etc/nginx/nginx.conf
            subPath: nginx.conf
            readOnly: true
      volumes:
        - name: nginx-default-config
          configMap:
            name: nginx-default-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-default-config
data:
  nginx.conf: |
    worker_processes  1;

    error_log /dev/stderr warn;
    pid        /tmp/nginx.pid;  # here

    events {
        worker_connections  1024;
    }

    http {
        include       /etc/nginx/mime.types;
        default_type  application/octet-stream;

      server {
        listen 8080 default_server;  # here
        server_name _;

        location = /health {
          access_log off;
          return 200 'alive';
          add_header Content-Type text/plain;
        }
      }
    }
```


<br>

## Conclusion
* docker container는 기본적으로 root user로 실행되므로 **특별한 이유가 없다면
non-root user로 실행하는 unprivileged container로 생성하도록 하자**


<br><br>

> #### Reference
> * [Nginx Official Images - Dockerhub](https://hub.docker.com/_/nginx)
> * [nginxinc/nginx-unprivileged](https://hub.docker.com/r/nginxinc/nginx-unprivileged)
> * [How to run an nginx container as non root?](https://stackoverflow.com/questions/63108119/how-to-run-an-nginx-container-as-non-root)
> * [Running nginx as a non-root user](https://github.com/docker-library/docs/tree/master/nginx#running-nginx-as-a-non-root-user)

<br>

> #### Further reading
> * [Work With Non-Root Containers for Bitnami Applications](https://docs.bitnami.com/tutorials/work-with-non-root-containers/)
> * [Why non-root containers are important for security](https://engineering.bitnami.com/articles/why-non-root-containers-are-important-for-security.html)
> * [Understanding root inside and outside a container](https://www.redhat.com/en/blog/understanding-root-inside-and-outside-container)
