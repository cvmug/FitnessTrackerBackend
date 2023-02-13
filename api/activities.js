const express = require('express');
const router = express.Router();
const {
  getAllActivities,
  getPublicRoutinesByActivity,
  getActivityById,
  createActivity,
  getActivityByName,
  updateActivity
} = require('../db');

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {
  const activities = await getActivityById(req.params.activityId);
  try {
    if (!activities) {
      next({
        name: 'ActivityNotFoundError',
        message: `Activity ${req.params.activityId} not found`,
        error: 'ActivityNotFoundError'
      });
    }
    if (req.params.activityId) {
      const routines = await getPublicRoutinesByActivity({ id: req.params.activityId });
      res.send(routines);
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/activities/
router.get('/', async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities
router.post("/", async (req, res, next) => {
  const activityDetails = req.body;
  const { name } = activityDetails;
  if (name && await getActivityByName(name)) {
    next({
      name: 'ActivityExistsError',
      message: `An activity with name ${name} already exists`,
      error: 'ActivityExistsError'
    });
  }
  try {
    const newActivity = await createActivity(activityDetails);
    res.send(newActivity);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId
router.patch('/:activityId', async (req, res, next) => {
  const id = req.params.activityId;
  const { name, description } = req.body;
  const activityDetails = { id: id };
  const activityExist = await getActivityById(id);

  if (name) {
    activityDetails.name = name;
    if (await getActivityByName(name)) {
      next({
        name: 'ActivityExistsError',
        message: `An activity with name ${name} already exists`,
        error: 'ActivityExistsError'
      });
    }
  }
  if (description) {
    activityDetails.description = description;
  }
  try {
    if (!activityExist) {
      next({
        name: 'ActivityNotFoundError',
        message: `Activity ${id} not found`,
        error: 'ActivityNotFoundError'
      });
    } else if (activityExist) {
      const updatedActivity = await updateActivity(activityDetails);
      res.send(updatedActivity);
    }
  } catch (error) {
    next(error);
}
})

module.exports = router;