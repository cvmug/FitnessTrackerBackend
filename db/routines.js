const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [routine] } = await client.query(`
      INSERT INTO routines("creatorId", "isPublic", name, goal)
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `, [creatorId, isPublic, name, goal]);
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [routine] } = await client.query(`
      SELECT *
      FROM routines
      WHERE id = $1;
    `, [id]);
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routines;
    `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users ON routines."creatorId"=users.id;
    `);
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows } = await client.query(`
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users ON routines."creatorId"=users.id
      WHERE "isPublic"=$1;
    `, [true]);
    return await attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(`
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users ON routines."creatorId"=users.id
      WHERE username=$1;
    `, [username]);
    return await attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(`
      SELECT routines.*, users.username AS "creatorName" FROM routines
      JOIN users ON routines."creatorId"=users.id
      WHERE username=$1 AND "isPublic"=true;
    `, [username]);
    return await attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const query = `
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId"=users.id
      JOIN routine_activities ON routines.id = routine_activities."routineId"
      WHERE "activityId"=$1 AND "isPublic"=true;
    `;
    const { rows } = await client.query(query, [id]);
    return await attachActivitiesToRoutines(rows);
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(', ');

    const query = `
      UPDATE routines
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `;

    const { rows: [routine] } = await client.query(query, Object.values(fields));
    return routine;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    const deleteRoutineActivitiesQuery = `
      DELETE FROM routine_activities WHERE "routineId"=${id};
    `;
    await client.query(deleteRoutineActivitiesQuery);

    const deleteRoutineQuery = `
      DELETE FROM routines WHERE id=${id}
      RETURNING *;
    `;
    const { rows: [routine] } = await client.query(deleteRoutineQuery);
    return routine;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};