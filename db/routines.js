const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {}

async function getRoutineById(id) {}

async function getRoutinesWithoutActivities() {}


//for each routune in routines array, have an activities array containing activities

async function getAllRoutines() {
  const { rows : routines } = await client.query(`
  SELECT users.username AS "creatorName, routines.* FROM routines
  JOIN users ON routine."creatorId" = users.id;
  `)

  return await attachActivitiesToRoutines(routines)
}

async function getAllPublicRoutines() {}

async function getAllRoutinesByUser({ username }) {}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

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
