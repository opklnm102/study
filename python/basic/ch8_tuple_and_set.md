# 튜플과 집합

## 튜플
* 순서있는 임의의 객체 모음
   * 리스트와 유사
* 변경 불가능(Immutable)
   * 상수와 비슷한 속성

### 생성
```python
t1 = ()  # 비어있는 튜플
t2 = (1, 2, 3)
t3 = 1, 2, 3  # == (1, 2, 3). 괄호가 없이도 튜플

r1 = (1)  # no tuple, <class 'int'>
type(r1)

# 자료가 1개일때는 반드시 콤마가 필요
r1 = (1, )  # tuple

# 괄호는 없어도 콤마는 필요
r2 = 1,  # tuple

t[0] = 100  # error -> 변경 불가능
```

### 연산
```python
t = (1, 2, 3)
t * 2  # 반복
t + ('PyKUG', 'users')  # 연결

# 인덱싱
t[0] 

# 슬라이싱
t[1:3]  

# 길이
len(t)  

# 멤버쉽테스트
1 in t  
```

### 튜플 사용하기
```python
t = (12345, 54321, 'Hello!')  # tuple을 원소로
u = t, (1, 2, 3, 4, 5)  # == (t, (1, 2, 3, 4, 5))

t2 = [1, 2, 3]  # list를 원소로
u2 = t2, (1, 2, 4)

t3 = {1:"abc", 2:"def"}  # dictionary를 원소로
u3 = t3, (1, 2, 3)

# 튜플을 이용한 복수개의 자료할당
x, y, z = 1, 2, 3  # == (1, 2, 3) 
type(x)  # <class 'int'>
print(x, y, z)

# tuple을 이용한 swap
x = 1
y = 2
x, y = y, x  
print(x, y)
```

### Packing <-> unPacking

#### Packing
* 하나의 튜플안에 여러개의 데이터를 넣는 작업(=여러개의 객체를 하나의 변수에 묶는 것)
```python
t = 1, 2, 'hello'  # (1, 2, 'hello')
```

#### unPacking
* 하나의 튜플에서 여러개의 데이터를 한꺼번에 꺼내 각각변수에 할당하는 작업(=묶여 있는 객체를 푸는 것)
```python
x ,y ,z = t
print x, y, z
```

#### 리스트로도 가능하지만 단순 패킹/언패킹 용도면 튜플 권장
```python
l = ['foo', 'bar', 4, 5]
print(l)
[x, y, z, w] = l
print(x, y, z, w)
```

### Tuples과 List의 공통점
* 원소로 임의의 객체 저장
* 시퀀스 자료형 - 인덱싱, 슬라이싱, 연결, 반복, 멤버쉽테스트 지원
* 튜플만의 특징 - 메소드를 가지지 않는다(Immutable이라 필요X)

### list(), tuple()내장 함수를 사용한 상호변환
```python
T = (1, 2, 3, 4, 5)
L = list(T)  # tuple -> list
L[0] = 100  # list -> mutable(변경가능)

T = tuple(L)  # list -> tuple
```

### tuple 사용 용도

#### 1. multiple return value 
* 함수가 하나이상의 값을 리턴하는 경우
```python
def calc(a, b):
	return a + b, a * b  # 튜플. 괄호 숨어있음

x, y = calc(5, 4)  # 리턴한 결과가 튜플, 언패킹 진행
print(x, y)
```

#### 2. string formating. 문자열 포맷팅
```python
print('id : %s, name : %s' % ('gslee', 'GongSeong'))
```

#### 3. 고정된 값을 쌍으로 표현하는 경우
```python
d = {'one':1, 'two':2}
print(d.items())
```

## 집합 자료형
* Mutable한 객체
* 원소간 순서X
* 중복X
* 시퀀스 자료형X
   * 인덱싱, 슬라이싱, 정렬등 지원X
* `set(리스트 or 튜플 or 사전)`
   * 튜플이 들어가도 출력은 리스트
   * 사전이 들어가면 value는 무시, key값만 가져옴. 출력은 리스트
   
