const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  const { rows: [user] } = await client.query(
    `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
    [username, password]
  );

  return user;
}

async function getUser({ username, password }) {
  const { rows: [user] } = await client.query(
    `SELECT * FROM users WHERE username = $1 AND password = $2`,
    [username, password]
  );

  return user;
}

async function getUserById(userId) {
  const { rows: [user] } = await client.query(
    `SELECT * FROM users WHERE id = $1`,
    [userId]
  );

  return user;
}

async function getUserByUsername(username) {
  const { rows: [user] } = await client.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );

  return user;
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
