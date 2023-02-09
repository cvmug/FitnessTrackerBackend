const express = require('express');
const router = express.Router();

const { 
    getAllActivities,
    getActivityById,
    getRoutinesByActivityId,
    createActivity,
    updateActivity
  } = require('../db');

// GET /api/activities
router.get("/api/activities", async (req, res) => {
    const activities = await createActivity();
    res.json(activities);
});


// POST /api/activities
router.post('/', async (req, res, next) => {
    try {
      const activity = await createActivity(req.body);
      return res.status(201).send({
        description: activity.description,
        name: activity.name
      });
    } catch (error) {
      if (error.message.includes("duplicate key value violates unique constraint")) {
        return res.status(400).send({
          error: 'An activity with the same name already exists',
          name: req.body.name
        });
      } else {
        next(error);
      }
    }
  });
  
  router.post('/', async (req, res, next) => {
    try {
      const activity = await createActivity(req.body);
      return res.status(201).send({
        description: activity.description,
        name: activity.name
      });
    } catch (error) {
      if (error.message.includes("duplicate key value violates unique constraint")) {
        return res.status(409).send({
          error: "An activity with name " + req.body.name + " already exists"
        });
      }
      next(error);
    }
  });
  
// PATCH /api/activities/:activityId
router.patch('/:activityId', async (req, res, next) => {
    try {
      const activity = await updateActivity({
        id: req.params.activityId,
        ...req.body
      });
      if (!activity) return res.status(404).send({ 
        error: 'Activity not found',
        message: `Activity ${req.params.activityId} not found`,
        name: 'ActivityNotFoundError' });
      
      return res.send({ activity });
    } catch (error) {
      next(error);
    }
  });

// GET /api/activities/:activityId/routines

module.exports = router;
