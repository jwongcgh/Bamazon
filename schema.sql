CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE products (
item_id INTEGER(100) AUTO_INCREMENT NOT NULL,
product_name VARCHAR(100) NOT NULL,
department_name VARCHAR(50) NULL,
price FLOAT(10,2) NOT NULL,
stock_quantity INTEGER(10) NULL,
PRIMARY KEY(item_id)
);
