const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

router.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');
  
  if (!auth) {
    next();
  } else if (!auth.startsWith(prefix)) {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
  } else {
    const token = auth.slice(prefix.length);
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      req.user = await getUserById(id);
      next();
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
});

router.get('/health', (req, res) => {
  res.send({ message: 'API is healthy' });
});

router.use('/users', require('./users'));
router.use('/activities', require('./activities'));
router.use('/routines', require('./routines'));
router.use('/routine_activities', require('./routineActivities'));

module.exports = router;
