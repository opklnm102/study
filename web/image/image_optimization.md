# [Image] Image Optimization in Web
> date - 2022.05.30  
> keyworkd - image, optimization, webp  
> image optimization에 대해 정리

<br>

## image optimization?
* image optimization = greatest-quality + smallest-possible size
* **가능한 가장 작은 사이즈로 좋은 품질을 유지**하는 과정
  * format, size, resolution

<br>

### image optimization의 이점
* Improved user experience
  * loading 시간을 줄여 더 나은 user experience 제공
* Better page performance
  * unoptimized image는 page load를 지연시키는 원인으로 optimization을 통해 page load performance 향상
* Enhanced visibility
  * SEO에 이점


<br>

## Best practices
* `<img>` tag 사용
* `Webp` 같은 next-gen format 사용
* `alt` text 사용
* `srcset`로 반응형 이미지 사용
* `sizes`로 resolution-switching 지원
* 가로세로 비율 유지
* 중요 이미지에 `fetchpriority` 사용
* lazy loading과 async decoding 사용

<br>

### <img> tag 사용
```html
<img src="my-pic.png" />
```

<br>

### next-gen formats 사용
* jpg, png -> webp, avif
* `WebP`는 size가 `JPEG`, `PNG`보다 최소 25~30% 작아 loading이 빠르고, data를 적게 소모

<br>

### alt text 사용
```html
<img src="my-pic.png" alt="my photo" />
```
* image loading 지연시 `alt`를 통해 어떤 의미인지 파악할 수 있어 user experience에 좋은 영향을 줄 수 있다

<br>

### `srcset`로 반응형 이미지 사용
```html
<img srcset="small.webp 500w, \
             medium.webp 1000w, \
             large.webp 2000w"
    src="large.webp" />
```

<br>

### `sizes`로 resolution-switching 지원
```html
<img srcset="small.webp 500w, \
             medium.webp 1000w"
    sizes="(max-width: 400px) 95vw, \
           (max-width: 900px) 50vw"
    src="medium.webp" />
```
* image width가 몇 px인지 브라우저에게 알려주어 화면에서 차지할 비율 지정

<br>

### 가로세로 비율 유지
```html
.avatar {
    heigth: auto;
    width: 200px;
}

<img class="image"
     src="img.webp"
     height="200px"
     width="200px" />
```
* 반응형 최적화시 가로세로 비율을 유지하지 않으면 `layout shift` 현상이 발생하여 user experience에 좋지 않은 영향을 줄 수 있다
* HTML에서 height, width 지정하고 CSS에서 `heigth: auto` 지정하면 `layout shift` 현상을 최소화할 수 있다
* CSS `object-fit` 사용도 추천

<br>

### 중요 이미지에 `fetchpriority` 적용
```html
<img src="core-img.webp" fetchpriority="high" />
<img src="img.webp" />
```
* LCP(Large Contentful Paint)의 일부로 첫 로드시 가져와야할 이미지나 중요 이미지에 `fetchpriority="high"`를 설정하여 빠르게 로드하도록 한다

<br>

### lazy loading과 async decoding 사용
```html
<img src="img.webp" loading="lazy" decoding="async"/>
```

* LCP image가 아닌 하단 image에 사용하면 리소스 효율성을 높여 performance에 도움을 준다
* `loading="lazy"` - `viewport`에 있는 image를 load하는데 리소스를 먼저 사용하도록 한다
* `decoding="async"` - performance에 영향을 주는 image decoding에서 나중에 decoding하도록 한다
* `fetchpriority="low"` - 낮은 우선 순위로 load

<br>

## Conclusion
* [Next.js Image](https://nextjs.org/docs/api-reference/next/image), [Builder.io](https://www.builder.io/m/developers)를 사용하면 위의 과정을 자동화할 수 있다
* [Performance Insights](https://www.builder.io/c/performance-insights)를 활용하여 품질을 확인해보고 조치해보는 것을 추천한다


<br><br>

> #### Reference
> * [The Definitive Guide to Image Optimization](https://www.builder.io/blog/the-definitive-guide-to-image-optimization)
> * [WebP vs JPG vs PNG](./webp_vs_jpg_vs_png.md)
