const express = require('express');
const router = express.Router();

const {
    updateRoutineActivity,
    getUserById,
    canEditRoutineActivity,
    getRoutineById,
    destroyRoutineActivity,
    getRoutineActivityById,
} = require('../db');


// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', async (req, res, next) => {
    const id = req.params.routineActivityId
    const user = req.user;
    const routineActivity = await getRoutineActivityById(id)
    const routine = await getRoutineById(routineActivity.routineId)
    const { count, duration } = req.body;
    const updatedFields = { id: id }
    const canEdit = await canEditRoutineActivity(id, user.id)

    if (count) {
        updatedFields.count = count
    }
    if (duration) {
        updatedFields.duration = duration
    }

    try {
        if (!canEdit) {
            return res.status(403).send({ 
                error: 'UnauthorizedUpdateError',
                name: 'UnauthorizedUpdateError',
                message: `User ${user.username} is not allowed to update ${routine.name}` });
        } else {
            const updatedRoutineAct = await updateRoutineActivity(updatedFields)
            res.send(updatedRoutineAct)
        }
    } catch (error) {
        next(error)
    }
})


// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId', async (req, res, next) => {
    try{
        const {routineActivityId: id} = req.params;
        const {id: currentUser} = req.user
        const user = await getUserById(req.user.id)
        const routine = await getRoutineById(id);

        const {routineId} = await getRoutineActivityById(id)
        const {creatorId:routineOwner} = await getRoutineById(routineId)

        if (routineOwner == currentUser) {
            const destroyedRoutine = await destroyRoutineActivity(id)
            if (destroyedRoutine) {
                res.send(destroyedRoutine)
            }
        } else {
            res.status(403).send({ 
                error: 'UnauthorizedDeleteError',
                name: 'UnauthorizedDeleteError',
                message: `User ${user.username} is not allowed to delete ${routine.name}`
            });
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router;


