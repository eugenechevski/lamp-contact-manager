// Create account page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Require authentication check is not needed for create account page
  
  const createAccountForm = document.getElementById("createAccountForm");
  const usernameField = document.getElementById("username");
  
  // Variables for username availability checking
  let usernameCheckTimeout = null;
  const TYPING_DELAY = 500; // ms to wait after typing stops
  
  // Clear username error when user starts typing
  if (usernameField) {
    usernameField.addEventListener("input", function() {
      const usernameError = document.getElementById("usernameError");
      if (usernameError) {
        usernameError.style.display = "none";
      }
      usernameField.classList.remove("is-invalid");
      usernameField.classList.remove("is-valid");
      
      // Clear any existing timeout
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
      }
      
      // Set a new timeout to check username availability
      const username = usernameField.value.trim();
      if (username.length >= 3) { // Only check if username is at least 3 characters
        usernameCheckTimeout = setTimeout(() => {
          checkUsernameAvailability(username);
        }, TYPING_DELAY);
      }
    });
  }

  // Function to check username availability
  function checkUsernameAvailability(username) {
    fetch("../../api/CheckUsername.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    })
      .then((response) => response.json())
      .then((data) => {
        const usernameError = document.getElementById("usernameError");
        
        if (data.available) {
          // Username is available
          usernameField.classList.add("is-valid");
          usernameField.classList.remove("is-invalid");
          if (usernameError) {
            usernameError.style.display = "none";
          }
        } else {
          // Username is not available
          usernameField.classList.add("is-invalid");
          usernameField.classList.remove("is-valid");
          if (usernameError) {
            usernameError.textContent = "Username already taken. Please choose a different one.";
            usernameError.style.display = "block";
          }
        }
      })
      .catch((error) => {
        console.error("Error checking username:", error);
      });
  }

  if (createAccountForm) {
    createAccountForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Get form values
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();

      // Reset error messages
      document.getElementById("firstNameError").style.display = "none";
      document.getElementById("lastNameError").style.display = "none";
      document.getElementById("usernameError").style.display = "none";
      document.getElementById("passwordError").style.display = "none";
      document.getElementById("confirmPasswordError").style.display = "none";

      // Validate form
      let isValid = true;

      if (!firstName) {
        document.getElementById("firstNameError").textContent = "First name is required";
        document.getElementById("firstNameError").style.display = "block";
        isValid = false;
      }

      if (!lastName) {
        document.getElementById("lastNameError").textContent = "Last name is required";
        document.getElementById("lastNameError").style.display = "block";
        isValid = false;
      }

      if (!username) {
        document.getElementById("usernameError").textContent = "Username is required";
        document.getElementById("usernameError").style.display = "block";
        isValid = false;
      }

      if (!password) {
        document.getElementById("passwordError").textContent = "Password is required";
        document.getElementById("passwordError").style.display = "block";
        isValid = false;
      }

      if (password !== confirmPassword) {
        document.getElementById("confirmPasswordError").textContent = "Passwords do not match";
        document.getElementById("confirmPasswordError").style.display = "block";
        isValid = false;
      }

      if (isValid) {
        // Create user data object
        const userData = {
          FIRST: firstName,
          LAST: lastName,
          USER: username,
          PASSWORD: password,
        };

        // Log JSON data
        console.log("Sending JSON:", JSON.stringify(userData));

        // Submit data to API as JSON
        fetch("../../api/AddUser.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              window.location.href = "../../index.html";
            } else {
              // Check for specific error messages
              if (data.error && data.error.includes("Username already exists")) {
                // Display username error
                const usernameError = document.getElementById("usernameError");
                usernameError.textContent = "Username already exists. Please choose a different username.";
                usernameError.style.display = "block";
                
                // Highlight the username field
                document.getElementById("username").classList.add("is-invalid");
                
                // Scroll to the username field
                document.getElementById("username").scrollIntoView({ behavior: "smooth", block: "center" });
              } else {
                // Generic error
                alert("Account creation failed: " + (data.error || "Please try again."));
              }
            }
          })
          .catch((error) => {
            console.error("Error during create account:", error);
            alert("An error occurred. Please try again.");
          });
      }
    });
  }
}); 