const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', // Tu usuario de PostgreSQL
    host: 'database-1.c1ie4iyeoxkq.us-east-2.rds.amazonaws.com', // Reemplaza con el endpoint de AWS
    database: 'postgres', // Nombre de la base de datos
    password: 'Postgres2024!#', // La contraseña que configuraste
    port: 5432, // Puerto de PostgreSQL en AWS
    ssl: { rejectUnauthorized: false } // Necesario si el RDS requiere SSL
});

module.exports = pool;
