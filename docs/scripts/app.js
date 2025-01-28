import { API_BASE_URL } from "./config.js"; // Import the shared constant

// Helper function to send POST requests
async function postData(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "An error occurred");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

// Register a user
async function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById("register-name").value;
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const registerButton = document.getElementById("register-button");

  if (!name || !username || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  showLoading("Registering...");
  registerButton.disabled = true; // Disable button

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, password }),
    });

    if (response.ok) {
      alert("Registration successful! Please log in.");
      window.location.href = "login.html"; // Redirect to login page
    } else {
      const error = await response.json();
      alert(`Error: ${error.error || "Registration failed"}`);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    hideLoading();
    registerButton.disabled = false; // Re-enable button
  }
}

// Login a user
async function loginUser(event) {
  event.preventDefault();

  const loginField = document.getElementById("login-field").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const rememberMe = document.getElementById("remember-me").checked; // Check "Remember Me"
  const loginButton = document.getElementById("login-button");

  if (!loginField || !password) {
    alert("Please fill in all fields.");
    return;
  }

  showLoading("Logging in...");
  loginButton.disabled = true; // Disable button during login

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: loginField, password }),
    });

    if (response.ok) {
      const { token, user } = await response.json();

      // Store the token in the correct storage
      if (rememberMe) {
        localStorage.setItem("jwtToken", token); // Save in localStorage
      } else {
        sessionStorage.setItem("jwtToken", token); // Save in sessionStorage
      }

      localStorage.setItem("userName", user.name); // Save user name for personalization
      window.location.href = "dashboard.html"; // Redirect to dashboard
    } else {
      const error = await response.json();
      alert(`Error: ${error.error || "Login failed"}`);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    hideLoading();
    loginButton.disabled = false; // Re-enable button
  }
}

// Initialize the landing page
document.addEventListener("DOMContentLoaded", () => {
  hideLoading(); // Ensure the loading screen is hidden after page load.

  // Detect the current page based on the URL or a unique element.
  const currentPage = window.location.pathname;

  // Initialize the landing page
  if (currentPage.endsWith("index.html") || currentPage === "/") {
    console.log("Landing page initialized.");

    const loginPageButton = document.getElementById("login-button");
    if (loginPageButton) {
      loginPageButton.addEventListener("click", () => {
        window.location.href = "login.html";
      });
    }
  }

  // Initialize the login page
  if (currentPage.endsWith("login.html")) {
    console.log("Login page initialized.");

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", loginUser);
    } else {
      console.error("Login form not found!");
    }
  }

  // Initialize the register page
  if (currentPage.endsWith("register.html")) {
    console.log("Register page initialized.");

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", registerUser);
    } else {
      console.error("Register form not found!");
    }
  }

  // Initialize the dashboard
  if (currentPage.endsWith("dashboard.html")) {
    console.log("Dashboard initialized.");
    // Include dashboard-specific initialization if needed
  }

  // Initialize the profile page
  if (currentPage.endsWith("profile.html")) {
    console.log("Profile page initialized.");
    // Include profile-specific initialization if needed
  }
});
