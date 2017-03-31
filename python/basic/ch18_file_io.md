# 파일 입출력
* File I/O: 파일을 `열어서 읽고, 쓰고, 덧붙이는` 방법
   * `open(filename, mode)`: filename이름을 지닌 file객체를 얻는다
   * file객체에서 자료를 읽거나, 쓰거나, 덧붙이는 작업 수행
* 모든 작업이 끝나면 `close()`를 호출하여 작업 프로세스의 자원 점유 해제
* mode
   * r - 읽기 모드, 파일포인터를 처음 위치에
   * w - 쓰기 모드, 없으면 생성, 존재하면 기존 내용지우고 연다. 파일 포인터를 처음 위치에
   * a - 추가 모드, 없으면 생성, 존재하면 기존 내용 뒤에. 파일 포인터를 마지막 위치에
   * rb, wb, ab - 이진파일(일반 파일보다 크기가 작음)

## 파일 입출력 기본
```python
import os

print(os.getcwd())  # cwd(current working directory

s = """Its power: Python developers typically report
they are.
zzzzz
fdfd
fdfd"""
f = open('t.txt', mode='w')
type(f)  # <class '_io.TextIOWrapper'>

f.write(s)  # 문자열을 파일에 기록
f.close()  # 파일이 점유하던 자원 해제, 호출하지 않으면 다른 값으로 치환 or 프로그램 종료시 자동으로 호출, 명시적 호출 권장

f = open('t.txt', mode='r')
s = f.read()
print(s)
```

> ### 자동으로 열고 닫기
> * 매번 파일을 열고 닫는것이 귀찮은 경우 파일관리를 하는 컨텍스트 매니저 사용
> * 자동으로 열고 닫고 수행
> ```python
> with open('t.txt', 'a') as test:
>     test.write('\n with test \n')
> ```


## Line단위로 File Read

### 1. iterator(반복자)
* 라인별로 내용을 읽어오도록 설정되어 있음
* 라인별로 읽는 방법 중 제일 효과적
```python
f = open('t.txt', mode='r')
idx = 1
for line in f:
    print(idx, ':', line)
    idx += 1
f.close()
```

### 2. readline()
* 현재 파일포인터에서 개행문자까지 `한번에 한줄씩` 읽는다
```python 
f = open('t.txt', mode='r')
line = f.readline()
idx = 1
while line:
    print(idx, ':', line)
    line = f.readline()
    idx += 1
f.close()
```

### 3. readlines()
* `파일 전체를 라인단위로` 끊어서 메모리에 리스트로 저장
* 메모리 비효율적 사용
```python
f = open('t.txt', mode='r')
print(f.readlines())  # 파일포인터가 마지막에 위치하게됨

f.seek(0)  # 파일포인터 처음으로 이동
idx = 1
for line in f.readlines():
    print(idx, ':', line)
    idx += 1
f.close()
```

## Line단위로 File Write

### 1. writelines()
* 리스트 안에 있는 문자열을 연속해서 파일로 출력
```python
lines = ['first line\n', 'second line\n', 'third line\n']  # \n필히 넣어줌

f = open('t.txt', mode='w')
f.writelines(lines)
f.close()

f = open('t.txt', mode='r')
print(f.read())
f.close()
```

### 2. write()
```python
lines = ['first line', 'second line', 'third line']
f = open('t.txt', 'w')
f.write('\n'.join(lines))
f.close()

f = open('t1.txt')
print f.read()
f.close()
```

> ### 텍스트 파일 t.txt의 단어(공백으로 분리된 문자열) 수를 출력하는 방법
> ```python
> f = open('t.txt')
> s = f.read()
> n = len(s.split())  # 공백문자를 기준으로 짤라 list화
> print(n)
> f.close()
> ```

## 기존 파일에 파일 내용 추가
```python
file_name = 't.txt'

f = open(file_name, mode='w')  # 파일 생성
f.write('first line\n')
f.write('second line\n')
f.close()

f = open(file_name,mode='a')  # 추가모드로 열기
f.write('third line\n')
f.close()

f = open(file_name, mode='r')
print(f.read())
```

## File Pointer Random Access(파일 내 임의 위치 접근)
* file pointer
   * 파일 내에서 현재 위치를 가리키고 있음
* 파일접근 방법
   * 순차접근(기본) - 앞에서 부터 순차적으로 읽고 쓰는 방식
   * 임의접근 - 임의 위치에서 읽고 쓰는 방식
      * 임의 접근을 위한 file pointer 관련 메소드
      * `seek(n)` - 첫번째 위치에서 n번째 바이트로 포인터 이동
      * `tell()` - 현재 포인터 위치 반환
