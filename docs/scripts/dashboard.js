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
  const activeTasksList = document.getElementById("active-tasks-list");
  const completedTasksList = document.getElementById("completed-tasks-list");

  // Ensure containers exist before modifying them
  if (!activeTasksList || !completedTasksList) {
    console.error("Task containers not found.");
    return;
  }

  // Clear existing task elements before re-rendering
  activeTasksList.innerHTML = "";
  completedTasksList.innerHTML = "";

  // Check if there are tasks
  if (!tasks || !Array.isArray(tasks)) {
    console.error("Invalid task data.");
    return;
  }

  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");
    taskElement.setAttribute("data-task-id", task._id);

    taskElement.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="task-complete" ${
          task.completed ? "checked" : ""
        } />
        <span class="task-title ${
          task.completed ? "completed" : ""
        }" contenteditable="true">
          ${task.title}
        </span>
      </div>
      <div class="task-actions">
        <button class="delete-task" aria-label="Delete Task">🗑️</button>
      </div>
    `;

    // Append task to the correct section
    if (task.completed) {
      completedTasksList.appendChild(taskElement);
    } else {
      activeTasksList.appendChild(taskElement);
    }

    // Add event listeners
    taskElement
      .querySelector(".task-complete")
      .addEventListener("change", () => toggleTaskCompletion(task._id));
    taskElement
      .querySelector(".delete-task")
      .addEventListener("click", () => deleteTask(task._id));
  });
}

// Toggle Completed Task Section Visibility
// document.getElementById("toggle-completed").addEventListener("click", () => {
//   document
//     .getElementById("completed-task-container")
//     .classList.toggle("collapsed");
// });

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

async function updateTaskTitle(taskId, newTitle) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title: newTitle }),
    });

    if (!response.ok) {
      throw new Error("Failed to update task title.");
    }

    console.log("Task title updated successfully.");
  } catch (error) {
    console.error("Error updating task title:", error);
    alert("Failed to update task title. Please try again.");
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

    // Fetch updated tasks and update UI
    const tasks = await fetchTasks();

    // Update the welcome card stats *only if elements exist*
    if (document.getElementById("welcome-card")) {
      updateWelcomeCard(tasks);
    } else {
      console.warn("Welcome card not found, skipping update.");
    }
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
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

    if (!taskElement) {
      console.error("Task element not found in DOM");
      return;
    }

    const isCompleted = taskElement.querySelector(".task-complete").checked;

    console.log("Sending PATCH request with:", {
      completed: isCompleted,
    });

    const response = await fetchWithAuth(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }, // ✅ Ensure proper headers
      body: JSON.stringify({ completed: isCompleted }),
    });

    console.log("Raw response from server:", response);

    const data = await response.json();
    console.log("Task completion updated successfully:", data);

    if (!data || !data._id) {
      throw new Error("Failed to update task completion");
    }

    // Refresh the UI
    const tasks = await fetchTasks();
    renderTasks(tasks);
  } catch (error) {
    console.error("Error toggling task completion:", error.message);
    alert("Failed to update task completion.");
  }
}

// Move a task element in the DOM (For immediate UI updates without fetching the entire task list from the server)
function moveTaskInUI(taskId, completed) {
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
  if (!taskElement) {
    console.error(`Task element with ID ${taskId} not found`);
    return;
  }

  // Find the correct containers
  const activeTasksContainer = document.getElementById("active-tasks");
  const completedTasksContainer = document.getElementById("completed-tasks");

  // Ensure containers exist
  if (!activeTasksContainer || !completedTasksContainer) {
    console.error("Task containers not found");
    return;
  }

  console.log(
    `Moving Task ${taskId} to ${completed ? "Completed Tasks" : "Active Tasks"}`
  );

  // Remove from current location
  taskElement.remove();

  // Move task to the correct section
  if (completed) {
    taskElement.classList.add("completed-task");
    completedTasksContainer.appendChild(taskElement);
  } else {
    taskElement.classList.remove("completed-task");
    activeTasksContainer.appendChild(taskElement);
  }

  // Update the checkbox state
  taskElement.querySelector(".task-complete").checked = completed;
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

// Collapsible Tasks Sections
// function setupCollapsibleSections() {
//   const activeTasksSection = document.getElementById("active-tasks");
//   const completedTasksSection = document.getElementById("completed-tasks");

//   if (activeTasksSection && completedTasksSection) {
//     [activeTasksSection, completedTasksSection].forEach((section) => {
//       const header = section.querySelector(".task-section-header");

//       if (header) {
//         header.addEventListener("click", () => {
//           section.classList.toggle("collapsed");

//           // Update the chevron icon rotation
//           const icon = header.querySelector("i");
//           if (icon) {
//             icon.classList.toggle("fa-chevron-down");
//             icon.classList.toggle("fa-chevron-up");
//           }
//         });
//       }
//     });
//   }
// }

// Ensure collapsing behavior works correctly
function setupTaskCollapsing() {
  const taskSections = document.querySelectorAll(".task-section");

  taskSections.forEach((section) => {
    const header = section.querySelector(".task-header");

    header.addEventListener("click", () => {
      section.classList.toggle("collapsed");
    });
  });
}

// Display a welcome message
function updateWelcomeCard(tasks = []) {
  const userNameElement = document.getElementById("user-name");
  const activeTasksElement = document.getElementById("active-tasks-count");
  const completedTasksElement = document.getElementById(
    "completed-tasks-count"
  );

  if (!userNameElement || !activeTasksElement || !completedTasksElement) {
    console.error("Welcome card elements not found! Skipping update.");
    return; // Exit function early if elements are missing
  }

  const userName = localStorage.getItem("userName") || "User";
  const activeTasksCount = tasks.filter((task) => !task.completed).length;
  const completedTasksCount = tasks.filter((task) => task.completed).length;

  userNameElement.textContent = userName;
  activeTasksElement.textContent = activeTasksCount;
  completedTasksElement.textContent = completedTasksCount;
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
      return;
    }

    // Step 2: Setup Logout Button
    setupLogoutListener();

    // Step 3: Fetch and render tasks
    console.log("Fetching tasks...");
    const tasks = await fetchTasks();
    updateWelcomeCard(tasks);

    // Step 4: Set up the "Add Task" section
    // console.log("Setting up Add Task section...");
    // setupAddTaskSection();

    // Step 5: Initialize inactivity logout
    console.log("Initializing inactivity logout...");
    resetLogoutTimer();
    initializeInactivityListener();

    // Step 6: Setup collapsible task sections
    // setupCollapsibleSections();
    setupTaskCollapsing();

    console.log("Dashboard initialized successfully.");
  } catch (error) {
    console.error("Error initializing dashboard:", error.message);
    updateWelcomeCard([]); // Display a fallback welcome card
  }
});

document.getElementById("add-task-form")?.addEventListener("submit", addTask);
