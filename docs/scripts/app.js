// Redirect to Dashboard
// const getStartedButton = document.getElementById('get-started');
// if (getStartedButton) {
//     getStartedButton.addEventListener('click', () => {
//         window.location.href = 'dashboard.html';
//     });
// }

//const API_BASE_URL = "http://localhost:5001/api"; // Update with Render URL after deployment
const API_BASE_URL = "https://steadysteps-goaltracker.onrender.com/api"; // Update with Render URL after deployment

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

// Providing immediate feedback to the user during registration
const registerButton = document.querySelector("#register-form button");

registerButton.disabled = true; // Disable button
registerButton.textContent = "Registering..."; // Show loading text

try {
  const response = await fetch("https://your-backend-url/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      username,
      email,
      password,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    alert(data.message); // Success feedback
    window.location.href = "login.html";
  } else {
    const error = await response.json();
    alert(`Error: ${error.error}`);
  }
} catch (error) {
  alert("An unexpected error occurred. Please try again.");
} finally {
  registerButton.disabled = false; // Re-enable button
  registerButton.textContent = "Register"; // Reset button text
}

// Redirect to Dashboard after Successful Registration
document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent form from submitting the default way and the query string

    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Display success message
        window.location.href = "login.html"; // Redirect to login page
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`); // Show specific error from the server
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again later."); // Generic error message
      console.error(error);
    }
  });

// Redirect to Dashboard after Successful Login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent form from submitting the default way and the query string

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const { user } = await response.json();
      alert(`Welcome, ${user.name}! Redirecting to your dashboard...`);
      window.location.href = `dashboard.html?name=${encodeURIComponent(
        user.name
      )}`;
    } else {
      const { message } = await response.json();
      alert(`Error: ${message}`);
    }
  } catch (error) {
    alert("An error occurred. Please try again.");
  }
});