```python
file_name = 't.txt'

f = open(file_name, mode='w+')  # w+(=rw)
s = 'abcdefghijs'
f.write(s)

f.seek(5)  # 5byte move
print(f.tell())  # 5, current pointer
print(f.read(1))  # f, one character read
print(f.tell())  # 6
```

## redirection
* sys모듈의 표준 입출력 관련 객체
   * `sys.stdout`: 표준 출력
   * `sys.stderr`: 표준 에러 출력
   * `sys.stdin`: 표준 입력

### example

#### 1. `sys.stdout`을 파일 객체로 변환하면 모든 표준출력은 해당 파일로 저장
```python
import sys

file_name = 't.txt'

f = open(file_name, mode='w')
stdout = sys.stdout  # stdout store
sys.stdout = f  # redirection
print('Sample output')
print('Good')
print('Good')
f.close()
sys.stdout = stdout  # stdout restore
```

#### 2. print를 직접 이용하여 출력을 다른 객체로 전환하기
```python
# 표준출력(print)을 표준 에러로 출력
print("Warning, action field not supplied", file=sys.stderr)

# print를 파일에 출력
f = open(file_name, mode='w')
print('spam string', file=f)
f.close()

# 확인
f = open(file_name, mode='r')
print(f.read())
f.close()
```

## io모듈의 StringIO클래스
* 문자열을 자기가 받고 내보낼 수 있는 파일객체와 비슷한 객체
* 파일객체처럼 I/O가능한 문자열 객체
* StringIO에 지원되는 메소드는 파일객체가 지원하는 메소드와 거의 동일
* `getvalue()` - 현재까지 담아놓은 전체 내용반환
```python
import io

# 메모리에 존재하는 특정 영역
f = io.StringIO()
f.write("abc")
f.seek(0)
s = f.read()
print(s)

s2 = f.getvalue()  # 전체 내용 반환
print(s2)


stdout = sys.stdout  # 표준 출력 저장
sys.stdout = f = io.StringIO()  # 파일이 아니라 StringIO객체

print(type(f))  # <class '_io.StringIO'>
print('Sample output')
print('Good')
print('Good')

sys.stdout = stdout

s = f.getvalue()
print(s)
```

## Persistence(지속성, 영속성)
* 프로그램 내에 생성된 각종 객체들을 해당 프로그램 종료 이후에도 존재하게 만들고, 그것들을 동일한 또는 다른 프로그램에서 사용하는 기능
* 객체는 메모리에 존재 -> 종료시 삭제됨
* Persistence를 지원하는 모듈
   * DBM관련 모듈
      * anydbm, dbm, gdbm, dbhash, dumbdbm
      * anydbm: 시스템에서 사용가능한 모듈 중 가장 최적의 모듈 반환
         * 기본적으로 dumbdbm반환
         * 사전과 동일한 방법으로 사용
   * pickle 모듈 -> 좀더 일반적
      * 파이썬의 객체를 저장하는 일반화된 영속성 모듈
      * 기본 객체뿐만 아니라 사용자 정의 객체도 저장
      * 텍스트(default), 이진 모드로 저장 가능
      * `pickle.dump(저장하고자 하는 객체, 저장하는 위치)`
      * `pickle.load(저장했던 위치)` - 저장했던 객체 불러옴
```python
import pickle

phone = {'tom': 4343, 'jack': 43434, 'jim': 4343}
l = ['string', 43433, 0.4343]
t = (phone, l)

file_name = 'pickle.txt'

f = open(file_name, mode='wb')
pickle.dump(t, f)  # file write(pickling). 복합객체출력, 저장하고자하는 Tuple을 f에 넣어 열림
f.close()

f = open(file_name, mode='rb')
x, y = pickle.load(f)
print(x)  # dictionary
print(y)  # list
```

```python
import pickle

class Simple:
    pass

s = Simple()
s.count = 10

file_name = 'pickle.txt'
f = open(file_name, mode='wb')
pickle.dump(s, f)
f.close()

f = open(file_name, mode='rb')
t = pickle.load(f)
print(t.count)  # 10
```

### example
```python
# text.txt파일에 대해 각 라인을 읽고 존재하는 단어의 개수를 출력
f = open('t.txt', mode='r')
idx = 1
for line in f.readlines():
    words = line.split()
    print(idx, ':', len(words))
f.close()
```
