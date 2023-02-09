const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const result = await client.query(
      `
        INSERT INTO routines ("creatorId", "isPublic", name, goal)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `,
      [creatorId, isPublic, name, goal]
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
        SELECT users.username AS creatorName, routines.* FROM routines
        WHERE routines.id = $1;
      `,
      [id]
    );
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routines } = await client.query(
      `
        SELECT routines.* FROM routines;
      `
    );
    return routines;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(
      `
        SELECT routines.*, users.username AS "creatorName" FROM routines
        JOIN users ON routines."creatorId" = users.id;
      `
    );
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(
      `
        SELECT users.username AS "creatorName", routines.* FROM routines
        JOIN users ON routines."creatorId" = users.id
        WHERE routines."isPublic" = true;
      `
    );
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        SELECT * FROM users
        WHERE username = $1;
      `,
      [username]
    );

    if (!user) return [];

    const { rows: routines } = await client.query(
      `
        SELECT users.username AS "creatorName", routines.* FROM routines
        JOIN users ON routines."creatorId" = users.id
        WHERE routines."creatorId" = $1;
      `,
      [user.id]
    );
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        SELECT * FROM users
        WHERE username = $1;
      `,
      [username]
    );

    if (!user) return [];

    const { rows: routines } = await client.query(
      `
        SELECT users.username AS "creatorName", routines.* FROM routines
        JOIN users ON routines."creatorId" = users.id
        WHERE routines."creatorId" = $1 AND routines."isPublic" = true;
      `,
      [user.id]
    );
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(
      `
        SELECT routines.*, users.username AS "creatorName" FROM routines
        JOIN routine_activities ON routines.id = routine_activities."routineId"
        JOIN users ON routines."creatorId" = users.id
        WHERE routine_activities."activityId" = $1 AND routines."isPublic" = true;
      `,
      [id]
    );
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  let query = `UPDATE routines SET "isPublic" = $2, name = $3`;
  let values = [id, fields.isPublic, fields.name];
  let index = 4;
  if (fields.goal) {
    query += `, goal = $${index}`;
    values.push(fields.goal);
    index++;
  }
  query += ` WHERE id = $1 RETURNING *`;
  const { rows } = await client.query(query, values);

  return rows[0];
}

async function destroyRoutine(id) {
  try {
    const { rows: routines } = await client.query(
      `
        DELETE FROM routines 
        WHERE id = $1 
        RETURNING *;
        `,
      [id]
    );
    return routines[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
createRoutine,
getRoutineById,
getRoutinesWithoutActivities,
getAllRoutines,
getAllPublicRoutines,
getAllRoutinesByUser,
getPublicRoutinesByUser,
getPublicRoutinesByActivity,
updateRoutine,
destroyRoutine
};



