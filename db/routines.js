const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");


async function createRoutine({ creatorId, isPublic, name, goal }) {
  const { rows: [routine] } = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1,$2,$3,$4)
    RETURNING *;
  `, [creatorId, isPublic, name, goal]);
  return routine;
}

async function getRoutineById(id) {
  const { rows: [routine] } = await client.query(` 
  SELECT *
  FROM routines
  WHERE id = $1;
  `, [id])
  return routine;
}

async function getRoutinesWithoutActivities() {
  const { rows } = await client.query(`
  SELECT * FROM routines;
  `)
  return rows
}
async function getAllRoutines() {
  const { rows: routines } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" FROM routines
  JOIN users ON routines."creatorId"=users.id;
  `)
  return await attachActivitiesToRoutines(routines);
}

async function getAllPublicRoutines() {
  const { rows } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE "isPublic"=$1;
  `, [true])
  return await attachActivitiesToRoutines(rows);
}

async function getAllRoutinesByUser({ username }) {
  const { rows } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE username=$1;
  `, [username])
  return await attachActivitiesToRoutines(rows);
}

async function getPublicRoutinesByUser({ username }) {
  const { rows } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" FROM routines
  JOIN users ON routines."creatorId"=users.id
  WHERE username=$1 AND "isPublic"=true;
  `, [username])
  return await attachActivitiesToRoutines(rows);
}

async function getPublicRoutinesByActivity({ id }) {
  const { rows } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" FROM routines
  JOIN users ON routines."creatorId"=users.id
  JOIN routine_activities ON routines.id = routine_activities."routineId"
  WHERE "activityId"=$1 AND "isPublic"=true;
  `, [id])
  return await attachActivitiesToRoutines(rows);
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  ).join(', ');
  const { rows: [routine] } = await client.query(`
  UPDATE routines
  SET ${setString}
  WHERE id=${id}
  RETURNING *;
  `, Object.values(fields))
  return routine
}

async function destroyRoutine(id) {
  await client.query(`
  DELETE FROM routine_activities WHERE "routineId"=${id};
  `)
  const { rows: [routine] } = await client.query(`
  DELETE FROM routines WHERE id=${id}
  RETURNING *;
    `)
  return routine
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