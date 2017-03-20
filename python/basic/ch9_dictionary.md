# Dictionary
* 집합적 자료형
* 자료의 `순서를 정하지 않는 Mapping`형
   * key를 이용하여 value에 접근
   * 시퀀스 자료형이 아님
* key와 value의 mapping 1개를 item이라고 부름
* value를 저장할 시에 key를 사용
   * key가 없다면 새로운 key와 value의 아이템이 `생성`
   * key가 이미 존재한다면 그 key에 해당하는 값이 `변경`
* 사전을 출력하면 각 아이템들이 `임의의 순서`로 출력
* 새로운 아이템이 들어오면 `key에 따라 순서가 달라진다`
* 내부적으로 key 내용에 대해 `Hash`기법 사용
   * 검색속도가 매우 빠름
* key와 value 매핑에 대한 item을 삭제할 때는 `del(key)` 사용
* key는 `Immmutable`. 문자열, 숫자, 튜플 가능
* value는 `임의의 객체`


```python
d = {'one': 'hana', 'two': 'dul'}
print(d['one'])  # hana

# 새 항목의 삽입
d['four'] = 'net'
print(d)  # {'four': 'net', 'one': 'hana', 'two': 'dul'}

# 기존 항목의 값 변경
d['one'] = 1
print(d)  # {'four': 'net', 'one': 1, 'two': 'dul'}
```

## key로 쓰일 수 있는 것
```python
d = {}

# 문자열
d['str'] = 'abc'

# 정수
d[1] = 4

# 튜플
d[(1, 2, 3)] = 'tuple'

# list X
d[[1, 2]] = 'list' # Type error -> unhashable type

# dictionary X
d[{1: 10}] = 'dictionary'
```

```python
def add(a, b):
	return a + b

def sub(a, b):
	return a - b

# 함수의 이름을 사전의 value로
action = {0: add, 1: sub}
print(action[0](4, 5))
print (action[1](4, 5))
```

## dict()
```python
d = dict()  # 사전 생성  
type(d)  # <class 'dict'>

dict(one=1, two=2)  # {'one': 1, 'two': 2}

dict([('one', 1), ('two', 2)])  # {'one': 1, 'two': 2}

dict({'one': 1, 'two': 2})  # {'one': 1, 'two': 2} -> 노의미


keys = ['one', 'two', 'three']
values = (1, 2, 3)
zip(keys, values)  # zip(): 두개의 자료를 순서대로 쌍으로 묶은 튜플의 리스트 반환
dict(zip(keys, values))  # {'two': 2, 'one': 1, 'three': 3}
```

## Dictionary methods

### keys()
* 키만 리스트로 추출
```python
d.keys()  # dict_keys(['one', 'four', 'two'])  
```

### values()
* 값만 리스트로 추출 
```python
d.values()  # dict_values([1, 'net', 'dul'])
```

### items()
* 키와 값의 튜플을 리스트로 반환
```python
d.items()  # dict_items([('one', 1), ('four', 'net'), ('two', 'dul')])
```

### in
* key에 대한 멤버쉽 테스트 - 포함 여부
```python
'one' in d  # True
```

### len()
* 길이
```python
len(d)  # 2
```

### del
* item delete
```python
del d['one']
```

### copy()
* shallow copy(o)
   * 복사하려는 리스트 안 원소까지 복사X
* deep copy(x)
   * 복사하려는 리스트 안 원소까지 복사
```python
# dictionary reference copy, dictionary 객체 공유
p = phone

phone['jack'] = 1234  # phone을 변경하면
print(phone)
print(p)  # p도 함께 변경된다.

# dictionary copy, dictionary 객체 별도
ph = phone.copy()  
phone['jack'] = 1111  # phone을 바꿔도
print(phone)
print(ph)  # ph는 바뀌지 않는다.
```


### key로 value 꺼내기 
```python
ph = {'jack': 9465215, 'jin': 1111, 'joseph': 6584321}

# get('key') = value
ph.get('jack')
ph.get('gslee')  # no key -> None
ph['jack']
ph['gslee'] # no key -> error

# get(key, default value)
ph.get('gslee', 5284)  
```

### dic.popitem()
* 임의의 아이템을 꺼낸다
```python
ph.popitem()
```

### dic.pop(key)
* key를 통해 해당 아이템을 지정하여 꺼낸다
```python
ph.pop('jack')
```

### dic.update(dic)
* dictionary의 value에 dic추가
```python
phone = {'jack': 946512, 'jin': 1111, 'joseph': 6584321}
ph = {'kim': 9465215, 'lee': 1111}
phone.update(ph)
print(phone)
```

### dic.clear()
* dictionary의 모든 입력을 없앤다
```python
phone.clear()
```

### loop
```python
D = {'a': 1, 'b': 2, 'c':3}
# Dictionary의 모든 key를 순차적으로 참조
for key in D.keys():  # key return
	print(key, D[key])

# Dictionary 자체를 for에 활용하면 key에 대한 루프 실행
for key in D:
	print(key, D[key])

# tuple로 된 list return
for key, value in D.items():  
	print(key, value)

# key, value 동시 참조
for value in D.values():  # value가 list로 return
	print(value)
```
