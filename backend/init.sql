-- Initialize Database
CREATE DATABASE IF NOT EXISTS myntra_clone;
USE myntra_clone;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  discount INT,
  rating DECIMAL(3, 1),
  reviews VARCHAR(50),
  image_url VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  seller VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert Default Admin & User
INSERT IGNORE INTO users (id, name, mobile, email, role) VALUES 
(1, 'Admin Sahil', '9999999999', 'admin@myntra.local', 'admin'),
(2, 'Customer Rahul', '8888888888', 'rahul@myntra.local', 'user');

-- Insert Initial Products (Same as our mock data)
INSERT IGNORE INTO products (id, brand, title, price, original_price, discount, rating, reviews, image_url, description, category, seller) VALUES
(1, 'Puma', 'Men Solid Polo Collar T-shirt', 799, 1599, 50, 4.2, '1.2k', 'https://raw.githubusercontent.com/ZeroOctave/ZeroOctave-Javascript-Projects/main/assets/Images/myntraclone/pic16.webp', 'Orange solid polo collar t-shirt, has a polo collar', 'Men Topwear', 'Puma Sports'),
(2, 'Nike', 'Men Printed Round Neck T-shirt', 1299, 2199, 40, 4.5, '3.4k', 'https://raw.githubusercontent.com/ZeroOctave/ZeroOctave-Javascript-Projects/main/assets/Images/myntraclone/pic17.webp', 'Grey printed round neck t-shirt', 'Men Topwear', 'Nike India'),
(3, 'Roadster', 'Men Skinny Fit Jeans', 999, 2499, 60, 3.9, '890', 'https://raw.githubusercontent.com/ZeroOctave/ZeroOctave-Javascript-Projects/main/assets/Images/myntraclone/pic18.webp', 'Blue medium wash 5-pocket light fade skinny fit jeans', 'Men Bottomwear', 'RetailNet'),
(4, 'HRX by Hrithik Roshan', 'Men Solid Track Pants', 899, 1799, 50, 4.1, '2.1k', 'https://raw.githubusercontent.com/ZeroOctave/ZeroOctave-Javascript-Projects/main/assets/Images/myntraclone/pic19.webp', 'Black solid mid-rise track pants', 'Men Bottomwear', 'HRX Active Wear');
