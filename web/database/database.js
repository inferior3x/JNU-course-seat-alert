const personal = require('../personal');

const mysql = require("mysql2/promise");
const pool = mysql.createPool({
host: 'localhost',
database: 'course_seat_alert',
user: 'root',
password: personal.password
})
module.exports = pool