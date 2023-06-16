# [Spring Security] WebSecurityConfigurerAdapter deprecated
> date - 2023.06.17  
> keyworkd - spring security, websecurityconfigureradapter  
> WebSecurityConfigurerAdapter가 Sptring Boot 2.7(Spring Security 5.7)에서 deprecated, Spring Boot 3.0(Spring Security 6.0)에서 remove되었기 때문에 migration에 관련된 내용을 정리  

<br>

## HttpSecurity 설정

### As-is
```java
@Configuration
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
  
  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
        .antMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
        .anyRequest().authenticated()
        .and()
        .csrf().disable()
        .addFilterBefore(new CustomFilter(), AbstractPreAuthenticatedProcessingFilter.class);
    }
}
```

<br>

### To-be
* `SecurityFilterChain` 사용
```java
@Configuration
public class SecurityConfiguration {
 
  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http.authorizeHttpRequests(
                        auth -> auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                                    .anyRequest().authenticated())
                .csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(new CustomFilter(), AbstractPreAuthenticatedProcessingFilter.class)
                .build();
  }
}
```
* authorizeRequests() -> authorizeHttpRequests()
* antMatchers(), mvcMatchers() -> requestMatchers()
* mvcMatchers(), requestMatchers()에서 `**`는 `/swagger-ui/**`처럼 마지막에 있을때만 유효

<br>

### Test
* `@WebMvcTest` 같은 sliced test를 하는 경우 [Guide](https://docs.spring.io/spring-boot/docs/2.7.x/reference/html/howto.html#howto.testing.slice-tests)를 참고하여 `@Import(SecurityFilterChain.class)` 사용 필요
```java
@Import(WebSecurityConfiguration.class)
public class WebSecurityConfigurationTest {

    @Autowired
    private MockMvc mvc;

    @Test
    @WithAnonymousUser
    public void whenAnonymousAccessLogin_thenOk() throws Exception {
        mvc.perform(get("/login"))
                .andExpect(status().isOk());
    }

    @Test
    @WithUserDetails()
    public void whenUserAccessUserSecuredEndpoint_thenOk() throws Exception {
        mvc.perform(get("/user"))
                .andExpect(status().isOk());
    }

    @Test
    @WithUserDetails(value = "admin")
    public void whenAdminAccessUserEndpoint_thenOk() throws Exception {
        mvc.perform(get("/user"))
                .andExpect(status().isOk());
    }
}
```

<br>

## WebSecurity 설정

### As-is
```java
@Configuration
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    
  @Override
  public void configure(WebSecurity web) {
    web.ignoring().antMatchers("/ignore1", "/ignore2");
  }
}
```

<br>

### To-be
* `WebSecurityCustomizer` 사용
```java
@Configuration
public class SecurityConfiguration {

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers("/ignore1", "/ignore2");
    }
}
```

* static resource를 사용하는 경우
```java
@Bean
public WebSecurityCustomizer webSecurityCustomizer() {
  return web -> web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
}
```

* `WebSecurityCustomizer`를 사용하면 아래처럼 warning이 발생하므로 `SecurityFilterChain`에서 HttpSecurity#authorizeHttpRequests.permitAll()을 사용하자
```
You are asking Spring Security to ignore org.springframework.boot.autoconfigure.security.servlet.StaticResourceRequest$StaticResourceRequestMatcher@72a61eae. This is not recommended -- please use permitAll via HttpSecurity#authorizeHttpRequests instead.
```
```java 
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
  return http.authorizeHttpRequests(
                      auth -> auth.requestMatchers(athRequest.toStaticResources().atCommonLocations()).permitAll())
             .build();
}
```


<br>

## AuthenticationManager 설정
### As-is
```java
@Configuration
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
  
  @Autowired
  private UserDetailsService userDetailsService;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(userDetailsService)
        .passwordEncoder(passwordEncoder());
  }


  @Bean
  @Override
  public AuthenticationManager authenticationManagerBean() throws Exception {
    return super.authenticationManagerBean();
  }
  ...
}
```

<br>

### To-be
#### local
```java
@Configuration
public class SecurityConfiguration {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
            .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
            .authenticationManager(new CustomAuthenticationManager())
            .build();
  }
}
```

#### global
* AuthenticationManager 등록
```java
@Bean
public AuthenticationManager authenticationManager() {
  return new CustomAuthenticationManager();
}

// or
@Bean
public AuthenticationManager authenticationManager(HttpSecurity http, BCryptPasswordEncoder bCryptPasswordEncoder, UserDetailService userDetailService) throws Exception {
  return http.getSharedObject(AuthenticationManagerBuilder.class)
             .userDetailsService(userDetailsService)
             .passwordEncoder(bCryptPasswordEncoder)
             .and()
             .build();
}
```

* UserDetailsService 등록
```java
@Bean
public UserDetailsService userDetailsService(BCryptPasswordEncoder bCryptPasswordEncoder) {
  InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
  manager.createUser(User.withUsername("user")
                         .password(bCryptPasswordEncoder.encode("userPass"))
                         .roles("USER")
                         .build());
  manager.createUser(User.withUsername("admin")
                         .password(bCryptPasswordEncoder.encode("adminPass"))
                         .roles("USER", "ADMIN")
                         .build());
  return manager;
}
```

#### UserDetailsService, PasswordEncoder 자동 설정
```java
@Configuration
public class SecurityConfiguration {

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }
  ...
}
```

#### UserDetailsServiceAutoConfiguration에 의해 InMemoryUserDetailsManager(UserDetailsService) 생성
```java
@Configuration
public class WebSecurityConfig {
  ...
}
```

#### UserDetailsServiceAutoConfiguration가 동작하지 않아 UserDetailsService 생성 X
* UserDetailsService를 사용하지 않고, custom filter에서 인증을 처리하기 위해 UserDetailsServiceAutoConfiguration을 미동작시켜야하는 경우
```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }
}
```

<br><br>

> #### Reference
> * [Spring Security without the WebSecurityConfigurerAdapter](https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter)
> * [Spring Security: Upgrading the Deprecated WebSecurityConfigurerAdapter](https://www.baeldung.com/spring-deprecated-websecurityconfigureradapter)
> * [Spring Security will soon deprecate the configuration class WebSecurityConfigurerAdapter](https://www.springcloud.io/post/2022-02/spring-security-deprecate-websecurityconfigureradapter/#comparison-of-old-and-new-usage-of-authenticationmanager&gsc.tab=0)
