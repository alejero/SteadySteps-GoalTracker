import { getToken } from "./auth.js"; // Function to check if a token exists

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const menu = navbar.querySelector(".menu");
  const logoutButton = navbar.querySelector(".logout-button");

  // Check if user is authenticated
  const isLoggedIn = !!getToken();

  // Show/hide menu links and logout button
  if (isLoggedIn) {
    menu.style.display = "flex";
    logoutButton.style.display = "inline-block";
  } else {
    menu.style.display = "none";
    logoutButton.style.display = "none";
  }
});