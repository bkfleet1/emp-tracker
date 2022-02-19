const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'riceuser',
  password: 'W3stW00dOn3@',
  database: 'emp_tracker'
});

module.exports = db;