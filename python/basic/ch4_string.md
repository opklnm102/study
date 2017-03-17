# 시퀀스 자료형
* 저장된 각 요소를 `정수 index`를 이용하여 참조 가능한 자료형
* 문자열, 리스트, 튜플

## 문자열

### indexing
```python
s = 'abcdef'
l = [100, 200, 300]
s[0]  #  a
s[1]  # b
s[-1]  # f
l[1]  # 200
l[1] = 900
l[1]  # 900
```

### slicing
* `[start, end]` - start ~ end-1까지
```python
s = 'abcdef'
L = [100, 200, 300]
s[1:3]  # bc
s[1:]  # bcdef
s[:]  # abcdef
s[-100:100]  # abcedf
L[:-1]  # L[:2]와 동일
L[:2]  # [100, 200]
```

### extended slicing
* `[start, end, step]`
* `:`이 2개 쓰임
*  step에 해당하는 숫자만큼 `인덱스에 차이`를 두어 반환
```python
s = 'abcd'
s[::2]  # ac
s[::-1]  # dcba
```

### concatenation(+) 
* 연결하기
```python
s = 'abc' + 'def'  # 2개의 시퀀스를 연결하여 하나로
s  # abcdef

L = [1,2,3] + [4,5,6]  # 하나의 리스트로 반환
L  # [1,2,3,4,5,6]
```

### repition(*)
* 반복하기
```python
s = 'abc'
s * 4  # abcabcabcabc

L = [1,2,3]
L * 2  # [1 ,2, 3, 1, 2, 3]
```

### membership test(in)
* 안에 존재하는지 확인
```python
s = 'abcde'
'c' in s  # True

t = (1,2,3,4,5)
2 in t  # True
10 in t  # False
10 not in t  # 10이 t안에 존재하지 않는지 확인 - True

'ab' in 'abcd'  # True
'ad' in 'abcd'  # False
' ' in 'abcd'  # False
' ' in 'abcd '  # True
```

### length
* 길이정보
```python
s = 'abcde'
l = [1,2,3]
t = (1,2,3,4)
len(s)  # 5
len(l)  # 3
len(t)  # 4
```

### for~in
```python
for c in 'abcd':  # abcd
	print(c)
```

### string
* `'(문장)'`, `"(문장)"` 둘다 사용가능
```python
s = ''
str1 = 'Python is great!'
str2 = "Yes, it is."
str3 = "It's not like any other languages"
str4 = 'Don\'t walk. "Run"'  

# `\` 다음라인이 현재 라인의 뒤에 이어짐을 나타냄
long_str = "This is a rather long string \
ontaining back slash and new line\nGood!"
long_str  # long_str = "This is a rather long string ontaining back slash and new line\nGood!"

# """(문장)""",'''(문장)''': 여러 줄 문자열
multiline = """dddddddddddddddddddddddddddddddddddddddddddddddd
ddddddddddddddddddddddddddddddddddddddddddddddddd
dddddddddddddddddddddddddddddddddddddddddddddddddd
dddddddddddddddddddddddddddddddddddddddddddddddddd"""

ml = '''ffffffffffffffffffffffffffffffffffffffff
fffffffffffffffffffffffffffffffffffffffff
ffffffffffffffffffffffffffff'fffffffffffff
fffffffffffffffffffffffffffffffffffffffff'''
```

### Escape Characters
```python
print('\\abc\\')  # \abc\
print('abc\tdef\taghi')  # abc     def     aghi
print('a\nb\nc')
```
| 코드 | 설명 |
|:--:|:---:|
| \n | 개행 |
| \t | 수평 탭 |
| \\ | \ |
| \' | ' |
| \" | " |


### 문자열 연산
```python
str1 = 'First'
str2 = 'Second'
str3 = str1 + ' ' + str2
str3  # First Second
str1 * 3  # FirstFirstFirst
str1[2]  # r
str1[1:-1]  # 1 ~ n-1, irs
len(str1)  # 5
str1[0:len(str1)]  # == str1[:], First
```

### string modify
* 여러 Slicing연결 활용 -> 새로 생성하여 재할당
```python
s = 'spam and egg'
s = s[:4] + ', chese, ' + s[5:]
s  # spam, chese, and egg
```


### example
```python
# s='A, B, D, E'로서 파이썬 코딩된 문자열 s에 슬라이싱과 연결 연산을 활용하여 
#'A, B, C, D, E'문자열을 s가 지니도록 하고, 이후 문자열 s의 길이를 출력하는 
#프로그램을 작성하세요.

s = 'A,B,D,E'
s = s[:4] + 'C,' + s[4:]
print s
print len(s)
```

## 문자열 메소드와 포멧팅



### 문자 변환

#### 대문자 변환
```python
'i like programming.'s.upper()
```

#### 대문자 -> 소문자 변환
```python
'i like programming.'.upper().lower()  
```

#### 대문자 <-> 소문자 변환
```python
'I Like Programming'.swapcase()  
```

#### 첫문자만 대문자로 변환
```python
'I Like Programming's.capitalize()  
```

#### 각 단어의 첫문자를 대문자로 변환
```python
'I Like Programming's.title()  
```

### 등장 횟수 찾기
```python
# 'like'의 등장 횟수 반환
'i like programming, i like swimming.'.count('like')  
```

### index 찾기
```python
# 'like'의 첫 인덱스 반환
'I Like Programming's.find('like')  

# 3인덱스부터 like의 인덱스를 찾아
'I Like Programming's.find('like', 3)  

# my라는 단어는 없어서 -1반환
'I Like Programming's.find('my')  
```

