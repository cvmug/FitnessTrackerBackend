// Requires
const client = require('./client');
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10;

async function createUser ({username, password}) {
    try {
        const hashPass = await bcrypt.hash(password, SALT_ROUNDS);
            const {rows: [user]} = await client.query(`
                INSERT INTO users(username, password) 
                VALUES($1, $2) 
                ON CONFLICT (username) DO NOTHING 
                RETURNING id, username;
            `, [username, hashPass]);
            return user;
        
    } catch (error) {
        console.log(error)
        throw error
    }
}

async function getUser ({username, password}) {
    try {
        const queriedUser = await getUserByUsername(username);
        const hashPass = queriedUser.password;
        const correctPass = await bcrypt.compare(password,hashPass) 
        if (correctPass) {
            delete queriedUser.password;
            return queriedUser;
        }
    } catch (error) {
        throw error
    }
}

async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE id=$1;
    `, [userId]);
    delete user.password;
    return user;
  } catch (error) {
    console.error(error);  
    throw error;
  }
}

async function getUserByUsername (username) {
    try {
        const {rows: [user]} = await client.query(`
            SELECT * 
            FROM users
            WHERE username = $1;
        `, [username]);
        return user
    } catch (error) {
        throw error
    }
}

async function getUserNameByUsername (username) {
    try {
        const {rows: [user]} = await client.query(`
            SELECT username 
            FROM users
            WHERE username = $1;
        `, [username]);
        return user
    } catch (error) {
        throw error
    }
}

module.exports = {
    createUser,
    getUser,
    getUserById,
    getUserByUsername,
    getUserNameByUsername
}
