-- EasyStock: School Supplies Management System
-- MySQL 8.0+
CREATE DATABASE IF NOT EXISTS easystock;
USE easystock;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_warehouse_stock_summary;
DROP VIEW IF EXISTS v_requisition_details;
DROP TABLE IF EXISTS stock_logs, shipments, requisition_items, requisitions,
                     inventory, products, departments, warehouses, categories, suppliers;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(120) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(120) UNIQUE,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE warehouses (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    campus_location VARCHAR(150) NOT NULL,
    staff_in_charge VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(120) NOT NULL UNIQUE,
    department_type ENUM('Academic','Administrative','Laboratory','Other') DEFAULT 'Academic',
    contact_person VARCHAR(100),
    location VARCHAR(150)
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(40) NOT NULL UNIQUE,
    product_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT,
    unit VARCHAR(30) NOT NULL DEFAULT 'piece',
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    reorder_level INT NOT NULL DEFAULT 10,
    description VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    CONSTRAINT chk_product_price CHECK (unit_price >= 0),
    CONSTRAINT chk_reorder_level CHECK (reorder_level >= 0)
);

CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_inventory_product_warehouse (product_id, warehouse_id),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_inventory_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    CONSTRAINT chk_inventory_quantity CHECK (quantity_on_hand >= 0)
);

