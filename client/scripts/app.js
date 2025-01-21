// Redirect to Dashboard
// const getStartedButton = document.getElementById('get-started');
// if (getStartedButton) {
//     getStartedButton.addEventListener('click', () => {
//         window.location.href = 'dashboard.html';
//     });
// }

//const API_BASE_URL = "http://localhost:5001/api"; // Update with Render URL after deployment
const API_BASE_URL = "https://steadysteps-goaltracker.onrender.com"; // Update with Render URL after deployment

// Helper function to send POST requests
async function postData(url, data) {
  console.log("Sending data to:", url);
  console.log("Request body:", data);
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "An error occurred");
  }

  return response.json();
}

// Register a user
async function registerUser(event) {
  event.preventDefault();
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const result = await postData(`${API_BASE_URL}/auth/register`, {
      username,
      email,
      password,
    });
    alert("Registration successful! Please login.");
    window.location.href = "index.html";
  } catch (error) {
    alert(error.message);
  }
}

// Login a user
async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const { token } = await postData(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    localStorage.setItem("jwtToken", token); // Store token in localStorage
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
}

// Event listeners for forms
document
  .getElementById("register-form")
  ?.addEventListener("submit", registerUser);
document.getElementById("login-form")?.addEventListener("submit", loginUser);
