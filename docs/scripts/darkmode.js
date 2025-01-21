// Dark Mode Toggle Logic
const darkModeToggle = document.getElementById("dark-mode-toggle");
const toggleIcon = document.getElementById("toggle-icon");

// Initialize dark mode based on saved preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.classList.toggle("dark-mode", savedTheme === "dark");
  toggleIcon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

// Add event listener to toggle dark mode
darkModeToggle.addEventListener("click", () => {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  toggleIcon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";

  // Save the user's preference
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});
