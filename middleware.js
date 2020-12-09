const jwt = require("jsonwebtoken");

module.exports = {
  validateRegistration: (req, res, next) => {
    if (!req.body.username || req.body.username.length < 6) {
      return res.status(400).json({
        msg: "Username cannot be created",
      });
    }
    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({
        msg: "Password cannot be created",
      });
    }
    next();
  },
  isLoggedIn: (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.SECRETKEY);
      req.userData = decodedToken;
      next();
    } catch (err) {
      return res.status(401).send({ msg: "Your session is invalid" });
    }
  },
};
