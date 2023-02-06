const client = require('./client');

// database functions

async function createActivity({ name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      INSERT INTO activities (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `,
      [name, description]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

async function getAllActivities() {
  const { rows } = await client.query(`
    SELECT * FROM activities;
  `);
  return rows;
}

async function getActivityById(id) {
  const { rows } = await client.query(
    `SELECT * FROM activities WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function getActivityByName(name) {
  const { rows } = await client.query(
    `SELECT * FROM activities WHERE name = $1`,
    [name]
  );
  return rows[0];
}

//return an array of routines with new array with activities attached
//requires a join because data comes from different tables

async function attachActivitiesToRoutines(routines) {
  const RoutinesWithActivities = [...routines]
  const routineIds = routines.map(routine => routine.id).join(", ")

  //get activities related to any of the routines passed in
  const { rows: activities } = await client.query(`
  SELECT activities.*, routine_activities.duration, 
  routine_activities.count, routine_activities."routineId",
  routine_activities.id AS "routineActivityId"
  FROM activities
  JOIN routine_activities ON activities.id = routine_activities."activityId"
  WHERE routine_activities."routineId" IN (${routineIds})
  `, routineIds)
  // Attach activities to routines
  activities.forEach(activity => {
    const routine = RoutinesWithActivities.find(routine => routine.id === activity.routineId)
    if (routine) {
      if (!routine.activities) {
        routine.activities = []
      }
      routine.activities.push(activity)
    }
  })

  return RoutinesWithActivities
}

async function updateActivity({ id, ...fields }) {
  try {
    const setStatement = Object.entries(fields).map(([key, value], index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fields);
    const { rows: [activity] } = await client.query(
      `UPDATE activities
       SET ${setStatement}
       WHERE id = $` + (values.length + 1) + `
       RETURNING *;
      `,
      [...values, id]
    );

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
