# [Java] Multi level grouping with streams


## Domain
```java
public class Book {
    private final String title;
    private final String author;
    private final String publisher;
    private final Category category;

    public Book(String title, String author, String publisher, Category category) {
        this.title = title;
        this.author = author;
        this.publisher = publisher;
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    public String getPublisher() {
        return publisher;
    }

    public Category getCategory() {
        return category;
    }

    @Override
    public String toString() {
        return "Book{" +
                "title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", publisher='" + publisher + '\'' +
                ", category=" + category +
                '}';
    }
}

public class Category {
    private final String name;

    public Category(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "Category{" +
                "name='" + name + '\'' +
                '}';
    }
}
```


## Single level grouping
```java
public static void singleLevelGrouping(List<Book> books) {
    final Map<String, List<Book>> booksByAuthor = books.stream()
            .collect(groupingBy(Book::getAuthor));

    System.out.println("A book written by Ethan: " + booksByAuthor.get("Ethan"));
}
```


## Two level grouping
```java
public static void twoLevelGrouping(List<Book> books) {
    final Map<String, Map<String, List<Book>>> booksByAuthorAndPublisher = books.stream()
            .collect(
                groupingBy(Book::getAuthor,
                    groupingBy(Book::getPublisher)
                )
            );

    System.out.println("The River that published the book written by ethan: " + booksByAuthorAndPublisher.get("Ethan").get("River").size());
}
```


## Three level grouping
```java
public static void threeLevelGrouping(List<Book> books) {
    final Map<String, Map<String, Map<String, List<Book>>>> booksByAuthorPublisherAndCategoryName =
            books.stream().collect(
                    groupingBy(Book::getAuthor, groupByPublisherAndCategoryName()
                    )
            );

    System.out.println("The River that published the book written by ethan: " + booksByAuthorPublisherAndCategoryName.get("Ethan").get("River").get("Fiction").size());
}

private static Collector<Book, ?, Map<String, Map<String, List<Book>>>> groupByPublisherAndCategoryName() {
    return groupingBy(Book::getPublisher, groupingBy(c -> c.getCategory().getName()));
}
```


## Run
```java
public static void main(String[] args) {
        Book book1 = new Book("Book1", "Ethan", "River", new Category("Fiction"));
        Book book2 = new Book("Book2", "Ethan", "Shy", new Category("Fiction"));
        Book book3 = new Book("Book3", "Steve", "Shy", new Category("Comic"));
        Book book4 = new Book("Book4", "Mike", "River", new Category("Fiction"));

        List<Book> peoples = Arrays.asList(book1, book2, book3, book4);

        singleLevelGrouping(peoples);
        twoLevelGrouping(peoples);
        threeLevelGrouping(peoples);
    }
```

