# Ble(Bluetooth Low Energy) 
1. centeral mode
   * 주변기기에서 쏜 advertising packet을 받는다
2. peripheral mode
   * 주변기기에 advertising packet을 쏜다
   * `롤리팝(API20)`부터 가능
   * HW spec에 따라 사용 못하기도함

## concurrent advertisements
* Advertising packet에 원하는 데이터를 각각의 분리된 packet으로 송출

## peripheral advertising latency balancing
* advertising packet이 얼마나 자주 송출할지 결정
* packet 전송 주기가 짧을수록 베터리 소모 증가, 장치 발견율 상승
* 롤리팝에서는 advertising의 속도와 저젼력, 응답속도의 적절한 밸런싱을 한다

## Background로 실행되는 BLE Scanning Issue
1. Scanning이 베터리를 굉장히 빠르게 소모하는 과정
   * android는 대기모드가 해제되고, 베터리를 소모
   * `롤리팝(API20)`부터 Scanning을 하위 레이어로 내려서 실행하고 대기모드로 들어갈 수 있도록 변경
      * 사용자가 Bluetooth를 사용하지 않더라도 꺼둘 필요가 없게 변경
2. android가 슬립 상태여도 주변장치는 advertising 패킷을 쏜다
   * 불필요한 데이터라도 앱이 깨어나서 패킷을 확인해야함
   * 필터를 사용해서 처리
   * 특정 포맷, 데이터와 매칭되는 패킷이 왔을 때만 깨어날 수 있다

## 가이드 라인
1. 원하는 기기 발견시 Scanning을 멈춘다
2. Scan시 `루프를 돌리지 않는다`
3. Scanning과정에 `time limit`를 준다

## Background Ble Scanning 구현
1. Service
2. device sleep을 대비해 WakeLock permisssion
3. Doze mode 대응

> 서로 다른 기능들을 가진 다양한 칩셋들을 사용하기 때문에 통합적용되지 않는다
> Android 플랫폼상으로 이전 버전과 큰차이가 있다

![ble](https://github.com/opklnm102/study/blob/master/android/images/ble.PNG)

## Example
```java
private BluetoothLeScanner mLeScanner;
public static final long SCAN_PERIOD = 10000;  // 10s

private void scanLeDevice(final boolean enable) {
        if (enable) {
            // Stops scanning after a pre defined scan period
            mHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    if (Build.VERSION.SDK_INT < 21) {
                        mBluetoothAdapter.stopLeScan(mLeScanCallback);
                    } else {
                        mLEScanner.stopScan(mScanCallback);
                    }
                }
            }, SCAN_PERIOD);

            if (Build.VERSION.SDK_INT < 21) {
                mBluetoothAdapter.startLeScan(mLeScanCallback);
            } else {
                mLEScanner.startScan(filters, settings, mScanCallback);
            }
        } else {
            if (Build.VERSION.SDK_INT < 21) {
                mBluetoothAdapter.stopLeScan(mLeScanCallback);
            } else {
                mLEScanner.stopScan(mScanCallback);
            }
        }
    }
```

### ScanFilter는 다음항목에 기반해서 스캔된 장치들을 거른다
* Service UUIDs which identify the Bluetooth GATT services running on the device.
* Name of remote Bluetooth LE device.
* Mac address of the remote device.
* Service data which is the data associated with a service.
* Manufacturer specific data which is the data associated with a particular manufacturer.

> #### 참고
> [Bluetooth Low Energy](https://developer.android.com/guide/topics/connectivity/bluetooth-le.html#connect)  
> [Android 5.0 Lollipop brings BLE Improvements](http://www.argenox.com/blog/android-5-0-lollipop-brings-ble-improvements/)  
> [BLE기기를 검색할 때 유의할 점](http://fortune94.tistory.com/325)  
> [How to do background scan for BLE devices?](http://stackoverflow.com/questions/34759328/how-to-do-background-scan-for-ble-devices)  
> [Android BLE Passive scan](http://stackoverflow.com/questions/24994776/android-ble-passive-scan)  

