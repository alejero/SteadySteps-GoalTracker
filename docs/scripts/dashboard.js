import { API_BASE_URL } from "./config.js";

// Helper function for authenticated fetch requests
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    console.error("No token found in localStorage.");
    throw new Error("Unauthorized: No token available.");
  }

  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "An error occurred");
  }

  return response.json();
}

// Render tasks in the task container
function renderTasks(tasks) {
  const taskContainer = document.getElementById("task-container");
  if (!taskContainer) {
    console.error("Task container not found!");
    return;
  }

  taskContainer.innerHTML = ""; // Clear existing tasks

  if (tasks.length === 0) {
    taskContainer.innerHTML = "<p>No tasks yet. Add some to get started!</p>";
    return;
  }

  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task"; // Add styling class if needed
    taskElement.textContent = task.title; // Adjust to match your Task model
    taskContainer.appendChild(taskElement);
  });
}

// Fetch tasks from the API
async function fetchTasks() {
  showLoading("Fetching tasks...");
  try {
    const tasks = await fetchWithAuth(`${API_BASE_URL}/tasks`);
    renderTasks(tasks); // Render the fetched tasks
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    alert("Failed to load tasks. Please try again.");
  } finally {
    hideLoading();
  }
}

// Add a new task
async function addTask(event) {
  event.preventDefault();

  const title = document.getElementById("task-title").value;
  if (!title) {
    alert("Task title cannot be empty.");
    return;
  }

  showLoading("Adding task...");
  try {
    await fetchWithAuth(`${API_BASE_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    await fetchTasks(); // Refresh tasks after adding a new one
  } catch (error) {
    console.error("Error adding task:", error.message);
    alert("Failed to add task. Please try again.");
  } finally {
    hideLoading();
  }
}

// Display a welcome message
function displayWelcomeMessage() {
  const userName = localStorage.getItem("userName");
  const headerTitle = document.getElementById("dashboard-header");

  if (headerTitle) {
    headerTitle.textContent = userName ? `Welcome, ${userName}!` : "Welcome!";
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  displayWelcomeMessage(); // Show user's name
  fetchTasks(); // Load tasks on page load
});

document.getElementById("task-form")?.addEventListener("submit", addTask);
