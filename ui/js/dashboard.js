// Dashboard and contact management functionality
document.addEventListener("DOMContentLoaded", async function () {
  // Require authentication for dashboard
  await requireAuth();

  // Dashboard elements
  const createContactForm = document.getElementById("createContactForm");
  const contactsList = document.getElementById("contactsList");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const logoutButton = document.getElementById("logoutButton");

  // Display username from session
  if (usernameDisplay) {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      usernameDisplay.textContent = currentUser.firstName + " " + currentUser.lastName;
    }
  }

  // Logout functionality
  if (logoutButton) {
    logoutButton.addEventListener("click", function() {
      logout(); // This function is defined in auth.js
    });
  }

  // Loading contacts
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

  // Create new contact
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

  // Event listeners for edit and delete buttons
  function addContactButtonListeners() {
    // Edit contacts
    document.querySelectorAll(".edit-contact").forEach((button) => {
      button.addEventListener("click", function () {
        const contactId = this.getAttribute("data-id");
        const row = this.closest("tr");
        const name = row.cells[0].textContent;
        const email = row.cells[1].textContent;

        // Inline edit form
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

        row.querySelector(".cancel-edit").addEventListener("click", function () {
          loadContacts(); // reload contacts list to cancel edit
        });
      });
    });

    // Delete contact buttons
    document.querySelectorAll(".delete-contact").forEach((button) => {
      button.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this contact?")) {
          const contactId = this.getAttribute("data-id");

          const formData = new FormData();
          formData.append("id", contactId);

          fetch("../../api/DeleteContact.php", {
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

  // Load contacts when dashboard page loads
  if (contactsList) {
    loadContacts();
  }
}); 