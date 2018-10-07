# [JavaScript] 5 Tips to Write Better Conditionals
> date - 2018.10.07  
> keyword - JavaScript, clean code, ES2016  
> [5 Tips to Write Better Conditionals in JavaScript](https://scotch.io/tutorials/5-tips-to-write-better-conditionals-in-javascript)를 읽고 ES2016에서 깔끔한 조건문 작성법을 위한 내용 정리

<br>

## 1. Use Array. includes for multiple criteria

```js
function test (fruit) {
  if (fruit === 'apple' || fruit === 'strawberry') {
    console.log('red')
  }
}
```
* cherry, cranberries 등 다른 조건이 늘어나면 `||` 가 늘어나 `조건문이 장황`해진다

### solution
* `Array.includes`를 사용
```js
function test_better (fruit) {
  // extract conditions to array
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries']

  if (redFruits.includes(fruit)) {
    console.log('red')
  }
}
```

<br>

## 2. Less Nesting, Return Early

```js
function test (fruit, quantity) {
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries']

  // condition 1: fruit must has value
  if (fruit) {
    // condition 2: must be red
    if (redFruits.includes(fruit)) {
      console.log('red')

      // condition 3: must be big quantity
      if (quantity > 10) {
        console.log('big quantity')
      }
    } else {
      throw new Error('No Fruit!')
    }
  }
}
```
* 만약 조건문이 길다면 `else를 찾기 위해 조건문 전체를 살펴야한다`
* 중첩된 조건문으로 인해 가독성이 떨어진다

### solution
* return early when invalid conditions
* inverting the condition
```js
function test_better (fruit, quantity) {
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries']

  // condition 1: fruit must has value
  if (!fruit) {
    throw new Error('No Fruit!')
  }

  // condition 2: must be red
  if (!redFruits.includes(fruit)) {
    return
  }

  console.log('red')

  // condition 3: must be big quantity
  if (quantity > 10) {
    console.log('big quantity')
  }
}
```
* 중첩된 조건문 제거
* else를 찾기 위해 아래로 내려갈 필요가 없다

<br>

## 3. Use default function parameters and destructuring
```js
function test (fruit, quantity) {
  if (!fruit) {
    return
  }

  const q = quantity || 1  // if quantity not provieded, default to one

  console.log('We have ${q} ${fruit}!')
}
```
* 항상 null, undefined를 확인해야 한다

### solution
* default parameter 사용
```js
function test_better (fruit, quantity = 1) {  // if quantity not provieded, default to one
  if (!fruit) {
    return
  }
  console.log('We have ${q} ${fruit}!')
}
```
* 훨씬 더 직관적이다

* object인 fruit도 default value를 사용하고 싶다면?
```js
function test_better (fruit) {
  if (fruit && fruit.name) {
    console.log(fruit.name)
  } else {
    console.log('unknown')
  }
}

test(undefined)  // unknown
test({})  // unknown
test({name: 'apple', color: 'red'})  // apple
```

* `default function parameter` & `destructing` 사용
```js
function test ({name} = {}) {
  console.log(name || 'unknown')
}
```
* fruit의 name만 필요하기 때문에 `fruit.name 대신 {name}`을 사용
* 3rd party 사용에 제한이 없다면 [Lodash get](https://lodash.com/docs/4.17.10#get) function, [idx](https://github.com/facebookincubator/idx)를 사용
  * [Lodash fp](https://github.com/lodash/lodash/wiki/FP-Guide)를 사용해 FP Style로 작성할 수 있다

```js
// use Lodash
function test (fruit) {
  console.log(_.get(fruit, 'name', 'unknown'))  // get property name, if not available, assign default value 'unknown'
}
```

<br>

## 4. Favor Map/Object Literal than Switch Statment
```js
function test (color) {
  switch (color) {
    case 'red':
      return ['apple', 'strawberry']
    case 'yellow':
      return ['banana', 'pineapple']
    case 'purple':
      return ['grape', 'plum']
    default:
      return []
  }
}
```
* 장황한 switch statement....

### solution
* `Object Literal` 사용
```js
const fruitColor = {
  red: ['apple', 'strawberry'],
  yellow: ['banana', 'pineapple'],
  purple: ['grape', 'plum']
}

function test (color) {
  return fruitColor[color] || []
}
```

* `Map` 사용(ES2015 이상)
```js
const fruitColor = new Map()
  .set('red', ['apple', 'strawberry'])
  .set('yellow', ['banana', 'pineapple'])
  .set('purple', ['grape', 'plum'])

function test (color) {
  return fruitColor.get(color) || []
}
```

* `Array.filter` 사용
```js
// 위의 예제를 refactoring
const fruits = [
  {name: 'apple', color: 'red'},
  {name: 'apple', color: 'red'},
  {name: 'banana', color: 'yellow'},
  {name: 'pineapple', color: 'yellow'},
  {name: 'grape', color: 'purple'},
  {name: 'plum', color: 'purple'}
]

function test (color) {
  return fruits.filter(f => f.color == color)
}
```

<br>

## 5. Use Array.every & Array.some for All/Partial Criteria
```js
function test () {
  let isAllRed = true

  // condition: all fruits must be red
  for (let f of fruits) {
    if (!isAllRed) {
      break
    }
    isAllRed = (f.color == 'red')
  }

  return isAllRed
}
```

### solution
* `Array.every`, `Array.some`를 사용
```js
function isAllRed (fruits) {
  // condition: short way, all fruits must be red
  return fruits.every(f => f.color == 'red')
}

function isAnyRed (fruits) {
  // condition: if any fruit is red
  return fruits.some(f => f.color == 'red')
}
```

<br>

> #### Reference
> * [5 Tips to Write Better Conditionals in JavaScript](https://scotch.io/tutorials/5-tips-to-write-better-conditionals-in-javascript)
