import { logoutUser, getToken } from "./auth.js"; // Import shared auth functions

async function fetchUserProfile() {
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile information.");
    }

    const userProfile = await response.json();
    populateProfile(userProfile);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
  }
}

function populateProfile({ name, email, theme }) {
  document.getElementById("profile-name").textContent = name;
  document.getElementById("email").value = email || "";
  document.getElementById("theme").value = theme || "light";

  // Apply the theme immediately
  document.body.classList.toggle("dark-mode", theme === "dark");
}

async function saveUserProfile() {
  const email = document.getElementById("email").value.trim();
  const theme = document.getElementById("theme").value;
  const token = getToken();

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, theme }),
    });

    if (!response.ok) {
      throw new Error("Failed to update profile.");
    }

    alert("Profile updated successfully!");
    document.body.classList.toggle("dark-mode", theme === "dark");
  } catch (error) {
    console.error("Error updating profile:", error.message);
    alert("An error occurred while updating your profile. Please try again.");
  }
}

function setupProfilePage() {
  // Logout functionality
  const logoutButton = document.getElementById("logout-button");
  logoutButton?.addEventListener("click", logoutUser);

  // Save profile changes
  const saveProfileButton = document.getElementById("save-profile");
  saveProfileButton?.addEventListener("click", saveUserProfile);

  // Fetch profile information on load
  fetchUserProfile();
}

document.addEventListener("DOMContentLoaded", setupProfilePage);
