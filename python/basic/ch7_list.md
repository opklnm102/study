# 리스트
* 임의의 객체를 순차적으로 저장하는 집합적 자료형
* 시퀀스 자료형
* 변경가능(Mutable)
* 인덱싱, 슬라이싱, 연결, 반복, 멤버쉽테스트 지원

```python
l = [1,2,3]
type(l)  # 타입
len(l)  # 길이
l[1]  # 인덱스1의 값
l[-1]  # 인덱스가 뒤에서 1번째인 값
l[1:3]  # 인덱스 1~3까지 슬라이싱
l + l  # 리스트2개를 합처 하나의 리스트로
l * 3  # 리스트를 숫자만큼 반복하여 하나의 리스트로
```

## 리스트는 변경가능
```python
l1 = [4,5,6]
l1[0] = 10
```

## 리스트 원소에 대한 슬라이스 치환

### 동일한 크기에 대한 슬라이스 치환
```python
a = [5, 4, 123, 1234]
a[0:2] = [1, 12]  
print(a)  # [1, 12, 123, 1234]
```

### 서로 다른 크기에 대한 슬라이스 치환
```python
a[0:2] = [1]  
print(a)  # [1, 123, 1234]
```

### 서로 다른 크기에 대한 슬라이스 치환
```python
a[0:1] = [1, 2, 3]  
print(a)  # [1, 2, 3, 123, 1234]
```

### 리스트 원소에 대한 슬라이스 삭제
```python
a = [1, 12, 123, 1234]
a[0:2] = []
print(a)  # [123, 1234]
```

### 첫번째 인덱스에 삽입
```python
a = [123, 1234]
a[1:1] = ['spam', 'ham']  
print(a)  # [123, 'spam', 'ham', 1234]
```

### 1번쨰 원소에 대한 치환
```python
b = [123, 1234]
b[1:2] = ['spam', 'ham']  
print(b)  # [123, 'spam', 'ham']
```

### 리스트 맨앞에 자기자신을 삽입
```python
a[0:0] = a  
print(a)  # [1, 2, 1, 2]
```

## del
* 리스트 요소 삭제
```python
a = [1, 2, 3, 4]
del a[0]  # 0번 인덱스 요소 삭제
print(a)  # [2, 3, 4]

del a[1:]  # 1번 인덱스부터 끝까지 삭제
print(a)  # [2]

a = range(4)
print a  # [0, 1, 2, 3]
print a[::2]  # [0, 2]

del a[::2]  # 2개 간격으로 삭제
print(a)  # [1, 3]

# 리스트 자체에 대한 삭제. 리스트를 가리키는 레퍼런스를 지닌 변수 a삭제
a = range(5)
del a
print(a)  # a의 레퍼런스가 사라져서, name 'a' is not defined
```

## 중첩 리스트: 리스트 안에 요소로 리스트를 지닌 리스트
```python
s = [1,2,3]
t = ['begin', s, 'end']
t  # ['begin', [1, 2, 3], 'end']

t[1][1]  # 2
t[1]  # [1, 2, 3]

s[1] = 100
t  # ['begin', [1, 100, 3], 'end']

L = [1, ['a', ['x', 'y'], 'b'], 3]
L[0]  # 1
L[1]  # ['a', ['x', 'y'], 'b']
L[1][1]  # ['x', 'y']
L[1][1][1]  # y
```

## range(k)
* `0부터 k-1까지`의 숫자의 리스트를 반환
```python
l = range(10)
l
l[::2]
l[::-1]
4 in l  # l안에 4가 있다
```

### range(start[, stop][, step])
* 순차적인 정수 리스트 만들기
```python
range(10)  # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
range(5, 15)  # [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
range(5, 15, 2)  # [5, 7, 9, 11, 13]

for el in range(10):
	print(el, 'inch = ', el * 2.54, 'centi')

sun, mon, tue, wed, thu, fri, sat = range(7)
print(sun, mon, tue, wed, thu, fri, sat)  # 0 1 2 3 4 5 6
```

## 리스트 안의 원소가 튜플일 때 for문을 사용하여 값 추출
```python
lt = [('one', 1), ('two', 2), ('three', 3)]
for t in lt:
	print('name = ', t[0], ', num = ', t[1])
```

