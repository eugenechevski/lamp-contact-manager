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
            const newUsername = document.getElementById("newUsername").value.trim();
            const newPassword = document.getElementById("newPassword").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();
            const newUsernameError = document.getElementById("newUsernameError");
            const newPasswordError = document.getElementById("newPasswordError");

            newUsernameError.style.display = 'none';
            newPasswordError.style.display = 'none';

            let isValid = true;

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
                formData.append("username", newUsername);
                formData.append("password", newPassword);

                fetch("api/addUser.php", {
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

// ------ DASHBOARD FUNCTIONALITY ------
const createContactForm = document.getElementById("createContactForm");
const contactsList = document.getElementById("contactsList");
const usernameDisplay = document.getElementById("usernameDisplay");

// Display username in dashboard
if (usernameDisplay) {
    fetch("api/getUserInfo.php")  // Note: You might need to create this PHP file
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                usernameDisplay.textContent = data.username;
            }
        })
        .catch(error => {
            console.error("Error fetching user info:", error);
        });
}

// Load contacts
function loadContacts() {
    if (contactsList) {
        fetch("api/RetrieveContact.php")  // Updated to match your PHP file
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    contactsList.innerHTML = ''; // Clear existing contacts
                    data.contacts.forEach(contact => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${contact.name}</td>
                            <td>${contact.email}</td>
                            <td>
                                <button class="btn btn-warning btn-sm edit-contact" data-id="${contact.id}">
                                    Edit
                                </button>
                                <button class="btn btn-danger btn-sm delete-contact" data-id="${contact.id}">
                                    Delete
                                </button>
                            </td>
                        `;
                        contactsList.appendChild(row);
                    });

                    // Add event listeners to new buttons
                    addContactButtonListeners();
                }
            })
            .catch(error => {
                console.error("Error loading contacts:", error);
            });
    }
}

// Create new contact
if (createContactForm) {
    createContactForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);

        fetch("api/CreateContact.php", {  // Updated to match your PHP file
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                createContactForm.reset();
                loadContacts(); // Reload the contacts list
            } else {
                alert("Failed to create contact: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error creating contact:", error);
            alert("An error occurred. Please try again.");
        });
    });
}

// Add event listeners to edit and delete buttons
function addContactButtonListeners() {
    // Edit contact buttons
    document.querySelectorAll('.edit-contact').forEach(button => {
        button.addEventListener('click', function() {
            const contactId = this.getAttribute('data-id');
            const row = this.closest('tr');
            const name = row.cells[0].textContent;
            const email = row.cells[1].textContent;

            // Create inline edit form
            row.innerHTML = `
                <td>
                    <input type="text" class="form-control" value="${name}" id="edit-name-${contactId}">
                </td>
                <td>
                    <input type="email" class="form-control" value="${email}" id="edit-email-${contactId}">
                </td>
                <td>
                    <button class="btn btn-success btn-sm save-edit" data-id="${contactId}">Save</button>
                    <button class="btn btn-secondary btn-sm cancel-edit" data-id="${contactId}">Cancel</button>
                </td>
            `;

            // Add save and cancel handlers
            row.querySelector('.save-edit').addEventListener('click', function() {
                const updatedName = document.getElementById(`edit-name-${contactId}`).value;
                const updatedEmail = document.getElementById(`edit-email-${contactId}`).value;

                const formData = new FormData();
                formData.append("id", contactId);
                formData.append("name", updatedName);
                formData.append("email", updatedEmail);

                fetch("api/UpdateContact.php", {  // Updated to match your PHP file
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadContacts(); // Reload the contacts list
                    } else {
                        alert("Failed to update contact: " + data.message);
                    }
                })
                .catch(error => {
                    console.error("Error updating contact:", error);
                    alert("An error occurred. Please try again.");
                });
            });

            row.querySelector('.cancel-edit').addEventListener('click', function() {
                loadContacts(); // Reload the contacts list to cancel edit
            });
        });
    });

    // Delete contact buttons
    document.querySelectorAll('.delete-contact').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm("Are you sure you want to delete this contact?")) {
                const contactId = this.getAttribute('data-id');
                
                const formData = new FormData();
                formData.append("id", contactId);

                fetch("api/DeleteContact.php", {  // Updated to match your PHP file
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadContacts(); // Reload the contacts list
                    } else {
                        alert("Failed to delete contact: " + data.message);
                    }
                })
                .catch(error => {
                    console.error("Error deleting contact:", error);
                    alert("An error occurred. Please try again.");
                });
            }
        });
    });
}

// Load contacts when dashboard page loads
if (contactsList) {
    loadContacts();
}
});