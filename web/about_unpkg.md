# [Web] About UNPKG
> date - 2018.08.30  
> keyword - unpkg, npm cdn  
> vue.js 소스를 가져오는 unpkg가 어떤건지 궁금해서 정리

<br>

## UNPKG란?
* npm에서 관리되는 package에 대한 CDN(Content Delivery Network)
  * CDN이니깐 당연히 빠르다..!
* 아래 url을 사용하여 모든 패키지의 파일을 빠르게 로드할 수 있다
```
unpkg.com/:package@:version/:file
```
* [UNPKG Stats](https://unpkg.com/#/stats)에서 리전/package/protocol별 CDN 상태 확인 가능

* example
```html
<!-- Vue.js -->
<script src="https://unpkg.com/vue@2.5.16/dist/vue.js"></script>
```

* [semver range](https://docs.npmjs.com/misc/semver)나 [tag](https://docs.npmjs.com/cli/dist-tag)를 생략해 최신 버전 사용
```html
<!-- semver range -->
<script src="https://unpkg.com/vue@^2/dist/vue.js"></script>

<!-- tag 생략 -->
<script src="https://unpkg.com/vue/dist/vue.js"></script>
```

* 자세한 파일 경로를 모를 경우
  * package 이름만 입력하면 package.json의 unpkg 필드에 지정된 파일을 제공하거나 main으로 fall back

```
https://unpkg.com/d3

https://unpkg.com/vue
```

* package의 파일 리스트를 보고 싶으면 URL 끝에 `/`를 붙인다
```
https://unpkg.com/vue/
```


<br>

## unpkg에 등록하려면?
* UMD 빌드를 npm package에 포함하기만 하면되서 npm package 작성자가 코드를 CDN에 publish하는 부담을 덜어준다
  * .gitignore에 umd(or dist) 디렉토리 추가
  * package.json의 파일 배열에 umd 디렉토리 추가
  * npm에 publish시 unpkg에서도 사용할 수 있다


---

<br>

> #### Reference
> * [UNPKG](https://unpkg.com/#/)
