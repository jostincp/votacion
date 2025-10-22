const fs = require('fs');
const path = require('path');

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

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
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

    // Ruta al archivo de votos (en el directorio del proyecto)
    const votesFile = path.join(process.cwd(), 'votes.json');

    // Leer votos existentes
    let votes = {};
    if (fs.existsSync(votesFile)) {
      const data = fs.readFileSync(votesFile, 'utf8');
      votes = JSON.parse(data);
    }

    // Incrementar el voto
    votes[theme] = (votes[theme] || 0) + 1;

    // Guardar votos actualizados
    fs.writeFileSync(votesFile, JSON.stringify(votes, null, 2));

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
  }
};