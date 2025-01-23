// Dark Mode Toggle Logic
const darkModeToggle = document.getElementById("dark-mode-toggle");
const toggleIcon = document.getElementById("toggle-icon");

// Initialize dark mode based on saved preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.classList.toggle("dark-mode", savedTheme === "dark");
  toggleIcon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
  updateTaskStyles(); // Ensure tasks reflect the current theme
}

// Add event listener to toggle dark mode
darkModeToggle.addEventListener("click", () => {
  const isDarkMode = document.documentElement.classList.toggle("dark-mode");
  toggleIcon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";

  // Save the user's preference
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");

  // Update tasks dynamically to reflect the new theme
  updateTaskStyles();
});

// Update task styles dynamically
function updateTaskStyles() {
  const tasks = document.querySelectorAll(".task");
  const root = document.documentElement;

  tasks.forEach((task) => {
    task.style.backgroundColor = getComputedStyle(root).getPropertyValue(
      "--task-background-color"
    );
    task.style.color = getComputedStyle(root).getPropertyValue("--text-color");
  });
}
