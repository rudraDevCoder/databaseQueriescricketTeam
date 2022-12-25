const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server Running");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();
//get all player details
app.get("/players/", async (request, response) => {
  const sqlQuery = `
     SELECT * FROM cricket_team ORDER BY player_id`;
  const playersTable = await db.all(sqlQuery);
  response.send(playersTable);
});
//ADD PLAYER API
app.post("/players/", async (request, response) => {
  const sqlUpdateQuery = request.body;
  const { playerName, jerseyNumber, role } = sqlUpdateQuery;
  const addPlayers = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES
        ('${playerName}',
        '${jerseyNumber}',
        '${role}'
           );`;
  const playersAdd = await db.run(addPlayers);
  const playerId = playersAdd.lastID;
  //response.send(playersAdd);
  //response.send({ playerId: playerId });
  response.send("Player Added to Team");
});

//get player details based on id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetailsQuery = `
    SELECT *  FROM cricket_team WHERE player_id = ${playerId};`;
  const playerDetails = await db.get(playerDetailsQuery);
  response.send(playerDetails);
});

//update player details based on id
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
    UPDATE cricket_team SET
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
    WHERE player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//delete player based on id
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetailsQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(playerDetailsQuery);
  response.send("Player Removed");
});

module.exports = app;
