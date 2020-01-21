# [Linux] Best way to simulate "group by" from shell
> date - 2020.01.20  
> keyword - linux, awk, sort, uniq  
> shell에서 grouping count를 어떤 과정을 통하여 하는지 정리  

<br>

## 1. Sample Data
```sh
$ kubectl get pods -o wide

NAME                                         READY     STATUS    RESTARTS   AGE       IP            NODE                                       NOMINATED NODE
user-service-d645c5c68-t64dk                 1/1       Running   0          3d        10.2.79.54    ip-10-0-1-57.us-east-1.compute.internal    <none>
cart-servuce-6f49448697-ffkwh                1/1       Running   0          2d        10.2.65.201   ip-10-0-3-114.us-east-1.compute.internal   <none>
product-service-666768bc45-9xdz8             1/1       Running   0          2d        10.2.81.109   ip-10-0-0-84.us-east-1.compute.internal    <none>
...
```

<br>

## 2. Filtering field with awk, sort
* `awk`를 사용해 원하는 조건의 필드를 filtering 후 `sort`로 정렬
```sh
$ kubectl get pods -o wide | awk '/Running/ {print $7}' | sort

ip-10-0-0-55.us-east-1.compute.internal
ip-10-0-0-55.us-east-1.compute.internal
ip-10-0-0-55.us-east-1.compute.internal
ip-10-0-0-55.us-east-1.compute.internal
ip-10-0-0-55.us-east-1.compute.internal
ip-10-0-0-84.us-east-1.compute.internal
...
```


<br>

## 3. Counting with uniq
* `uniq`를 사용해 중복된 필드 counting
```sh
$ kubectl get pods -o wide | awk '/Running/ {print $7}' | sort | uniq -c
   5 ip-10-0-0-55.ap-northeast-1.compute.internal
   7 ip-10-0-0-84.ap-northeast-1.compute.internal
   6 ip-10-0-1-184.ap-northeast-1.compute.internal
   7 ip-10-0-1-57.ap-northeast-1.compute.internal
   6 ip-10-0-2-124.ap-northeast-1.compute.internal
   7 ip-10-0-2-17.ap-northeast-1.compute.internal
  11 ip-10-0-2-177.ap-northeast-1.compute.internal
...
```

<br>

### uniq
* `-c`, `--count`
  * prefix lines by the number of occurrences
  * 발생 횟수를 line prefix로 출력


<br>

## 4. Reverse sorting with sort
* counting 결과를 `sort`로 역순 정렬
```sh
$ kubectl get pods -o wide | awk '/Running/ {print $7}' | sort | uniq -c | sort -rn
  11 ip-10-0-2-177.us-east-1.compute.internal
   7 ip-10-0-3-122.us-east-1.compute.internal
   7 ip-10-0-1-57.us-east-1.compute.internal
   7 ip-10-0-0-84.us-east-1.compute.internal
   6 ip-10-0-3-114.us-east-1.compute.internal
   6 ip-10-0-2-17.us-east-1.compute.internal
```

<br>

### sort
* `-r`, `--reverse`
  * reverse the result of comparisons
  * 역순 정렬
* `-n`, `--numeric-sort`
  * compare according to string numerical value
  * 숫자로 정렬


<br><br>

> #### Reference
> * [Best way to simulate "group by" from bash?](https://stackoverflow.com/questions/380817/best-way-to-simulate-group-by-from-bash)
> * [sort(1)](http://man7.org/linux/man-pages/man1/sort.1.html)
> * [uniq(1)](http://man7.org/linux/man-pages/man1/uniq.1.html)
