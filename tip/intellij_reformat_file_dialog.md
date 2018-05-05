# [Tip] IntelliJ - Reformat File Dialog
> code review시에 내가 작성한 코드가 아닌 auto reformat 때문에 변경사항을 파악하기 어려운 경우 사용할 수 있는 IntelliJ의 기능에 대해 정리

* `Reformat File Dialog`에서 scope를 `Only VCS changed text`로 변경하면 이번 commit에서 변경한 code에만 reformat을 적용할 수 있다

## Scope
* Only VCS changed text
   * VCS에서 변경된 영역에만 reformat이 적용
* Selected text
   * 선택한 영역에만 reformat 적용
* Whole file
   * 파일 전체에 reformat 적용

## Optional
* Optimize imports
   * Scope내에서 optimize import까지 적용
* Rearrange code
   * Code Style settings에 따라 code를 재배열


> #### 참고
> * [Reformat File Dialog](https://www.jetbrains.com/help/idea/reformat-file-dialog.html)