### 생성
```python
# list를 변환
a = set([1, 2, 3])  
type(a)   # <class 'set'>
print(a)  # {1, 2, 3}

# duplication removal
a = set([1, 2, 2, 3])
type(a)  # <class 'set'>
print(a)  # {1, 2, 3}

# tuple을 변환
b = set((1, 2, 3))  
type(b)  # <class 'set'>
print(b)  # {1, 2, 3}

# dictionary를 변환
c = set({'a':1, 'b':2, 'c':3})
type(c)  # <class 'set'>
print(c)  # {'c', 'a', 'b'}

d = set({'a':1, 'b':2, 'c':3}.values())
type(d)  # <class 'set'>
print(d)  # {1, 2, 3}

set()
set([1, 2, 3, 4, 5])
set([1, 2, 3, 2, 3, 4])
set('abc')
set([(1, 2, 3), (4, 5, 6)])
set([[1, 2, 3], [4, 5, 6]])  #error -> 변경가능한 list는 집합의 원소가 될 수 없다.
```

### 연산
```python
A = set([1, 2, 3, 4, 5, 6, 7, 8, 9])

len(A)  # 9, 원소의 개수
5 in A  # True, 5가 A의 원소인가
10 not in A  # True, 10이 A의 원소가 아닌가
```

#### 집합 연산

```python
# x.issubset(y) - x가 y의 부분집합?
B = set([4, 5, 6, 10, 20, 30])
C = set([10, 20, 30])

C.issubset(B)  # True
c <= B  # True

# x.issuperset(y) - x가 y를 포함하는 집합?
B.issuperset(C)  # True
B >= C  # True


A = set([1, 2, 3, 4, 5, 6, 7, 8, 9])
B = set([4, 5, 6, 10, 20, 30])

# x.union(y) == x | y. 합집합
A.union(B)

# x.intersection(y) == x & y. 교집합
A.intersection(B) 

# x.difference(y) == x - y. 차집합
A.difference(B)

# x.symmetric_difference(y) == x ^ y. 배타집합
A.symmetric_difference(B) 

# copy - 내용은 그대로 가져오나 새로운 집합 생성
D = A.copy()  #내용은 그대로 가져오나 새로운 집합 생성
print(D)

# 자료값 비교
A == D  

# 객체 동등성 비교
A is D  


A = set([1, 2, 3, 4])
B = set([3, 4, 5, 6])

# x.update(y) - (|=), x, y의 합집합을 x에 저장
A.update(B)  # {1, 2, 3, 4, 5, 6}
print(A)

# x.intersection_update(y) - (&=). x, y의 교집합을 x에 저장
A.intersection_update([4, 5, 6, 7, 8])  # {4, 5, 6}
print(A)

# x.difference_update(y) - (-=). x, y의 차집합을 x에 저장
A.difference_update([6, 7, 8])  # {4, 5}
print(A)

# x.symmetric_difference_update(y) - (^=). x, y의 배타집합을 x에 저장
A.symmetric_difference_update([5, 6, 7])  # {4, 6, 7}
print(A)


A = set([1, 2, 3, 4])
B = set([3, 4, 5, 6])

# element add
A.add(8)  # {8, 1, 2, 3, 4} 

# element remove, 없는 원소를 제거하면 KeyError
A.remove(8)  # {1, 2, 3, 4}

# remove와 같으나 error가 발생하지 않음
A.discard(10)  

# 임의의 원소 하나 꺼내기(random)
A.pop()  # {2, 3, 4}

# 원소 모두 없애기
A.clear()  # set()
```

### List, Tuple로 변경
```python
A = set([1, 2, 3, 4, 5, 6, 7, 8, 9])
list(A)
tuple(A)
```

### 집합에 for ~ in은 가능
```python
for element in A:
	print(element,)
```

### example
```python
#t1=[1,2,3,4,5]과 t2=[3,4,5,6,7]를 입력한 후 두개의 리스트에 존재하는 원소들
#모두 지니는 새로운 리스트 t3를 구성함에 있어서 t1과 t2에 중복되어 속한 원소를
#배제한 리스트를 구하여 출력
t1 = [1, 2, 3, 4, 5]
t2 = [3, 4, 5, 6, 7]
s1 = set(t1)
s2 = set(t2)
s3 = s1.symmetric_difference(s2)
t3 = list(s3)
print t3
```
