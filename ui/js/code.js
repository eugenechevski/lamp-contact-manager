// Make sure the page is loaded before running js
document.addEventListener("DOMContentLoaded", function () {
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
              alert("Login failed: " + data.message);
            }
          })
          .catch((error) => {
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
        newPasswordError.style.display = "block";
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

  // -- DASHBOARD FUNCTIONALITY --
  const createContactForm = document.getElementById("createContactForm");
  const contactsList = document.getElementById("contactsList");
  const usernameDisplay = document.getElementById("usernameDisplay");

  // display username
  if (usernameDisplay) {
    fetch("../../api/RetrieveUser.php") // TO
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          usernameDisplay.textContent = data.username;
        }
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
      });
  }

  // loading contacts
  function loadContacts() {
    if (contactsList) {
      fetch("../../api/RetrieveContact.php")
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            contactsList.innerHTML = ""; // clearing contacts
            data.contacts.forEach((contact) => {
              const row = document.createElement("tr");
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

            // event listeners to new buttons
            addContactButtonListeners();
          }
        })
        .catch((error) => {
          console.error("Error loading contacts:", error);
        });
    }
  }

  // create new contact
  if (createContactForm) {
    createContactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("contactName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);

      fetch("../../api/CreateContact.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            createContactForm.reset();
            loadContacts(); // reloading contacts list
          } else {
            alert("Failed to create contact: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error creating contact:", error);
          alert("An error occurred. Please try again.");
        });
    });
  }

  // event listeners to edit and delete buttons
  function addContactButtonListeners() {
    // edit contacts
    document.querySelectorAll(".edit-contact").forEach((button) => {
      button.addEventListener("click", function () {
        const contactId = this.getAttribute("data-id");
        const row = this.closest("tr");
        const name = row.cells[0].textContent;
        const email = row.cells[1].textContent;

        // inline edit form
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

        // add save and cancel handlers
        row.querySelector(".save-edit").addEventListener("click", function () {
          const updatedName = document.getElementById(
            `edit-name-${contactId}`
          ).value;
          const updatedEmail = document.getElementById(
            `edit-email-${contactId}`
          ).value;

          const formData = new FormData();
          formData.append("id", contactId);
          formData.append("name", updatedName);
          formData.append("email", updatedEmail);

          fetch("../../api/UpdateContact.php", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                loadContacts(); // reloading contacts list
              } else {
                alert("Failed to update contact: " + data.message);
              }
            })
            .catch((error) => {
              console.error("Error updating contact:", error);
              alert("An error occurred. Please try again.");
            });
        });

        row
          .querySelector(".cancel-edit")
          .addEventListener("click", function () {
            loadContacts(); // reload contacts list to cancel edit
          });
      });
    });

    // delete contact buttons
    document.querySelectorAll(".delete-contact").forEach((button) => {
      button.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this contact?")) {
          const contactId = this.getAttribute("data-id");

          const formData = new FormData();
          formData.append("id", contactId);

          fetch("../../api/DeleteContact.php", {
            //delete contact file
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                loadContacts(); // reloading contacts list
              } else {
                alert("Failed to delete contact: " + data.message);
              }
            })
            .catch((error) => {
              console.error("Error deleting contact:", error);
              alert("An error occurred. Please try again.");
            });
        }
      });
    });
  }

  // load contacts when dashboard page loads
  if (contactsList) {
    loadContacts();
  }
});
