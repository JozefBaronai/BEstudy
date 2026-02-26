const logger = require("./logger");
const userDao = require("../DAO/users-dao");
const jwt = require("jsonwebtoken");

//metod,end_path,body
/**
 *
 * @param {express.Request} req
 * @param {*} res
 * @param {*} next
 */
const requestLogger = (req, _res, next) => {
  logger.info("method: ", req.method);
  logger.info("path: ", req.path);
  logger.info("body: ", req.body);
  logger.info("----------------");
  next();
};

const userExtractor = async (req, res, next) => {
  try {
    const authorization = req.get("authorization");
    if (!authorization || !authorization.startsWith("Bearer")) {
      return res.status(401).json({ error: "token is invalid" });
    }
    const token = authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.TOKEN_PASSWORD);
    if (decoded) {
      const user = await userDao.findById(decoded.id);
      req.user = user;
    } else {
      return res.status(401).json({
        error: "token is invalid",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const errorHandler = (error, _req, res, _next) => {
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "token is invalid" });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000")
  ) {
    return res.status(400).json({ error: "`name` and `email` must be unique" });
  }
  if (!error.status) {
    return res.status(400).json({ error: error.message });
  } else {
    return res.status(error.status).json({ error: error.message });
  }
  //at next known error in between reqests we create elseif statements

};

module.exports = { requestLogger, userExtractor, errorHandler };
