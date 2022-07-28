# [AWS] ALB rewrite path
> date - 2022.07.28  
> keyworkd - aws, elb, rewrite  
> /foo가 오면 /foo를 제거하고, foo 서비스로 트레픽을 라우팅하는 URL Rewrite가 필요한 경우 AWS ALB로만으로는 방법이 없어서 가능한 방법들을 정리  

<br>

## 1. ALB의 backend로 Nginx 같은 별도의 proxy server 사용
```
www.example.com -> ALB -> Nginx -> EC2
```
* Nginx로 rewrite를 구현

```sh
location /foo {
    rewrite ^/foo(.*)$ $1 break;
    proxy_pass http://foo-app;
}
```


<br>

## 2. Lambda@Edge를 사용
```
www.example.com -> CloudFront -> Lambda@Edge -> ALB -> EC2
```
* 1번의 방법과는 flow가 다르나 Lambda@Edge에서 rewrite를 구현

```js
'use strict';
exports.handler = (event, context, callback) => {
    var request = event.Records[0].cf.request;
    var olduri = request.uri;
    request.uri = olduri.replace(/^/foo(.*)$/, '$1');
    
    return callback(null, request);
};
```

<br><br>

> #### Reference
> * [AWS ELB rewrite path and alter the path in between](https://stackoverflow.com/questions/53157427/aws-elb-rewrite-path-and-alter-the-path-in-between)
> * [Module ngx_http_rewrite_module](http://nginx.org/en/docs/http/ngx_http_rewrite_module.html)
> * [Implementing Default Directory Indexes in Amazon S3-backed Amazon CloudFront Origins Using Lambda@Edge](https://aws.amazon.com/ko/blogs/networking-and-content-delivery/implementing-default-directory-indexes-in-amazon-s3-backed-amazon-cloudfront-origins-using-lambdaedge/)
