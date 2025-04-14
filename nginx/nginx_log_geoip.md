


geoIp

```sh
# /etc/nginx/nginx.conf
http {
    ...

    log_format custom '$remote_addr - $remote_user [$time_local] '
                      '"$request" $status $body_bytes_sent '
                      '"$http_referer" "$http_user_agent" '
                      '"$http_x_forwarded_for" $request_id '
                      '$geoip_country_name $geoip_country_code '
                      '$geoip_region_name $geoip_city ';

    여기 있는 geoip를 사용하는 방법에 대해 정리..!!
}
```


https://www.howtoforge.com/tutorial/how-to-use-geoip-with-nginx-on-ubuntu-16.04/

https://www.google.co.kr/search?q=nginx+ip+geolocation&oq=nginx+ip+geo&aqs=chrome.1.69i57j0l5.6502j0j7&sourceid=chrome&ie=UTF-8



