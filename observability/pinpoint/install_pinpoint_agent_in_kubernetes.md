# [Pinpoint] Install pinpoint agent in kubernetes
> date - 2021.12.08  
> keyworkd - kubernetes, apm, pinpoint  
> kubernetes 환경에서 pinpoint agent를 설치하는 방법을 정리  
> 아래 내용은 다양한 agent 설치시 활용할 수 있다  

<br>

총 3가지 방법을 소개해보려고한다
* build time
  * binary를 download 후 Dockerfile COPY
  * Dockerfile에서 image build시 download
* run time
  * init container 사용


<br>

## 1. binary를 미리 다운로드 후 build time에 COPY
* project에 binary를 다운로드
```sh
.
├── pinpoint
...
└── Dockerfile
```

* Dockerfile에서 COPY
```dockerfile
...
# Install Pinpoint
COPY pinpoint /app/pinpoint
...
```

* `entrypoint`에서 설정 수정
```sh
...
# Install Pinpoint
if [ "${PINPOINT_AGENT_ENABLED}" == "true" ]; then
  JAVA_OPTS="${JAVA_OPTS} -javaagent:pinpoint-agent/pinpoint-bootstrap.jar"
  JAVA_OPTS="${JAVA_OPTS} -Dpinpoint.agentId=$(echo ${HOSTNAME: -16} | sed 's/^-//')"
  JAVA_OPTS="${JAVA_OPTS} -Dpinpoint.agentName=${HOSTNAME}"
  JAVA_OPTS="${JAVA_OPTS} -Dpinpoint.applicationName=${PINPOINT_APP_NAME}"

  sed -i "/profiler.sampling.rate=/ s/=.*/=20/" pinpoint-agent/profiles/release/pinpoint.config
  ...
fi

...
exec java ${JAVA_OPTS} -jar app.jar "$@"
```


<br>

## 2. build time에 download
* 1번 방법에서 `Dockerfile` 내용만 다르다
```dockerfile
...
ARG PINPOINT_VERSION=${PINPOINT_VERSION:-2.3.1}

# Install Pinpoint
RUN curl -LsS -o pinpoint-agent.tar.gz https://github.com/pinpoint-apm/pinpoint/releases/download/v${PINPOINT_VERSION}/pinpoint-agent-${PINPOINT_VERSION}.tar.gz \
    && tar xzvf pinpoint-agent.tar.gz \
    && mv pinpoint-agent-${PINPOINT_VERSION} pinpoint-agent \
    && rm -rf pinpoint-agent.tar.gz \
    && sed -i "/profiler.sampling.rate=/ s/=.*/=20/" pinpoint-agent/profiles/release/pinpoint.config  # Dockerfile or entrypoint에서 실행
...
```


<br>

## 3. init container 사용

```yaml
initContainers:
  - name: init-pinpoint-agent
    image: busybox
    command:
      - /bin/sh
      - '-c'
      - >
        cd pinpoint \
        && curl -LsS -o pinpoint-agent.tar.gz https://github.com/pinpoint-apm/pinpoint/releases/download/v${PINPOINT_VERSION}/pinpoint-agent-${PINPOINT_VERSION}.tar.gz \
        && tar xzvf pinpoint-agent.tar.gz \
        && mv pinpoint-agent-${PINPOINT_VERSION} pinpoint-agent \
        && rm -rf pinpoint-agent.tar.gz \
        && sed -i "/profiler.sampling.rate=/ s/=.*/=20/" pinpoint-agent/profiles/release/pinpoint.config \
        && sed -i "/profiler.collector.ip=/ s/=.*/=collector.example.com/" pinpoint-agent/profiles/release/pinpoint.config \
        && sed -i "/profiler.transport.grpc.collector.ip=/s/=.*/=collector.example.com/" pinpoint-agent/profiles/release/pinpoint.config
    env:
      - name: PINPOINT_VERSION
        value: "2.3.1"
    volumeMounts:
      - mountPath: /pinpoint
        name: pinpoint-volume
containers:
  - name: application
    ...
    command: ["java", "${JAVA_OPTS}", "-jar", "app.jar"]
    env:
      - name: PINPOINT_APP_NAME
        valueFrom:
          fieldRef:
            fieldPath: metadata.labels.app
      - name: JAVA_OPTS
        value: >-
          -javaagent:/pinpoint/pinpoint-agent/pinpoint-bootstrap.jar
          -Dpinpoint.agentId=$(echo ${HOSTNAME: -16} | sed 's/^-//')
          -Dpinpoint.agentName=${HOSTNAME}
          -Dpinpoint.applicationName=${PINPOINT_APP_NAME}
    volumeMounts:
      - mountPath: /pinpoint
        name: pinpoint-volume
  volumes:
    - name: pinpoint-volume
      emptyDir: {}
```


<br><br>

> #### Reference
> * [DanPerovich/new-relic-java-apm-k8s-init-practice - GitHub](https://github.com/DanPerovich/new-relic-java-apm-k8s-init-practice)
