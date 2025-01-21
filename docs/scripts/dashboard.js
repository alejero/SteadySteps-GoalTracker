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
    const tasks = await fetchWithAuth(`${API_BASE_URL}/tasks`);
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = ""; // Clear the list

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.textContent = task.title;
      taskList.appendChild(li);
    });
  } catch (error) {
    alert(error.message);
  }
}

// Create a new task
async function createTask(event) {
  event.preventDefault();
  const title = document.getElementById("task-title").value;

  try {
    await fetchWithAuth(`${API_BASE_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    document.getElementById("task-title").value = ""; // Clear input
    fetchTasks(); // Refresh task list
  } catch (error) {
    alert(error.message);
  }
}

// Event listeners
document.getElementById("task-form")?.addEventListener("submit", createTask);
document.addEventListener("DOMContentLoaded", fetchTasks);