# [Set up Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html)
* 여기에는 Elasticsearch를 설정하고 실행에 대한 정보가 있다
  * Downloading
  * Installing
  * Starting
  * Configuring

<br>

## Supported platforms
* [Support Matrix](https://www.elastic.co/support/matrix)에서 officially supported OS & JVM 확인


<br>

## Java(JVM) Version
* Elasticsearch는 Java를 사용하고, package에 bundle되어 제공
* Bundled JVM은 recommanded version이며, Elasticsearch home의 `jdk` directory에 있다
* Custom JVM을 사용하려면 `JAVA_HOME` 환경 변수 설정
  * LTS version 권장
