// Login page functionality
document.addEventListener("DOMContentLoaded", async function () {
  // Check if user is already logged in and redirect if needed
  await redirectIfLoggedIn();

  // Login form elements
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const usernameError = document.getElementById("usernameError");
  const passwordError = document.getElementById("passwordError");

  // Login form submission handler
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent refreshing

      const username = usernameInput.value;
      const password = passwordInput.value;

      // Clear previous error messages
      usernameError.style.display = "none";
      passwordError.style.display = "none";

      // Check if the fields are filled
      let isValid = true;
      if (!username) {
        usernameError.textContent = "Please enter a username.";
        usernameError.style.display = "block";
        isValid = false;
      }

      if (!password) {
        passwordError.textContent = "Please enter a password.";
        passwordError.style.display = "block";
        isValid = false;
      }

      // If valid, submit form
      if (isValid) {
        // Prepare data to be sent
        const requestData = {
          USER: username,
          PASSWORD: password,
        };

        // Send data to backend (login.php)
        fetch("../../api/Login.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              window.location.href = "../pages/dashboard.html";
            } else {
              alert("Login failed: " + (data.error || "Unknown error"));
            }
          })
          .catch((error) => {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again.");
          });
      }
    });
  }
}); 