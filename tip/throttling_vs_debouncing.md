# [Tip] Throttling vs Debouncing
> date - 2019.08.12  
> keyworkd - performance, throttling, debouncing  
> UI 라이브러리(프레임워크), network traffic control middleware 등에서 성능을 위해 사용되는 테크닉인 throttling과 debouncing에 대해 알아보자

<br>

## Throttling
* 마지막 event를 처리한 후 일정 시간(delay)이 지나기 전에 다시 처리하지 않도록 한다
* **Filtering**을 통해 일정 시간안에 발생한 event를 무시해 **일정한 주기마다 event를 처리**하는 방식

<br>

### use case
* 트랜잭션을 처리하는 middleware
* network traffic을 제어하는 middleware
* web frontend 등 client의 UI Layer
  * infinite scrolling - 스크롤의 마지막에 도달했는지 확인하기 위해 스크롤 이벤트를 받아 계산해야 하는데 매번 계산한다면 부하가 크므로 성능을 위해 강제로 계산 주기를 조절한다

<br>

### Example
* Python
```python
last_call = 0

def throttle(event, delay):
    if datetime.now - last_call > delay:
        print "Event trigger"
        last_call = datetime.now
    else:
        print "Event dismiss"
```

* Javascript
```js
// ES6
function throttled(delay, fn) {
    let lastCall = 0;
    return function (...args) {
        const now = (new Date).getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn(...args);
    }
}

// usage
const myHandler = (event) => // do something with the event
const tHandler = throttled(200, myHandler);
domNode.addEventListener("mousemove", tHandler);
```


<br>

## Debouncing
* Event를 **Grouping**하여 **일정 시간이 지난 후 하나의 event만 처리**하도록 한다
* 연속으로 발생하는 event 중 처음(or 마지막) event만 처리하도록 하는 것
  * `Leading Edge` - event의 기준이 처음
* 먼저 발생한 event의 처리를 대기하는 중 새로운 event가 발생하면 이전 event를 취소하고, 새로운 event를 기준으로 다시 대기

<br>

### use case
* API 요청이 있는 자동 완성 기능에서 매 입력마다 발생하는 키보드 이벤트에 대해 API 요청을 대기하고 완성된 단어에 대해 API 요청

<br>

### Example
* Python
```python
def handler:
    print "Event trigger"

timer = Timer(10, handler)
def debounce(event, delay):
    timer.cancel()
    timer.start()
```

* Javascript
```js
// ES6
function deounced(delay, fn) {
    let timerId;
    return function (...args) {
        if(timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    }
}

// usage
const myHandler = (event) => // do something with the event
const dHandler = deounced(200, myHandler);
domNode.addEventListener("input", dHandler);
```


<br>

## Conclusion
* throttling과 debouncing의 결과는 비슷하지만 방식의 차이가 있으므로 적절히 적용하는게 중요
* throttling은 적어도 일정 시간마다 정기적인 실행이 보장되지만, debouncing은 일정 시간동안 발생한 수많은 이벤트 중 1번만 실행된다

<br><br>

> #### Reference
> * [Throttling and debouncing in JavaScript](https://codeburst.io/throttling-and-debouncing-in-javascript-646d076d0a44)
