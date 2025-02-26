-- 📌 Crear la base de datos (Ejecutar esto solo si no la has creado)
CREATE DATABASE activaciones;

-- 📌 Usar la base de datos
\c activaciones;

-- 📌 Tabla de Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 📌 Tabla de Formularios de Activación
CREATE TABLE activations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    activation_place VARCHAR(100) NOT NULL,
    activation_date DATE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    activation_type VARCHAR(50) NOT NULL,
    error_description TEXT,
    merchant_type INT REFERENCES merchant_types(id) ON DELETE SET NULL,
    activator_id INT REFERENCES activators(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 📌 Tabla de Tipos de Comercio
CREATE TABLE merchant_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 📌 Insertar tipos de comercio
INSERT INTO merchant_types (name) VALUES
('Carnicería'), ('Verdulería/Frutas'), ('Abarrotes'),
('Licorería/Coca'), ('Comida'), ('Ferretería'),
('Salón de Belleza'), ('Ropa y Calzados'), ('Librería'),
('Muebles'), ('Tecnología'), ('Transporte'),
('Servicios Varios'), ('Tienda');

-- 📌 Tabla de Impulsadores
CREATE TABLE activators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 📌 Insertar impulsadores
INSERT INTO activators (name) VALUES
('Jaime Loras'), ('Gustavo Noro'), ('Robert Dominguez'),
('Geraldine Loras'), ('German Tacana'), ('Jaime Jimenez');
