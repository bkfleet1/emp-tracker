const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: '',
  password: '',
  database: 'emp_tracker'
});

module.exports = db;