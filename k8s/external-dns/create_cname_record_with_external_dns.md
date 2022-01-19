# [k8s] Create CNAME record with external-dns
> date - 2022.01.20  
> keyworkd - kubernetes, dns, external-dns  
> 2020년 초에 진행했던 내용을 기반으로 external-dns에서 CNAME record를 생성하는 법을 정리

<br>

## Background
* Kubernetes Service/Ingress로 생성한 ELB의 DNS name을 external-dns를 사용하여 Route 53에 sync하여 사용 중
* AWS WAF(Web Application Firewall)가 아닌 별도의 WAF solution을 사용하게 됨
* WAF에 ELB의 DNS name을 사용하게 되면 Service/Ingress의 변경으로 인해 ELB의 DNS name이 변경되면 WAF의 설정도 수정되야하는 issue 발생
* 그리하여 기존의 external domain을 CNAME으로 WAF에 연결하고, internal domain을 만들어서 사용하기로 함

<br>

### As-is
#### Route 53
| Name | Type | Value |
|:--|:--|:--|
| test.example.com | A | ALIAS xxxx.ap-xxxx-1.elb.amazonaws.com. |
| test.example.com | TXT | "heritage=external-dns,external-dns/owner=opklnm102,external-dns/resource=service/default/test" |

<br>

### To-be
#### Route 53
| Name | Type | Value |
|:--|:--|:--|
| test.example.com | CNAME | waf.example.com |
| test.internal.example.com | A | ALIAS xxxx.ap-xxxx-1.elb.amazonaws.com. |
| test.internal.example.com | TXT | "heritage=external-dns,external-dns/owner=opklnm102,external-dns/resource=service/default/test" |

#### WAF configuration
| Name  | Value |
|:--|:--|
| test.example.com | test.internal.example.com |


#### Service로 설정할 경우
```yaml
apiVersion: v1
kind: Service
metadata:
  name: test-xn-service
  annotations:
    external-dns.alpha.kubernetes.io/hostname: test.example.com
    external-dns.alpha.kubernetes.io/ttl: '60'
spec:
  type: ExternalName
  externalName: waf.example.com
```

#### Ingress로 설정할 경우

```yml
kind: Ingress
metadata:
  annotations:
    external-dns.alpha.kubernetes.io/hostname: test.example.com
    external-dns.alpha.kubernetes.io/target: waf.example.com
```

<br>

## Troubleshooting

### Issue 1. conflicting RRSet of type CNAME with the same DNS name already exists in zone
* external-dns는 default로 A, TXT record를 생성하는데 CNAME record 생성시 TXT record와 conflict 발생하는 것을 아래와 같이 확인할 수 있다
```
time="2020-02-03T06:58:12Z" level=info msg="Desired change: CREATE cname-test.example.com CNAME"
time="2020-02-03T06:58:12Z" level=info msg="Desired change: CREATE cname-test.example.com TXT"
time="2020-02-03T06:58:12Z" level=error msg="InvalidChangeBatch: [RRSet of type TXT with DNS name cname-test.example.com. is not permitted because a conflicting RRSet of type  CNAME with the same DNS name already exists in zone example.com.]\n\tstatus code: 400, request id: f62fd45e-bdb9-4766-b885-c360c40e0068"
time="2020-02-03T06:58:12Z" level=error msg="Failed to submit all changes for the following zones: [/hostedzone/XXXXXXXXXXX]"
```

<br>

#### Resolve
* [I'm using an ELB with TXT registry but the CNAME record clashes with the TXT record. How to avoid this?](https://github.com/kubernetes-sigs/external-dns/blob/master/docs/faq.md#im-using-an-elb-with-txt-registry-but-the-cname-record-clashes-with-the-txt-record-how-to-avoid-this)에 나와 있듯 `--txt-prefix`을 사용해 TXT record가 `prefix.<CNAME record>`로 생성되도록 한다
```sh
time="2020-02-03T07:06:11Z" level=info msg="Desired change: CREATE cname-test.example.com CNAME"
time="2020-02-03T07:06:11Z" level=info msg="Desired change: CREATE _cname-test.example.com TXT"
time="2020-02-03T07:06:11Z" level=info msg="2 record(s) in zone example.com. were successfully updated"
```

<br>

### Issue 2.
* [external-dns note](https://github.com/kubernetes-sigs/external-dns#note)에 나와있듯 Issue 1에서 `--txt-prefix`를 사용하면 기존에 생성되어 있던 TXT record에 대해 변경사항을 반영해주지 않기 때문에 기존에 생성된 TXT record를 수정해줘야한다

#### Resolve
* A record를 제거하면 새롭게 생성된다 -> 자동이지만 DNS resolve 시간 필요하여 서비스 점검시에나 가능
* API로 txt prefix가 붙은 txt record를 생성해주고, 기존 record를 제거 -> 수동이지만, 언제든 가능


<br><br>

> #### Reference
> * [External DNS always uses ALIAS for AWS ELBs, not CNAME (only A records are created in Route53) #564](https://github.com/kubernetes-sigs/external-dns/issues/564)

