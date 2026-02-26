const { Sequelize } = require("@sequelize/core");
const { MySqlDialect } = require("@sequelize/mysql");
const config = require("../../MysqlServer/utils/config");

const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: config.DATABASE,
  user: config.USERNAME,
  password: config.PASSWORD,
  host: config.HOST,
  port: config.DB_PORT
});

module.exports = sequelize;
