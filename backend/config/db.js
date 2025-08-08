const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Aries@2403',
  database: 'splitease'
});

module.exports = db;