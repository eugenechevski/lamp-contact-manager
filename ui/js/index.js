// Main entry point for all pages
document.addEventListener("DOMContentLoaded", async function () {
  // If already logged in, redirect to dashboard
  await redirectIfLoggedIn();
});
