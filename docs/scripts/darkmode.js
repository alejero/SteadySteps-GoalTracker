// Dark Mode Toggle Logic
document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const toggleIcon = document.getElementById("toggle-icon");

  // Check local storage for dark mode setting
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode");
    toggleIcon.classList.remove("fa-moon");
    toggleIcon.classList.add("fa-sun");
  }

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      toggleIcon.classList.remove("fa-moon");
      toggleIcon.classList.add("fa-sun"); // Switch to sun icon
    } else {
      localStorage.setItem("theme", "light");
      toggleIcon.classList.remove("fa-sun");
      toggleIcon.classList.add("fa-moon"); // Switch to moon icon
    }
  });
});
