USE Bamazon;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
('SAS Rage 70 lb. 30" Compound Bow', 'Sports and Outdoors', 499.99, 20),
('Transcend 1 TB USB 3.0 External Hard Drive', 'Computers', 64.00, 10),
('Echo Dot 2nd Generation', 'Amazon Devices', 49.99, 4),
('SanDisk - Ultra Fit 128GB USB 3.0 FlashDrive', 'Computers', 119.99, 20),
('Eagles: The Very Best of (Audio CD + DVD)', 'Music', 16.99, 20),
('Apple iPhone 7 unlocked CDMA/GSM 64GB', 'Electronics', 700.00, 20),
('Jumbo Swag Hook with Hardware', 'Tools', 5.72, 2),
('Mass Effect Andromeda Deluxe - Xbox One', 'Video Games', 69.96, 10),
('Odd Thomas - DVD', 'Movies', 7.07, 35),
('Makita 18V XPH102 Cordless 1/2" Hammer Driver-Crill Kit', 'Tools', 129.00, 20);

SELECT * FROM products;

-- UPDATE products SET stock_quantity = 20;