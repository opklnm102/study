
정리

update mission_user set parent_user_id = '000150786858662902466ed5dd234790' where user_id in (
select user_id
from mission_user 
where parent_user_id IS NULL
	and use_version_code < 30000
    and updated_at < '2017-09-29 06:22:36'
order by 1 asc limit 100); 

https://www.google.co.kr/search?q=Error+Code%3A+1235.+This+version+of+MySQL+doesn%27t+yet+support+%27LIMIT+%26+IN%2FALL%2FANY%2FSOME+subquery%27+0.229+sec&oq=Error+Code%3A+1235.+This+version+of+MySQL+doesn%27t+yet+support+%27LIMIT+%26+IN%2FALL%2FANY%2FSOME+subquery%27+0.229+sec&aqs=chrome..69i57.218j0j7&sourceid=chrome&ie=UTF-8


13:20:09	update mission_user set parent_user_id = '000150786858662902466ed5dd234790' where user_id in ( select user_id from mission_user  where parent_user_id IS NULL  and use_version_code < 30000     
and updated_at < '2017-09-29 06:22:36' order by 1 asc limit 100)	Error Code: 1235. This version of MySQL doesn't yet support 'LIMIT & IN/ALL/ANY/SOME subquery'	0.229 sec

