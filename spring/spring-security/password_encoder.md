# [Spring Security] PasswordEncoder
> date - 2018.05.28  
> keyword - spring security, password encoder  
> Spring Security 5.0의 crypto package의 PasswordEncoder에 대해 파헤처 본다

<br>

## Password history
* password plaintext 저장
  * SQL injection을 통해 data dump로 노출 위험 -> hash를 사용하여 극복!
* one-way hash(e.g. sha-256)
  * 사용자가 입력한 password로 생성한 hash를 저장
  * password 검증시 저장된 hash와 비교
  * 유출시 hash가 노출되므로 괜찮다
  * hash는 단방향이고, password를 추측하는게 계산적으로 어려움
  * rainbow table attack에 취약 -> salt를 사용해 극복!
* salt
  * hash 생성시 salt(임의의 값)를 추가해 rainbow table 무력화
  * salt + password -> hash 생성 -> salt + hash를 저장
  * password 검증시 기존에 저장된 salt를 사용해 hashing 후 비교
  * 최신 HW에서는 초당 수십억개의 hash 계산을 수행하므로 안전하지 않다 -> adaptive one-way(의도적으로 느리게 만들어) 극복!
* adaptive one-way(e.g. Bcrypt, PBKDF2, Scrypt, Argon2) 사용
  * 의도적으로 cpu, memory를 많이 사용
  * work factor(cpu, memory, parallelism)를 조정하여 HW가 좋아짐에 따라 증가하는 속도를 조정할 수 있다
  * password 검증시 약 1초가(일반 유저가 느리다고 느끼지 않는 시간) 걸리도록 work factor를 조정하는게 좋다
  * 공격자가 password를 해독하기 어렵게 만들되 사용자 시스템에 과도한 부담을 줄 정도로 비용이 많이들지 않도록하는 절충안
  * 의도적으로 리소스를 많이 사용하기 때문에 모든 요청에 대해 password 검증하려면 application의 성능이 저하되므로 1번의 검증을 통해 long term credentials(i.e. id, password)을 short term credentials(i.e. session, OAuth token)로 교환하는게 좋다
  * short term credentials은 보안의 손실 없이 빠르게 검증 가능


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
* SHA는 단방향(one-way) hash이므로 salt에는 모든 문자가 포함될 수 있다
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
* digest 기반 password encoding은 안전하지 않으므로 적응형 단방향(adaptive one-way) 함수를 사용
  * [BCryptPasswordEncoder](#bcryptpasswordencoder)
  * [Pbkdf2PasswordEncoder](#pbkdf2passwordencoder)
  * [SCryptPasswordEncoder](#scryptpasswordencoder)
  * [Argon2PasswordEncoder](#argon2passwordencoder)
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
* 암호화할 때마다 새로운 salt를 생성하므로, salt 추가해서 암호화하지 않아도 된다
  * salt가 누락되는 취약점 제거
* [BCrypt](https://en.wikipedia.org/wiki/Bcrypt) strong hashing function을 사용하는 구현체
* strength(Bcrypt의 log round), SecureRandom을 optional하게 제공할 수 있다
  * strength(default, 10)가 클수록 hash를 생성하기 위해 더 많은 작업(기하급수적으로)을 수행
* 다른 적응형 단방향(adaptive one-way) 알고리즘과 마찬가지로 시스템에서 password를 확인하는데 약 1초가 걸리도록 strength를 조정해야한다

```java
public class BCryptPasswordEncoder implements PasswordEncoder {
  private Pattern BCRYPT_PATTERN;
  private final Log logger;
  private final int strength;
  private final BCryptVersion version;
  private final SecureRandom random;

  public BCryptPasswordEncoder() {
    this(-1);
  }

  public BCryptPasswordEncoder(int strength) {
    this(strength, (SecureRandom)null);
  }

  public BCryptPasswordEncoder(BCryptVersion version) {
    this(version, (SecureRandom)null);
  }

  public BCryptPasswordEncoder(BCryptVersion version, SecureRandom random) {
    this(version, -1, random);
  }

  public BCryptPasswordEncoder(int strength, SecureRandom random) {
    this(BCryptPasswordEncoder.BCryptVersion.$2A, strength, random);
  }

  public BCryptPasswordEncoder(BCryptVersion version, int strength) {
    this(version, strength, (SecureRandom)null);
  }

  public BCryptPasswordEncoder(BCryptVersion version, int strength, SecureRandom random) {
    this.BCRYPT_PATTERN = Pattern.compile("\\A\\$2(a|y|b)?\\$(\\d\\d)\\$[./0-9A-Za-z]{53}");
    this.logger = LogFactory.getLog(this.getClass());
    if (strength == -1 || strength >= 4 && strength <= 31) {
      this.version = version;
      this.strength = strength == -1 ? 10 : strength;
      this.random = random;
    } else {
      throw new IllegalArgumentException("Bad strength");
    }
  }

  public String encode(CharSequence rawPassword) {
    if (rawPassword == null) {
      throw new IllegalArgumentException("rawPassword cannot be null");
    } else {
      String salt = this.getSalt();
      return BCrypt.hashpw(rawPassword.toString(), salt);
    }
  }

  private String getSalt() {
    return this.random != null ? BCrypt.gensalt(this.version.getVersion(), this.strength, this.random) : BCrypt.gensalt(this.version.getVersion(), this.strength);
  }

  public boolean matches(CharSequence rawPassword, String encodedPassword) {
    if (rawPassword == null) {
      throw new IllegalArgumentException("rawPassword cannot be null");
    } else if (encodedPassword != null && encodedPassword.length() != 0) {
      if (!this.BCRYPT_PATTERN.matcher(encodedPassword).matches()) {
        this.logger.warn("Encoded password does not look like BCrypt");
        return false;
      } else {
        return BCrypt.checkpw(rawPassword.toString(), encodedPassword);
      }
    } else {
      this.logger.warn("Empty encoded password");
      return false;
    }
  }

  public boolean upgradeEncoding(String encodedPassword) {
    if (encodedPassword != null && encodedPassword.length() != 0) {
      Matcher matcher = this.BCRYPT_PATTERN.matcher(encodedPassword);
      if (!matcher.matches()) {
        throw new IllegalArgumentException("Encoded password does not look like BCrypt: " + encodedPassword);
      } else {
        int strength = Integer.parseInt(matcher.group(2));
        return strength < this.strength;
      }
    } else {
      this.logger.warn("Empty encoded password");
      return false;
    }
  }

  public static enum BCryptVersion {
    $2A("$2a"),
    $2Y("$2y"),
    $2B("$2b");

    private final String version;

    private BCryptVersion(String version) {
      this.version = version;
    }

    public String getVersion() {
      return this.version;
    }
  }
}
```

<br>

### Usage
```java
// Create an encoder with strength 16(default. 10)
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(16);
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));
```


<br>

## SCryptPasswordEncoder
* spring security에서 권장하는 암호화 방식
* [Scrypt](https://en.wikipedia.org/wiki/Scrypt)를 사용하는 구현체
  * password cracking을 무력화하기 위해 의도적으로 느린 알고리즘을 사용하여 많은 양의 memory 필요
* 다른 적응형 단방향(adaptive one-way) 알고리즘과 마찬가지로 시스템에서 password를 확인하는데 약 1초가 
걸리도록 조정해야한다
```java

public class SCryptPasswordEncoder implements PasswordEncoder {
  private static final int DEFAULT_CPU_COST = 65536;
  private static final int DEFAULT_MEMORY_COST = 8;
  private static final int DEFAULT_PARALLELISM = 1;
  private static final int DEFAULT_KEY_LENGTH = 32;
  private static final int DEFAULT_SALT_LENGTH = 16;
  private final Log logger = LogFactory.getLog(this.getClass());
  private final int cpuCost;
  private final int memoryCost;
  private final int parallelization;
  private final int keyLength;
  private final BytesKeyGenerator saltGenerator;

  public SCryptPasswordEncoder(int cpuCost, int memoryCost, int parallelization, int keyLength, int saltLength) {
    if (cpuCost <= 1) {
      throw new IllegalArgumentException("Cpu cost parameter must be > 1.");
    } else if (memoryCost == 1 && cpuCost > 65536) {
      throw new IllegalArgumentException("Cpu cost parameter must be > 1 and < 65536.");
    } else if (memoryCost < 1) {
      throw new IllegalArgumentException("Memory cost must be >= 1.");
    } else {
      int maxParallel = Integer.MAX_VALUE / (128 * memoryCost * 8);
      if (parallelization >= 1 && parallelization <= maxParallel) {
        if (keyLength >= 1 && keyLength <= Integer.MAX_VALUE) {
          if (saltLength >= 1 && saltLength <= Integer.MAX_VALUE) {
            this.cpuCost = cpuCost;
            this.memoryCost = memoryCost;
            this.parallelization = parallelization;
            this.keyLength = keyLength;
            this.saltGenerator = KeyGenerators.secureRandom(saltLength);
          } else {
            throw new IllegalArgumentException("Salt length must be >= 1 and <= 2147483647");
          }
        } else {
          throw new IllegalArgumentException("Key length must be >= 1 and <= 2147483647");
        }
      } else {
        throw new IllegalArgumentException("Parallelisation parameter p must be >= 1 and <= " + maxParallel + " (based on block size r of " + memoryCost + ")");
      }
    }
  }

  /** @deprecated */
  @Deprecated
  public static SCryptPasswordEncoder defaultsForSpringSecurity_v4_1() {
    return new SCryptPasswordEncoder(16384, 8, 1, 32, 64);
  }

  public static SCryptPasswordEncoder defaultsForSpringSecurity_v5_8() {
    return new SCryptPasswordEncoder(65536, 8, 1, 32, 16);
  }

  public String encode(CharSequence rawPassword) {
    return this.digest(rawPassword, this.saltGenerator.generateKey());
  }

  public boolean matches(CharSequence rawPassword, String encodedPassword) {
    if (encodedPassword != null && encodedPassword.length() >= this.keyLength) {
      return this.decodeAndCheckMatches(rawPassword, encodedPassword);
    } else {
      this.logger.warn("Empty encoded password");
      return false;
    }
  }

  public boolean upgradeEncoding(String encodedPassword) {
    if (encodedPassword != null && !encodedPassword.isEmpty()) {
      String[] parts = encodedPassword.split("\\$");
      if (parts.length != 4) {
        throw new IllegalArgumentException("Encoded password does not look like SCrypt: " + encodedPassword);
      } else {
        long params = Long.parseLong(parts[1], 16);
        int cpuCost = (int)Math.pow(2.0, (double)(params >> 16 & 65535L));
        int memoryCost = (int)params >> 8 & 255;
        int parallelization = (int)params & 255;
        return cpuCost < this.cpuCost || memoryCost < this.memoryCost || parallelization < this.parallelization;
      }
    } else {
      return false;
    }
  }

  private boolean decodeAndCheckMatches(CharSequence rawPassword, String encodedPassword) {
    String[] parts = encodedPassword.split("\\$");
    if (parts.length != 4) {
      return false;
    } else {
      long params = Long.parseLong(parts[1], 16);
      byte[] salt = this.decodePart(parts[2]);
      byte[] derived = this.decodePart(parts[3]);
      int cpuCost = (int)Math.pow(2.0, (double)(params >> 16 & 65535L));
      int memoryCost = (int)params >> 8 & 255;
      int parallelization = (int)params & 255;
      byte[] generated = SCrypt.generate(Utf8.encode(rawPassword), salt, cpuCost, memoryCost, parallelization, this.keyLength);
      return MessageDigest.isEqual(derived, generated);
    }
  }

  private String digest(CharSequence rawPassword, byte[] salt) {
    byte[] derived = SCrypt.generate(Utf8.encode(rawPassword), salt, this.cpuCost, this.memoryCost, this.parallelization, this.keyLength);
    String params = Long.toString((long)((int)(Math.log((double)this.cpuCost) / Math.log(2.0)) << 16 | this.memoryCost << 8 | this.parallelization), 16);
    StringBuilder sb = new StringBuilder((salt.length + derived.length) * 2);
    sb.append("$").append(params).append('$');
    sb.append(this.encodePart(salt)).append('$');
    sb.append(this.encodePart(derived));
    return sb.toString();
  }

  private byte[] decodePart(String part) {
    return Base64.getDecoder().decode(Utf8.encode(part));
  }

  private String encodePart(byte[] part) {
    return Utf8.decode(Base64.getEncoder().encode(part));
  }
}
```

<br>

### Usage
* BouncyCastle 필요
```gradle
dependencies {
  implementation "org.bouncycastle:bcprov-jdk18on:1.78.1"
}
```
```java
// Create an encoder with all the defaults
SCryptPasswordEncoder encoder = new SCryptPasswordEncoder();
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));
```



<br>

## Pbkdf2PasswordEncoder
* spring security에서 권장하는 암호화 방식
* [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2)를 사용하는 구현체
  * password cracking을 무력화하기 위해 의도적으로 느린 알고리즘
* 다른 적응형 단방향(adaptive one-way) 알고리즘과 마찬가지로 시스템에서 password를 확인하는데 약 1초가 걸리도록 조정해야한다
* FIPS 인증이 필요한 경우 좋은 선택


<br>

### Usage
```java
// Create an encoder with all the defaults
Pbkdf2PasswordEncoder encoder = Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8();
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));
```


<br>

## Argon2PasswordEncoder
* [Argon2](https://en.wikipedia.org/wiki/Argon2)을 사용하는 구현체
  * [Password Hashing Competition](https://en.wikipedia.org/wiki/Password_Hashing_Competition)에서 우승한 알고리즘
  * password cracking을 무력화하기 위해 의도적으로 느린 알고리즘
* 다른 적응형 단방향(adaptive one-way) 알고리즘과 마찬가지로 시스템에서 password를 확인하는데 약 1초가 걸리도록 조정해야한다

<br>

### Usage
* BouncyCastle 필요
```gradle
dependencies {
  implementation "org.bouncycastle:bcprov-jdk18on:1.78.1"
}
```
```java
// Create an encoder with all the defaults
Argon2PasswordEncoder encoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));
```


<br>

## MessageDigestPasswordEncoder
* MD5, SHA-1, SHA-256에 사용되며, 16진수(32자) message digest 생성

```java

public class MessageDigestPasswordEncoder implements PasswordEncoder {
  private static final String PREFIX = "{";
  private static final String SUFFIX = "}";
  private StringKeyGenerator saltGenerator = new Base64StringKeyGenerator();
  private boolean encodeHashAsBase64;
  private Digester digester;

  public MessageDigestPasswordEncoder(String algorithm) {
    this.digester = new Digester(algorithm, 1);
  }

  public void setEncodeHashAsBase64(boolean encodeHashAsBase64) {
    this.encodeHashAsBase64 = encodeHashAsBase64;
  }

  public String encode(CharSequence rawPassword) {
    String salt = "{" + this.saltGenerator.generateKey() + "}";
    return this.digest(salt, rawPassword);
  }

  private String digest(String salt, CharSequence rawPassword) {
    String saltedPassword = "" + rawPassword + salt;
    byte[] digest = this.digester.digest(Utf8.encode(saltedPassword));
    String encoded = this.encode(digest);
    return salt + encoded;
  }

  private String encode(byte[] digest) {
    return this.encodeHashAsBase64 ? Utf8.decode(Base64.getEncoder().encode(digest)) : new String(Hex.encode(digest));
  }

  public boolean matches(CharSequence rawPassword, String encodedPassword) {
    String salt = this.extractSalt(encodedPassword);
    String rawPasswordEncoded = this.digest(salt, rawPassword);
    return PasswordEncoderUtils.equals(encodedPassword.toString(), rawPasswordEncoded);
  }

  public void setIterations(int iterations) {
    this.digester.setIterations(iterations);
  }

  private String extractSalt(String prefixEncodedPassword) {
    int start = prefixEncodedPassword.indexOf("{");
    if (start != 0) {
      return "";
    } else {
      int end = prefixEncodedPassword.indexOf("}", start);
      return end < 0 ? "" : prefixEncodedPassword.substring(start, end + 1);
    }
  }
}
```

<br>

### Usage
```java
var encoder = new MessageDigestPasswordEncoder("SHA-256");
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));

var encoder = new MessageDigestPasswordEncoder("MD5");
String result = encoder.encode("myPassword");
assertTrue(encoder.matches("myPassword", result));
```


<br>

## DelegatingPasswordEncoder
* Spring Security 5.0을 기점으로 default PasswordEncoder를 `NoOpPasswordEncoder` -> `BCryptPasswordEncoder`로 변경하고 싶었으나 아래의 어려움 존재
  * password migration을 쉽게할 수 없는 application이 많다
  * password 저장에 대한 best practice는 변경될 수 있다
  * Spring Security는 framework로써 주요 변경을 자주 수행할 수 없다
* 위의 문제를 `DelegatingPasswordEncoder`로 해결
  * password가 현재 권장에 맞게 encoding되었는지 확인
  * modern & legacy format validating 수행
  * 미래의 encoding upgrade 허용
* prefix(`{id}`)에 맞는 PasswordEncoder를 사용하여 다양한 알고리즘 적용 가능
```java
public final class PasswordEncoderFactories {
  private PasswordEncoderFactories() {
  }

  public static PasswordEncoder createDelegatingPasswordEncoder() {
    String encodingId = "bcrypt";
    Map<String, PasswordEncoder> encoders = new HashMap();
    encoders.put(encodingId, new BCryptPasswordEncoder());
    encoders.put("ldap", new LdapShaPasswordEncoder());
    encoders.put("MD4", new Md4PasswordEncoder());
    encoders.put("MD5", new MessageDigestPasswordEncoder("MD5"));
    encoders.put("noop", NoOpPasswordEncoder.getInstance());
    encoders.put("pbkdf2", Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_5());
    encoders.put("pbkdf2@SpringSecurity_v5_8", Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8());
    encoders.put("scrypt", SCryptPasswordEncoder.defaultsForSpringSecurity_v4_1());
    encoders.put("scrypt@SpringSecurity_v5_8", SCryptPasswordEncoder.defaultsForSpringSecurity_v5_8());
    encoders.put("SHA-1", new MessageDigestPasswordEncoder("SHA-1"));
    encoders.put("SHA-256", new MessageDigestPasswordEncoder("SHA-256"));
    encoders.put("sha256", new StandardPasswordEncoder());
    encoders.put("argon2", Argon2PasswordEncoder.defaultsForSpringSecurity_v5_2());
    encoders.put("argon2@SpringSecurity_v5_8", Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8());
    return new DelegatingPasswordEncoder(encodingId, encoders);
  }
}

// usage
var passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
```

* custom
```java
String idForEncode = "bcrypt";
Map encoders = new HashMap<>();
encoders.put(idForEncode, new BCryptPasswordEncoder());
encoders.put("noop", NoOpPasswordEncoder.getInstance());
encoders.put("pbkdf2", new Pbkdf2PasswordEncoder());
encoders.put("scrypt", new SCryptPasswordEncoder());
encoders.put("sha256", new StandardPasswordEncoder());

var passwordEncoder = new DelegatingPasswordEncoder(idForEncode, encoders);
```

<br>

### password storage format
```
{id}encodedPassword

// plain text - password
{bcrypt}$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG 1
{noop}password 2
{pbkdf2}5d923b44a6d129f3ddf3e3c8d29412723dcbde72445e8ef6bf3b508fbf17fa4ed4d6b99ca763d8dc 3
{scrypt}$e0801$8bWJaSu2IKSn9Z9kM+TPXfOc/9bdYSrN1oD9qfVThWEwdRTnO7re7Ei+fUZRJ68k9lTyuTeUp4of4g24hHnazw==$OAOec05+bXxvuu/1qZ6NUR+xQYvYv7BeL1QxwRpY5Pc=  4
{sha256}97cde38028ad898ebc02e690819fa220e88c62e0699403e94fff291cfffaf8410849f27605abcbc0 5
```
* id - `PasswordEncoder` 조회를 위한 id
* encodedPassword - 인코딩된 password
* algorithm은 쉽게 노출되는 정보이므로 password storage format의 id에서 노출되어도 괜찮다
  * BCrypt는 `$2a$`로 시작하는 경우가 많다



<br><br>

> #### Reference
> * [Spring Security 5.0.3 Reference - Password Encoding](https://docs.spring.io/spring-security/site/docs/5.0.3.RELEASE/reference/htmlsingle/#core-services-password-encoding)
> * [Spring Security - Password Storage](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)
