# 모듈과 패키지

## Naming Space or Scope
* 이름이 존재하는 장소
* 파이썬은 `실행 시간`에 각 이름들을 적절한 `이름 공간에 넣어 관리`
* 이름 공간(스코프)의 종류
   * 지역(Local): 각 `함수 내부`
   * 전역(Global): `모듈(파일) 내부`
   * 내장(Built-in): 파이썬 언어 `자체에서 정의한 영역`
* 변수가 정의되는 위치에 의해 스코프가 결정
   * 파이썬에서 변수 정의
      * 변수가 `l-value`로 사용될 때
   * 함수 내에서 정의되면 해당 `함수의 지역변수`가 된다
* 변수가 `r-value`로 사용될 때 해당 변수의 값을 찾는 규칙
*	L -> G -> B

```python
# g, h는 전역 변수
g = 10
h = 5

def f(x):
	h = x + 10  # h, x(local)
	b = h + x + g  # b, x, h(local), g(global)
	return b

f(h)  # f(5)=30. 함수 호출시 사용되는 변수는 해당 위치의 스코프에서 값을 찾음
h  # 5, global 
```

### global 키워드
* 함수 내부에서 전역변수를 직접 사용하고자 할 때
```python
h = 5

def f(x):  # a는 local
	global h  # global variable use
	h = x + 10
	return h

f(10)  # 20
h  # 20, 전역 변수 h값이 함수 내에서 변경되었음
```

### 동일 함수내에서 동일한 변수가 지역, 전역변수로 동시에 활용될 수 없음
* 함수 내에서 정의되는 변수는 지역변수로 간주
* 지역변수로 선언되기 이전에 해당 변수를 사용할 수 없음
```python
# scope error
g = 10

def f():
    x = g  # local variable로써 선언이 되어 있지 않아서 error  
    g = 20
    return x

def f():
    global g  # error resolve1 -> global 사용
    g = 20  # error resolve2 -> local variable로 선언
    x = g  
    g = 20
    return x
```

### 특정 공간의 이름목록 얻기
* Name: 변수(객체) 이름
   * 함수 이름
   * 클래스 이름
   * 모듈 이름
* `dir()`
   * 함수가 호출된 `스코프에서 정의되어 있는 모든 Name`들을 문자열 리스트로 반환
* `dir(object)`
   * `object이 지니고 있는 모든 Name`들을 문자열 리스트로 반환
* 파이썬의 `모든 것은 object`(함수, 객체, 클래스, 인스턴스, 모듈이름 등)
```python
l = []
print dir(l)
```

### Nested Scopes
* 함수안에 정의되어 있는 함수 내부
* 가장 안쪽의 스코프부터 바깥쪽의 스코프쪽으로 변수를 찾는다
```python
x = 2
def f():
	x = 1
	def g():
		print(x)
	g()

f()  # 1
```

## 모듈
* 파이썬 프로그램 파일로서 `파이썬 데이터와 함수등을 정의하고 있는 단위`
* 서로 `연관있는 작업을 하는 코드를 묶어서` `독립성을 유지`하되 `재사용 가능`하게 만드는 단위
* 모듈을 사용하는 측에서는 모듈에 정의된 함수나 변수 이름을 사용
* 모듈의 종류
   * 표준 모듈
      * 파이썬 언어 패키지안에 기본적으로 포함된 모듈
      * 대표적인 표쥰 모듈 예: `math`, `string`
   * 사용자 생성 모듈: 개발자가 직접 정의한 모듈
   * 써드파티 모듈: 다른 업체나 개인이 만들어서 제공하는 모듈
* 모듈이 정의되고 저장되는 곳은 파일
   * 파일: 모듈 코드를 저장하는 물리적인 단위
   * 모듈: 논리적으로 하나의 단위로 조직된 코드의 모임
* 파이썬 모듈의 확장자: `.py`
* 다른곳에서 모듈을 사용하게 되면 해당 모듈의 .py는 바이트 코드로 컴파일 되어 `.pyc`로 존재
* .pyc가 있으면 .py가 없더라도 .pyc를 활용하여 import가능

### module definition
```python
import mymath

dir(mymath)  # mymath에 정의된 이름들 확인. __가 없는 식별자는 평범한 식별자
mymath.mypi  # mymath 안에 정의된 mypi를 이용
mymath.add(1, 10)  
mymath.area(10)  # mymath 안에 정의된 area를 사용

import string
dir(string)  # string에 정의된 이름들을 확인
```

## 함수와 모듈
* 함수: 파일 내에서 일부 코드를 묶는 것
* 모듈: 파일단위로 코드를 묶는 것. 비슷하거나 관련된 일을 하는 함수나 상수값들을 모아서 하나의 파일에 저장하고 추후에 재사용하는 단위
* 모듈 사용의 이점
   * 코드의 재사용
   * 개발시 전체 코드를 모듈 단위로 분리하여 설계함으로써 작업의 효율 증가
   * 이름공간을 제공함으로써 동일한 이름이 각 모듈마다 독립적으로 정의
* 모듈은 하나의 독립된 이름 공간을 확보하면서 정의

### name space
```python
# 1. module
string.a = 1  # string모듈 밖에서 새로운 변수를 정의하여 삽입. 비추
print(string.a)

#2. class, object
class C:
	a = 2
	pass

c = C()  # 클래스 인스턴스 객체 생성
c.a = 1  # instance inner variable
print(c.a)  # 1, instance variable
print(c.__class__.a)  # <class '__main__.C'> class variable
print(C.a)  # 2, class variable

#3. method
# method 안에서 선언된 변수는 밖에서 조작 불가
x = 10
def f():
	a = 1
	b = 2
f.c = 1
print(f.c)  # 1
print(f.a)  #error
```

