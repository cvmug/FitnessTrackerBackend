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
    try {
        const id = req.params.routineActivityId;
        const { count, duration, goal, isPublic, name } = req.body;
        const user = req.user;
        const routineActivity = await getRoutineActivityById(id);
        const routine = await getRoutineById(routineActivity.routineId);
        const canEdit = await canEditRoutineActivity(id, user.id);

        if (!canEdit) {
            return res.status(403).send({ 
                name: 'UnauthorizedUpdateError',
                message: `User ${user.username} is not allowed to update ${routine.name}`,
                error: 'UnauthorizedUpdateError'
            });
        } 

        const updateDetails = { id, 
            ...(count && { count }), 
            ...(duration && { duration }), 
            ...(goal && { goal }), 
            ...(isPublic && { isPublic }), 
            ...(name && { name }) };
        const updatedRoutineActivity = await updateRoutineActivity(updateDetails);
        res.send(updatedRoutineActivity);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId', async (req, res, next) => {
    try {
        const { routineActivityId: id } = req.params;
        const user = await getUserById(req.user.id);
        const routine = await getRoutineById(id);
        const { creatorId: routineOwner } = routine;
        const { id: currentUser } = req.user;

        if (routineOwner !== currentUser) {
            return res.status(403).send({ 
                name: 'UnauthorizedDeleteError',
                message: `User ${user.username} is not allowed to delete ${routine.name}`,
                error: 'UnauthorizedDeleteError'
            });
        } 

        const destroyedRoutine = await destroyRoutineActivity(id);
        res.send(destroyedRoutine);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
