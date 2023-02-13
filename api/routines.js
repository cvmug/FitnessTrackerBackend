const express = require('express');
const router = express.Router();

const {
    getAllPublicRoutines,
    createRoutine,
    getUserById,
    getRoutineById,
    updateRoutine,
    destroyRoutine,
    addActivityToRoutine,
    getRoutineActivitiesByRoutine,
} = require('../db');

// GET /api/routines
router.get('/', async (req, res, next) => {
    try {
        const pubRoutines = await getAllPublicRoutines();
        res.send(pubRoutines)
    } catch (error) {
        next(error)
    }
})

// POST /api/routines
router.post("/", async (req, res, next) => {
    const user = req.user;
    if (!user) {
        return next({
            error: 'UnauthorizedError',
            name: 'UnauthorizedError',
            message: 'You must be logged in to perform this action'
        });
    }
    const routineFields = req.body;
    const routineDetails = {creatorId: user.id, ...routineFields};
    try {
        const newRoutine = await createRoutine(routineDetails);
        res.send(newRoutine);
    } catch (error) {
        next(error);
    }
})

// PATCH /api/routines/:routineId
router.patch("/:routineId", async (req, res, next) => {
    const { isPublic, name, goal } = req.body;
    const user = req.user;

    if (!user) {
        return next({
            error: 'UnauthorizedError',
            name: 'UnauthorizedError',
            message: 'You must be logged in to perform this action'
        });
    }
    const id = user.id;
    const routineToBeUpdated = req.params.routineId;
    const beforeUpdate = await getRoutineById(routineToBeUpdated);
    const creatorId = beforeUpdate.creatorId;

    if (id === creatorId) {
        const updatedRoutine = await updateRoutine({ id, isPublic, name, goal });
        return res.send(updatedRoutine);
    } else {
        res.status(403);
        return next({
            error: 'UnauthorizedError',
            name: 'UnauthorizedError',
            message: `User ${user.username} is not allowed to update ${beforeUpdate.name}`
        });
    }
});

// DELETE /api/routines/:routineId
router.delete('/:routineId', async (req, res, next) => {
    const id = req.params.routineId;
    const user = await getUserById(req.user.id)
    const routine = await getRoutineById(id);
    try {
        if (req.user.id != routine.creatorId) {
            return res.status(403).send({ 
                error: 'UnauthorizedDeleteError',
                name: 'NotYourRoutine',
                message: `User ${user.username} is not allowed to delete ${routine.name}`
            });
        }
        const destroy = await destroyRoutine(id);
        res.send(destroy);
    } catch (error) {
        next(error);
    }
});

// POST /api/routines/:routineId/activities
router.post('/:routineId/activities', async (req, res, next) => {
    const id = req.params.routineId
    const { routineId, activityId, count, duration } = req.body
    const check = await getRoutineActivitiesByRoutine({ id })
    try {
        check.map(activity => {
            if (activity.activityId == activityId) {
                next({
                    name: 'DuplicateRoutineActivityError',
                    message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
                    error: 'DuplicateRoutineActivityError'
                })
            }
        })
        const addActivity = await addActivityToRoutine({ routineId, activityId, count, duration })
        res.send(addActivity)
    } catch (error) {
        next(error)
    }
})

module.exports = router;