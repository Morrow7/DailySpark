-- Run this script in your MySQL client to set up the database and user
-- Command: mysql -u root -p < setup_mysql.sql

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS dailyspark CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Update root password to '1234' (if that's what you want)
-- Note: Use this carefully. It changes your global root password.
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234';

-- OR: Create a specific user for the app (Recommended)
CREATE USER IF NOT EXISTS 'dailyspark'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON dailyspark.* TO 'dailyspark'@'localhost';

-- 3. Flush privileges to apply changes
FLUSH PRIVILEGES;

-- 4. Check status
SELECT user, host FROM mysql.user WHERE user = 'dailyspark';
