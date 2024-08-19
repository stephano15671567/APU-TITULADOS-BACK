import mysql2 from "mysql2/promise";
import db from "../database/connection.js";

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

export const getStateSpecific = async (req, res) => {
  const connection = await createConnection();
  const { state } = req.params;
  try {
    const [rows] = await connection.query("SELECT * FROM states WHERE state = ?", [
      state,
    ]);
    res.json(rows);
  } catch (error) {
    console.error("Error getting state:", error);
    res.status(500).send("Server error");
  } finally {
    await connection.end();
  }
}

export const getStates = async (req, res) => {
  const connection = await createConnection();
  try {
    const [rows] = await connection.query("SELECT * FROM states");
    res.json(rows);
  } catch (error) {
    console.error("Error getting states:", error);
    res.status(500).send("Server error");
  } finally {
    await connection.end();
  }
};

export const addState = async (req, res) => {
  const connection = await createConnection();
  const { RUT, state} = req.body;
  const process_date = new Date()
  try {
    const [result] = await connection.query(
      "INSERT INTO states (RUT, state, process_date) VALUES (?, ?, ?)",
      [RUT, state, process_date]
    );
    res.json(result);
  } catch (error) {
    console.error("Error creating state:", error);
    res.status(500).send("Server error");
  } finally {
    await connection.end();
  }
};

export const updateState = async (req, res) => {
  const connection = await createConnection();
  const { RUT, state } = req.body;
  let comment = req.body.comments
  if (!comment){
    comment = "-"
  }
  const process_date = new Date()
  try {
    const [result] = await connection.query(
      "UPDATE states SET state = ?, process_date = ?, comments = ? WHERE RUT = ?",
      [state, process_date, comment, RUT]
    );
    res.json(result);
  } catch (error) {
    console.error("Error updating state:", error);
    res.status(500).send("Server error");
  } finally {
    await connection.end();
  }
};
