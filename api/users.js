/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

const {
    createUser,
    getUserByUsername,
    getAllRoutinesByUser,
    getUserById
} = require('../db');

const jwt = require('jsonwebtoken');

// POST /api/users/register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const _user = await getUserByUsername(username);
        if (_user) {
            next({
                name: 'UserTakenError',
                message: `User ${_user.username} is already taken.`,
                error: 'UserTakenError'
            });
        }
        if (password.length < 8) {
            next({
                name: 'PasswordTooShortError',
                message: 'Password Too Short!',
                error: 'PasswordTooShortError'
            });
        }
        const user = await createUser({
            username,
            password
        });
        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });
        res.send({
            user,
            message: "Thank you for registering",
            token
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }
    try {
        const user = await getUserByUsername(username);
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
            const token = jwt.sign({
                id: user.id,
                username
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            });
            res.send({
                user,
                message: "you're logged in!",
                token
            });
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            });
        }
    } catch (error) {
        next(error);
    }
});

// GET /api/users/me
router.get('/me', async (req, res, next) => {
    try {
        if (req.user) {
            const {id} = req.user
            const user = await getUserById(id); 
            res.send(user)
        }
        else {
            res.status(401);
            next({
                error: 'UnauthorizedError',
                name: 'UnauthorizedError',
                message: 'You must be logged in to perform this action'
            });
        }
    } catch ( error ) {
        next( error )
    }
})

// GET /api/users/:username/routines
router.get('/:username/routines', async (req, res, next) => {
    try {
        if (req.user && (req.user.username === req.params.username)) {
            const userRoutines = await getAllRoutinesByUser(req.params);
            res.send(userRoutines);
        } else if (req.params.username) {
            const userRoutines = await getAllRoutinesByUser(req.params);
            const publicUserRoutines = userRoutines.filter(
                (routine) => routine.isPublic
            );
            res.send(publicUserRoutines);
        } else {
            next({
                error: "NotAuthorized",
                name: "UserNotFoundError",
                message: "Could not find a user by that name."
            });
        }
    } catch ( error ) {
        next( error );
    } 
})

module.exports = router;