### 문자열 포맷팅 이용
* 더 효츌적 
```python
for t in lt:
	print('name = %s, num = %s' % t)
```

### for문의 헤더에서 튜플 원소 추출
```python
for name, num in lt:  # for header
	print(name, num)
```

### 리스트안의 원소가 리스트여도 동일하게 사용
```python
lt = [['one', 1], ['two', 2], ['three', 3]]
for name, num in lt:  #for header
	print(name, num)
```

## list method

### append(element)
* 리스트 뒤에 element 추가
```python
s = [1, 2, 3]
s.append(5)  # s리스트 뒤에 정수 5추가
print(s)

s.append("abc")
s.append((1, 2))
s.append({'a':100})
print(s)
```

### insert(index, element)
* index 위치에 element 추가
```python
s.insert(3, 4)  # 3인덱스 위치에 정수 4추가
print(s)
```

### index(element)
* element의 index 구하기
```python
s = [1, 2, 3, 4, 5]
s.index(3)  # 값 3의 인덱스 반환
```

### count(element)
* element의 개수 구하기
```python
s = [1, 2, 2, 2, 2, 2, 2, 3, 4, 5]
s.count(2)  # 값 2의 개수 반환
```

### remove(element)
* element 삭제
```python
s = [10, 20, 30, 40, 50]
s.remove(10)  # 원소 10 삭제
print(s)

s = [10, 20, 30, 20, 40, 50]
s.remove(20)  # 원소가 여러개면 첫번째 것만 삭제
print(s)
```

### extend(elemelt)
* 병합
```python
s.extend([60, 70])  # 기존 리스트 s뒤에 병합. 리스트 자체로
print(s)

s.append([60, 70])  # 리스트가 원소로 들어감. 중첩 리스트 됨
print(s)
```

### pop()
* 마지막 element를 뻼
```python
s = [10, 20, 30, 40, 50]
print(s.pop())  # 50
print(s)  # [10, 20, 30, 40]
```

### list stack
```python
s = [10, 20, 30, 40, 50]
s.append(60)  # 마지막에 넣고
print(s)  # [10, 20, 30, 40, 50, 60]

print(s.pop())  # 60, 마지막꺼 빼낸다
print(s)  # [10, 20, 30, 40, 50]
```

### list queue
```python
q = [10, 20, 30, 40, 50]
q.append(60)  # 마지막에 넣고
print(q)  # [10, 20, 30, 40, 50, 60]

print(q.pop(0))  # 10, 0번 인덱스의 원소를 뺌
print(q)  # [20, 30, 40, 50, 60]
```

### example
```python
# 초기에 내용이 비어있는 리스트를 스택으로 활용하여 정수 1부터 차례대로 10까지
# 스택에 쌓고 마지막에 삽입된 정수부터 4개의 수를 꺼내오는 프로그램을 작성
stack = []
for element in range(1,11):
	stack.append(element)
	print(stack)

for idx in range(4):
	print(stack.pop())
```

## list align

### sort()
* 정렬 - 리스트 자체를 변경, 반환X
```python
s.sort()
print(s)
```

> #### python의 소팅 알고리즘: Timsort (변형된 merge sort)
> 참고: http://orchistro.tistory.com/175

#### sort()의 인자로 reverse값을 받을 수 있다
```python
l = [1, 6, 3, 8, 6, 2, 9]
l.sort(reverse = False)  # defaul. == l.sort(). 오름차순 정렬

l.sort(reverse = True)  # 내림차순 정렬
```

#### sort()의 인자로 key에 함수를 넣어줄 수 있다
* key에 함수가 할당되어 있으면 비교함수 호출 직전에 key함수를 먼저 호출
```python
l = ['123', '34', '56', '2345']
l.sort()  # 문자열에 대해 비교

l.sort(key = int)  # 숫자에 대해 비교. 비교하는 순간 정수로 바꾸고 문자열 반환
```

### sorted()
* 자체 내용 변경 없이 정렬되어진 새로운 리스트 반환
```python
l = [1, 6, 3, 8, 6, 2, 9]
new_list = sorted(l)
print(newList)
print(l)
```

#### key parameter 지정
```python
l = sorted('This is a test string from Andrew'.split(), key=str.lower)
print(l)
```

