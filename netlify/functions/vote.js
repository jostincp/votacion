const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'modulotest085.mysql.db',
  user: process.env.DB_USER || 'modulotest085_usr',
  password: process.env.DB_PASSWORD || 'sXcELVoz2s',
  database: process.env.DB_NAME || 'modulotest085',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

exports.handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  let connection;

  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);

    // Crear tabla si no existe
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS halloween_votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        theme VARCHAR(50) NOT NULL UNIQUE,
        votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Si es GET, devolver todos los votos
    if (event.httpMethod === 'GET') {
      const [rows] = await connection.execute('SELECT theme, votes FROM halloween_votes');
      const votes = {};
      rows.forEach(row => {
        votes[row.theme] = row.votes;
      });

      // Asegurar que todos los temas estén presentes
      const allThemes = ['La purga', 'F1', 'Hombres de negro', 'Oxxo', 'Minecraft'];
      allThemes.forEach(theme => {
        if (!(theme in votes)) {
          votes[theme] = 0;
        }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(votes)
      };
    }

    // Solo permitir POST para votar
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

    const { theme } = JSON.parse(event.body);

    // Validar que el tema sea válido
    const validThemes = ['La purga', 'F1', 'Hombres de negro', 'Oxxo', 'Minecraft'];
    if (!validThemes.includes(theme)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Tema inválido' })
      };
    }

    // Insertar o actualizar el voto
    await connection.execute(`
      INSERT INTO halloween_votes (theme, votes)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE votes = votes + 1
    `, [theme]);

    // Obtener todos los votos actualizados
    const [rows] = await connection.execute('SELECT theme, votes FROM halloween_votes');
    const votes = {};
    rows.forEach(row => {
      votes[row.theme] = row.votes;
    });

    // Asegurar que todos los temas estén presentes
    validThemes.forEach(theme => {
      if (!(theme in votes)) {
        votes[theme] = 0;
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(votes)
    };

  } catch (error) {
    console.error('Error procesando el voto:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};