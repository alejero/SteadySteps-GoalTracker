// Loading animations
function showLoading(message = "Loading...") {
  const loadingMessage = document.getElementById("loading-message");
  if (loadingMessage) loadingMessage.textContent = message;

  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "flex"; // Show the loading screen
  }
}

function hideLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "none"; // Hide the loading screen
  }
}

// Ensure the loading screen is hidden after the page loads
document.addEventListener("DOMContentLoaded", () => {
  hideLoading(); // Hide the loading screen after initial page load
});
