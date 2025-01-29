// Dark Mode Toggle Logic
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dark mode script loaded...");

  const toggleButton = document.getElementById("dark-mode-toggle");
  if (!toggleButton) {
    console.error("Dark mode toggle button NOT FOUND in DOM.");
    return;
  }

  toggleButton.addEventListener("click", (event) => {
    console.log("Dark mode toggle clicked!");
    document.body.classList.toggle("dark-mode");
  });

  // Also listen for clicks on the icon itself
  document.getElementById("toggle-icon")?.addEventListener("click", (event) => {
    console.log("Icon clicked, triggering dark mode...");
    event.stopPropagation(); // Prevent double event firing
    document.body.classList.toggle("dark-mode");
  });
});
