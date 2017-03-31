# 예외 처리

## NameError
* 선언되지 않은 변수명 사용할 경우 발생
```python
4 + spam * 3  # name 'spam' is not defined
```

## ZeroDivisionError
* 어떤 수를 0으로 나누려고할 경우 발생
```python
def division():
	for n in range(0, 5):
		print 10.0 / n

division()  # ZeroDivisionError: float division by zero
```

## TypeError
```python
'2' + 2  # Can't convert 'int' object to str implicitly
```

## IndexError
```python
l = [1, 2]
print(l[2])  # IndexError: list index out of range
```

## KeyError
```python
d = {'a': 1, 'b': 2}
print(d['c'])  # KeyError: 'c'
```

## IOError
```python
a = open('aa.txt')  # FileNotFoundError: [Errno 2] No such file or directory: 'aa.txt'
```

## Exception Catch

### ZeroDivisionError Catch
```python
try:
    print(1.0/0.0)
except ZeroDivisionError:
    print('zero division error!!')


def division():
    for n in range(0, 5):
        try:
            print(10.0/n)
        except ZeroDivisionError as msg:  # exception catch
            print(msg)
        else:  # exception 없을 때
            print('Success!')
        finally:  # exception, else문 실행 후 마지막에 호출
            print('finally')

division()
```

### NameError Catch
```python
try:
    spam()
except NameError as msg:
    print('Error - ', msg)  # Error -  name 'spam' is not defined
```

### ZeroDivisionError Catch
```python
def zero_division():
    x = 1 / 0

try:
    zero_division()
except ZeroDivisionError as msg:
    print('Zero division error!! - ', msg)  # Zero division error!! -  division by zero
```

### All Except Catch
```python
try:
    spam()
    print(1.0 / 0.0)
except:
    print('Error')
```

### Multiple Exception Catch
```python
b = 0.0
name = 'aaa.txt'
try:
    print(1.0 / b)  # ZeroDivisionError
    spam()  # NameError
    f = open(name, 'r')  # IOError
    '2' + 2  # TypeError
except NameError:
    print('NameError!')
except ZeroDivisionError:
    print('ZeroDivisionError!')
except TypeError:
    print('TypeError')
except IOError:
    print('IOError!')
else:
    print('No Exception!')
finally:
    print('Exit!')
```

### Best Error Catch
```python
import os

print(os.getcwd())
file_name = 't.txt'

try:
    f = open(file_name, 'r')
except IOError as msg:
    print(msg)
else:
    a = float(f.readline())
    try:
        answer = 1.0 / a
    except ZeroDivisionError as msg:
        print(msg)
    else:
        print(answer)
    finally:  # file open시 exception발생하면 close() 해야함
        print('finally!!')
        f.close()
```

### Same Error Catch
* 같은 Error를 Catch하기
```python
def dosomething():
    a = 1 / 0

# ZeroDivisionError occured
try:
    dosomething()
except ZeroDivisionError:  # ZeroDivisionError
    print('ZeroDivisionError occured')
except ArithmeticError:  # FloatingPotinError
    print('ArithmeticError occured')

# ArithmeticError occured
try:
    dosomething()
except ArithmeticError:  # FloatingPotinError
    print('ArithmeticError occured')
except ZeroDivisionError:  # ZeroDivisionError
    print('ZeroDivisionError occured')
```

### raise
* exception occured
```python
class SquareSeq:
    def __init__(self, n):
        self.n = n

    def __getitem__(self, item):
        if item >= self.n or item < 0:
            raise IndexError
        return item * item

    def __len__(self):
        return self.n

s = SquareSeq(10)
print(s[2], s[4])  # 4 16

for x in s:
    print(x, end=' ')  # 0 1 4 9 16 25 36 49 64 81

try:
    print(s[20])  # IndexError
except IndexError:
    print('Index Error!')
```

#### Custom Exception Raise
```python
class Big(Exception):
    pass

class Small(Big):
    pass

def dosomething1():
    x = Big()
    raise x

def dosomething2():
    raise Small()

for f in (dosomething1, dosomething2):
    try:
        f()
    except Big:
        print('Exception occurs!!')
```

### Exception Message Passing
```python
def f():
    raise Exception('message!!!')

try:
    f()
except Exception as msg:
    print(msg)


a = 10
b = 0
try:
    if b == 0:
        raise ArithmeticError('division by zero')
    a / b
except ArithmeticError as msg:
    print(msg)
```

### example
```python
# t.txt 파일에서 숫자를 읽어서 실수로 변환한 후 나누기 연산을 수행 여기서 발생할 수 있는 예외를 처리

file_name = "ttt.txt"
try:
    f = open(file_name, 'r')
except IOError as msg:
    print(msg)
else:
    a = float(f.readline())
    try:
        answer = 1.0 / a
    except ZeroDivisionError as msg:
        print(msg)
    else:
        print(answer)
    finally:
        print('- end -')
        f.close()
```