### module search path
1. in memory에서 import한 것
2. current directory
3. PYTHON PATH
4. 표준 라이브러리 디렉토리들

### example
```python
# code내에서 모듈 검색 경로 확인
import sys
print(sys.path)

# code내에서 모듈 검색 경로 추가
sys.path.append('~/Dev')
print(sys.path)
```

### module import
* import는 코드를 가져오기만 하는 것이 아니라 가져온 코드를 수행

```python
# fibo.py

def generator_list(n):
    result = []
    a, b = 0, 1
    while b < n:
        result.append(b)
        a, b = b, a + b
    return result
```

#### 1. import <module name> -> code run
* 가장 기본적인 형태
   * 이름공간 fibo가 그대로 유지되므로 fibo.generator_list() 형태로 사용
   * `module_name.안에 존재하는 함수(인자)`
```python
import fibo

fibo.generator_list(20)
```

#### 2. from <module name> import <names>
* 해당 모듈에 존재하는 `지정 이름들`을 현재 이름 공간으로 불러들인다
* 불러들인 각 이름들은 `모듈 이름 없이 직접 사용` 가능
* import하는 이름들이 기존에 미리 존재하고 있었다면 그 이름들에 의해 `참조되던 기존 객체들은 상실`
```python
mypi = 3.141592

from mymath import area, mypi

area(5)
mypi
```

#### 3. from <module name> import *
* 해당 모듈에 존재하는 `'__'로 시작되는 이름들을 제외`한 모든 이름들을 현재 이름 공간으로 불러들인다
```python
from mymath import *

area(5)
```

#### 4. import <module name> as <new module name>
* 해당 모듈을 새로운 다른 이름으로 사용하고자 할 때 사용
* 기존 모듈 이름이 너무 길거나 현재 사용중인 다른 이름들과 충돌이 일어날 때 유용
```python
import fibo as f

f
f.generator_list(20)
```

#### 5. from <module name> import <name as new name[, name as new name], ...>
* 해당 모듈 내에 정의된 이름을 다른 새로운 이름으로 사용하고자 할 때 사용
```python
from fibo import generator_list as generator, upper as up

generator(20)
up('abc')
```

### import문은 보통의 문(statement)이 작성될 수 있는 곳이라면 어디에서나 사용 가능
* 함수 정의 def문 안이나 if문 안에서 사용가능
```python
def str_test(s):
	import fibo
	l = fibo.generator_list(20)
	print(l)

str_test('ha ha haa')
```

### import mymath를 수행할 때 발생하는 일
1. mymath.pyc를 찾는다
2. 없다면 mymath.py를 찾아서 mymath.pyc를 생성
3. 생성된 mymath.pyc를 메모리로 읽어들여 수행

### .pyc 파일
* 바이트 코드 파일
   * 기계나 플랫폼(OS)에 의존하지 않도록 만들어진 일종의 Object Code
   * 파이썬은 컴파일 언어이면서 동시에 인터프리터 언어의 수행 방식을 취하고 있다
* 새로운 .pyc 생성에 대한 판단
   * .py수정시간이 .pyc 수정시간보다 더 최근일 때
* .py가 없이도 .pyc만 있어도 import가능
   * 코드를 숨기는 간단한 기법으로 활용

### 모듈 이름과 이미 사용하고 있던 이름이 같다면?
* 이전의 이름이 참조하던 객체는 상실
```python
fibo = "My first string"
import fibo

print(fibo)
```

### 한번 import된 모듈은 메모리에 적재, 나중에 동일 모듈 import시 메모리에 적대된 모듈이 즉시 사용
```python
import string
string.a = 1
string = "My first string"
print(string)

import string
print(string.a)  # string모듈이 기존에 이미 등록되었던 것임을 알 수 있다
```


### `__name__`
* 현재의 모듈이 `최상위 모듈로서 수행`되는지, 아니면 `다른 모듈에 의해 import되어 수행되는지를 구별`하기 위해 주로 사용
* `prname.py`를 직접 수행할 때의 출력 내용: __main__
   * prname.py가 최상위 모듈로서 수행됨을 의미		
* prname.py가 모듈로서 다른 이름 공간으로 import되어질 떄 출력 내용: prname
```python
import fibo

# 모듈이름과 동일한 이름 출력
print(fibo.__name__)  # fibo  

print(__name__)  # __main__
```

> ### `if __name__ == "__main__":` 의 의미
> * 보통 파이썬 모듈을 개발할 때에는 마지막 부분에 if __name__ == "__main__": 과 같은 코드를 추가하여 테스트 코드를 삽입
> ```python
> # fibo.py
> def generator_list(n):
>    result = []
>    a, b = 0, 1
>    while b < n:
>        result.append(b)
>        a, b = b, a + b
>    return result
>
> def f():
>    print("Python is becoming popular")
>
>
> if __name__ == "__main__":  # test 가능
>    print(generator_list(20))
>    f()
>
> # main.py
> # 아래 코드는 최상위 모듈로서 수행될 때에만 test() 호출이 일어난다.
> import fibo
>
> print fibo.generator_list(20)
> ```

## Package
* `여러 모듈들을 한데 묶어서 정리`해 놓은 구조
* 물리적으로 `여러 모듈 파일을 모아 놓은 디렉토리`에 해당
   * `최상위 디렉토리 이름이 패키지 이름`이 된다
   * 최상위 디렉토리 하위에 여러 서브 디렉토리는 해당 최상위 패키지의 하위 패키지가 된다

### `__init__.py`
* 디렉토리를 `패키지로 인식`시키는 역할

### package import
```python
import pack1.HMM
pack1.HMM.train()
```

### package module import
```python
from pack1 import HMM
HMM.train()

from pack1.HMM import train
train()

from pack1.HMM import *
train()
loadModel()
saveModel()
```