### 문자열 판단
```python
s = 'I Like Programming'

# i like로 시작하는 문자열인지 판단
s.startswith('i like')  

# 대소문자 구별
s.startswith('I like')  

# swimming로 끝나는지 판단
s.endswith('swimming.')  

# 7번째 문자열이 progr로 시작하는지 판단
s.startswith('progr', 7)  
```

### 공백 제거
```python
u = '    spam and ham           '

# 앞뒤 공백제거하여 새로운 스트링 생성
u.strip()  

# 오른쪽 공백제거
u.rstrip()  

# 왼쪽 공북제거
u.lstrip()  

# <,>를 앞뒤에서 제거
'><><abc<><><>'.strip('<>')  

# \t도 공백으로 인식되 제거
p = '  \t abc \t '
p.strip()  
```

### u.replace(a,b): u안의 a문자를 b문자로 대치 
```python
u = 'spam and ham'
u.replace('spam', 'spam, egg')  # 'spam, egg and ham'
```

### 문자열 분리
* 리스트로 분리됨
```python
u = 'spam and ham   '

# 공백으로 분리
u.split()  # ['spam', 'and', 'ham']

# and로 분리
u.split('and')  # ['spam ', 'ham  ']

# \t, \n도 공백으로 인식
u2 = 'spam and ham\tegg\ncheese'
u2.split()  

lines = '''first lines
second line
third line'''
print type(lines)  # <class 'str'>

# 라인 기준으로 분리한 리스트 반환
lines2 = lines.splitlines()  # ['first lines', 'second line', 'third line']
type(lines2)  # <class 'list'>
```

### s.join(list)
* list 내부의 원소들을 s로 연결한 `문자열` 반환
```python
# t의 원소들을 :로 연결
t = ':'.join(t)  # 'spam:and:ham:egg:cheese'
type(t)  # <class 'str'>

",".join(t)  #t의 원소들을 ,로 연결
'\n'.join(t)  #t의 원소들을 \n로 연결
```

### align
```python
u = 'spam and egg'

# 60자리를 확보하되, 기존 문자열을 가운데 정렬
u.center(60)  

# 60자리를 확보하되, 기존 문자열을 왼쪽 정렬
u.ljust(60)  

# 60자리를 확보하되, 기존 문자열을 오른쪽 정렬
u.rjust(60)  

# 공백에 -문자를 채운다
u.center(60, '-')
```

### 문자열 검증
```python
# 문자열이 모두 숫자인가
'1234'.isdigit()  

# 문자열이 모두 영문자인가
'abcd'.isalpha()  

# 문자열이 모두 영문자 또는 숫자인가
'1abc234'.isalnum()  

# 문자열이 모두 소문자인가
'abc'.islower()  

# 문자열이 모두 대문자인가
'ABC'.isupper()  

# 문자열이 모두 공백인가
'\t\r\n'.isspace() 

# 문자열의 첫글자가 대문자인가
'This Is A Title'.istitle()  
```

### 문자열 채우기
```python
s = '123'
s.zfill(5)  #5자리 확보 후 문자열 쓰고, 남은 공백에 0채움
'goofy'.zfill(6)
```

### 문자열 formating

#### tupple formating
* 포맷팅 문자: 문자열 내에 존재하는 %
* 형식: 포맷팅 문자를 포함하는 문자열 % 튜플
```python
print('name = %s, age = %s' % ('gslee', '24'))

letter = '''
hello %s, world!! '''
name = 'dong'
print(letter % name)

names = ['kim', 'dong', 'hee']
for name in names:
	print(letter % name)
	print('-' * 40)

print("%s -- %s -- %d -- %f -- %e" % ((1,2), [3,4,5], 5, 5.3, 101.3))
print("%3d -- %5.2f -- %.2e" % (5, 5.356, 101.3))

a = 456
print('%d -- %o -- %x -- %X' % (a, a, a, a))
```

#### dictionary formating
```python
print('%(name)s -- %(phone)s' % {'name':'dong', 'phone':5235})

# 순서 달라도 상관없음
print('%(name)s -- %(phone)s' % {'phone':5235, 'name':'dong'})

# 없는 것은 무시
print('%(name)s -- %(phone)s' % {'name':'dong', 'phone':5235, 'address':'seoul'})
```

#### 고급 formating
```python
# 숫자 바로 대입
"I eat {0} apples".format(3)

# 문자열 바로 대입
"I eat {0} apples".format('five')

# 숫자값을 가진 변수로 대입
num = 3
"I eat {0} apples".format(num)

# 2개 이상의 값 넣기
num = 10
day = 'three'
'I {0} {1}'.format(num, day)

# 이름으로 넣기
'I {num}, {day}'.format(num=10, day=3)

# 인덱스와 이름을 혼용해서 넣기
'I {0}, {day}'.format(10, day)

# 왼쪽 정렬
'{0:<10}'.format('hi')

# 오른쪽 정렬
'{0:>10}'.format('hi')

# 가운데 정렬
'{0:^10}'.format('hi')

# 공백 채우기
'{0:=^10}'.format('hi')
'{0:!>10}'.format('hi')

# 소수점 표현하기
y = 3.43434343434
'{0:0.4f}'.format(y)

# {} 표현하기
'{{ and }}'.format()
```

### Example
```python
# s="1, 2, 3, 4, 5"에서 숫자만 골라내어 리스트에 넣어 최종적으로는 숫자 1부터 5까지의 
# 원소만 지니는 리스트 l을 출력하세요.
s = "1,2 ,3, 4, 5 "
parts = s.split(",")  # ","로 분리
l = []
for i in range(len(parts)):
	parts[i] = parts[i].strip()  # 공백 제거
	l.append(parts[i])  # 리스트에 삽입

print(l)
```
