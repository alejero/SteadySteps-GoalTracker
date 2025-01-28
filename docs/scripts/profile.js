import { logoutUser } from "./auth.js"; // Import shared logout functionality

// Handle saving profile changes
function setupProfile() {
  const saveProfileButton = document.getElementById("save-profile");
  const logoutButton = document.getElementById("logout");

  saveProfileButton?.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const theme = document.getElementById("theme").value;

    // Save theme preference
    localStorage.setItem("theme", theme);
    document.body.classList.toggle("dark-mode", theme === "dark");

    alert("Profile updated successfully!");
  });

  logoutButton?.addEventListener("click", logoutUser);
}

document.addEventListener("DOMContentLoaded", setupProfile);