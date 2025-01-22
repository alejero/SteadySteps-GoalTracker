//const API_BASE_URL = "http://localhost:5001/api"; // Update with Render URL after deployment
const API_BASE_URL = "https://steadysteps-goaltracker.onrender.com/api"; // Update with Render URL after deployment

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

  const loginField = document.getElementById("login-field").value;
  const password = document.getElementById("login-password").value;
  const loginButton = document.getElementById("login-button");

  if (!loginField || !password) {
    alert("Please fill in all fields.");
    return;
  }

  showLoading("Logging in...");
  loginButton.disabled = true; // Disable button

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: loginField, password }),
    });

    if (response.ok) {
      const { token, user } = await response.json();
      localStorage.setItem("jwtToken", token); // Save token
      localStorage.setItem("userName", user.name); // Save user name
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

// Attach event listener for register form
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", registerUser);
}

// Attach event listener for login form
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", loginUser);
}
