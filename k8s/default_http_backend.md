# [k8s] About default http backend
> date - 2019.04.27  
> keyword - kubernetes, k8s, ingress  
> kubernetes의 ingress 사용시 필요한 default backend에 대한 내용 정리


<br>

## Default Backend란?
* ingress rule에 일치하지 않은 traffic을 받아 http status 404로 응답해주는 역할
* ingress controller의 옵션 컴포넌트
  * ingress controller는 rule에 맞지 않는 traffic을 default backend로 라우팅
  * 기본적으로 ingress controller는 default backend가 필요하지만 [aws-alb-ingress-controller](https://github.com/kubernetes-sigs/aws-alb-ingress-controller)는 필요 없다
* health check를 위한 `/healthz` endpoint 제공


<br>

### Source Code
* [404-server/server.go](https://github.com/kubernetes/ingress-gce/blob/master/cmd/404-server/server.go)를 보면 Source Code는 정말 간단하게 구현되어 있음을 확인할 수 있다
```go
package main

func main() {
    port := flag.Int("port", 8080, "Port number to serve default backend 404 page.")
    timeout := flag.Duration("timeout", 5*time.Second, "Time in seconds to wait before forcefully terminating the server.")

    flag.Parse()

    notFound := newHTTPServer(fmt.Springf(":%d", *port), notFound())

    // start the main http server
    go func() {
        err := notFound.ListenAndServe()
        if err != http.ErrServerClosed {
            fmt.Fprintf(os.Stderr, "cloud not start http server: %s\n", err)
            os.Exit(1)
        }
    }()

    waitShutdown(notFound, *timeout)
}

type server struct {
    mux *http.ServeMux
}

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    s.mux.ServeHTTP(w, r)
}

func newHTTPServer(addr string, handler http.Handler) *http.Server {
    return &http.Server{
		Addr:              addr,
		Handler:           handler,
		ReadTimeout:       10 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       10 * time.Second,
    }
}

func notFound(options ...func(*server)) *server {
    s := &server{mux: http.NewServeMux()}

    s.mux.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        fmt.Fprint(w, "ok")
    })
    s.mux.HandleFunc("/", func(w http.ResponseWriter,r *http.Request) {
        w.WriteHeader(http.StatusNotFound)
        fmt.Fprint(w, "default backend - 404")
    })
    return s
}

func waitShutdown(s *http.Server, timeout time.Duration) {
    stop := make(chan os.Signal, 1)
    signal.Notify(stop, os.Interrupt, syscal.SIGTERM)
    <-stop

    fmt.Fprintf(os.Stdout, "stopping http server...\n")
    ctx, cancel := context.WithTimeout(context.Background(), timeout)
    defer cancel()

    if err := s.Shutdown(ctx); err != nil {
        fmt.Fprintf(os.Stderr, "could not gracefully shutdown http server: %s\n", err)
    }
}
```


<br>

### Test
```sh
$ docker pull k8s.gcr.io/defaultbackend-amd64:1.5
...

$ docker run -p 12000:8080 k8s.gcr.io/defaultbackend-amd64:1.5
...

$ curl -v 127.0.0.1:12000/
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 12000 (#0)
> GET / HTTP/1.1
> Host: 127.0.0.1:12000
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 404 Not Found
< Date: Sat, 27 Apr 2019 06:49:57 GMT
< Content-Length: 21
< Content-Type: text/plain; charset=utf-8
<
* Connection #0 to host 127.0.0.1 left intact
default backend - 404

$ curl -v 127.0.0.1:12000/healthz
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 12000 (#0)
> GET /healthz HTTP/1.1
> Host: 127.0.0.1:12000
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Date: Sat, 27 Apr 2019 06:50:02 GMT
< Content-Length: 2
< Content-Type: text/plain; charset=utf-8
<
* Connection #0 to host 127.0.0.1 left intact
ok
```


<br>

## Usage
* Kubernetes에 Deployment로 띄우기
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: l7-default-backend
  namespace: kube-system
  labels:
    k8s-app: glbc
spec:
  replicas: 1
  selector:
    matchLabels:
      k8s-app: glbc
  template:
    metadata:
      k8s-app: glbc
    spec:
      containers:
      - name: default-http-backend
        image: k8s.gcr.io/defaultbackend-amd64:1.5
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 30
          timeoutSeconds: 5
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 10m
            memory: 20Mi
          limits:
            cpu: 10m
            memory: 20Mi
---
apiVersion: v1
kind: Service
metadata:
  name: default-http-backend
  namespace: kube-system
  labels:
    k8s-app: glbc
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    k8s-app: glbc
```

<br><br>

> #### Reference
> * [ingress default backend - k8s docs](https://kubernetes.io/docs/concepts/services-networking/ingress/#default-backend)
> * [kubernetes/ingress-gce - Github](https://github.com/kubernetes/ingress-gce/tree/master/cmd/404-server)
> * [gcr.io/google_containers/defaultbackend](gcr.io/google_containers/defaultbackend)
