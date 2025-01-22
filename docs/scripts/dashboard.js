//const API_BASE_URL = "http://localhost:5001/api"; // Update with Render URL after deployment
const API_BASE_URL = "https://steadysteps-goaltracker.onrender.com/api"; // Update with Render URL after deployment

const token = localStorage.getItem("jwtToken");

// Helper function to send requests with authorization
async function fetchWithAuth(url, options = {}) {
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

// Fetch and display tasks
async function fetchTasks() {
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const tasks = await response.json();
      renderTasks(tasks);
    } else {
      console.error("Failed to fetch tasks:", response.status);
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

function renderTasks(tasks) {
  const taskContainer = document.getElementById("task-container");
  taskContainer.innerHTML = ""; // Clear existing tasks

  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task";
    taskElement.textContent = task.title; // Adjust based on your task model
    taskContainer.appendChild(taskElement);
  });
}

// Create a new task
async function addTask(event) {
  event.preventDefault();

  const title = document.getElementById("task-title").value;
  const token = localStorage.getItem("jwtToken");

  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      fetchTasks(); // Refetch tasks to update the dashboard
    } else {
      const error = await response.json();
      console.error("Error adding task:", error);
    }
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

// Event listeners
document.getElementById("task-form")?.addEventListener("submit", addTask); // Attach event listener to task form
document.addEventListener("DOMContentLoaded", fetchTasks); // Fetch tasks on page load
