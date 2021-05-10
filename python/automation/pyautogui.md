# [Python] PyAutoGUI
> date - 2021.05.10  
> keyworkd - python, automation, pyautogui  
> python 자동화에 사용하는 PyAutoGUI module에 대해 정리  


<br>

# PyAutoGUI란?
* 마우스, 키보드 자동 제어를 위한 cross-platform python module로 업무 자동화 등에 활용할 수 있다
* cross-platform을 위해 PyAutoGUI가 사용하는 API
  * Windows - Win32 API
  * macOS - Cocoa API 접근을 위해 `pyobjc` module 사용
  * Linux - X11, X Window System 접근을 위해 `Xlib` module 사용


<br>

## Install
```sh
$ pip install pyautogui
```

## Usage
<br>

### Mouse
* 마우스의 현재 좌표 리턴
```python
pyautogui.position()
```

* 마우스를 (x, y)로 이동
```python
pyautogui.moveTo(x, y)
```

* 마우스를 (x, y)로 2초동안 이동
```python
pyautogui.moveTo(x, y, 2)
```

* 현재 위치를 기준으로 (x, y)만큼 이동
```python
pyautogui.moveRel(x, y)
```

<br>

### Click
* 현 위치 click
```python
pyautogui.click()
```

* (100, 100) click
```python
pyautogui.click(x=100, y=100)
```

* 우클릭
```python
pyautogui.click(button=pyautogui.RIGHT)
```

* 3번 click
```python
pyautogui.click(clicks=3)
```

* 0.25초 간격으로 3번 click
```python
pyautogui.click(clicks=3, interval=0.25)
```

* (100, 100) double click
```python
pyautogui.doubleClick(x=100, y=100)  
```

<br>

### Drag
* 마우스 우 클릭으로 (x, y)까지 duration 동안 drag
```python
pyautogui.dragTo(x, y, duration, button='right')
```

* 마우스 우 클릭으로 현재 마우스 기준으로 (x, y)만큼 duration 동안 drag
```python
pyautogui.dragRel(x, y, duration, button='right')
```

<br>

### Scroll
* 30만큼 up scroll
```python
pyautogui.scroll(30)
```

* 30만큼 down scroll
```python
pyautogui.scroll(-30)
```

* 100, 100으로 이동후 10만큼 up scroll
```python
pyautogui.scroll(10, x=100, y=100)
```

* 30만큼 수평 scroll
```python
pyautogui.hscroll(30)
```

* -30만큼 수평 scroll
```python
pyautogui.hscroll(-30)
```


<br>

### Keyboard
* 글자 입력
```python
pyautogui.typewrite('Hello')
pyautogui.typewrite('Hello', interval=0.25)  # 0.25 간격으로 글자 입력
```

* key 입력
```python
pyautogui.press('enter')
```

* key 여러번 입력
```python
pyautogui.press(['enter', 'enter'])
pyautogui.press('enter', presses=2)
```

* key 누르고 떼기
```python
pyautogui.keyDown('shift')
pyautogui.keyUp('shift')
```

#### ctrl + v 입력
````python
pyautogui.keyDown('ctrl')
pyautogui.press('v')
pyautogui.keyUp('ctrl')
````

* 여러 key를 동시에 입력해야 할 때 `keyDown()`, `keyUp()`을 사용하면 불편 `hotkey()`를 사용하자
```python
pyautogui.hotkey('ctrl', 'v')
```

#### 한글 입력
* unicode는 `typewirte()`로 입력이 불가하여 `pyperclip.copy()` 사용
```python
pyperclip.copy("안녕")
pyautogui.hotkey('ctrl', 'v')  # Windows
pyautogui.hotkey('command', 'v')  # macOS
```

<br>

### Screen
* 현재 스크린의 해상도를 리턴
```python
pyautogui.size()
```

* x, y가 현재 해상도 내에 존재하는지에 대해서 확인
```python
pyautogui.onScreen(x, y)
```

#### screenshot 찍기
```python
pyautogui.screenshot()
pyautogui.screenshot('test_screenshot.png')  # 파일로 저장
pyautogui.screenshot('test_screenshot.png', region=(0, 0, 300, 300))  # (0, 0) ~ (300, 300)을 파일로 저장
```

#### screenshot으로 좌표를 찾는다
```python
location = pyautogui.locateOnScreen('a.png')
print(location)
```

#### 이미지 영역의 가운데 위치 click
```python
location = pyautogui.locateOnScreen('a.png')
center = pyautogui.center(location)
pyautogui.doubleClick(center)

# locateCenterOnScreen() 사용
center = pyautogui.locateCenterOnScreen('a.png')
pyautogui.doubleClick(center)
```


<br>

### Message Box
* 사용자에게 간단한 창을 띄우거나, yes/no button을 누르게 하거나, text를 입력 받게 할 수 있다
```python
alert_message_box = pyautogui.alert(text='text', title='title', button='OK')
print(alert_message_box)  # button의 text print
```

#### OK/Cancel button이 있는 message box 표시
```python
confirm_message_box = pyautogui.confirm(text='text', title='title', buttons=['OK', 'Cancel'])
print(confirm_message_box)
```

#### 입력창이 있는 message box 표시
* 입력한 text 리턴, Cancel은 None 리턴
```python
prompt_message_box = pyautogui.prompt(text='text', title='title', default='default')
print(prompt_message_box)
```
#### masking되는 prompt message box
```python
password_message_box = pyautogui.password(text='text', title='title', default='default', mask='*')
print(password_message_box)
```


<br>

## 특정 window 활성화하여 조작하기
* `Window` OS에서만 가능
```python
import pyautogui
import pywinauto
import pygetwindow

win = pygetwindow.getWindowsWithTitle('Chrome')[0]  # window title이 Chrome인 것을 조회

if not win.isActive:
    pywinauto.application.Application().connect(handle=win._hWnd).top_window().set_focus()

win.activate() # window를 활성화

pyautogui.click(win.center)  # window의 center를 click
pyautogui.click(win.left, win.top)  # window의 왼쪽 최상단을 click
```


<br>

## Conclusion
* 매크로의 기본인 마우스 조작에 `PyAutoGUI`를 활용할 수 있다
* `PyAutoGUI`를 활용해 자동화를 구현하면 도움이 될 것이다


<br><br>

> #### Reference
> * [PyAutoGUI Docs](https://pyautogui.readthedocs.io/en/latest/index.html)
