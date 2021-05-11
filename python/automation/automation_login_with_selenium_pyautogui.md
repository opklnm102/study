# [Python] Automation login with selenium, pyautogui
> date - 2021.05.11  
> keyworkd - python, automation, pyautogui, selenium  
> PyAutoGUI, Selenium을 활용하여 로그인을 자동화하는 방법에 대해 정리  

<br>

## Install
* 자동화에 필요한 module을 설치하자
```sh
$ pip install pyautogui selenium webdriver-manager
```


<br>

## Implement
로그인 과정을 세분화해보자

1. 웹 사이트의 로그인 페이지에 접속
2. ID 입력 칸으로 이동
3. ID 입력
4. Password 입력 칸으로 이동
5. Password 입력
6. 로그인 시도(Enter)

Facebook의 경우 home에서 바로 로그인이 가능하고 ID 입력 칸에 커서가 위치하여 바로 입력 가능

<div align="center">
  <img src="./images/facebook_login.png" alt="Facebook Login pages" width="80%" height="80%"/>
</div>


<br>

### Code
* app.py
```python
import sys
import time

from login_macro import LoginBot


login_url = 'https://www.facebook.com'

print('start')
start_time = time.time()

id = sys.argv[1]
password = sys.argv[2]

login_bot = LoginBot()
login_bot.login(login_url, id, password)
login_bot.kill()

print(f'done {time.time() - start_time}')
```

* login_macro.py
```python
import time

import pyautogui
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager


class LoginBot:
    def __init__(self):
        self.driver = webdriver.Chrome(ChromeDriverManager().install())
        self.driver.set_window_size(1600, 900)

    def kill(self):
        self.driver.quit()

    def login(self, url, id, password):
        self.driver.get(url)  # 웹 사이트의 로그인 페이지에 접속
        time.sleep(5)  # 페이지 로딩 대기

        pyautogui.typewrite(id)  # ID 입력
        pyautogui.press('tab')  # Password 입력 칸으로 이동
        pyautogui.typewrite(password)  # Password 입력
        pyautogui.press('enter')  # 로그인 시도
        time.sleep(10)  # 로그인 성공/실패 대기
```

<br>

### Usage
```sh
$ python app.py '<ID>' '<Password>'
```

<br><br>

> #### Reference
> * [PyAutoGUI Docs](https://pyautogui.readthedocs.io/en/latest/index.html)
> * [Selenium Docs](https://www.selenium.dev/documentation/ko/)
