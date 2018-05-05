# [Java] Collections.emptyList() UnsupportedOperationException
> data를 list로 조회할 경우 존재하지 않으면 null safety를 위해 null보다는 empty list를 반환하는게 더 좋다고 한다  
> 그래서 저는 보통 Collections.emptyList()를 사용하는데, 무심코 사용하다 만난 exception에 대해 정리


* empty list를 반환할 경우 보통 `new`로 객체를 생성한다
```java
public List<Order> readRecentOrders() {
    List<Order> recentOrders = orderRepository.findRecentOrders();

    if(recentOrders == null) {
        return new ArrayList();  // 여기
    }

    return recentOrders;
}
```
* 그러나 객체 생성에는 리소스가 소모되기 때문에 미리 생성해둔 empty list를 사용한다

```java
public List<Order> readRecentOrders() {
    List<Order> recentOrders = orderRepository.findRecentOrders();

    if(recentOrders == null) {
        return Collections.emptyList();  // 여기
    }

    return recentOrders;
}
```
* `Collections.emptyList()` 사용시 주의할 점이 있는데 code를 살펴보면서 알아가보자


## Collections.emptyList()
```java
// Collections
public static final List EMPTY_LIST = new EmptyList<>();

public static final <T> List<T> emptyList() {
    return (List<T>) EMPTY_LIST;
}

private static class EmptyList<E> extends AbstractList<E> implements RandomAccess, Serializable {
    private static final long serialVersionUID = 8842843931221139166L;

    public Iterator<E> iterator() {
        return emptyIterator();
    }
    public ListIterator<E> listIterator() {
        return emptyListIterator();
    }

    public int size() {return 0;}
    public boolean isEmpty() {return true;}

    public boolean contains(Object obj) {return false;}
    public boolean containsAll(Collection<?> c) { return c.isEmpty(); }

    public Object[] toArray() { return new Object[0]; }

    public <T> T[] toArray(T[] a) {
        if (a.length > 0)
            a[0] = null;
        return a;
    }

    public E get(int index) {
        throw new IndexOutOfBoundsException("Index: "+index);
    }

    public boolean equals(Object o) {
        return (o instanceof List) && ((List<?>)o).isEmpty();
    }

    public int hashCode() { return 1; }

    @Override
    public boolean removeIf(Predicate<? super E> filter) {
        Objects.requireNonNull(filter);
        return false;
    }
    @Override
    public void replaceAll(UnaryOperator<E> operator) {
        Objects.requireNonNull(operator);
    }
    @Override
    public void sort(Comparator<? super E> c) {
    }

    // Override default methods in Collection
    @Override
    public void forEach(Consumer<? super E> action) {
        Objects.requireNonNull(action);
    }

    @Override
    public Spliterator<E> spliterator() { return Spliterators.emptySpliterator(); }

    // Preserves singleton property
    private Object readResolve() {
        return EMPTY_LIST;
    }
}

// AbstractList
public abstract class AbstractList<E> extends AbstractCollection<E> implements List<E> {
    
    public boolean add(E e) {
        add(size(), e);
        return true;
    }

    public void add(int index, E element) {
        throw new UnsupportedOperationException();
    }
}
```
* EmptyList에는 `AbstractList<E>의 add()`가 overriding되어 있지 않다
* 그렇기 때문에 `Collections.emptyList()로 반환된 List`의 add()를 호출하면 아래의 exception이 발생한다

```java
java.lang.UnsupportedOperationException
	at java.util.AbstractList.add(AbstractList.java:148)
	at java.util.AbstractList.add(AbstractList.java:108)
    ...
```
