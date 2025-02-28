// Create account page functionality
document.addEventListener("DOMContentLoaded", async function () {
  // Require authentication check is not needed for create account page
  
  const createAccountForm = document.getElementById("createAccountForm");

  if (createAccountForm) {
    createAccountForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const newUsername = document.getElementById("username").value;
      const newPassword = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      const firstNameError = document.getElementById("firstNameError");
      const lastNameError = document.getElementById("lastNameError");
      const newUsernameError = document.getElementById("usernameError");
      const newPasswordError = document.getElementById("passwordError");

      firstNameError.style.display = "none";
      lastNameError.style.display = "none";
      newUsernameError.style.display = "none";
      newPasswordError.style.display = "none";

      let isValid = true;

      // Check that all fields are filled out
      if (!firstName) {
        firstNameError.textContent = "Please enter your first name.";
        firstNameError.style.display = "block";
        isValid = false;
      }

      if (!lastName) {
        lastNameError.textContent = "Please enter your last name.";
        lastNameError.style.display = "block";
        isValid = false;
      }

      if (!newUsername) {
        newUsernameError.textContent = "Please enter a username.";
        newUsernameError.style.display = "block";
        isValid = false;
      }

      if (!newPassword) {
        newPasswordError.textContent = "Please enter a password.";
        newPasswordError.style.display = "block";
        isValid = false;
      } else if (newPassword !== confirmPassword) {
        newPasswordError.textContent = "Passwords do not match.";
        newPasswordError.style.display = "block";
        isValid = false;
      }

      // If all fields are correct, submit to API
      if (isValid) {
        const userData = {
          FIRST: firstName,
          LAST: lastName,
          USER: newUsername,
          PASSWORD: newPassword,
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
              alert("Account creation failed. Please try again.");
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