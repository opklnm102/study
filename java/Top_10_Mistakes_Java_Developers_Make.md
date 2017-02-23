# 자바 프로그래머가 자주 실수하는 10가지

> [자바 프로그래머가 자주 실수하는 10가지-1](http://bestalign.github.io/2015/08/31/top-10-mistakes-java-developers-make-1/) <br/>
> [자바 프로그래머가 자주 실수하는 10가지-2](http://bestalign.github.io/2015/09/02/top-10-mistakes-java-developers-make-2/) <br/>
> 위의 포스팅을 읽고 잊어버리기 전에 복습


### 1. 일반 배열을 ArrayList로 변환
```java
ArrayList<String> arrayList = new ArrayList<String>(Arrays.asList(arr));
```

### 2. 일반 배열에 특정 값이 들어있는지 확인
```java
Arrays.asList(arr).contains(targetValue);  //  이게 더 좋은 솔루션 

// OR

for(String s : arr){
	if(s.equils(targetValue))
		return true;
}
return false;
```

### 3. Loop에서 list의 원소 제거
```java
ArrayList<String> list = new ArrayList<String>(Arrays.asList("a", "b", "c", "d"));
Iterator<String> iter = list.iterator();
while(iter.hasnext()){
	String s = iter.next();

	if(s.equals("a")){
		iter.remove();
	}
}
```

### 4. Hashtable vs HashMap
동기화 때문에 HashMap을 사용하는 것이 좋다

### 5. Collection의 Raw Type 사용
Raw Type Collection을 사용하는 것은 타입체크를 건너뛰기 때문에 안전하지 않다
```java
public static void add(List list, Object o){
	list.add(o);
}

public static void main(String[] args){
	List<String> list = new ArrayList<String>();
	add(list, 10);  // 10이 Object로 캐스팅되어 추가되었다가
	String s = list.get(0);  // 꺼낼 때 String로 캐스팅되면서 10이 숫자이기 때문에 Exception 발생
}
```

### 6. 접근레벨
각 멤버들에게 가능한한 낮은 접근 레벨을 주는 것 -> public 남발하지 말 것

### 7. ArrayList vs LinkedList
무작정 ArrayList를 쓰지말 것. 큰 성능 차이를 불러온다
LinkedList는 Random Access가 별로없고 값의 추가/삭제가 많을 때 사용하는 것이 적당

### 8. Mutable vs Immutable
- Immutable
심플함, 안정성 등에서 많은 장점
다른 값을 위해 새로운 객체를 생성해야 해서 gc에 부하를 줄 가능성이 있다

- Mutable
하나의 객체를 만들기 위해 값을 많이 바꿀 필요가 있을 경우 사용
ex. String을 붙일경우 StringBuilder 사용, 정렬과 필터링
```java
// before
String result = "";
for(String s : arr){  // 객체가 계속 생성됨
	result = result +s;
}

// after
StringBuilder sb = new StringBuilder();
for(String s : arr){
	sb.append(s);
}
```

### 9. Super와 Sub의 생성자
```java
class Super {
	String s;

	public Super(String s){  // 생성자가 존재해서 default 생성자를 추가하지 않는다
		this.s = s;
	}
}

class Sub extends Super {
	int x = 200;

	// super class의 default 생성자 호출, error 발생
	public Sub(String s){
		super();  // 이 코드를 컴파일러가 넣는다
	}

	// super class의 default 생성자 호출, error 발생
	public Sub(){
	}
}
```

### 10. "", 생성자
```java
String a = "abc";  // method area
String b = "abc";  // method area
String c = new String("abc");  // heap
String d = new String("abc");  // heap
if(a == b)  // true
if(a.equals(b))  // true
if(c == d)  // false
if(c.equals(d))  // true
```
a와 b는 method area내의 같은 "abc"를 가리키는 레퍼런스가 된다 <br/>
c와 d는 heap내의 각자의 "abc"를 가리키는 레퍼런스가 된다 <br/>
[여기에 그림을 보면 이해가 빠름](http://www.programcreek.com/2014/03/create-java-string-by-double-quotes-vs-by-constructor/)
