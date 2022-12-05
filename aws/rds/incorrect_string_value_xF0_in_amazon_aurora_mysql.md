# [AWS] Incorrect string value: '\xF0...' in Amazon Auroa MySQL
> date - 2022.12.06  
> keyworkd - rds, aurora, mysql, jdbc, spring, mariadb java client  
> Amazon Aurora MySQL을 mariadb-java-client로 접근시 이모지 저장시 발생하는 에러에 대해 정리  

<br>

## Requirement

### Dependency
* [Spring Boot 2.x](https://spring.io/projects/spring-boot)
* Spring Data JPA
* [mariadb-java-client 2.7.6](https://mariadb.com/kb/en/mariadb-connector-j-276-release-notes)
* [Amazon Aurora MySQL](https://docs.aws.amazon.com/ko_kr/AmazonRDS/latest/AuroraUserGuide/Aurora.AuroraMySQL.Overview.html)


<br>

## Issue
* table, column의 character set은 utf8mb4로 설정되어 있는데 이모지 저장 불가
```java
(conn=50379728) Incorrect string value: '\xF0\x9F\x87\xA6\xF0\x9F...' for column 'data' at row 1
org.springframework.orm.jpa.JpaSystemException: could not execute statement; nested exception is org.hibernate.exception.GenericJDBCException: could not execute statement
at org.springframework.orm.jpa.vendor.HibernateJpaDialect.convertHibernateAccessException(HibernateJpaDialect.java:351)
at org.springframework.orm.jpa.vendor.HibernateJpaDialect.translateExceptionIfPossible(HibernateJpaDialect.java:253)
...
```

* DB의 character set도 utf8mb4로 확인
```sql
show global variables
```
| Variable name | Value |
|:--:|:--:|
| character_set_client | utf8mb4 |
| character_set_connection | utf8mb4 |
| character_set_database | utf8mb4 |
| character_set_filesystem | binary |
| character_set_results | utf8mb4 |
| character_set_server | utf8mb4 |
| character_set_system | utf8 |
| collation_connection | utf8mb4_general_ci |
| collation_database | utf8mb4_general_ci |
| collation_server | utf8mb4_general_ci |


<br>

## Why?
* UTF-8은 4byte 가변 길이 인코딩이지만 MySQL에서는 3byte로 구현되어 4byte인 이모지를 처리할 수 없기 때문에 MySQL에서는 utf8mb4을 사용해야한다  
* DB의 모든 설정이 utf8mb4로 되어있음에도 이모지를 처리할 수 없는 이슈가 발생하여 원인을 찾아보자

<br>

### JDBC parameter를 비교

#### useUnicode=true&characterEncoding=utf8
| Variable name | Value |
|:--:|:--:|
| character_set_client | utf8 |
| character_set_connection | utf8 |
| character_set_database | utf8mb4 |
| character_set_filesystem | binary |
| character_set_results | utf8 |
| character_set_server | utf8mb4 |
| character_set_system | utf8 |
| collation_connection | utf8_general_ci |
| collation_database | utf8mb4_general_ci |
| collation_server | utf8mb4_general_ci |

#### useUnicode=true&characterEncoding=utf8mb4
| Variable name | Value |
|:--:|:--:|
| character_set_client | utf8 |
| character_set_connection | utf8 |
| character_set_database | utf8mb4 |
| character_set_filesystem | binary |
| character_set_results | utf8 |
| character_set_server | utf8mb4 |
| character_set_system | utf8 |
| collation_connection | utf8_general_ci |
| collation_database | utf8mb4_general_ci |
| collation_server | utf8mb4_general_ci |

#### default parameter
| Variable name | Value |
|:--:|:--:|
| character_set_client | utf8 |
| character_set_connection | utf8 |
| character_set_database | utf8mb4 |
| character_set_filesystem | binary |
| character_set_results | utf8 |
| character_set_server | utf8mb4 |
| character_set_system | utf8 |
| collation_connection | utf8_general_ci |
| collation_database | utf8mb4_general_ci |
| collation_server | utf8mb4_general_ci |

#### sessionVariables=character_set_client=utf8mb4,character_set_results=utf8mb4
| Variable name | Value |
|:--:|:--:|
| character_set_client | utf8mb4 |
| character_set_connection | utf8 |
| character_set_database | utf8mb4 |
| character_set_filesystem | binary |
| character_set_results | utf8mb4 |
| character_set_server | utf8mb4 |
| character_set_system | utf8 |
| collation_connection | utf8_general_ci |
| collation_database | utf8mb4_general_ci |
| collation_server | utf8mb4_general_ci |


#### Result
| JDBC parameter | 이모지 처리 여부 |
|:--:|:--:|
| useUnicode=true&characterEncoding=utf8 | X<br>(현재 사용 중인 옵션) | 
| useUnicode=true&characterEncoding=utf8mb4 | X |
| default parameter | X |
| sessionVariables=character_set_client=utf8mb4,character_set_results=utf8mb4 | O |

* character_set_client, character_set_results에 영향을 받는 것을 확인
* character_set_client가 utf8로 설정되어 발생하는 에러로 MySQL Connector/J와 다르게 MariaDB Connector/J는 `characterEncoding` parameter가 동작하지 않는다
* MariaDB Connector/J의 default character set은 utf8로 `sessionVariables`로 지정해주지 않으면 character set이 변경되지 않는다

<br>

### Amazon RDS parameter group 설정 확인
| Variable name | Value |
|:--:|:--:|
| character_set_client | utf8mb4 |
| character_set_connection | utf8mb4 |
| character_set_database | utf8mb4 |
| character_set_filesystem | binary |
| character_set_results | utf8mb4 |
| character_set_server | utf8mb4 |
| character_set_system | utf8 |
| collation_connection | utf8mb4_general_ci |
| collation_database | utf8mb4_general_ci |
| collation_server | utf8mb4_general_ci |
| skip-character-set-client-handshake | 0 |

<br>

> #### skip-character-set-client-handshake
> * Ignore character set information sent by the client(client의 character set을 무시하고 DB의 character set 사용)


<br>

## Resolve
1. 불필요한 useUnicode=true, characterEncoding=utf8 parameter 제거
2. JDBC parameter에 `sessionVariables=character_set_client=utf8mb4,character_set_results=utf8mb4,character_set_connection=utf8mb4,collation_connection=utf8mb4_general_ci` 사용 or Amazon RDS parameter group에서 `skip-character-set-client-handshake`를 활성화하여 DB character set을 사용


<br>

## Conclusion
* MySQL 8.0부터 default character set이 utf8mb4로 되었고, 이모지 처리에 이슈가 없으려면 처음부터 utf8mb4를 사용하는게 좋겠다


<br><br>

> #### Reference
> * [Best practices for configuring parameters for Amazon RDS for MySQL, part 3: Parameters related to security, operational manageability, and connectivity timeout](https://aws.amazon.com/ko/blogs/database/best-practices-for-configuring-parameters-for-amazon-rds-for-mysql-part-3-parameters-related-to-security-operational-manageability-and-connectivity-timeout)
