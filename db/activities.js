const client = require('./client');

async function createActivity({ name, description }) {
  const { rows: [activities] } = await client.query(`
    INSERT INTO activities(name, description)
    VALUES($1,$2)
    RETURNING *;
  `, [name, description])
  return activities;
}

async function getAllActivities() {
  const { rows } = await client.query(`
  SELECT * FROM activities;
  `)
  return rows;
}

async function getActivityById(id) {
  const { rows: [activities] } = await client.query(`
  SELECT * FROM activities
  WHERE id=$1
  `, [id])
  return activities;
}

async function getActivityByName(name) {
  const { rows: [activities] } = await client.query(`
  SELECT * FROM activities
  WHERE name=$1
  `, [name])
  return activities;
}

async function attachActivitiesToRoutines(routines) {
  const routinesWithActivities = [...routines]
  const routinesIds = routines.map(routine => routine.id)
  const binds = routines.map((routine, index) => `$${index + 1}`).join(", ")
  const { rows: activities } = await client.query(`
  SELECT activities.*, routine_activities.duration,
  routine_activities.count,
  routine_activities."routineId",
  routine_activities.id AS "routineActivityId"
  FROM activities
  JOIN routine_activities ON activities.id = routine_activities."activityId"
  WHERE routine_activities."routineId" IN (${binds})
  `, routinesIds)
  for (let i = 0; i < routinesWithActivities.length; i++) {
    const routine = routinesWithActivities[i]
    routine.activities = activities.filter(activity => activity.routineId === routine.id)
  }
  return routinesWithActivities;

}

async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  ).join(', ');
  const { rows: [activities] } = await client.query(`
    UPDATE activities
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
  `, Object.values(fields));
  return activities
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};