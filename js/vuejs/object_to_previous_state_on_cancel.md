# [Vue.js] Object ot previous state on cancel
> date - 2018.10.09  
> keyword - vue.js  
> Vue.js에서 수정 중 취소 기능 구현시 발생한 이슈에 대해 정리

<br>

## Issue
* 리스트의 요소 클릭시 dialog에서 수정하는 기능을 만들던 도중. 수정 중 취소 버튼/esc 클릭시 이전 데이터로 복구해줘야 했었는데(안하면 Vue의 2-way data binding으로 인해 데이터 불일치 발생)
* 이전 데이터을 임시 저장하고 취소시 사용하는 방식으로 구현하려고 했으나 reference 공유로 인해 임시 저장한 데이터도 같이 변경되는 문제 발생
```html
<input type="text" v-model="task.title"/>
```

```js
exports.app = new Vue({
    ...
    methods: {
        editTodo: function (task) {
            this.beforeEditCache = task;  // 같은 reference가 공유되어서 문제 발생
            this.editedTask = task;
        },
        cancelEdit: function (task) {
            this.editedTask = {};
            task = this.beforeEditCache;  // here
        },
        ...
    }
});
```

<br>

## Solution
* `Object.asign()`으로 같은 데이터를 가지는 새로운 객체 생성으로 해결

```js
exports.app = new Vue({
    ...
    methods: {
        editTodo: function (task) {
            this.beforeEditCache = Object.assign({}, task);  // 객체 복사
            this.editedTask = task;
        },
        cancelEdit: function (task) {
            this.editedTask = {};
            Object.assign(task, this.beforeEditCache);  // here
        },
        ...
    }
});
```

<br>

## Other
* [todomvc - vue.js](https://github.com/tastejs/todomvc/blob/master/examples/vue/js/app.js)를 보면 값 자체를 저장하기 때문에 위와 같은 문제가 발생하지 않는듯
```js
exports.app = new Vue({
    ...
    methods: {
        editTodo: function (todo) {
            this.beforeEditCache = todo.title;  // value가 들어가기 때문에 문제가 없다
            this.editedTodo = tood;
        },
        cancelEdit: function (todo) {
            this.editedTodo = {};
            todo.title = this.beforeEditCache;
        },
        ...
    }
});
```


<br>

> #### Reference
> * [Vue.js return object to previous state on cancel](https://medium.com/@nickdenardis/vue-js-return-object-to-previous-state-on-cancel-2fa0f2db700a)
> * [todomvc - vue.js](https://github.com/tastejs/todomvc/blob/master/examples/vue/js/app.js)
