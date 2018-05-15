# [Design Pattern] Data Transfer Object(DTO)
> remote server에 대한 다중 호출을 피하기 위해 사용하는 Data Transfer Object Pattern에 대해 정리

## Data Transfer Object(DTO)란?
* remote server에 대한 다중 호출을 피하기 위해 여러 속성이 있는 데이터를 1번에 전달하는 pattern

### Applicability
* Client가 관련된 여러 정보를 요구할 경우
* 성능을 위해 리소스를 얻기 위해
* 원격 호출 수를 줄이려는 경우

> DTO를 이용하면 Domain Object에서 View 관련 로직을 제거해서 Domain 로직에 대한 책임만 가지게 할 수 있다

---

## Example

![Data Transfer Object](https://github.com/opklnm102/study/blob/master/design-pattern/images/data_transfer_object.png)

```java
public class CustomerDto {

    private final String id;
    private final String firstName;
    private final String lastName;

    public CustomerDto(String id, String firstName, String lastName) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }
}
```
* client로 정보를 각각 보내는 대신 관련된 정보를 함께 보낸다
* 어떠한 비즈니스 로직도 가지지 않는다

```java
public class CustomerResource {

    private List<CustomerDto> customers;

    public CustomerResource(List<CustomerDto> customers) {
        this.customers = customers;
    }

    public List<CustomerDto> getAllCustomers() {
        return customers;
    }

    public void save(CustomerDto customer) {
        customers.add(customer);
    }

    public void delete(String customerId) {
        customers.removeIf(customer -> customer.getId().equals(customerId));
    }
}
```
* remote server 역할이라고 생각
* client에서 필요한 정보를 전달
* 비즈니스 로직을 가진다

```java
public class CustomerClientApp {

    public static void main(String[] args) {
        List<CustomerDto> customers = new ArrayList<>();
        CustomerDto customer1 = new CustomerDto("1", "Kelly", "Brown");
        CustomerDto customer2 = new CustomerDto("2", "Alfonso", "Bass");
        customers.add(customer1);
        customers.add(customer2);

        CustomerResource customerResource = new CustomerResource(customers);

        System.out.println("All customers:-");
        customerResource.getAllCustomers()
                .forEach(customer -> System.out.println(customer.getFirstName()));

        System.out.println("-----------------");

        customerResource.delete(customer1.getId());
        customerResource.getAllCustomers()
                .forEach(customer -> System.out.println(customer.getFirstName()));

        System.out.println("-----------------");

        CustomerDto customer3 = new CustomerDto("3", "Lynda", "Blair");
        customerResource.save(customer3);
        customerResource.getAllCustomers()
                .forEach(customer -> System.out.println(customer.getFirstName()));
    }
}
```


> #### 참고
> * [DTO와 Bean Validation](https://github.com/HomoEfficio/dev-tips/blob/master/DTO%EC%99%80%20Bean%20Validation.md)
> * [data-transfer-object](https://github.com/iluwatar/java-design-patterns/tree/master/data-transfer-object)
