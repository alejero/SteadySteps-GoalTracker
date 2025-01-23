const express = require("express");
const protect = require("../middleware/authMiddleware");
const Task = require("../models/Task");
const router = express.Router();

// (Create) Create a new task
router.post("/", protect, async (req, res) => {
  const { title, completed } = req.body;
  try {
    const task = new Task({ title, completed, user: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// (Read) Get all tasks for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// (Read) Get a single task by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate task ID
    if (!id) {
      return res.status(400).json({ error: "Task ID is required." });
    }

    // Find the task by ID
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json(task); // Return the task as JSON
  } catch (error) {
    console.error("Error fetching task:", error.message);
    res.status(500).json({ error: "Failed to fetch task." });
  }
});

// (Update) Update a task
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required." });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ error: "Failed to update task." });
  }
});

// (Delete) Delete a task
router.delete("/:id", protect, async (req, res) => {
  try {
    const taskId = req.params.id;

    // Validate taskId
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required." });
    }

    // Find and delete the task
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task." });
  }
});

module.exports = router;
