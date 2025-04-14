# [Spring] validator

TODO: Spring 에서 유효성 검증하는 법 정리



https://goldenrabbit.co.kr/2024/04/02/spring-%EC%8A%A4%ED%94%84%EB%A7%81-%EB%B6%80%ED%8A%B8-%EA%B0%92-%EA%B2%80%EC%A6%9Dvalidation-%EA%B0%80%EC%9D%B4%EB%93%9C/?fbclid=IwAR2nLP_01zc5szq_E1DqNQgTPKhZKrSCyonygCnXWm1fvEFXLWeSCWt0Fe4



https://jeong-pro.tistory.com/203
https://rnokhs.tistory.com/37

https://www.baeldung.com/spring-validate-requestparam-pathvariable

https://github.com/HomoEfficio/dev-tips/blob/master/DTO%EC%99%80%20Bean%20Validation.md
여기의 validation 내용도 담기



collection field 에 @Valid 안걸면 개별 object 의 validation 은 작동안하지 않았었나요?

```java
package com.yanolja.memberclass.order.leisure.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.yanolja.memberclass.common.code.LeisureOrderItemStatusCode;
import com.yanolja.memberclass.common.code.LeisureOrderStatusCode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@EqualsAndHashCode
@ToString
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SaveLeisureOrderRequest {
    @NotNull
    private String orderId;

    @NotNull
    private String memberNo;

    private String compositeOrderId;

    @NotNull
    private LeisureOrderStatusCode orderStatusCode;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime orderCreatedAt;

    @NotNull
    private Long orderPrice;

    @NotNull
    private Long eventTime;

    @NotNull
    private String eventName;

    @Valid
    @NotEmpty
    @Size(min = 1)
    private List<OrderItemRequest> orderItemRequestList;

    @Getter
    @EqualsAndHashCode
    @ToString
    @Builder
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class OrderItemRequest {
        @NotNull
        private Long orderItemId;

        @NotNull
        private LeisureOrderItemStatusCode useStatusCode;

        @NotNull
        private String productId;

        @NotNull
        private String productName;

        @NotNull
        private String itemId;

        @NotNull
        private String itemName;

        @NotNull
        private Long amount;

        @NotNull
        private Long pgAmount;

        @NotNull
        private Long pointAmount;

        @NotNull
        private Long couponAmount;

        @NotNull
        private Long nolPointAmount;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
        private LocalDateTime cancelRequestedAt;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", shape = JsonFormat.Shape.STRING)
        private LocalDateTime cancelCompletedAt;
    }
}
```




+ 그룹지어서 하는법
@Validated(groups=xxx.class)




validator 정리


jsr 303
validator 를 주입받아서 쓰는 방법
    dataBinder, DI



https://www.google.co.kr/search?newwindow=1&safe=off&ei=9kVdWuSKLIy88QXql5jIAw&q=spring+validator+jsr+303&oq=spring+validator+jsr+303&gs_l=psy-ab.3..0i19k1l2j0i8i30i19k1j0i8i13i30i19k1l5j0i8i30i19k1j0i8i13i30i19k1.129379.132686.0.132819.14.14.0.0.0.0.125.1268.3j9.12.0....0...1c.1.64.psy-ab..2.12.1267...0j0i67k1j0i10k1j0i30k1j0i8i30k1j0i5i30k1j35i39k1j0i203k1j0i10i30k1j0i8i10i30k1j0i13i10i30i19k1j0i13i30i19k1.0.p4voaFnkcWU



http://springsource.tistory.com/18



http://www.popit.kr/javabean-validation%EA%B3%BC-hibernate-validator-%EA%B7%B8%EB%A6%AC%EA%B3%A0-spring-boot/


https://heowc.github.io/2018/01/14/spring-boot-hibernate-validation/




https://heowc.github.io/2018/01/14/spring-boot-hibernate-validation/



