const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  const { rows: [activities] } = await client.query(`
INSERT INTO routine_activities("routineId", "activityId", count, duration)
VALUES($1,$2,$3,$4)
RETURNING *;
`, [routineId, activityId, count, duration]);
  return activities;
}

async function getRoutineActivityById(id) {
  const { rows: [routines] } = await client.query(`
  SELECT * FROM routine_activities
  WHERE id=$1;
  `, [id])
  return routines
}

async function getRoutineActivitiesByRoutine({ id }) {
  const { rows: routine_activities } = await client.query(`
  SELECT * FROM routine_activities
  WHERE "routineId"=$1;
  `, [id])
  return routine_activities;
}

async function updateRoutineActivity({ id, ...fields }) {
  const fieldsToUpdate = {}
  for (const key in fields) {
    if (fields[key] !== undefined) {
      fieldsToUpdate[key] = fields[key]
    }
  }
  const setString = Object.keys(fieldsToUpdate).map(
    (key, index) => `"${key}"=$${index + 1}`
  ).join(', ');
  const { rows: [activities] } = await client.query(`
    UPDATE routine_activities
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
  `, Object.values(fieldsToUpdate));
  return activities
}

async function destroyRoutineActivity(id) {
  const { rows: [routine] } = await client.query(`
  DELETE FROM routine_activities WHERE id=$1
  RETURNING *;
  `, [id])
  return routine
}

async function canEditRoutineActivity(routineActivityId, userId) {
  const { rows: [edit] } = await client.query(`
  SELECT routine_activities.id, routines."creatorId" FROM routine_activities
  JOIN routines ON routine_activities."routineId" = routines.id
  WHERE routine_activities.id =$1;
  `, [routineActivityId])
  if (edit.creatorId === userId) {
    return true
  } else {
    return false
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};