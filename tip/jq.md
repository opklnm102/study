# [Tip] About jq
> date - 2019.03.21  
> keyword - json  
> kube-aws에서 JSON processing에 사용되는 jq에 대해 알아보자


<br>

## jq란?
* lightweight and flexible command-line JSON processor
* `sed`, `awk`, `grep` 등이 사용할 수 있도록 structured data를 slice, filter, map, transform 해준다
  * JSON format에 대한 `sed`와 같다
* portable C로 구현되어 있고, runtime dependency가 없어서 같은 타입의 머신에 `scp`로 binary를 전달하면 사용할 수 있다


<br>

## Install

### Mac OS
```sh
$ brew install jq
```

### Linux
* Debian, Ubuntu
```sh
$ sudo apt-get install jq
```

* Fedora
```sh
$ sudo dnf install jq
```


<br>

## Usage
```sh
$ jq - commandline JSON processor [version 1.5-1-a5b5cbe]
Usage: jq [options] <jq filter> [file...]

        jq is a tool for processing JSON inputs, applying the
        given filter to its JSON text inputs and producing the
        filter's results as JSON on standard output.
        The simplest filter is ., which is the identity filter,
        copying jq's input to its output unmodified (except for
        formatting).
        For more advanced filters see the jq(1) manpage ("man jq")
        and/or https://stedolan.github.io/jq

        Some of the options include:
         -c             compact instead of pretty-printed output;
         -n             use `null` as the single input value;
         -e             set the exit status code based on the output;
         -s             read (slurp) all inputs into an array; apply filter to it;
         -r             output raw strings, not JSON texts;
         -R             read raw strings, not JSON texts;
         -C             colorize JSON;
         -M             monochrome (don't colorize JSON);
         -S             sort keys of objects on output;
         --tab  use tabs for indentation;
         --arg a v      set variable $a to value <v>;
         --argjson a v  set variable $a to JSON value <v>;
         --slurpfile a f        set variable $a to an array of JSON texts read from <f>;
        See the manpage for more options.
```


<br>

### Formatting
* `jq .`으로 간단히 formatting 가능
  * `.`은 JSON root

```sh
$ <data source> | jq .

## example
$ echo '{"foo": "bar", "foo": "bar"}' | jq .
{
  "foo": "bar",
  "foo": "bar"
}
```

* API의 JSON 응답에 바로 사용 가능
```sh
$ curl <api endpoint> | jq .

## example
$ curl 'https://api.github.com/repos/stedolan/jq/commits?per_page=5' | jq .

[
  {
    "sha": "3ea0199e031e98e92670a25e4323bd711005b5db",
    "node_id": "MDY6Q29tbWl0NTEwMTE0MTozZWEwMTk5ZTAzMWU5OGU5MjY3MGEyNWU0MzIzYmQ3MTEwMDViNWRi",
    ...
  },
   {
    "sha": "abed751e9669ee716b04a8923413c4bc2734185d",
    "node_id": "MDY6Q29tbWl0NTEwMTE0MTphYmVkNzUxZTk2NjllZTcxNmIwNGE4OTIzNDEzYzRiYzI3MzQxODVk",
    ...
   }
   ...
]
```


<br>

### Parsing
* `data.json`이란 sample data가 있다
```json
[
    {
        "first_name": "Hue",
        "last_name": "Kim",
        "contact": {
            "email": "xx@xx",
            "tel": "000-0000-0000"
        },
        "group": [
            "A",
            "B"
        ]
    },
    {
        "first_name": "Dan",
        "last_name": "Kim",
         "contact": {
            "email": "xx@xx",
            "tel": "000-0000-1111"
        },
        "group": [
            "A",
            "C"
        ]
    }
]
```

* Array의 특정 필드 추출
```sh
$ cat data.json | jq .[].first_name
"Hue"
"Dan"
```

* Array의 특정 index의 필드 추출
```sh
$ cat data.json | jq .[0].first_name
"Hue"

$ cat data.json | jq .[0].group     
[
  "A",
  "B"
]

$ cat data.json | jq .[0].group[]
"A"
"B"
```

* Array/String Slice
```sh
$ cat data.json | jq .[0:1]
[
  {
    "first_name": "Hue",
    "last_name": "Kim",
    "contact": {
      "email": "xx@xx",
      "tel": "000-0000-0000"
    },
    "group": [
      "A",
      "B"
    ]
  }
]
```


<br>

### 기존 데이터에서 새로운 JSON 만들기
* `'`, `|` 사용
```sh
$ cat data.json | jq '.[] | {email: .contact.email, tel: .contact.tel }'
{
  "email": "xx@xx",
  "tel": "000-0000-0000"
}
{
  "email": "xx@xx",
  "tel": "000-0000-1111"
}
```


#### JSON Array로 만들기
* `[]`로 묶어주기
```sh
$ cat data.json | jq '[.[] | {email: .contact.email, tel: .contact.tel }]'
[
  {
    "email": "xx@xx",
    "tel": "000-0000-0000"
  },
  {
    "email": "xx@xx",
    "tel": "000-0000-1111"
  }
]
```


<br><br>

> #### Reference
> * [jq](https://stedolan.github.io/jq/)
> * [jq - Github](https://github.com/stedolan/jq)
