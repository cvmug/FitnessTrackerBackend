const client = require('./client');

async function createActivity({ name, description }) {
  try {
    const { rows: [activity] } = await client.query(`
      INSERT INTO activities(name, description)
      VALUES($1, $2)
      RETURNING *;
    `, [name, description]);
    return activity;
  } catch (error) {
    throw error;
  }
}

async function getAllActivities() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM activities;
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT * FROM activities
      WHERE id=$1;
    `, [id]);
    return activity;
  } catch (error) {
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT * FROM activities
      WHERE name=$1;
    `, [name]);
    return activity;
  } catch (error) {
    throw error;
  }
}

async function attachActivitiesToRoutines(routines) {
  const routinesWithActivities = [...routines];
  const routineIds = routines.map(routine => routine.id);
  const routineIdString = routineIds.map((routineId, index) => `$${index + 1}`).join(", ");

  const { rows: activities } = await client.query(`
    SELECT activities.*, routine_activities.duration,
    routine_activities.count,
    routine_activities."routineId",
    routine_activities.id AS "routineActivityId"
    FROM activities
    JOIN routine_activities ON activities.id = routine_activities."activityId"
    WHERE routine_activities."routineId" IN (${routineIdString})
  `, routineIds);

  activities.forEach(activity => {
    const routine = routinesWithActivities.find(routine => routine.id === activity.routineId);

    if (routine) {
      if (!routine.activities) {
        routine.activities = [];
      }
      routine.activities.push(activity);
    }
  });

  return routinesWithActivities;
}

async function updateActivity({ id, ...fields }) {
  try {
    const setString = Object.keys(fields).map(
      (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');
    const { rows: [activity] } = await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `, Object.values(fields));
    return activity;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};