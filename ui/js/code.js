// Make sure the page is loaded before running js
document.addEventListener("DOMContentLoaded", function() {
    // ------ LOGIN FORM ------
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");

    // Login functionality
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent refreshing

            const username = usernameInput.value;
            const password = passwordInput.value;

            // Clear previous error messages
            usernameError.style.display = 'none';
            passwordError.style.display = 'none';

            // Check if the fields are filled
            let isValid = true;
            if (!username) {
                usernameError.textContent = "Please enter a username.";
                usernameError.style.display = 'block';
                isValid = false;
            }

            if (!password) {
                passwordError.textContent = "Please enter a password.";
                passwordError.style.display = 'block';
                isValid = false;
            }

            // If valid, submit form
            if (isValid) {
                // Prepare data to be sent
                const requestData = {
                    username: username,
                    password: password
                };

                // Send data to backend (login.php)
                fetch("api/login.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.response.success) {
                        window.location.href = "./ui/pages/dashboard.html";
                    } else {
                        alert("Login failed: " + data.message);
                    }
                })
                .catch(error => {
                    console.error("Error during login:", error);
                    alert("An error occurred. Please try again.");
                });
            }
        });
    }

    // ------ CREATE ACCOUNT FORM ------
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

            firstNameError.style.display = 'none';
            lastNameError.style.display = 'none';
            newUsernameError.style.display = 'none';
            newPasswordError.style.display = 'none';

            let isValid = true;

            // Check that all fields are filled out
            if (!firstName) {
                firstNameError.textContent = "Please enter your first name.";
                firstNameError.style.display = 'block';
                isValid = false;
            }

            if (!lastName) {
                lastNameError.textContent = "Please enter your last name.";
                lastNameError.style.display = 'block';
                isValid = false;
            }

            if (!newUsername) {
                newUsernameError.textContent = "Please enter a username.";
                newPasswordError.style.display = 'block';
                isValid = false;
            }

            if (!newPassword) {
                newPasswordError.textContent = "Please enter a password.";
                newPasswordError.style.display = 'block';
                isValid = false;
            } else if (newPassword !== confirmPassword) {
                newPasswordError.textContent = "Passwords do not match.";
                newPasswordError.style.display = 'block';
                isValid = false;
            }

            // If all fields are correct, submit to API
            if (isValid) {
                const userData = {
                    firstName: firstName,
                    lastName: lastName,
                    username: newUsername,
                    password: newPassword
                };

                // Log JSON data
                console.log("Sending JSON:", JSON.stringify(userData));

                // Submit data to API as JSON
                fetch("../../api/addUser.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = "../../index.html";
                    } else {
                        alert("Account creation failed. Please try again.");
                    }
                })
                .catch(error => {
                    console.error("Error during create account:", error);
                    alert("An error occurred. Please try again.");
                })
            }
        })
    }
});
