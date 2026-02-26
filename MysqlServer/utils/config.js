require("dotenv").config();

const PORT = process.env.PORT;
const DATABASE = process.env.NODE_ENV === "test"? process.env.TEST_DATABASE :process.env.DATABASE;
const USERNAME = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const DB_PORT = parseInt(process.env.DB_PORT);
const HOST = process.env.HOST;
module.exports = { PORT,DATABASE,USERNAME,PASSWORD,DB_PORT,HOST };
