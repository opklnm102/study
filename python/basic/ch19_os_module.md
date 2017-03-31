# os module
* OS의 기능들을 사용할 수 있는 모듈

## os 모듈 메소드

### getcwd()
* 현재 작업중인 디렉토리를 보여줌
```python
print(os.getcwd())
```

### chdir(path)
* 현재 작업 디렉토리를 변경
```python
os.chdir('home/dong/dev/')
```

### listdir(path)
* 입력한 경로의 파일과 폴더 목록을 리스트로 반환
```python
for file_name in os.listdir(os.getcwd()):
    print(file_name)

os.listdir('.')  # current directory
os.listdir('../')  # parent directory
```

### mkdir(path)
* 폴더 생성
```python
os.mkdir(os.getcwd() + "/test1")
```

### mkdirs(path)
* 폴더 생성(하위 폴더 포함)
* `$ mkdir -p`와 동일
```python
os.mkdirs(os.getcwd() + '/test2/test3/test4')
```

### remove(path), unlink(path)
* 파일 삭제(존재할 시)
```python
os.remove(os.getcwd() + "/t.txt")
os.unlink(os.getcwd() + '/t.txt')
```

### rmdir(path)
* 폴더 삭제
* 내용이 있을 경우 오류(비어있어야 함)
```python
os.rmdir(os.getcwd() + "/test1")
```

### removedirs(path)
* 폴더 삭제
* 경로에 있는 폴더 전부 삭제
```python
os.removedirs(os.getcwd() + '/test2/test3/test4')
```

## os.path 모듈
* 파일, 폴더에 대한 정보를 알 수 있다
* 생성시간, 접근권한, 파일존재 유무 판단 등

### isdir(path)
* 폴더 유무 판단
```python
print(os.path.isdir(os.getcwd()))
```

### isfile(path)
* 파일 유무 판단
```python
print(os.path.isfile(os.getcwd()))
```

### islink(path)
* 심볼릭 링크인지 판단
```python
print(os.path.islink(os.getcwd()))
```

> ### 파일 타입 판단하기
> ```python
> import os
> 
> def file_type(file_path):
>     print(file_path, end=' - ')
>     if os.path.isfile(file_path):
>         print('Regular file')
>     if os.path.isdir(file_path):
>         print('Directory')
>     if os.path.islink(file_path):
>         print('Symbolic link')
> 
> file_list = os.listdir(os.getcwd())
> for file_name in file_list:
>     file_type(file_name)
> ```

### exists(path)
* 파일이나 폴더가 존재하는지 판단
```python
print(os.path.exists(os.getcwd()))
```

### getsize(path)
* 파일의 크기(Byte)를 반환
```python
print(os.path.getsize(os.getcwd()))
```

### split(path), splitext(path)
* 파일과 폴더의 경로 구분(튜플 반환)
* img태그의 img url에서 이미지 파일의 경로와 이름을 분리할 때 사용
```python
print(os.path.split(os.getcwd()))  # 마지막 폴더 분리
print(os.path.splitext(os.getcwd() + '/t.txt'))  # 확장자 분리
```

### join()
* 파일 이름과 폴더 이름을 합친다
```python
join_1ist = os.path.split(os.getcwd())
print(os.path.join(join_1ist[0], join_1ist[1]))
```

### dirname()
* 완성경로의 폴더경로만 꺼낸다
```python
print(os.path.dirname(os.getcwd()))
```

### basename()
* 파일 이름만 꺼낸다
```python
print(os.path.basename(os.getcwd()))
```


## 파일의 권한

### 파일의 권한 확인
* `os.access(filepath, mode)` 
* mode에 들어갈 값
   * `os.F_OK`: 파일 자체가 존재하는 것을 테스트
   * `os.R_OK`: 읽기 권한이 있는 것을 테스트
   * `os.W_OK`: 쓰기 권한이 있는 것을 테스트
   * `os.X_OK`: 실행 권한이 있는 것(또는 디렉토리인지)을 테스트
```python
def file_access(file_path):
    print(file_path, end=' ')
    if os.access(file_path, os.F_OK):
        print('Exists', end=' ')
    else:
        return
    if os.access(file_path, os.R_OK):
        print('R', end=' ')
    if os.access(file_path, os.W_OK):
        print('W', end=' ')
    if os.access(file_path, os.X_OK):
        print('X', end=' ')
    print()

file_list = os.listdir(os.getcwd())
for file_name in file_list:
    file_access(file_name)
```


### 파일 권한 변경
* `os.chmod(path, mode)`
```python
os.chmod('t2.txt', 0o664)  # linux chmod와 같다
```

### File Rename
* `os.rename(old_file_path, new_file_path)`
```python
os.rename('t1.txt', 't.txt')
print(os.access('t.txt', os.F_OK))  # True
print(os.access('t1.txt', os.F_OK))  # False
```

