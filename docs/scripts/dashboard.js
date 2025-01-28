import { API_BASE_URL } from "./config.js";
import {
  initializeSession,
  getToken,
  setupLogoutListener,
  resetLogoutTimer,
  initializeInactivityListener,
} from "./auth.js";

// Helper function for authenticated fetch requests
async function fetchWithAuth(url, options = {}) {
  const token = getToken(); // Get token from either storage
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
    if (!tasks || !Array.isArray(tasks)) {
      throw new Error("Tasks response is not an array or is undefined.");
    }
    renderTasks(tasks); // Render the fetched tasks
    return tasks; // Return tasks for further use
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    renderTasks([]); // Ensure empty state is shown if tasks can't be fetched
    return []; // Return an empty array in case of error
  } finally {
    hideLoading();
  }
}

// Render tasks in the DOM
function renderTasks(tasks) {
  const taskContainer = document.getElementById("task-container");
  const emptyStateContainer = document.getElementById("empty-state-container");

  if (!taskContainer || !emptyStateContainer) {
    console.error("Task container or empty state container not found!");
    return;
  }

  // Clear the task container
  taskContainer.innerHTML = "";

  if (!Array.isArray(tasks) || tasks.length === 0) {
    // If no tasks, show the empty-state-container and hide the task-container
    taskContainer.style.display = "none";
    emptyStateContainer.style.display = "flex"; // Ensure it's visible
    return;
  }

  // If tasks exist, show the task-container and hide the empty-state-container
  taskContainer.style.display = "flex"; // Ensure it's visible
  emptyStateContainer.style.display = "none";

  // Populate the task container
  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task"; // This ensures the task gets the correct styles
    taskElement.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-complete" ${
          task.completed ? "checked" : ""
        } />
        <span class="task-title ${task.completed ? "completed" : ""}">
          ${task.title}
        </span>
      </div>
      <div class="task-actions">
        <button class="edit-task" aria-label="Edit Task">✏️</button>
        <button class="delete-task" aria-label="Delete Task">🗑️</button>
      </div>
    `;

    // Attach event listeners
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
  });
}

// Add a new task
async function addTask(event) {
  event.preventDefault(); // Prevent form from submitting normally

  const taskInput = document.getElementById("task-title");
  const title = taskInput?.value.trim();

  if (!title) {
    alert("Task title cannot be empty.");
    return;
  }

  try {
    showLoading("Adding task...");
    await fetchWithAuth(`${API_BASE_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });

    taskInput.value = ""; // Clear the input field

    // Refresh tasks and update UI
    const tasks = await fetchTasks();
    updateWelcomeCard(tasks);
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

  try {
    showLoading("Deleting task...");
    await fetchWithAuth(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
    });

    // Refresh tasks and update UI
    const tasks = await fetchTasks();
    updateWelcomeCard(tasks); // Update welcome stats
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
function updateWelcomeCard(tasks) {
  const userName = localStorage.getItem("userName") || "User";
  const activeTasksCount = tasks.filter((task) => !task.completed).length;
  const completedTasksCount = tasks.filter((task) => task.completed).length;

  const welcomeCard = document.getElementById("welcome-card");
  if (welcomeCard) {
    document.getElementById("user-name").textContent = userName;
    document.getElementById("active-tasks-count").textContent =
      activeTasksCount;
    document.getElementById("completed-tasks-count").textContent =
      completedTasksCount;
  } else {
    console.error("Welcome card element not found!");
  }
}

// Setup Add Task section

function setupAddTaskSection() {
  const toggleButton = document.getElementById("toggle-add-task");
  const addTaskSection = document.getElementById("add-task-section");
  const addTaskForm = document.getElementById("add-task-form");

  if (!toggleButton || !addTaskSection || !addTaskForm) {
    console.error("Required elements for Add Task section not found!");
    return;
  }

  toggleButton.addEventListener("click", () => {
    const isVisible = addTaskSection.classList.contains("visible");

    if (isVisible) {
      addTaskSection.classList.remove("visible");
      addTaskSection.classList.add("hidden");
      toggleButton.textContent = "+ Add New Task";
    } else {
      addTaskSection.classList.remove("hidden");
      addTaskSection.classList.add("visible");
      toggleButton.textContent = "Close Add Task";
    }
  });

  addTaskForm.addEventListener("submit", addTask);
}

// Add Task Handler
async function handleAddTask(event) {
  event.preventDefault();

  const taskInput = document.getElementById("task-title");
  const title = taskInput?.value.trim();

  if (!title) {
    alert("Task title cannot be empty.");
    return;
  }

  try {
    showLoading("Adding task...");

    // Add the task via the API
    await fetchWithAuth(`${API_BASE_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });

    // Clear the input field
    taskInput.value = "";

    // Refresh tasks and update UI
    const tasks = await fetchTasks();
    updateWelcomeCard(tasks); // Update welcome stats

    // Collapse Add Task section
    const addTaskSection = document.getElementById("add-task-section");
    const toggleButton = document.getElementById("toggle-add-task");

    if (addTaskSection && toggleButton) {
      addTaskSection.classList.remove("visible");
      addTaskSection.classList.add("hidden");
      toggleButton.textContent = "+ Add New Task";
    }
  } catch (error) {
    console.error("Error adding task:", error.message);
    alert("Failed to add task. Please try again.");
  } finally {
    hideLoading();
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Initializing dashboard...");

    // Step 1: Validate session
    const sessionValid = initializeSession(); // This should check token validity
    if (!sessionValid) {
      console.warn("Session invalid. Redirecting to login.");
      return; // Stop further execution if session is invalid
    }

    // Step 1.1: Attach logout listener
    setupLogoutListener(); // Attach logout listener to the button

    // Step 2: Fetch and render tasks
    console.log("Fetching tasks...");
    const tasks = await fetchTasks(); // Fetch and render tasks
    updateWelcomeCard(tasks); // Update the welcome card stats

    // Step 3: Set up the "Add Task" section
    console.log("Setting up Add Task section...");
    setupAddTaskSection();

    // Step 4: Initialize inactivity logout
    console.log("Initializing inactivity logout...");
    resetLogoutTimer(); // Reset the inactivity logout timer
    initializeInactivityListener(); // Start inactivity logout timer

    console.log("Dashboard initialized successfully.");
  } catch (error) {
    console.error("Error initializing dashboard:", error.message);

    // Ensure fallback behavior
    updateWelcomeCard([]); // Display a fallback welcome card
  }
});

document.getElementById("add-task-form")?.addEventListener("submit", addTask);
