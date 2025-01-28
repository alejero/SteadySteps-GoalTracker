// Show loading screen
function showLoading(message = "Loading...") {
  const loadingMessage = document.getElementById("loading-message");
  if (loadingMessage) loadingMessage.textContent = message;

  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.remove("hidden"); // Show loading screen
  }
}

// Hide loading screen
function hideLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden"); // Hide loading screen
  }
}

// Hide loading screen on initial page load
document.addEventListener("DOMContentLoaded", hideLoading);
