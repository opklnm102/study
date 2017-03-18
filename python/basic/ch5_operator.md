# 연산자

## 산술
* `+`, `-`, `*`, `/` ,`%`, `**`이 있다
```python
1 + -1  # 0
3 + 5  # 8
3 + 5.0  # 8.0 -> 정수 + 실수 = 실수
```

### 지수
```python
2 ** 3  # 8 
2 ** 2 ** 3  # 256
2 ** (2 ** 3)  # 256
(2 ** 2) ** 3  # 64
```

### 나누기
```python
5 / 2  # 2.5
-5 / 2  # -2.5
```

### 나머지
```python
5 % 2  # 1
-5 % 2  # 1
5 / 2.0  # 2.5 -> 정수 / 실수 = 실수
```

### 몫과 나머지(튜플)
```python
divmod(5,3)  # (1,2) 
```

### 몫을 구해서 출력
```python
5 // 3  # 1
10.52 / 3  # 3.506666..
10.52 // 3  # 3.0
```

## 관계
* 객체가 지닌 값의 크기(대소)를 비교하여 True, False를 반환

### 두 객체가 동일한지를 판단 
```python
6 == 9  # False
```

### 두 객체가 동일하지 않은지 판단
```python
6 != 9  # True
```

### 대소 비교
```python
1 > 3  # False
4 <= 5  # True

a = 5
b = 10
0 < a < b  # 0 < a and a < b
```

#### 같은 자료형일 때 - '사전순서'
* 다른 자료형일 때 - 비교 불가
```python
'abcd' > 'abc'  # True
(1,2,4) < (2,1,0)  # True
[1,3,2] == [1,2,3]  # False
(1, 2, 4) == (1, 2, 4)  # True, 내용이 동일하므로

# 다른 자료형일 때 비교를 못하므로 정렬 불가
L = [1,2,3,'abc','a','z',(1,2,3),[1,2,3],{1:2},['abc']]
L.sort()  # TypeError: unorderable types: str() < int()
```

### 객체 비교
```python
x = [1,2,3]
y = [1,2,3]
z = y

x == y  # True
x == z  # True
x is y  # False
x is z  # False
y is z  #Tyue
```

## 논리
```python
a = 20
b = 60

# and  - 둘다 참이여야 = 참
a > 10 and b < 50  # False

# or - 하나만 참이여도 = 참
a > 10 or b < 50  # True

# True = 1, False = 0
True + 1  # 2
False + 1  # 1
False * 75  # 0
True * 75  # 75
```

### bool() - bool인지 판단

#### 정수
```python
bool(0)  # False, 정수 0은 거짓
bool(1)  # Ture
bool(100)  # Ture
```

#### 실수
```python
bool(-100)  # Ture
bool(0.0)  # False, 실수 0.0은 거짓
bool(0.1)  # Ture
```

#### 문자열
```python
bool('abc')  # True
bool('')  # False
```

#### 리스트
```python
bool([])  # False
bool([1,2,3])  # True
```

#### 튜플
```python
bool(())  # False
bool((1,2,3))  # True
```

#### 딕셔너리
```python
bool({})  # False
bool({1:2})  # True
```

#### None
```python
bool(None)  # False
```
#### Example
```python
1 and 1  # 1 True
1 and 0  # 0 False 
0 or 0  # 0 False
1 or 0  # 1 True
[] or 1  # 1 True
[] or ()  # () False
[] and 1  # [] False

1 and 2  # 2 True
1 or 2  # 1 True

[[]] or 1  # [[]] True
[{}] or 1  # [{}] True

'' or 1  # 1 True

not(True)  # False
not(1 and 2)  # False
not('' or 1)  # False
```

> #### 연산자 우선순위에 의존하기보다 적절한 괄호 활용이 필요
> ```python
> 2 * 2 + 1 / 5  # 4.2
> (2 * 2) + (1 / 5)  # 4.2
> ```
