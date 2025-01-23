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

// Fetch and render tasks from the API
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

// Render tasks in the DOM
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
    taskElement.className = "task";
    taskElement.innerHTML = `
      <input type="checkbox" class="task-complete" ${
        task.completed ? "checked" : ""
      } />
      <span class="task-title ${task.completed ? "completed" : ""}">
        ${task.title}
      </span>
      <button class="edit-task">✏️</button>
      <button class="delete-task">🗑️</button>
    `;

    // Add functionality to the actions
    taskElement
      .querySelector(".task-complete")
      .addEventListener("change", () => toggleTaskCompletion(task._id));
    taskElement
      .querySelector(".edit-task")
      .addEventListener("click", () => editTask(task));
    taskElement
      .querySelector(".delete-task")
      .addEventListener("click", () => deleteTask(task._id));

    taskContainer.appendChild(taskElement);

    // Highlight the new task
    highlightNewTask(taskElement);
  });
}

// Add a new task
async function addTask(event) {
  event.preventDefault();

  const taskInput = document.getElementById("task-title");
  const title = taskInput.value;

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
    taskInput.value = ""; // Clear the input field
    await fetchTasks(); // Refresh tasks after adding a new one
  } catch (error) {
    console.error("Error adding task:", error.message);
    alert("Failed to add task. Please try again.");
  } finally {
    hideLoading();
  }
}

// Edit a task
async function editTask(task) {
  const newTitle = prompt("Edit task title:", task.title);
  if (!newTitle) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/tasks/${task._id}`, {
      method: "PUT",
      body: JSON.stringify({ title: newTitle }),
    });

    console.log("Task updated successfully:", response);
    await fetchTasks(); // Refresh tasks after editing
  } catch (error) {
    console.error("Error editing task:", error.message);
    alert(error.message || "Failed to edit task. Please try again.");
  }
}

// Delete a task
async function deleteTask(taskId) {
  if (!taskId) {
    console.error("Task ID is undefined!");
    return;
  }

  if (!confirm("Are you sure you want to delete this task?")) return;

  showLoading("Deleting task...");
  try {
    await fetchWithAuth(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
    });

    // Fetch the updated tasks and re-render
    const tasks = await fetchWithAuth(`${API_BASE_URL}/tasks`);
    renderTasks(tasks);
  } catch (error) {
    console.error("Error deleting task:", error.message);
    alert("Failed to delete task. Please try again.");
  } finally {
    hideLoading();
  }
}

function highlightNewTask(taskElement) {
  taskElement.classList.add("added");
  setTimeout(() => taskElement.classList.remove("added"), 1000);
}

// Toggle task completion
async function toggleTaskCompletion(taskId) {
  try {
    await fetchWithAuth(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: true }), // Toggle the completion state
    });
    await fetchTasks(); // Refresh tasks after toggling
  } catch (error) {
    console.error("Error toggling task completion:", error.message);
  }
}

// Remove a task element from the DOM (For task deletion to immediately reflect in the UI without fetching the entire task list from the server)
function deleteTaskFromDOM(taskElement) {
  if (!taskElement) {
    console.error("Task element not found for deletion.");
    return;
  }

  taskElement.classList.add("removed"); // Add fade-out animation
  setTimeout(() => {
    taskElement.remove(); // Remove the task from the DOM after animation

    // Check if the task container is empty
    const taskContainer = document.getElementById("task-container");
    if (taskContainer && taskContainer.children.length === 0) {
      taskContainer.innerHTML = "<p>No tasks yet. Add some to get started!</p>";
    }
  }, 300); // Match CSS animation duration
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
