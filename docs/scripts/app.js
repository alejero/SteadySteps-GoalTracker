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

  try {
    const result = await postData(`${API_BASE_URL}/auth/register`, {
      name,
      username,
      email,
      password,
    });

    alert("Registration successful! Please log in.");
    window.location.href = "login.html";
  } catch (error) {
    alert(error.message);
  }
}

// Login a user
async function loginUser(event) {
  event.preventDefault();

  const loginField = document.getElementById("login-field").value; // Can be email or username
  const password = document.getElementById("login-password").value;

  try {
    const { token, user } = await postData(`${API_BASE_URL}/auth/login`, {
      login: loginField, // Adjust backend to accept "login" for either email or username
      password,
    });

    localStorage.setItem("jwtToken", token); // Store the token in localStorage
    alert(`Welcome, ${user.name}!`);
    window.location.href = `dashboard.html?name=${encodeURIComponent(
      user.name
    )}`;
  } catch (error) {
    alert(error.message);
  }
}

// Attach event listener for register form
document.getElementById("register-form")?.addEventListener("submit", registerUser);

// Attach event listener for login form
document.getElementById("login-form")?.addEventListener("submit", loginUser);