const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config();

const port = process.env.SERVER_PORT || 8080;

const con = mysql.createConnection({
  host: process.env.MYSQL_DB_HOST,
  user: process.env.MYSQL_DB_USER,
  password: process.env.MYSQL_DB_PASS,
  database: process.env.MYSQL_DB_NAME,
  port: process.env.MYSQL_DB_PORT,
});

con.connect((err) => {
  if (err) throw err;
  console.log("Successfully connected to DB");
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/add-user", (req, res) => {
  const data = req.body;
  if (data.fullname && data.company && data.address) {
    con.query(
      `INSERT INTO users (name, company, address)
       VALUES ('${data.fullname}', '${data.company}', '${data.address}')`,
      (err, result) => {
        if (err) {
          res
            .status(400)
            .send(
              "The DB has not added any records due to an internal problem"
            );
        } else {
          res.status(201).json({ id: result.insertId });
        }
      }
    );
  } else {
    res.status(400).send("The information provided is not correct.");
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
