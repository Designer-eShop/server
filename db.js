const mysql = require("mysql");
require("dotenv").config();

const dbCfg = {
  host: process.env.MYSQL_DB_HOST,
  user: process.env.MYSQL_DB_USER,
  password: process.env.MYSQL_DB_PASS,
  database: process.env.MYSQL_DB_NAME,
  port: process.env.MYSQL_DB_PORT,
};

const database = (callback) => {
  const dbConnection = mysql.createConnection(dbCfg);
  dbConnection.connect(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Query connection");
      callback(dbConnection);
    }
  });
};

module.exports = database;
