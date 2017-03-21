# Optimizing for Doze and App Standby

> 백그라운드 서비스로 위치정보르 받아오는 기능을 구현하는

## Android 6.0 마시맬로우(API 23)에서 추가된 절전모드
1. Doze(잠자기 모드)
   * 기기를 오랫동안 사용하지 않는 경우 앱의 백그라운드 CPU 및 네트워크 기능을 지연시켜 배터리 소모량을 줄인다
2. App Standby(앱 대기 모드)
   * 최근 사용자와 상호작용이 없는 앱의 백그라운드 네트워크 기능 지연

## Doze
* `네트워크, CPU 사용량`이 많은 서비스에 `액세스를 제한`하여 배터리 절약
* 네트워크에 액세스하지 못하도록 하고 `작업, 동기화 및 표준알람`을 지연

![doze](https://github.com/opklnm102/study/blob/master/android/images/doze.PNG)

### maintenance window
* 유지관리 기간
* 지연된 작업를 완료할 수 있도록 주기적으로 잠깐 동안 Doze를 종료 
* 유지관리 기간 동안 시스템은 `보류 중인 동기화, 작업 및 알람을 모두 실행`하고 앱이 네트워크에 액세스할 수 있도록 허용
* 유지관리 기간이 끝나면 시스템이 다시 Doze로
* 배터리 소모량 감소를 위해 `시간이 지날수록 유지관리 기간의 횟수를 줄임`

### Doze로 들어가는 조건
* 충전 중X
* 디스플레이 Off
* 일정시간 동안 움직이지 않는 경우

### 제한되는 기능
* 네트워크 연결
* 시스템은 `wake locks`를 무시
* 표준 `AlarmManager`알람(setExact(), setWindow() 포함)은 다음 유지관리 기간으로 연기
   * Doze에서 실행하려면 `setAndAllowWhileIdle()`, `setExactAndAllowWhileIdle()`를 사용
   * `setAlarmClock()`으로 설정된 알람은 정상 실행 -> 알람실행 직전에 Doze 종료 
* Wi-Fi 스캔
* `SyncAdapte` 실행
* `JobScheduler` 실행
* GPS 스캔

### Doze에 최적화
* 대부분의 앱은 정상작동
* AlarmManager알람, 타이머가 관리하는 작업
   * `setAndAllowWhileIdle()`, `setExactAndAllowWhileIdle()`를 사용
      * 9분마다 최대 1번만 실행 가능
* 실시간 메시지를 사용하는 경우 `FCM`을 사용
* Doze에서 예상대로 작동하는지 확인하려면 adb명령어를 사용

### Doze 검사 목록
* 가능하면 다운스트림 메시징에 FCM 사용
* 사용자가 즉시 알림을 확인해야 하는 경우 `FCM high priority message`
* 이후에 네트워크 액세할 필요가 없도록 초기 메시지 페이로드에 충분한 정보 제공
* 중요한 알람은 `setAndAllowWhileIdle()`, `setExactAndAllowWhileIdle()` 사용
* [Doze에서 앱 테스트](https://developer.android.com/training/monitoring-device-state/doze-standby.html?hl=ko#testing_doze)

## AppStandby

### AppStandby로 들어가는 조건
* 사용자가 명시적으로 `앱을 실행하지 않을 때`
* 앱에 `Foreground Service`가 없을 때
* `Notification`을 생성하여 잠금화면, 알림 트레이에서 확인하지 않을 때

### AppStandby일때 앱과의 상호작용에 FCM사용
* `FCM high priority message`를 사용해 AppStandby에서 나온다
   * 시스템은 메시지를 제공하고 네트워크 서비스 및 부분 wake locks에 `일시적으로 액세스` 가능하게 한다
   * Doze에 영향을 주지않고, 다른앱의 상태에도 영향을 주지 않는다

> #### FCM(Firebase Cloud Messaging)
> * FCM은 클라우드에서 기기로 푸시하는 서비스
> * 클라우드와의 영구적 단일 연결 제공

### 제외 목록에 추가
* Doze, AppStandby에서 네트워크와 [Partial Wake Lock](https://developer.android.com/reference/android/os/PowerManager.html?hl=ko#PARTIAL_WAKE_LOCK) 사용 가능
* [isIgnoringBatteryOptimizations()](https://developer.android.com/reference/android/os/PowerManager.html?hl=ko#isIgnoringBatteryOptimizations(java.lang.String))를 사용해 제외 목록에 있는지 확인
* [ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS](https://developer.android.com/reference/android/provider/Settings.html?hl=ko#ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS) 인텐트를 사용하여 사용자가 추가할 수 있게 Battery Optimization으로 이동 가능
* [REQUEST_IGNORE_BATTERY_OPTIMIZATIONS](https://developer.android.com/reference/android/Manifest.permission.html?hl=ko#REQUEST_IGNORE_BATTERY_OPTIMIZATIONS) 권한을 보유한 앱은 [ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS](https://developer.android.com/reference/android/provider/Settings.html?hl=ko#ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS) 인텐트를 사용해 시스템 대화상자를 트리거하여 사용자가 바로 앱을 제외목록에 추가할 수 있다

## 테스트

### Doze 실행
```sh
$ adb shell dumpsys battery unplug
$ adb shell dumpsys deviceidle step  # 2번이상 실행해야 할 수 있다
```

### AppStandby 실행
```sh
$ adb shell dumpsys battery unplug
$ adb shell am set-inactive <package name> true

# 활성화
$ adb shell am set-inactive <package name> false
$ adb shell am get-inactive <package name>
```

## 음악 스트리밍 서비스 Issue
* 화면이 꺼져있고, 배터리 사용중, 오랜시간 움직임이 없는 동안에도 네트워크 연결을 지속해야 하는 경우
* `foreground service`로 동작하고 있는 동안 앱은 Doze 중에도 네트워크를 사용 가능

### Top Sleeping Importance 버그
* Android 프로세스는 내부에 동작하는 컴포넌트에 따라 [RunningAppProcessInfo](https://developer.android.com/reference/android/app/ActivityManager.RunningAppProcessInfo.html)를 가진다
   * `IMPORTANCE_FOREGROUND` - 현재 사용자가 사용 중인(onResume()) 액티비티를 갖고 있는 프로세스(중요도 100) 
   * `IMPORTANCE_FOREGROUND_SERVICE` - Foreground Service가 동작 중인 프로세스(중요도 125)
   * `IMPORTANCE_TOP_SLEEPING` - 최상단에 위치하는 액티비티를 포함하고 있지만, 화면이 꺼져서 더 이상 해당 액티비티가 사용자에게 보이지 않는 경우(중요도 150)
* Foreground Service로 동작 중인 앱이 동시에 Foreground Activity를 갖고 있는 경우 문제!
   * 화면이 꺼지면 `IMPORTANCE_FOREGROUND` -> `IMPORTANCE_FOREGROUND_SERVICE`가 되야 하지만 `IMPORTANCE_TOP_SLEEPING`이 된다 -> 버그

### 올바른 해결책
* Foreground Service를 별도의 프로세스로 분리해서 구현
* 매니페스트의 `process 속성`을 명시적으로 지정
* Doze와 별개로 음악 스트리밍 서비스처럼 점유하는 메모리의 크기가 크고, UI요소와 관계없이 안정적으로 동작해야 하는 애플리케이션 컴포넌트가 있는 경우
   * 해당 컴포넌트를 별도의 프로세스로 분리하면 좋다
   * 별개의 Heap 영역 할당, OutOfMemoryException도 효과적으로 방지
   * IPC(Inter Process Communication)를 구현
      * Intent와 Broadcast 조합
      * Handler
      * AIDL

### 빠른 해결책

#### 1. Doze모드 집입 시 앱을 백그라운드로 옮기기
* 현재 Foreground Service가 동작하고 있는 애플리케이션을 백그라운드로 옮기기
   * 프로세스 중요도가 `FOREGROUND_SERVICE`로 조정됨
* 구현이 간단
* 사용중인 앱이 `임의로 백그라운드`로 옮겨지는 문제

##### 서비스 시작시 Doze 상태 변화를 수신하는 리시버 구현
1. `ACTION_DEVICE_IDLE_MODE_CHANGE` 브로드캐스트 인텐트 수신하는 리시버 구현
2. onReceive()에서 `PowerManager.isDeviceIdleMode()`로 Doze여부 확인
3. Doze로 진입시 홈 런처 애플리케이션을 호출하고, 기존 애플리케이션이 백그라운드로 옮겨지게 함
```java
Intent startMain = new Intent(Intent.ACTION_MAIN);
startMain.addCategory(Intent.CATEGORY_HOME);
startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
context.startActivity(startMain);
```

#### 2. 별도 프로세스에서 동작하는 MaskActivity 활용하기
* 별도의 프로세스로 동작하는 빈 액티비티 하나 선언
   * 화면X
```xml
<activity 
    android:name=".MaskActivity"
    android:process="com.example.dozetester.empty"/>
```
* Doze상태 변화를 감지하는 리시버 등록
* Doze로 진입할 때 위에 선언한 MaskActivity 실행
   * 해당 액티비티를 갖고 있는 별개의 프로세스가 `TOP_SLEEPING` 중요도를 갖게되고, 기존 Foreground Service를 갖고있던 프로세스는 Foreground Activity를 갖고 있지 않기 때문에, 중요도가 `FOREGROUND_SERVICE`로 유지
* Doze에서 벗어나는 이벤트를 수신하여 MaskActivity를 종료


> #### 참고
> [Optimizing for Doze and App Standby](https://developer.android.com/training/monitoring-device-state/doze-standby.html?hl=en#understand_app_standby)  
> [Doze와 Foreground Service - Top Sleeping Importance 버그 회피하기](https://brunch.co.kr/@huewu/3)  
