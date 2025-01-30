import { getToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const homeLink = document.getElementById("home-link");
  const logoutButton = document.getElementById("logout-button");
  const profileLink = document.querySelector(".profile-link");
  const menu = document.querySelector(".menu");
  const currentPage = window.location.pathname;

  // Ensure elements exist before modifying them
  if (!navbar || !homeLink || !logoutButton || !profileLink || !menu) {
    console.error("Navbar elements are missing. Check your HTML structure.");
    return;
  }

  // Create the menu toggle (hamburger button)
  const menuToggle = document.createElement("button");
  menuToggle.classList.add("menu-toggle");
  menuToggle.innerHTML = "☰"; // Hamburger icon
  navbar.insertBefore(menuToggle, navbar.children[1]);

  // Check if user is authenticated
  const isAuthenticated = getToken();

  // Update logo link dynamically based on login status
  homeLink.href = isAuthenticated ? "dashboard.html" : "index.html";

  // Detect if user is on the landing page
  const isLandingPage =
    currentPage === "/docs/" || currentPage === "/docs/index.html";

  // Detect if user is on login or register pages
  const isAuthPage =
    currentPage.includes("login.html") || currentPage.includes("register.html");

  // Hide elements by adding/removing a 'hidden' CSS class
  if (isLandingPage || isAuthPage || !isAuthenticated) {
    logoutButton.classList.add("hidden");
    profileLink.classList.add("hidden");
    menuToggle.classList.replace("menu-toggle", "hidden");
  } else {
    logoutButton.classList.remove("hidden");
    profileLink.classList.remove("hidden");
    menuToggle.classList.replace("hidden", "menu-toggle");
  }

  // Logout function
  if (isAuthenticated) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.href = "index.html"; // Redirect to landing page
    });
  }

  // Handle Mobile Navbar Toggle
  menuToggle.addEventListener("click", () => {
    navbar.classList.toggle("expanded");
  });

  // Close the menu when a link is clicked (optional for smooth UX)
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("expanded");
    });
  });
});
