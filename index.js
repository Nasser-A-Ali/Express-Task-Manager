const express = require("express");
const { Pool } = require("pg");
const app = express();
const PORT = 3000;

const pool = new Pool({
  user: "student",
  host: "localhost",
  database: "express_task_manager",
  password: "password",
  port: 5432,
});

app.use(express.json());

let tasks = [
  { id: 1, description: "Buy groceries", status: "incomplete" },
  { id: 2, description: "Read a book", status: "complete" },
];

// Create the tasks table
async function createTasksTable() {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                description TEXT NOT NULL,
                status TEXT NOT NULL
            );
        `);
    console.log("Tasks table was created successfully");
  } catch (error) {
    console.error("Error creating tasks table", error);
  }
}

createTasksTable();

// GET /tasks - Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting tasks", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
  // res.json(tasks);
});

// POST /tasks - Add a new task
app.post("/tasks", (request, response) => {
  const { description, status } = request.body;
  if (!description || !status) {
    return response
      .status(400)
      .json({ error: "Description and status are both required" });
  }

  try {
    const result = pool.query(
      `
            INSERT INTO tasks (description, status) VALUES ($1, $2) RETURNING *
        `,
      [description, status]
    );
    response
      .status(201)
      .json({ message: "Task added successfully", task: result.rows[0] });
  } catch (error) {
    console.error("Error adding task", error);
    response.status(500).json({ error: "An unexpected error occurred" });
  }
});

// PUT /tasks/:id - Update a task's status
app.put("/tasks/:id", (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  const { status } = request.body;

  if (!status) {
    return response.status(400).json({ error: "Status is required" });
  }

  try {
    const result = pool.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, taskId]
    );
    response.status(200).json({
      message: "Task updated successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating task", error);
    response.status(500).json({ error: "An unexpected error occurred" });
  }
});

// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", (request, response) => {
  const taskId = parseInt(request.params.id, 10);

  try {
    const result = pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [
      taskId,
    ]);
    response.status(204).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task", error);
    response.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
