# [Shell Script] How to sensitive input in shell script
> date - 2022.08.19  
> keyword - shell script  
> shell script에서 password 같은 민감한 정보를 입력받을 때 사용하는 방법을 정리  

<br>

## Example
```sh
#!/usr/bin/env bash

set -eo pipefail

echo -n "Enter password: "
read -sr PASSWORD
echo
```
