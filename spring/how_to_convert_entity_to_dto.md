# [Spring] How to convert Entity to DTO
> date - 2022.08.08  
> keyworkd - spring, java, dto  
> entity <-> dto 변환에 대한 내용 정리  

<br>

## Entity <-> DTO 변환에 사용하는 library
* [ModelMapper](http://modelmapper.org/)
* [MapStruct](https://mapstruct.org/)

## Why?
* 아래와 같이 entity와 DTO가 있을 떄 변환을 위한 메소드가 구현되는데 필드 추가/제거시 해당 메소드로 인해 생산성이 떨어지기 때문에 library를 사용하여 해결
```java
public class Car {
    private String make;
    private int numberOfSeats;
    private int numberOfDoors;
    private CarType type;

    //constructor, getters, setters etc
}

public class CarDto {
    private String make;
    private int seatCount;
    private int doorCount;
    private String type;

    //constructor, getters, setters etc
}

// convert
public CarDto convertDto(Car car){
    return CarDto.builder()
                 .make(car.getMake())
                 .seatCount(car.getNumberOfSeats())
                 .type(car.getType())
                 .build();
}
```


<br>

## ModelMapper
* 변환시 reflection을 사용하므로 `MapStruct`보다 느리다

### dependency
* build.gradle에 추가
```gradle
dependencies {
    ...
    implementation 'org.modelmapper:modelmapper:3.0.0'
}
```

<br>

### Usage
* source는 getter, target은 setter 필요
  * Entity -> DTO 변환시
    * Entity - getter 필요
    * DTO - setter 필요
  * DTO -> Entity 변환시
    * Entity - setter 필요
    * DTO - getter 필요
* MatchingStrategies.STANDARD 사용시 필드 이름이 다를 경우 매핑되지 않는다
  * `typeMap`에서 수동으로 mapping

```java
@Configuration
public class ModelMapperConfiguration {

    @Bean
    public ModelMapper modelMapper() {
        var modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STANDARD);  // default strategy

        modelMapper.typeMap(Car.class, CarDto.class).addMappings(mapping -> {
            mapping.map(Car::getNumberOfSeats, CarDto::setSeatCount);  // 이름이 다른 필드를 mapping
        });

        return modelMapper;
    }
}
```

* convert
```java
Car car = new Car("a", 4, CarType.A);
CarDto result = modelMapper.map(car, CarDto.class);
```


<br>

## MapStruct
* annotationProcessor를 사용하여 compile time에 구현체를 생성하므로 `ModelMapper`보다 빠르다

### dependency
* build.gradle에 추가
```gradle
dependencies {
    ...
    implementation 'org.mapstruct:mapstruct:1.5.2.Final'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.2.Final'
}
```


<br>

### Usage
* source는 getter, target은 생성자 필요
  * Entity -> DTO 변환시
    * Entity - getter 필요
    * DTO - 생성자 필요
  * DTO -> Entity 변환시
    * Entity - 생성자 필요
    * DTO - getter 필요

```java
@Mapper
public interface CarMapper {

    CarMapper INSTANCE = Mappers.getMapper(CarMapper.class);

    @Mapping(source = "numberOfSeats", target = "seatCount")
    @Mapping(source = "numberOfDoors", target = "doorCount")
    CarDto carToCarDto(Car car);

    @Mapping(source = "seatCount", target = "numberOfSeats")
    @Mapping(source = "doorCount", target = "numberOfDoors")
    Car carDtoToCar(CarDto car);
}
```

* convert
```java
Car car = new Car("a", 4, CarType.A);
CarDto result = CarMapper.INSTANCE.carToCarDto(car);
```

#### Generic 사용
* field mapping을 custom할 수 없으니 entity와 dto의 field를 통일해주고, `@JsonProperty`를 사용하여 response의 호환성을 보장해주자
```java
public class CarDto {
    ...
    @JsonProperty("seatCount")
    private int numberOfSeats;

    @JsonProperty("doorCount")
    private int numberOfDoors;
}
```
* mapper 생성
```java
public interface GenericMapper<D, E> {
    D toDto(E entity);

    E toEntity(D dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromDto(D dto, @MappingTarget E entity);
}

@Mapper(componentModel = "spring")  // bean으로 관리
public interface CarMapper extends GenericMapper<CarDto, Car> {
}
```

* convert
```java
@RestController
public class CarController {

    private final CarMapper carMapper;

    public CarController(CarMapper carMapper) {
        this.carMapper = carMapper;
    }

    @GetMapping(path = "/car")
    public CarDto getCar() {
        Car car = new Car("a", 4, 2, CarType.A);

        return carMapper.toDto(car);
    }
}
```
    @JsonProperty("seatCount")
    private int numberOfSeats;

    @JsonProperty("doorCount")
    private int numberOfDoors;
    


<br><br>

> #### Reference
> * [ModelMapper](http://modelmapper.org/)
> * [MapStruct](https://mapstruct.org/)
