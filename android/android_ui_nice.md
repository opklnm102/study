# [Android UI 멋지게 만들기: 예제로 배우는 팁과 노하우](https://realm.io/kr/news/gotocph-israel-ferrer-camacho-android-ui/) 요약

<사진 넣기>

## RecyclerView가 View를 재활용하는 과정
1. 다음 위치를 보여줄 때 `LayoutManager`가 `RecyclerView의 getViewForPosition()`을 호출
2. RecyclerView가 `Adapter에게 ViewType을 묻는다`
3. `View Type`을 얻으면 재활용할 수 있는 모든 ViewHolders가 있는 `RecyclePool`에게서 `해당 Type의 ViewHolder`를 받는다
   * 없다면 Adapter로 가서 새로 생성 -> `onCreateViewHolder()`
   * 있는 경우라면 Adapter에게 건네주고 ViewHolder를 새 데이터와 새 위치로 바인딩할 수 있냐고 묻는다 -> `onBindViewHolder()`
4. 받은 정보를 RecyclerView로 다시 돌려주고, `LayoutManager가 해당 View를 화면에 보여준다`

> ### LayoutManager의 역할
> * Item View들을 측정
> * Item View의 위치 지정
> * 더이상 보이지 않는 View를 언제 재활용할 것인지 결정


## Shared Element Transition
* 액티비티 전환 상태를 호출해서 새 전환을 시작 -> ActivityTransitionCoordinator가 호출
* 프레임워크의 기본 전환은 `ViewOverlay` 사용

### ActivityTransitionCoordinator
* 가본 클래스로 2개의 Coordinator를 가짐
   1. EnterTransitionCoordinator - 들어오는 전환 처리
   2. ExitTransitionCoordinator - 나가는 전환 처리
* 이들은 TransitionManager를 가지고 있음
   * Transition은 기본값을 갖고 있지만 원한다면 테마를 바꿀 수 있고, 커스텀할 수 있다

### ViewOverlay
* `View 위`에 투명한 레이어를 제공
* 모든 유형의 시각적 콘텐츠를 추가할 수 있고 `맨위의 레이어에 영향을 주지 않도록 한다`
* 레이어 계층 구조를 망치지 않고도 무엇이든 움직일 수 있도록 해준다
* 애니메이션에서 즐겨 사용

```java
ViewOverlay overlay = LinearLayout.getOverlay();
overlay.add(ImageView);  // ImageView는 LinearLayout에서 Overlay에 속한다
```
* 모든 터치 이벤트, 애니메이션이 ViewOverlay로 위임

### Shared Element Transition 제약
* 사용자가 터치로 전환을 제어X -> 한시점에서 다른 시점으로 넘어가는 간단한 애니메이션이라
* 대상 목적지를 추적하지 않기 때문에 실행되는 동안 모든 터치 이벤트를 무효화하지 않으면 이상해 보인다.
```java
public static interface TransitionListener {
    void onTransitionStart(Transition transition);  
    void onTransitionEnd(Transition transition);  
    void onTransitionCancel(Transition transition);  
    void onTransitionPause(Transition transition);  
    void onTransitionResume(Transition transition);
}
```
* `TransitionListener.onTransitionStart()`에서 모든 터치 이벤트를 무효화

## 이미지의 중요 속성
### ClipChildren
* ViewGroup의 속성
* default - true
* ViewGroup의 경계를 넘지 않게 해준다

### ClipPadding
* 패딩을 넘지 않게 해줌

### View의 모든 부모를 찾아서 false로 바꾸는 유틸
```java
public static void disableParentsClip(@NonNull View view){
    while(view.getParent() != null &&
        view.getParent() instanceof ViewGroup){
            ViewGroup viewGroup = (ViewGroup)view.getParent();
            viewGroup.setClipChildren(false);
            viewGroup.setClipToPadding(false);
            view = viewGroup;
        }
}

public static void enabledParentsClip(@NonNull View view){
    while(view.getParent() != null &&
        view.getParent() instanceof ViewGroup){
            ViewGroup viewGroup = (ViewGroup)view.getParent();
            viewGroup.setClipChildren(true);
            viewGroup.setClipToPadding(true);
            view = viewGroup;
        }
}
```


























