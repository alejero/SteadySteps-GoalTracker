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
  event.preventDefault(); // Prevent default form submission behavior
  console.log("Register form submitted");

  const name = document.getElementById("register-name")?.value;
  const username = document.getElementById("register-username")?.value;
  const email = document.getElementById("register-email")?.value;
  const password = document.getElementById("register-password")?.value;

  if (!name || !username || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const result = await postData(`${API_BASE_URL}/auth/register`, {
      name,
      username,
      email,
      password,
    });

    alert("Registration successful! Please log in.");
    window.location.href = "login.html"; // Redirect to login page
  } catch (error) {
    alert(error.message);
  }
}

// Login a user
async function loginUser(event) {
  event.preventDefault(); // Prevent default form submission behavior
  console.log("Login form submitted");

  const loginField = document.getElementById("login-field")?.value; // Can be email or username
  const password = document.getElementById("login-password")?.value;

  if (!loginField || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const { token, user } = await postData(`${API_BASE_URL}/auth/login`, {
      login: loginField, // Supports either email or username
      password,
    });

    localStorage.setItem("jwtToken", token); // Store the token in localStorage
    alert(`Welcome, ${user.name}! Redirecting to your dashboard...`);
    window.location.href = `dashboard.html?name=${encodeURIComponent(
      user.name
    )}`; // Redirect to dashboard
  } catch (error) {
    alert(error.message);
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
