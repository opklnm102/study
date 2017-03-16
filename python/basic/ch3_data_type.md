# 수치형 자료형, 문자열 자료형

## int
```python
import sys

a = 23
b = 023
c = 0x23

print (type(a), type(b), type(c))  # <class 'int'> <class 'int'> <class 'int'>
print (a, b, c)  # 23 19 35
```

## float
```python
a = 1.2
b = 3.5e3  #3.5 * 10^3 = 3500.0
c = -0.2e-4  #-0.2 * (1/10000) = -2 * (1/100000) = -2e-5

print (type(a), type(b), type(c))  # <class 'float'> <class 'float'> <class 'float'>
print (a, b, c)  # 1.2 3500.0 -2e-05
```

## complex - 실수부와 허수부가 각각 계산
```python
a = 10 + 20j
print(a)  # (10+20j)
print(type(a))  # <class 'complex'>

b = 10 + 5j
print(b)  # (10+5j)
print(a + b)  # (20+25j)
```

## 사칙연산
```python
3 + 4  # 7
3 * 4  # 12
3 / 4  # 0.75

# x의 y제곱
3 ** 4  # 81

# 나눗셈 나머지
7 % 3  # 1

# 나눗셈의 결과값보다 작은 정수 중, 가장 큰 정수 리턴
7 // 4  # 1
-7 // 4  # -2
```

## 수치 자료형의 치환
```python
x = 1  #x는 1(객체)을 가리키는 레퍼런스
x = 2  #x가 2(객체)를 가리키고 1은 garbage가 되어 수집됨
```

## 수치 연산과 관련된 내장함수
* 절대값 - `abs(-3)`
* 정수형
   * `int(3.141592)` 
   * `int(-3.1415)`
   * `int(-3.9999)`
* 실수형 - `float(5)`
* 복소수형
   * `complex(3.4, 5)` - 3.4 + 5j
   * `complex(6)` - 6+0j와 같이 실수부만 나타남
* (a를 b로 나눈 몫, 나머지) - `divmod(5, 2)`
*  a의 b승값 - `pow(2, 3)`
   * `pow(2.3, 3.5)` - 실수도 입력가능

## math module의 수치연산 함수
```python
import math

math.pi  # 파이
math.e  # 지수
math.sin(1.0)  # 1.0라디안에 대한 싸인
math.sqrt(2)  # 제곱근  # 원의 넓이

r = 5.0
a = math.pi * r * r  

# 각도가 60도일 때 라디안값
degree = 60.0
rad = math.pi * degree / 180.0

math.sin(rad)
math.cos(rad)
math.tan(rad)
```

## string
```python
print 'Hello "World"'  #Hello "World"
print "Hello 'World'"  #Hello 'World'

# string 더하기
head = "a"
tail = "b"
head + tail  # ab

# string 곱하기
head * 2  # aa
```

### 여러줄 출력
```python
multiline = '''
To be, or not to be
that is the question
'''
print multiline

multiline2 = """
To be, or not to be
that is the question
"""
print multiline2
```

### 인덱싱 - `[index]`, `[-index](역순)`
```python
s = "Hello World!"
print(s[0])  # H
print(s[1])  # e
print(s[-1])  # !
print(s[-2])  # d
```

### 슬라이싱(자르기): [start(포함):end(제외): step]
```python
s = "Hello World!"

print(s[1:3])  #el
print(s[0:5])  #Hello
print(s[1:6:3])  #eo

print(s[1:])  #ello World!, 1부터 끝까지
print(s[:3])  #Hel, 처음부터 3까지
print(s[:])  #Hello World!, 처음부터 끝까지
print(s[::2])  #HloWrd, 처음부터 끝까지 2개의 step
print(s[::-1)]  #!dlroW olleH, 문자열 거꾸로
```

### 문자열은 내부 내용 변경 불가능
```python
# ex) s[0] = 'q'
# 슬라이싱을 활용해 문자열 새로 구성
s = 'h' + s[1:]  # h  

'Hello' + ' ' + 'World'  # 문자열 연결
'Hello ' * 10  # 숫자만큼 문자열 반복

len(s)  #문자열의 길이
```

### 문자열내 포함 관계 여부
```python
# A in B: B안에 A가 있다.
'World' in s

# A not in B: B안에 A가 없다
'World' not in s

# 문자열안에 공백이 있다
' ' in s  
```
