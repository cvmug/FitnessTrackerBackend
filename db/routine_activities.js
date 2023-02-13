const client = require("./client");

async function addActivityToRoutine({ routineId, activityId, count, duration }) {
  try {
    const { rows: [activity] } = await client.query(`
      INSERT INTO routine_activities("routineId", "activityId", count, duration)
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `, [routineId, activityId, count, duration]);
    return activity;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT * FROM routine_activities
      WHERE id=$1;
    `, [id]);
    return activity;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: activities } = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId"=$1;
    `, [id]);
    return activities;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
    const fieldsToUpdate = {};
    for (const key in fields) {
      if (fields[key] !== undefined) {
        fieldsToUpdate[key] = fields[key];
      }
    }
    const setString = Object.keys(fieldsToUpdate)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(", ");
    const { rows: [activity] } = await client.query(`
      UPDATE routine_activities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `, Object.values(fieldsToUpdate));
    return activity;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [activity] } = await client.query(`
      DELETE FROM routine_activities
      WHERE id=$1
      RETURNING *;
    `, [id]);
    return activity;
  } catch (error) {
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows: [edit] } = await client.query(`
      SELECT routine_activities.id, routines."creatorId"
      FROM routine_activities
      JOIN routines ON routine_activities."routineId" = routines.id
      WHERE routine_activities.id=$1;
    `, [routineActivityId]);
    return edit.creatorId === userId;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addActivityToRoutine,
  getRoutineActivityById,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};