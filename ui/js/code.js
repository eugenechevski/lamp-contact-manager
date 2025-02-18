// Make sure the page is loaded before running js
document.addEventListener("DOMContentLoaded", function() {
    // ------ LOGIN FORM ------
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    // const createAccountLink = document.querySelector(".create-account a");
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");

    // Login functionality
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent refreshing

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

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
                // --- Code for testing validation without backend ---
                //     mockLoginRequest(username, password);
                //
                //
                // // Mock the server response
                // function mockLoginRequest(username, password) {
                //     const mockResponse = username === "admin" && password === "password123"
                //         ? { success: true, message: "Login successful." }
                //         : { success: false, message: "Invalid username or password." };
                //
                //     handleLoginResponse(mockResponse);
                // }
                //
                // // Pop up feedback to the user
                // function handleLoginResponse(response) {
                //     if (response.success) {
                //         alert(response.message);
                //     } else {
                //         alert(response.message);
                //     }
                // }

                // --- Code for validating login with backend
                // Prepare data to be sent
                const formData = new FormData();
                formData.append("username", username);
                formData.append("password", password);

                // Send data to backend (login.php)
                fetch("api/login.php", {
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = "dashboard.html"; // --- TODO add dashboard page
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
            // console.log(newUsername);
            const newPassword = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            // console.log(newPassword);
            // console.log(confirmPassword);
            const firstNameError = document.getElementById("firstNameError");
            const lastNameError = document.getElementById("lastNameError");
            const newUsernameError = document.getElementById("usernameError");
            const newPasswordError = document.getElementById("passwordError");


            firstNameError.style.display = 'none';
            lastNameError.style.display = 'none';
            newUsernameError.style.display = 'none';
            newPasswordError.style.display = 'none';
            // confirmPasswordError.style.display = 'none';

            let isValid = true;

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

            if (isValid) {
                const formData = new FormData();
                formData.append("firstName", firstName);
                formData.append("lastName", lastName);
                formData.append("username", newUsername);
                formData.append("password", newPassword);

                for (const pair of formData.entries()) {
                    console.log(`${pair[0]}: ${pair[1]}`);
                }

                fetch("../../api/addUser.php", {
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = "index.html";
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
