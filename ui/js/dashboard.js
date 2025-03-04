// Dashboard and contact management functionality
document.addEventListener("DOMContentLoaded", async function () {
  // Require authentication for dashboard
  await requireAuth();

  // Dashboard elements
  const createContactForm = document.getElementById("createContactForm");
  const contactsList = document.getElementById("contactsList");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const logoutButton = document.getElementById("logoutButton");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  // Display username from session
  if (usernameDisplay) {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      usernameDisplay.textContent = "Welcome, " + currentUser.firstName;
    }
  }

  // Logout functionality
  if (logoutButton) {
    logoutButton.addEventListener("click", function() {
      // Call the logout function from auth.js
      logout();
    });
  }

  // Search functionality
  if (searchButton && searchInput) {
    // Search when button is clicked
    searchButton.addEventListener("click", function() {
      const searchTerm = searchInput.value.trim();
      if (searchTerm) {
        searchContacts(searchTerm);
      } else {
        loadContacts(); // If search is empty, load all contacts
      }
    });

    // Search when Enter key is pressed
    searchInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          searchContacts(searchTerm);
        } else {
          loadContacts(); // If search is empty, load all contacts
        }
      }
    });

    // Reset search when input is cleared
    searchInput.addEventListener("input", function() {
      if (searchInput.value.trim() === "") {
        loadContacts();
      }
    });
  }

  // Function to search contacts
  function searchContacts(searchTerm) {
    if (contactsList) {
      // Show loading indicator
      contactsList.innerHTML = `
        <tr>
          <td colspan="4" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
      `;

      // Send search request to API
      fetch("../../api/SearchContacts.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ search: searchTerm })
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            displayContacts(data.contacts);
          } else {
            // Display error message
            contactsList.innerHTML = `
              <tr>
                <td colspan="4" class="text-center text-muted">
                  ${data.message || "Error searching contacts"}
                </td>
              </tr>
            `;
          }
        })
        .catch((error) => {
          console.error("Error searching contacts:", error);
          contactsList.innerHTML = `
            <tr>
              <td colspan="4" class="text-center text-muted">
                An error occurred while searching. Please try again.
              </td>
            </tr>
          `;
        });
    }
  }

  // Function to display contacts in the table
  function displayContacts(contacts) {
    if (contactsList) {
      contactsList.innerHTML = ""; // clearing contacts
      
      // Check if there are any contacts
      if (contacts.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
          <td colspan="4" class="text-center">No contacts found. Try a different search or add a new contact.</td>
        `;
        contactsList.appendChild(emptyRow);
        return;
      }
      
      // Display each contact
      contacts.forEach((contact) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${contact.name}</td>
          <td>${contact.email}</td>
          <td>${contact.phone || ""}</td>
          <td class="text-end">
              <button class="btn btn-primary btn-sm edit-contact" data-id="${contact.id}">
                  <i class="bi bi-pencil-square"></i>
                  Edit
              </button>
              <button class="btn btn-secondary btn-sm delete-contact" data-id="${contact.id}">
                  <i class="bi bi-trash"></i>
                  Delete
              </button>
          </td>
        `;
        contactsList.appendChild(row);
      });

      // Add event listeners to new buttons
      addContactButtonListeners();
    }
  }

  // Loading contacts
  function loadContacts() {
    if (contactsList) {
      // Show loading indicator
      contactsList.innerHTML = `
        <tr>
          <td colspan="4" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </td>
        </tr>
      `;

      fetch("../../api/RetrieveContact.php", {
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        }
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            displayContacts(data.contacts);
          } else {
            // Display error message if contacts couldn't be loaded
            contactsList.innerHTML = `
              <tr>
                <td colspan="4" class="text-center text-muted">
                  Failed to load contacts: ${data.message || "Unknown error"}
                </td>
              </tr>
            `;
          }
        })
        .catch((error) => {
          console.error("Error loading contacts:", error);
          contactsList.innerHTML = `
            <tr>
              <td colspan="4" class="text-center text-muted">
                An error occurred while loading contacts. Please try again.
              </td>
            </tr>
          `;
        });
    }
  }

  // Create new contact
  if (createContactForm) {
    createContactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("contactEmail").value.trim();
      const phone = document.getElementById("phoneNumber").value.trim();

      // Create JSON data with the correct field names expected by the API
      const contactData = {
        FIRST: firstName,
        LAST: lastName,
        EMAIL: email,
        PHONE_NUMBER: phone
      };

      // Send data to backend as JSON
      fetch("../../api/CreateContact.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            createContactForm.reset();
            loadContacts(); // reloading contacts list
          } else {
            alert("Failed to create contact: " + (data.message || "Unknown error"));
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
        
        // Fetch the contact details to get all fields including phone number
        fetch(`../../api/RetrieveContact.php?id=${contactId}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.success && data.contacts && data.contacts.length > 0) {
              const contact = data.contacts[0];
              
              // Create a modal for editing
              const modalHTML = `
                <div class="modal fade" id="editContactModal" tabindex="-1" aria-labelledby="editContactModalLabel" aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="editContactModalLabel">Edit Contact</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <form id="editContactForm">
                          <input type="hidden" id="editContactId" value="${contactId}">
                          <div class="mb-3">
                            <label for="editFirstName" class="form-label">First Name</label>
                            <div class="input-group">
                              <span class="input-group-text">
                                <i class="bi bi-person"></i>
                              </span>
                              <input type="text" class="form-control" id="editFirstName" value="${contact.firstName || ''}" required>
                            </div>
                          </div>
                          <div class="mb-3">
                            <label for="editLastName" class="form-label">Last Name</label>
                            <div class="input-group">
                              <span class="input-group-text">
                                <i class="bi bi-person"></i>
                              </span>
                              <input type="text" class="form-control" id="editLastName" value="${contact.lastName || ''}" required>
                            </div>
                          </div>
                          <div class="mb-3">
                            <label for="editEmail" class="form-label">Email</label>
                            <div class="input-group">
                              <span class="input-group-text">
                                <i class="bi bi-envelope"></i>
                              </span>
                              <input type="email" class="form-control" id="editEmail" value="${contact.email || ''}" required>
                            </div>
                          </div>
                          <div class="mb-3">
                            <label for="editPhone" class="form-label">Phone Number</label>
                            <div class="input-group">
                              <span class="input-group-text">
                                <i class="bi bi-telephone"></i>
                              </span>
                              <input type="tel" class="form-control" id="editPhone" value="${contact.phone || ''}">
                            </div>
                          </div>
                        </form>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveContactChanges">Save Changes</button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
              
              // Add modal to the document
              const modalContainer = document.createElement("div");
              modalContainer.innerHTML = modalHTML;
              document.body.appendChild(modalContainer);
              
              // Initialize and show the modal
              const modal = new bootstrap.Modal(document.getElementById("editContactModal"));
              modal.show();
              
              // Handle save changes
              document.getElementById("saveContactChanges").addEventListener("click", function() {
                const updatedData = {
                  ID: contactId,
                  FIRST: document.getElementById("editFirstName").value.trim(),
                  LAST: document.getElementById("editLastName").value.trim(),
                  EMAIL: document.getElementById("editEmail").value.trim(),
                  PHONE_NUMBER: document.getElementById("editPhone").value.trim()
                };
                
                // Send update request
                fetch("../../api/UpdateContact.php", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(updatedData),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.success) {
                      modal.hide();
                      // Remove modal from DOM after hiding
                      document.getElementById("editContactModal").addEventListener("hidden.bs.modal", function() {
                        this.remove();
                      });
                      loadContacts(); // Reload contacts to show updated data
                    } else {
                      alert("Failed to update contact: " + (data.message || "Unknown error"));
                    }
                  })
                  .catch((error) => {
                    console.error("Error updating contact:", error);
                    alert("An error occurred. Please try again.");
                  });
              });
              
              // Clean up modal when closed
              document.getElementById("editContactModal").addEventListener("hidden.bs.modal", function() {
                this.remove();
              });
            } else {
              alert("Failed to load contact details");
            }
          })
          .catch((error) => {
            console.error("Error fetching contact details:", error);
            alert("An error occurred. Please try again.");
          });
      });
    });

    // Delete contacts
    document.querySelectorAll(".delete-contact").forEach((button) => {
      button.addEventListener("click", function () {
        const contactId = this.getAttribute("data-id");
        
        if (confirm("Are you sure you want to delete this contact?")) {
          // Send delete request
          fetch("../../api/DeleteContact.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ID: contactId }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                loadContacts(); // Reload contacts to show updated list
              } else {
                alert("Failed to delete contact: " + (data.message || "Unknown error"));
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

  // Load contacts when page loads
  loadContacts();
}); 