CREATE TABLE requisitions (
    requisition_id INT AUTO_INCREMENT PRIMARY KEY,
    requisition_code VARCHAR(30) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    requested_by VARCHAR(100) NOT NULL,
    request_date DATE NOT NULL,
    status ENUM('Pending','Approved','Rejected','Partially Fulfilled','Fulfilled','Cancelled')
        NOT NULL DEFAULT 'Pending',
    purpose VARCHAR(255),
    approved_by VARCHAR(100),
    approved_at DATETIME,
    CONSTRAINT fk_requisitions_department FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

CREATE TABLE requisition_items (
    requisition_item_id INT AUTO_INCREMENT PRIMARY KEY,
    requisition_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_requested INT NOT NULL,
    quantity_approved INT NOT NULL DEFAULT 0,
    quantity_issued INT NOT NULL DEFAULT 0,
    remarks VARCHAR(255),
    CONSTRAINT fk_req_items_requisition FOREIGN KEY (requisition_id) REFERENCES requisitions(requisition_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_req_items_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT chk_req_requested CHECK (quantity_requested > 0),
    CONSTRAINT chk_req_approved CHECK (quantity_approved >= 0),
    CONSTRAINT chk_req_issued CHECK (quantity_issued >= 0)
);

CREATE TABLE shipments (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_code VARCHAR(30) NOT NULL UNIQUE,
    requisition_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    shipped_by VARCHAR(100),
    received_by VARCHAR(100),
    shipment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_status ENUM('Preparing','In Transit','Delivered','Returned','Cancelled') NOT NULL DEFAULT 'Preparing',
    notes VARCHAR(255),
    CONSTRAINT fk_shipments_requisition FOREIGN KEY (requisition_id) REFERENCES requisitions(requisition_id),
    CONSTRAINT fk_shipments_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
);

CREATE TABLE stock_logs (
    stock_log_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    action_type ENUM('Restock','Issue','Adjustment','Return','Transfer') NOT NULL,
    quantity_change INT NOT NULL,
    reference_code VARCHAR(40),
    performed_by VARCHAR(100) NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),
    CONSTRAINT fk_stock_logs_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_stock_logs_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
);

-- Sample data
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES
('Campus Office Supplies','Maria Santos','09171234567','sales@campusoffice.example','Dumaguete City'),
('PaperPlus Trading','Jose Reyes','09181234567','orders@paperplus.example','Sibulan, Negros Oriental');

INSERT INTO categories (category_name, description) VALUES
('Writing Instruments','Pens, pencils, markers and related items'),
('Paper Products','Paper, notebooks and folders'),
('Laboratory Materials','Basic classroom and laboratory consumables');

INSERT INTO warehouses (warehouse_name, campus_location, staff_in_charge) VALUES
('Main Supply Room','Main Campus - Administration Building','Inventory Officer'),
('Science Stockroom','Main Campus - Science Building','Laboratory Custodian');

INSERT INTO departments (department_name, department_type, contact_person, location) VALUES
('Information Technology','Academic','Department Coordinator','IT Building'),
('Science Laboratory','Laboratory','Laboratory Custodian','Science Building'),
('Administration Office','Administrative','Office Secretary','Administration Building');

INSERT INTO products (sku, product_name, category_id, supplier_id, unit, unit_price, reorder_level, description) VALUES
('PEN-BL-001','Blue Ballpoint Pen',1,1,'piece',8.50,30,'Standard blue ink pen'),
('NOTE-A5-001','A5 Notebook',2,2,'piece',35.00,20,'80-page student notebook'),
('PPR-A4-001','A4 Bond Paper',2,2,'ream',220.00,10,'500 sheets per ream'),
('MARK-BK-001','Black Whiteboard Marker',1,1,'piece',28.00,10,'Refillable marker'),
('GLOVE-L-001','Laboratory Gloves - Large',3,1,'box',180.00,5,'Disposable laboratory gloves');

INSERT INTO inventory (product_id, warehouse_id, quantity_on_hand) VALUES
(1,1,150),(2,1,80),(3,1,25),(4,1,18),(5,2,12);

INSERT INTO requisitions (requisition_code, department_id, requested_by, request_date, status, purpose) VALUES
('REQ-2026-001',1,'Department Representative','2026-10-20','Pending','Classroom and office supplies'),
('REQ-2026-002',2,'Laboratory Custodian','2026-10-21','Approved','Laboratory activities');

INSERT INTO requisition_items (requisition_id, product_id, quantity_requested, quantity_approved, quantity_issued, remarks) VALUES
(1,1,30,0,0,'For student activities'),
(1,3,2,0,0,'For printed modules'),
(2,5,3,3,0,'For laboratory practical');

INSERT INTO shipments (shipment_code, requisition_id, warehouse_id, shipped_by, delivery_status, notes) VALUES
('SHP-2026-001',2,2,'Inventory Officer','Preparing','Awaiting dispatch');

INSERT INTO stock_logs (product_id, warehouse_id, action_type, quantity_change, reference_code, performed_by, remarks) VALUES
(1,1,'Restock',150,'OPENING-STOCK','Inventory Officer','Opening stock entry'),
(2,1,'Restock',80,'OPENING-STOCK','Inventory Officer','Opening stock entry'),
(3,1,'Restock',25,'OPENING-STOCK','Inventory Officer','Opening stock entry');

-- View: stock quantities by product and warehouse
CREATE VIEW v_warehouse_stock_summary AS
SELECT w.warehouse_name, w.campus_location, p.sku, p.product_name,
       c.category_name, i.quantity_on_hand, p.unit, p.reorder_level,
       CASE WHEN i.quantity_on_hand <= p.reorder_level THEN 'REORDER' ELSE 'Sufficient' END AS stock_status
FROM inventory i
JOIN products p ON p.product_id = i.product_id
JOIN categories c ON c.category_id = p.category_id
JOIN warehouses w ON w.warehouse_id = i.warehouse_id;

-- View: requisition details for reporting
CREATE VIEW v_requisition_details AS
SELECT r.requisition_code, r.request_date, r.status,
       d.department_name, r.requested_by, p.product_name,
       ri.quantity_requested, ri.quantity_approved, ri.quantity_issued,
       p.unit, p.unit_price
FROM requisitions r
JOIN departments d ON d.department_id = r.department_id
JOIN requisition_items ri ON ri.requisition_id = r.requisition_id
JOIN products p ON p.product_id = ri.product_id;

-- Example MySQL lessons / queries
-- INNER JOIN: products with supplier and category
SELECT p.sku, p.product_name, s.supplier_name, c.category_name
FROM products AS p
INNER JOIN suppliers AS s ON s.supplier_id = p.supplier_id
INNER JOIN categories AS c ON c.category_id = p.category_id;

-- LEFT JOIN: products that have never been requested
SELECT p.product_name
FROM products AS p
LEFT JOIN requisition_items AS ri ON ri.product_id = p.product_id
WHERE ri.requisition_item_id IS NULL;

-- RIGHT JOIN: all suppliers, including those without products
SELECT s.supplier_name, p.product_name
FROM products AS p
RIGHT JOIN suppliers AS s ON s.supplier_id = p.supplier_id;

-- SELF JOIN: products in the same category with the same unit price
SELECT p1.product_name AS product_one, p2.product_name AS product_two,
       p1.unit_price, p1.category_id
FROM products AS p1
JOIN products AS p2
  ON p1.category_id = p2.category_id
 AND p1.unit_price = p2.unit_price
 AND p1.product_id < p2.product_id;

-- Views
SELECT * FROM v_warehouse_stock_summary;
SELECT * FROM v_requisition_details;
