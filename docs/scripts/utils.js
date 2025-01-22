
// Loading animations
function showLoading(message = "Loading...") {
  const loadingMessage = document.getElementById("loading-message");
  if (loadingMessage) loadingMessage.textContent = message;

  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) loadingScreen.classList.remove("hidden");
}

function hideLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) loadingScreen.classList.add("hidden");
}
