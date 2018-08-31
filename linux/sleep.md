# [Linux] Sleep
> date - 2018.08.31  
> keyword - linux, shell, sleep  
> 

<br>

## Sleep
```sh
# wait 0.5 seconds
$ sleep .5

# wait 5 seconds
$ sleep 5

# wait 5 seconds
$ sleep 5s

# wait 5 minutes
$ sleep 5m

# wait 5 hours
$ sleep 5h

# wait 5 days
$ sleep 5d
```


<br>

## example
* build script에서 application shutdown 후 완전히 종료될 때까지 기다릴 경우 사용
```sh
#!/bin/bash
echo "start build"

echo "shutdown application"
sleep 5s

echo "start application"

echo 'all done'
```


