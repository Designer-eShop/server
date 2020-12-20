const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const middleware = require("./middleware");
require("./validation");
require("dotenv").config();

const database = require("./db");
const { validateInput } = require("./validation");

const port = process.env.SERVER_PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Back-End is working");
});

app.post("/login", (req, res) => {
  const email = req.body.email.toLowerCase();
  database((db) =>
    db.query(`SELECT * FROM users WHERE email = '${email}'`, (err, result) => {
      if (err || result.length === 0) {
        res.status(400).json({ msg: "Email or password is incorrect" });
      } else {
        bcrypt.compare(
          req.body.password,
          result[0].password,
          (bErr, bResult) => {
            if (bErr || !bResult) {
              res.status(400).json({ msg: "Email or password is incorrect" });
            } else if (bResult) {
              const token = jwt.sign(
                {
                  userId: result[0].id,
                  email,
                },
                process.env.SECRETKEY,
                {
                  expiresIn: "7d",
                }
              );
              db.query(
                `UPDATE users SET last_login_date = now() WHERE id = '${result[0].id}'`
              );
              res.status(200).json({
                msg: "Logged in",
                id: result[0].id,
                token,
                userData: {
                  userId: result[0].id,
                  email,
                },
              });
            }
          }
        );
      }
    })
  );
});

app.post("/register", middleware.validateRegistration, (req, res) => {
  const email = req.body.email.toLowerCase();
  const date = new Date().toISOString().slice(0, 10);
  database((db) =>
    db.query(`SELECT * FROM users WHERE email = '${email}'`, (err, result) => {
      if (err) {
        res.status(400).json(err);
      } else if (result.length !== 0) {
        res.status(400).json({ msg: "The email already exists" });
      } else {
        bcrypt.hash(req.body.password, 10, (error, hash) => {
          if (error) {
            res.status(400).json(error);
          } else {
            db.query(
              `INSERT INTO users (email, password, last_login_date) VALUES ('${email}', '${hash}', '${date}')`,
              (err, result) => {
                if (err) {
                  res.status(400).json(err);
                } else {
                  res.status(201).json({
                    msg: "User has been registered",
                  });
                }
              }
            );
          }
        });
      }
    })
  );
});

app.get("/clothes", (req, res) => {
  database((db) =>
    db.query(`SELECT * FROM clothes`, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ msg: "Internal server error" });
      } else {
        return res.status(200).json(result);
      }
    })
  );
});

app.get("/clothes/:id", (req, res) => {
  database((db) =>
    db.query(
      `SELECT * FROM clothes WHERE id = '${req.params.id}'`,
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(400).json({ msg: "Internal server error" });
        } else {
          return res.status(200).json(result);
        }
      }
    )
  );
});

app.post("/clothes", middleware.isLoggedIn, (req, res) => {
  if (
    req.body.title &&
    req.body.description &&
    req.body.price &&
    req.body.image &&
    req.body.size &&
    req.body.gender
  ) {
    database((db) =>
      db.query(
        `INSERT INTO clothes (title, description, price, image, size, gender) VALUES (${mysql.escape(
          req.body.title
        )}, ${mysql.escape(req.body.description)}, ${mysql.escape(
          req.body.price
        )}, ${mysql.escape(req.body.image)}, ${mysql.escape(
          req.body.size
        )}, ${mysql.escape(req.body.gender)})`,
        (err) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ msg: "Internal server error" });
          } else {
            return res
              .status(200)
              .json({ msg: "Product has been added successfully" });
          }
        }
      )
    );
  } else {
    return res.status(400).json({ msg: "Information entered incorrectly" });
  }
});

app.post("/updateuser", middleware.isLoggedIn, (req, res) => {
  const data = req.body;
  if (validateInput(data)) {
    database((db) =>
      db.query(
        `UPDATE users SET name = ${mysql.escape(
          req.body.name
        )}, surname = ${mysql.escape(
          req.body.surname.trim()
        )}, phone = ${mysql.escape(
          req.body.phone.trim()
        )}, street = ${mysql.escape(
          req.body.street.trim()
        )}, city = ${mysql.escape(req.body.city.trim())}, zip = ${mysql.escape(
          req.body.zip.trim()
        )} WHERE id = '${req.userData.userId}'`,
        (err) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ msg: "Internal server error" });
          } else {
            return res
              .status(200)
              .json({ msg: "User has been updated succesfully" });
          }
        }
      )
    );
  } else {
    return res.status(400).json({ msg: "Information entered incorrectly" });
  }
});

app.post("/cart", middleware.isLoggedIn, (req, res) => {
  const date = new Date().toISOString().slice(0, 10);
  if (req.body.product_id && req.body.status) {
    database((db) =>
      db.query(
        `INSERT INTO cart (user_id, date_created, product_id, status) VALUES ('${
          req.userData.userId
        }', '${date}', ${mysql.escape(req.body.product_id)}, ${mysql.escape(
          req.body.status
        )})`,
        (err) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ msg: "Internal server error" });
          } else {
            return res.status(200).json({ msg: "Cart has been created" });
          }
        }
      )
    );
  } else {
    return res.status(400).json({ msg: "Some information might be incorrect" });
  }
});

app.get("/orders", middleware.isLoggedIn, (req, res) => {
  database((db) =>
    db.query(
      `SELECT * FROM cart WHERE user_id = '${req.userData.userId}'`,
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(400).json({ msg: "Internal server error" });
        } else {
          return res.status(200).json(result);
        }
      }
    )
  );
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
