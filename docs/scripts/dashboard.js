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

document.addEventListener("DOMContentLoaded", () => {
  // Display welcome message
  const userName = localStorage.getItem("userName"); // Retrieve user's name from localStorage
  const headerTitle = document.getElementById("dashboard-header"); // Dashboard header/title element

  if (headerTitle) {
    if (userName) {
      headerTitle.textContent = `Welcome, ${userName}!`; // Display the user's name
    } else {
      headerTitle.textContent = "Welcome!"; // Fallback message
      console.warn("User name not found in localStorage.");
    }
  }

  // Fetch and display tasks
  async function fetchTasks() {
    showLoading("Fetching tasks...");
  
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.ok) {
        const tasks = await response.json();
        renderTasks(tasks); // Render tasks dynamically
      } else {
        console.error("Failed to fetch tasks:", response.status);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      hideLoading();
    }
  }

  function renderTasks(tasks) {
    const taskContainer = document.getElementById("task-container");
    if (!taskContainer) {
      console.error("Task container not found!");
      return;
    }

    taskContainer.innerHTML = ""; // Clear existing tasks

    if (tasks.length === 0) {
      // Display a message if no tasks are available
      taskContainer.innerHTML = "<p>No tasks yet. Add some to get started!</p>";
      return;
    }

    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task"; // Add styling class if needed
      taskElement.textContent = task.title; // Replace with the appropriate task property
      taskContainer.appendChild(taskElement);
    });
  }

  fetchTasks(); // Call fetchTasks on page load
});

// Create a new task
async function addTask(event) {
  event.preventDefault();

  const title = document.getElementById("task-title").value;
  if (!title) {
    alert("Task title cannot be empty.");
    return;
  }

  showLoading(); // Show loading screen
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      await fetchTasks(); // Refetch tasks to update the list
    } else {
      const error = await response.json();
      alert(`Error: ${error.error || "Failed to add task"}`);
    }
  } catch (error) {
    console.error("Error adding task:", error);
  } finally {
    hideLoading(); // Hide loading screen
  }
}

// Event listeners
document.getElementById("task-form")?.addEventListener("submit", addTask); // Attach event listener to task form
