const client = require("./client");

async function addActivityToRoutine({ routineId, activityId, count, duration }) {
  try {
    const { rows: [routineActivity] } = await client.query(
      `
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [routineId, activityId, count, duration]
    );

    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivityById(id) {
  try {
    const { rows: [routineActivity] } = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE id = $1
      `,
      [id]
    );

    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routineActivities } = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE "routineId" = $1
      `,
      [id]
    );

    return routineActivities;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
    const keys = Object.keys(fields);
    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(", ");
    const values = [id, ...Object.values(fields)];

    const { rows: [routineActivity] } = await client.query(
      `
      UPDATE routine_activities
      SET ${setClause}
      WHERE id = $1
      RETURNING *
      `,
      values
    );

    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  const query = `DELETE FROM routine_activities
                 WHERE id = $1
                 RETURNING *`;
  const values = [id];
  const { rows } = await client.query(query, values);

  return rows[0];
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows: [routineActivity] } = await client.query(
      `
      SELECT *
      FROM routine_activities
      JOIN routines
      ON routines.id = routine_activities."routineId"
      WHERE routine_activities.id = $1
      AND routines."createdBy" = $2
      `,
      [routineActivityId, userId]
    );

    return Boolean(routineActivity);
  } catch (error) {
    throw error;
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