### File Move
* `os.rename(old_file_path, new_file_path)`
```python
os.rename('t.txt', 'a/t1.txt')  # file move
print(os.access('t1.txt', os.F_OK))
```

### File Copy
* `shutil.copyfile(src_filepath, dest_filepath)`
```python
import os
import shutil

shutil.copyfile('t2.txt', 't.txt')
print(os.access('t.txt', os.F_OK))
```

## 파일 이름 다루기

### 1. absolute path로 변환
* `os.path.abspath(상대경로)`
```python
print(os.path.abspath('o.txt'))  # 파일의 존재유무에 관계없이 절대경로 리턴
```

### 2. 주어진 경로의 파일이 존재하는지 확인
```python
f = '/home/dong/dev/python/'
print(os.path.exists(f))
print(os.path.exists('simple.txt'))
```

### 3. 현재/부모 디렉토리를 가리키는 이름 얻기
```python
print(os.curdir)  # current directory
print(os.pardir)  # parent directory
```

### 4. 디렉토리 분리 문자 얻기
```python
print(os.sep)  # separation '/'
```

## 경로명 분리하기

### 1. 경로와 파일명으로 분리
```python
f = '/home/dong/dev/python/t.txt'

print(os.path.basename(f))  # file name 추출
print(os.path.dirname(f))  # directory path 추출
```

### 2. 경로명과 파일명을 한번에 분리. 튜플로
```python
print(os.path.split(f))  # return tuple ('directory path','file name')
```

### 3. MS 윈로우즈에서 드라이브명과 파일 경로명 분리
```python
print(os.path.splitdrive(f))  # 윈도우에서 드라이브명 확인
```

### 4. 확장자 분리
```python
print os.path.splitext(f)  # ('directory path','extension')
```

## 디렉토리에 관련된 일반 작업

### 1. 현재 작업 디렉토리 알아보기
```python
print(os.getcwd())  # current working directory
```

### 2. 작업 디렉토리 변경하기
```python
os.chdir(os.getcwd())
```

### 3. directory create
```python
os.mkdir('temp')  # 0755(rwxr-xr-x) 기본모드 , File exists -> error
os.mkdir('temp2', 0o700)  # 0700(rwx------), File exists -> error
os.makedirs('temp/level1/level2')  # 0755 기본모드, 중간에 필요한 디렉토리 생성(재귀적), File exists -> error

print os.access('/home/dong/Dev/python/python-tutorial/temp', os.F_OK)
print os.access('/home/dong/Dev/python/python-tutorial/temp2', os.F_OK)
print os.access('/home/dong/Dev/python/python-tutorial/temp/level1/level2', os.F_OK)
```

### 4. directory delete
```python
os.rmdir('temp2')  # directory에 내용이 없을 때 삭제 가능
os.rmdir('temp')  # directory에 다른 파일이 있으면 삭제x. OS error 발생
```

### 5. 다단계 디렉토리 삭제
* `os.removedirs(filepath)`
   * filepath에 지정된 디렉토리들 중 맨 `오른쪽 디렉토리부터 차례로 삭제`
   * 디렉토리에 `다른 파일이 있으면 삭제하지 않고 중단`
```python
os.removedirs('temp/level1/level2')  # <-> makedirs()
```

### 6.하위 디렉토리까지 모두 한번에 삭제
```python
shutil.rmtree('temp')  # 조심해서 사용
```

### 7. directory copy
* `shutil.copytree(src_filepath, dest_filepath)`
* 하위 디렉토리와 파일등을 지니고 있는 디렉토리를 복사
```python
os.mkdir('temp')
os.mkdir('temp/temp2', 0o700)
shutil.copytree('temp', 'myweb_backup')
```

## directory search
* `os.walk(file_path)`
* file_path부터 시작하여 재귀적으로 모든 하위 디렉토리까지 탐색하는 함수
* 탐색시 발견하는 모든 파일에 대해서 튜플 리턴
   * (dirpath, dirnames, filenames)
      * dirpath: 탐색하고 있는 디렉토리 경로
      * dirnames: dirpath안에 존재하는 서브 디렉토리 리스트
      * filenames: dirpath안에 존재하는 파일리스트
```python
import os

for path, subdirs, files in os.walk(os.getcwd()):
    for file_name in files:
        if file_name.endswith('.ttt'):
            full_path = os.path.join(path, file_name)
            print('removing', full_path)
            os.remove(full_path)
```

## example
```python
# 리눅스를 기준으로 root('/')로 부터 모든 하위 디렉토리들을 재귀적으로 방문하면서 '.py'를 확장자로 지닌 각각의 파일들에 대한 전체 경로를 출력
import os

for path, subdirs, files in os.walk('/'):
    for file_name in files:
        if file_name.endswith('.py'):  # or os.path.splitext(file_name)[1] == '.py
            full_path = os.path.join(path, file_name)
            print(full_path)
```
