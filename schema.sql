CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE products (
item_id INTEGER(10) AUTO_INCREMENT NOT NULL,
product_name VARCHAR(100) NOT NULL,
department_name VARCHAR(50) NULL,
price FLOAT(10,2) NOT NULL,
stock_quantity INTEGER(10) NULL,
PRIMARY KEY(item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
('SAS Rage 70 lb. 30" Compound Bow', 'Sports and Outdoors', 499.99, 4),
('Transcend 1 TB USB 3.0 External Hard Drive', 'Computers', 64.00, 9),
('Echo Dot 2nd Generation', 'Amazon Devices', 49.99, 5),
('SanDisk - Ultra Fit 128GB USB 3.0 FlashDrive', 'Computers', 119.99, 6),
('Eagles: The Very Best of (Audio CD + DVD)', 'Music', 16.99, 2),
('Apple iPhone 7 unlocked CDMA/GSM 64GB', 'Electronics', 700.00, 1),
('Jumbo Swag Hook with Hardware', 'Tools', 5.72, 200),
('Mass Effect Andromeda Deluxe - Xbox One', 'Video Games', 69.96, 3),
('Odd Thomas - DVD', 'Movies', 7.07, 2),
('Makita 18V XPH102 Cordless 1/2" Hammer Driver-Crill Kit', 'Tools', 129.00, 7);

SELECT * FROM products;

DROP TABLE products;

SHOW tables;