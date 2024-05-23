const mysql = require('mysql');
const { config } = require('dotenv');


config();
const db_password = process.env.DISCORD_TOKEN;


// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'discord',
  password: db_password,
  database: 'discord_db',
  connectTimeout: 10000
});

// Open the MySQL connection
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

module.exports = connection;
