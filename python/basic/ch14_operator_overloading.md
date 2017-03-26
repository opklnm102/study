# Operator Overloading

## 1. 수치 연산자 중복 
```python
class MyInteger:
    def __init__(self, num):
        self.num = num

    def __str__(self):  # 객체를 print할 떄 호출
        return str(self.num)

    def __add__(self, other):  # +할 때 호출
        self.num += other
        return self  # return instance

    def __neg__(self):  # -(단항)
        t = list(str(self.num))
        t.reverse()
        return int(''.join(t))

    __invert__ = __neg__  # ~


i = MyInteger(1200)
print(i)  # 1200
print(str(i))  # 1200

i += 10
print(i)  # 1210

i += 10
print(i)  # 1220
print(type(i))  # <class '__main__.MyInteger'>

print(-i)  # 221
print(~i)  # 221
```

```python
class MyCmp:
    def __init__(self, value):
        self.value = value

    def __cmp__(self, other):
        if self.value == other:
            return 0

    def __eq__(self, other):  # ==
        return self.value == other

    def __gt__(self, other):  # >
        return self.value > other

    def __lt__(self, other):  # <
        return self.value < other

    def __le__(self, other):  # <=
        return self.value <= other


c = MyCmp(10)
print(c > 1)  # True
print(c < 1)  # c.__lt__ call, False
print(c == 10)  # c.__eq__ call, True
print(c <= 1)  # False
```

## 2. sequence, mapping 연산자 중복
```python
class Square:
    def __init__(self, end):
        self.end = end

    def __len__(self):
        return self.end

    def __getitem__(self, item):
        if item < 0 or self.end <= item:
            raise IndexError(item)
        return item * item


s1 = Square(10)
print(len(s1))  # 10
print(s1[1])  # 1
print(s1[4])  # 16
print(s1[20])  # index error

for x in s1:  # s1.__getitem()__ call
    print(x)

print(list(s1))  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
print(tuple(s1))  # (0, 1, 4, 9, 16, 25, 36, 49, 64, 81)


class MyDict:
    def __init__(self, d=None):
        if d == None:
            d = {}
        self.d = d

    def __getitem__(self, key):
        return self.d[key]

    def __setitem__(self, key, value):
        self.d[key] = value

    def __len__(self):
        return len(self.d)

    def keys(self):
        return self.d.keys()

    def values(self):
        return self.d.values()

    def items(self):
        return self.d.items()


m = MyDict()  # __init__ call
m['day'] = 'light'  # __setitem__ call
m['night'] = 'darkness'  # __setitem__ call

print(m)  # <__main__.MyDict object at 0x7f9aa5a7a8d0>
print(m['day'])  # __getitem__ call, light
print(m['night'])  # __getitem__ call, darkness
print(len(m))  # __len__ call, 2

m = MyDict({'one': 1, 'two': 2, 'three': 3})
print(m.keys())  # dict_keys(['three', 'one', 'two'])
print(m.values())  # dict_values([3, 1, 2])
print(m.items())  # dict_items([('three', 3), ('one', 1), ('two', 2)])
```


## 3. string transfer
1. __repr__
2. __str__

```python
class StringRepr:
    def __repr__(self):
        return 'repr called'

    def __str__(self):
        return 'str called'

s = StringRepr()
print(s)  # __str__ call
print(str(s))  # __str__ call
print(repr(s))  # __repr__ call
```

### `__str__`가 없을 경우
* `__repr__` 호출
```python
class StringRepr:
    def __repr__(self):
        return 'repr called'

s = StringRepr()
print(s)  # __repr__ call
print(str(s))  # __repr__ call
print(repr(s))  # __repr__ call
```

### `__repr__`가 없을 경우
* `__str__` 호출 안됨
```python
class StringRepr:
    def __str__(self):
        return 'str called'

s = StringRepr()
print(s)  # __str__ call
print(str(s))  # __str__ call
print(repr(s))  # __str__ not call
```

### 호출 가능한 클래스 인스턴스 만들기
```python
class Accumulator:
    def __init__(self):
        self.sum = 0

    def __call__(self, *args, **kwargs):
        self.sum += sum(args)
        return self.sum


acc = Accumulator()
print(acc(1, 2, 3, 4, 5))  # 15
print(acc(6))  # 21
print(acc(7, 8, 9))  # 45
print(acc.sum)  # 45
```

### 호출 가능 객체인지 알아보기
```python
def check(func):
    if callable(func):
        print('callable')
    else:
        print('not callable')


class B:
    def func(self, v):
        return v


class A:
    def __call__(self, *args, **kwargs):
        return args


a = A()
b = B()
check(a)  # callable
check(b)  # not callable
print(callable(a))  # True
print(callable(b))  # False

# 모든 클래스는 callable(생성자가 있어서)
print(callable(A))  # True
print(callable(B))  # True
```