#### 특정 값을 기준으로 정렬
```python
# 튜플
student_tuples = [
    ('john', 'A', 15),
    ('jane', 'B', 12),
    ('dave', 'B', 10),
]
l = sorted(student_tuples, key=lambda student: student[2])
print(l)

# 클래스
class Stduent:
    def __init__(self, name, grade, age):
        self.name = name
        self.grade = grade
        self.age = age

    def __repr__(self):
        return repr((self.name, self.grade, self.age))

student_objects = [
    Stduent('john', 'A', 15),
    Stduent('jane', 'B', 12),
    Stduent('dave', 'B', 10),
]
l = sorted(student_objects, key=lambda student: student.age)
print(l)
```

#### operator module functions
```python
from _operator import itemgetter, attrgetter

sorted(student_tuples, key=itemgetter(2))
sorted(student_objects, key=attrgetter('age'))

# multiple levels of sorting
sorted(student_tuples, key=itemgetter(1, 2))
sorted(student_objects, key=attrgetter('grade', 'age'))
```

#### Ascending and Descending
```python
# reverse=True -> Descending
sorted(student_tuples, key=itemgetter(2), reverse=True)
sorted(student_objects, key=attrgetter('age'), reverse=True)
```

#### dictionary - key를 기준으로 정렬
```python
print(sorted({1: 'D', 2: 'Q', 3: 'C', 4: 'S', 5: 'A'}))
```

### reverse()
* 순서 뒤집기 - 반환X
```python
s = [1, 2, -10, -7, 100]
s.reverse()
print(s)
```

### reversed()
* 자체를 역순으로 - 반환O
```python
l = [1, 6, 3, 8, 6, 2, 9]
print(l)
```

## List Comprehension(리스트 내포)
* 리스트안에 실제 포함되어야 하는 `원소가 식`으로 들어감
   * 리스트 안에 for문을 포함
* 편리하고 직관적임

### 형식
```python
# if 생략가능
[표현식 for 항목 in 반복가능객체 if 조건]

# for문을 2개 이상 사용하는 경우
[표현식 for 항목1 in 반복가능객체1 if 조건1
		for 항목2 in 반복가능객체2 if 조건2
		...]
```

```python
# general. 일반적인 리스트 생성법
l = [1, 2, 3, 4]
result = []
for num in l:
	result.append(num*3)

# List Comprehension
result = [num * 3 for num in l]  # element에 *3

# 짝수에만 *3
result = [num * 3 for num in l if num % 2 == 0]
```

### 식의 결과로 `하나의 원소`가 나와야 하며 2개 이상일 경우 `튜플등으로 감싸`야 한다
```python
[x, y for x in seq1 for y in seq2]  # X
[(x, y) for x in seq1 for y in seq2]  # O
```

### for의 변수가 식의 변수와 동일해야 함 
```python
l = [k * k for k in range(10)]  
print(l)
```

## example
```python
# 20보다 작은 2의 배수와 3의 배수에 대해 그 두수의 합이 7의 배수인 것들에 대해
# 그 두수의 곱을 출력하는 코드
l = [(i, j, i*j) for i in range(2, 20, 2) for j in range(3, 20, 3) if (i + j) % 7 == 0]
print(l)

# 두개의 시퀀스 자료형에 대해 각각의 원소에 대한 쌍을 튜플 형태로 만들면서
# 리스트에 저장하는 코드
seq1 = 'abc'
seq2 = (1, 2, 3)
print([(x, y) for x in seq1 for y in seq2])

words = 'The quick brown fox jumps over the lazy dog'.split()
print(words)
stuff = [[w.upper(), w.lower(), len(w)] for w in words]
print(stuff)
for i in stuff:
	print(i)

# seq1='abc', seq2=(1,2,3), seq3=[4,5,6]를 입력한 후 각각의 원소에 대한 쌍을 튜플 형태로 만들면서 리스트에 저장하는 코드를 리스트 내포 형식으로 작성하고 출력
seq1 = 'abc'
seq2 = (1, 2, 3)
seq3 = [4, 5, 6]
l = [(x, y, z) for x in seq1 for y in seq2 for z in seq3]
print(l)
