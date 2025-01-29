// Token-related Functions
export function isTokenExpired(token) {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const currentTime = Math.floor(Date.now() / 1000);

    // If the token doesn't have an exp field, treat it as valid
    if (!payload.exp) {
      console.warn("Token does not have an 'exp' field. Assuming valid.");
      return false;
    }

    return payload.exp < currentTime; // Compare expiration time
  } catch (error) {
    console.error("Invalid token format:", error);
    return true; // Treat as expired if decoding fails
  }
}

export function getToken() {
  const token =
    localStorage.getItem("jwtToken") || sessionStorage.getItem("jwtToken");
  // console.log("Retrieved token:", token);  // Uncomment for debugging
  return token;
}

export function logoutUser() {
  console.log("Logging out user...");
  localStorage.removeItem("jwtToken");
  sessionStorage.removeItem("jwtToken");
  localStorage.removeItem("userName");
  alert("You have been logged out.");
  window.location.href = "login.html"; // Redirect to login page
}

export function setupLogoutListener(buttonId = "logout-button") {
  const logoutButton = document.getElementById(buttonId);
  if (logoutButton) {
    console.log(`Attaching logout listener to button with ID: ${buttonId}`);
    logoutButton.addEventListener("click", logoutUser);
  } else {
    console.error(`Logout button with ID "${buttonId}" not found.`);
  }
}

// Start user session
export function initializeSession() {
  const token = getToken(); // Retrieve token from either storage
  console.log("Checking session... Token:", token);

  if (!token || isTokenExpired(token)) {
    alert("Your session has expired. Please log in again.");
    console.warn("Session invalid. Redirecting to login.");
    logoutUser(); // Clear both storages and redirect
    return false;
  }

  console.log("Session is valid.");
  return true;
}

// Remember Me Functions
export function rememberUser(username) {
  localStorage.setItem("rememberedUser", username);
}

export function getRememberedUser() {
  return localStorage.getItem("rememberedUser");
}

export function handleRememberedUser() {
  const rememberedUser = getRememberedUser();
  if (rememberedUser) {
    const loginField = document.getElementById("login-field");
    if (loginField) {
      loginField.value = rememberedUser;
    }
  }
}

// Inactivity Timer Functions
let inactivityTimer;

export function resetLogoutTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    alert("You have been logged out due to inactivity.");
    logoutUser();
  }, 15 * 60 * 1000); // 15 minutes
}

export function initializeInactivityListener() {
  ["click", "keydown", "mousemove", "scroll", "touchstart"].forEach((event) =>
    document.addEventListener(event, resetLogoutTimer)
  );
}
