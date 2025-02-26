const pool = require('./src/config/db'); // Asegúrate de que este archivo existe y está configurado correctamente.

async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa a PostgreSQL:', res.rows[0]);
    } catch (error) {
        console.error('❌ Error en la conexión:', error);
    } finally {
        pool.end();
    }
}

testConnection();
