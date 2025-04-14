# [MySQL] Stored Procedure


http://www.w3resource.com/mysql/mysql-procedure.php


https://dev.mysql.com/doc/refman/5.7/en/stored-programs-defining.html





```sql
CREATE DEFINER=`test_db`@`172.31.%` PROCEDURE `reward_dummy_data`(
i INT UNSIGNED
)
BEGIN
    WHILE(@i <= 10) DO

        INSERT INTO reward(reward_id, receive_user_id, amount, occurred_at, trigger_user_id, collect_tx_id, collect_at, reward_type, reward_desc, event_id, created_at, updated_at)
        VALUES (@i, 'user1', 10.0, '2018-10-10 05:33:57', 'user2', NULL, NULL, 'MISSION', 'your mission completed', 'event_id', NOW(), NOW());

        SET @i = @i + 1;

    END WHILE;
END
```




