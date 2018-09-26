# [Spring Security] PasswordEncoder
> date - 2018.05.28  
> keyword - spring security, password encoder  
> Spring Security 5.0의 crypto package의 PasswordEncoder에 대해 파헤처 본다

<br>

## NoOpPasswordEncoder
* 암호화를 사용하지 않을 때 사용
* test 용도
* spring security 5.0에서 deprecated
```java
package org.springframework.security.crypto.password;

@Deprecated  // when spring security 5.0
public final class NoOpPasswordEncoder implements PasswordEncoder {
    
    // singleton
    private static final PasswordEncoder INSTANCE = new NoOpPasswordEncoder();
	
    public static PasswordEncoder getInstance() {
        return INSTANCE;
    }
	
    private NoOpPasswordEncoder() {
    }

    public String encode(CharSequence rawPassword) {
        return rawPassword.toString();
    }

    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return rawPassword.toString().equals(encodedPassword);
    }
}
```

<br>

## ShaPasswordEncoder
* SHA 구현체
* passwod가 null이면 `""`로 처리된다
* SHA는 단방향 hash이므로 salt에는 모든 문자가 포함될 수 있다
* strength
   * SHA-1(default) - `new ShaPasswordEncoder()`
   * SHA-256 - `new ShaPasswordEncoder(256)`
* deprecated
   * 대신 `org.springframework.security.crypto.password.MessageDigestPasswordEncoder`로 algorithm을 `SHA-$strength`로 사용
   * `new MessageDigestPasswordEncoder("SHA-256")`
* 5.x에서 제거됨
```java
package org.springframework.security.authentication.encoding;

@Deprecated
public class ShaPasswordEncoder extends MessageDigestPasswordEncoder {
	
    // SHA-1 사용
    public ShaPasswordEncoder() {
        this(1);
    }

    // strength에 따라 어떤 SHA를 사용할지 결정(1, 256, 384, 512)
    public ShaPasswordEncoder(int strength) {
        super("SHA-" + strength);
    }
}
```

<br>

## StandardPasswordEncoder
* 8byte의 랜덤 salt를 가지고 1024번 반복해서 `SHA-256` hashing 
* 추가 보호 기능을 제공하기 위해 시스템 전체의 비밀 값을 사용
* digest algorithm은 salt, secret, password가 연결된 byte에서 호출한다
* 새로운 시스템을 개발한다면, `org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder`가 다른 언어와의 보안 및 상호 운용성면에서 더 나은 선택이다
* digest 기반 password encoding은 안전하지 않다
   * 대신 BCryptPasswordEncoder, Pbkdf2PasswordEncoder, SCryptPasswordEncoder와 같은 적응형 단방향 함수를 사용
* 5.0부터 password upgrade를 지원하는 DelegatingPasswordEncoder를 사용 권장
* 보안상 안전하지 않기 때문에 spring security 5.0에서 deprecated

> #### digest 란?
> * hash function(수학적인 연산)에서 생성된 `암호화된 메시지`

