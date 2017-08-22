# Ch2. Creating and Destorying Objects(객체의 생성과 삭제)
> Effective Java를 읽으며 공부했던 내용을 정리한다


## 규칙 1. Consider static factory methods instead of constrictors


## 규칙 2. Consider a builder when faced with many constructor


## 규칙 3. Enforce the singleton property with private constructor or an enum type


## 규칙 4. Enforce noninstantiability with a private constructor


## 규칙 5. Avoid creating unnecessary objects


## 규칙 6. Eliminate obsolete object references


## 규칙 7. Avoid finalizers




# Ch3. Methods Common to All Objects

8. Obey the general contract when overriding equals

9. Always override hasCode when you override equals

10. Always override toString

11. Override clone judiciously

12. Consider implementing Comparable


# Ch4. Classes and Interfaces

13. Minimize the accessibility of classes and members

14. In public classes, use accessor methods, not public fields

15. Minimize mutablility

16. Favor composition over inheritance

17. Design and document for inheritance or else prohibit it

18. Prefer interfaces to abstract classes

19. Use interfaces only to define types

20. Prefer class hierachies to tagged classes

21. Use function objects to represent strategies

22. Favor static member classes over nonstatic


# Ch5. Generics

23. Don't use raw types in new code

24. Eliminate unchecked warnings

25. Prefer lists to arrays

26. Favor generic types

27. Favor generic methods

28. Use bounded wildcards to increase API flexibility

29. Consider typesafe heterogeneous containers


# Ch8. General Programming

45. Minimize the scope of local variables

46. Prefer for-each loops to traditional for loops

47. Know and use the libraries

48. Avoid float and double if exact answers are required

49. Prefer primitive types to boxed primitives

50. Avoid strings where other types are more appropriate

51. Beware the performance of string concatenation

52. Refer to objects by their interfaces

53. Prefer interfaces to reflection

54. Use native methods judiciously

55. Optimize judiciously

56. Adhere to generally accepted naming conventions


# Ch9. Exceptions

57. Use exceptions only for exceptional conditions

58. Use checked exceptions for recoverable conditions and runtime exceptions for programming errors

59. Avoid unnecessary use of checked exceptions

60. Favor the use of standard exceptions

61. Throw exceptions appropiate to the abstarction

62. Document all exceptions thrown by each method

63. Include failure-capture information in detail messages

64. Strive for failure atomicity

65. Don't ignore exceptions


# Ch10. Concurrency

66. Synchronize access to shared mutable data

67. Avoid excessive synchronization

68. Prefer executors and tasks to threads

69. Prefer concurrency utilities to wait and notify

70. Document thread safety

71. Use lazy initialization judiciously

72. Don't depend on the thread scheduler

73. Avoid thread groups


# Ch11. Serialization

74. Implement Serializable judiciously

75. Consider using a custom serialized form

76. Write readObject methods defensively

77. For instance control, perfer enum types to readResolve

78. Consider serialization proxies instead of serialized instances


