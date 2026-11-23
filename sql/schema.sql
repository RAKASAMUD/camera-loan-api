CREATE DATABASE IF NOT EXISTS loan_db;
USE loan_db;

CREATE TABLE IF NOT EXISTS loans (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  camera_name   VARCHAR(100) NOT NULL,
  borrower_name VARCHAR(100) NOT NULL,
  loan_date     DATE NOT NULL,
  due_date      DATE NOT NULL,
  status        ENUM('BORROWED','RETURNED') NOT NULL DEFAULT 'BORROWED'
);
