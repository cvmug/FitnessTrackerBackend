require("dotenv").config();
const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const { 
    createUser,
    getUserByUsername,
    getUserById,
    getAllPublicRoutines,
    getAllRoutines,
  } = require('../db');

router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const _user = await getUserByUsername(username);
        if (_user) {
            return res.status(400).json({
                error: 'A user by that username already exists',
                message: `User ${_user.username} is already taken.`,
                name: 'UserExistsError',
            });
        }
        
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Password Too Short!',
                message: 'Password Too Short!',
                name: 'PasswordTooShortError',
            });
        }
        
        const user = await createUser({ username, password });
        
        const token = jwt.sign({
            id: user.id,
            username,
        }, process.env.JWT_SECRET, {
            expiresIn: '1w',
        });
        
        return res.status(201).json({
            message: 'User created successfully',
            token,
            user,
        });
    
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to create user',
            message: error.message,
            name: error.name,
        });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({
        error: "Missing Credentials Error",
        message: "Please supply both a username and password",
        name: "MissingCredentialsError",
      });
    }
  
    try {
      const user = await getUserByUsername(username);
  
      if (user && user.password == password) {
        const token = jwt.sign({ 
          id: user.id, 
          username
        }, process.env.JWT_SECRET, {
          expiresIn: '1w'
        });
  
        return res.status(200).json({ 
          message: "you're logged in!",
          user,
          token
        });
      } else {
        return res.status(401).json({ 
          error: 'Incorrect Credentials Error', 
          message: 'Username or password is incorrect',
          name: 'IncorrectCredentialsError',
        });
      }
    } catch(error) {
      return res.status(500).json({
        error: "Server Error",
        message: error.message,
        name: error.name,
      });
    }
  });

router.get("/me", async (req, res) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUserById(decoded.id);
  
      if (!user) {
        return res.status(404).send({
          error: "User not found"
        });
      }
  
      res.send(user);
    } catch (error) {

      res.status(401).send({
        error: "Could not fetch user data",
        message: "You must be logged in to perform this action",
        name: "UnauthorizedError",
      });
    }
  });

  
  router.get("/api/users/:username/routines", async (req, res) => {
    try {
      const username = req.params.username;
      const user = await getUserByUsername(username);
  
      if (!user) {
        return res.status(400).send({ message: "User not found." });
      }
  
      let routines;
      if (!req.user) {
        routines = await getRoutines({ owner: user._id, visibility: "public" });
      } else {
        routines = await getRoutines({ owner: user._id });
      }
  
      return res.status(200).send({ routines });
    } catch (error) {
      return res.status(500).send({ message: "Error retrieving routines." });
    }
  });
  
  
  
  
module.exports = router;
