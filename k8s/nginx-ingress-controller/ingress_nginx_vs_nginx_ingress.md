# [k8s] Ingress Nginx Controller vs Nginx Ingress Controller
> date - 2023.09.28  
> keyworkd - Kubernetes, nginx, ingress controller  
> k8s에서 Ingress를 관리하는데 사용하는 ingress-nginx와 nginx-ingress에 대해 정리  
> 둘은 서로 다른 목표와 우선 순위를 기반으로 개발 및 배포 모델이며 다르다  

<br>

## [ingress-nginx](https://kubernetes.github.io/ingress-nginx)
* Ingress Nginx Controller
* Community version
* [Repository](https://github.com/kubernetes/ingress-nginx)
* controller 설정을 위해 ConfigMap, Ingress를 사용


<br>

## [nginx-ingress](https://docs.nginx.com/nginx-ingress-controller/)
* Nginx Ingress Controller
* Nginx version으로 Nginx OSS와 Nginx Plus(commercial) version으로 제공
* [Repository](https://github.com/nginxinc/kubernetes-ingress)
* Nginx를 기반으로 application의 access를 관리
* SSL 인증서, Load balancing, routing rule 등 다양한 Ingress rule을 설정할 수 있다


<br><br>

> #### Reference
> * [A Guide to Choosing an Ingress Controller, Part 4: NGINX Ingress Controller Options](https://www.nginx.com/blog/guide-to-choosing-ingress-controller-part-4-nginx-ingress-controller-options)
> * [kubernetes/ingress-nginx](https://github.com/kubernetes/ingress-nginx)
> * [ingress-nginx Docs](https://kubernetes.github.io/ingress-nginx)
> * [nginxinc/kubernetes-ingress](https://github.com/nginxinc/kubernetes-ingress)
> * [nginx-ingress Docs](https://docs.nginx.com/nginx-ingress-controller)