```java
package org.springframework.security.crypto.password;

@Deprecated
public final class StandardPasswordEncoder implements PasswordEncoder {
	
    private static final int DEFAULT_ITERATIONS = 1024;

    private final Digester digester;

    private final byte[] secret;

    private final BytesKeyGenerator saltGenerator;

    public StandardPasswordEncoder() {
        this("");
    }
    
    // secret - encoding에 사용될 공유되지 않는 key
    public StandardPasswordEncoder(CharSequence secret) {
        this("SHA-256", secret);
    }

    public String encode(CharSequence rawPassword) {
        return encode(rawPassword, saltGenerator.generateKey());
    }

    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        byte[] digested = decode(encodedPassword);
        byte[] salt = subArray(digested, 0, saltGenerator.getKeyLength());
        return matches(digested, digest(rawPassword, salt));
    }

    /*** internal helpers ***/

    private StandardPasswordEncoder(String algorithm, CharSequence secret) {
        this.digester = new Digester(algorithm, DEFAULT_ITERATIONS);
        this.secret = Utf8.encode(secret);
        this.saltGenerator = KeyGenerators.secureRandom();
    }

    private String encode(CharSequence rawPassword, byte[] salt) {
        byte[] digest = digest(rawPassword, salt);  // 평문과 salt를 사용해 digest 생성
        return new String(Hex.encode(digest));  // digest를 16진수로 반환
    }

    private byte[] digest(CharSequence rawPassword, byte[] salt) {
        // salt + secret + rawPassword(utf-8 encoding)으로 digest 생성
        byte[] digest = digester.digest(concatenate(salt, secret, Utf8.encode(rawPassword)));
        
        // 생성된 digest를 salt와 연결해 반환 
        // matches(...)에서 salt를 입력받지 않고, 암호화된 메시지에서 가져올 수 있도록 하기 위해
        // salt가 암호문에 포함되기 때문에 암호문이 노출되면(그럴일은 없나..?) salt가 노출된다
        // 평문, secret key만 똑같은 hash를 만들 수 있다
        return concatenate(salt, digest);  
    }

    private byte[] decode(CharSequence encodedPassword) {
        return Hex.decode(encodedPassword);
    }

    /**
        * Constant time comparison to prevent against timing attacks.
        */
    private boolean matches(byte[] expected, byte[] actual) {
        if (expected.length != actual.length) {
            return false;
        }
        
        int result = 0;
        for (int i = 0; i < expected.length; i++) {
            result |= expected[i] ^ actual[i];
        }
        return result == 0;
    }
}
```

<br>

## BCryptPasswordEncoder
* spring security에서 권장하는 암호화 방식
* 암호화할 때마다 새로운 값을 생성
* 임의의 값(salt)을 추가해서 암호화하지 않아도 된다
* BCrypt strong hashing function을 사용하는 구현체
* strength(Bcrypt의 log round), SecureRandom을 optional하게 제공할 수 있다
   * strength(default 10)가 클수록 hash를 생성하기 위해 더 많은 작업(기하 급수적으로)을 수행


Todo: 왜그런지 구현체를 봐보자
```java
package org.springframework.security.crypto.bcrypt;

public class BCryptPasswordEncoder implements PasswordEncoder {

    private Pattern BCRYPT_PATTERN = Pattern.compile("\\A\\$2a?\\$\\d\\d\\$[./0-9A-Za-z]{53}");

    private final Log logger = LogFactory.getLog(getClass());

    private final int strength;

    private final SecureRandom random;

    public BCryptPasswordEncoder() {
        this(-1);
    }

    /**
        * @param strength the log rounds to use, between 4 and 31
        */
    public BCryptPasswordEncoder(int strength) {
        this(strength, null);
    }

    /**
        * @param strength the log rounds to use, between 4 and 31
        * @param random the secure random instance to use
        *
        */
    public BCryptPasswordEncoder(int strength, SecureRandom random) {
        if (strength != -1 && (strength < BCrypt.MIN_LOG_ROUNDS || strength > BCrypt.MAX_LOG_ROUNDS)) {
            throw new IllegalArgumentException("Bad strength");
        }
        this.strength = strength;
        this.random = random;
    }

    public String encode(CharSequence rawPassword) {
        String salt;
        if (strength > 0) {
            if (random != null) {
                salt = BCrypt.gensalt(strength, random);
            } else {
                salt = BCrypt.gensalt(strength);
            }
        } else {
            salt = BCrypt.gensalt();
        }
        return BCrypt.hashpw(rawPassword.toString(), salt);
    }

    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null || encodedPassword.length() == 0) {
            logger.warn("Empty encoded password");
            return false;
        }
        
        if (!BCRYPT_PATTERN.matcher(encodedPassword).matches()) {
            logger.warn("Encoded password does not look like BCrypt");
            return false;
        }
        
        return BCrypt.checkpw(rawPassword.toString(), encodedPassword);
    }
}
```

<br>

## SCryptPasswordEncoder

<br>

## Pbkdf2PasswordEncoder

<br>

## MessageDigestPasswordEncoder

<br>

## DelegatingPasswordEncoder




---

<br>

> #### 참고
> * [Spring Security Reference - Password Encoding](https://docs.spring.io/spring-security/site/docs/5.0.3.RELEASE/reference/htmlsingle/#core-services-password-encoding)
