const { Pool } = require("pg");

const pool = new Pool({
  user: "student",
  host: "localhost",
  database: "express_task_manager",
  password: "password",
  port: 5432,
});

module.exports = pool;
