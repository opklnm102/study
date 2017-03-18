# 제어문과 반복문

## if

### 형식
```python
if condition:  # 실행하는 함수문의 헤더
	statements  # 밑 라인은 함수문의 몸체 역할 수행
elif condition:
	statements
else:
	statements
```

### example
```python
n = -2
if n > 0:
    print('Positive')
elif n < 0:
    print('Negative')
else:
    print('Zero')
```

## for

### 형식
```python
for <타겟> in <컨테이너 객체>:  # 컨테이너 객체에서 원소를 꺼내 타겟에 삽입
	statements
```

### example
```python
a = ['cat', 'cow', 'tiger']
for x in a:
	print(len(x), x)  # cat 3

for x in [1,2,3]:
	print(x)

for x in range(10):
	print(x)

sum = 0
for x in range(1, 11):
	sum = sum + x

prod = 1
for x in range(1,11):
	prod = prod * x
```

## enumerate()
* 컨테이너 객체가 지닌 각 `요소`, `인덱스` 함께 반환
```python
l = ['cat', 'dog', 'bird', 'pig']
for k, animal in enumerate(l):
	print(k, animal)

d = {'c':'cat', 'd':'dog', 'b':'bird', 'p':'pig'}
for k, key in enumerate(d):
	print(k, key, d[key])
```

## break
* 루프문을 빠져나간다
```python
for x in range(10):
	if x > 3:
		break
	print(x)
```

## continue
* 루프블록 내의 continue이후 부분은 수행하지 않고 루프의 시작부분으로 이동
```python
for x in range(10):
	if x < 8:
		continue
	print(x)
```

## for-else
* break에 의한 `중단 없이 정상`적으로 모두 수행되면 `else블록`이 수행
```python
# break가 없으므로 else블록 수행
for x in range(10):
	print(x,)
else:
	print('else block')

# break가 있으므로 else블록 수행x
for x in range(10):
	break
	print(x,)
else:
	print('else block')
```

## while

### 형식
```python
while condition:
	statements
```

### example
```python
count = 1
while count < 11:
	print(count)
	count = count + 1

# while도 else가 가능
x = 0
while x < 10:
	print x,
	x = x + 1
else:
	print('else block')
print('done')
```
