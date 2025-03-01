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
      usernameDisplay.textContent = "Welcome, " + currentUser.firstName;
    }
  }

  // Logout functionality
  if (logoutButton) {
    logoutButton.addEventListener("click", function() {
      logout(); // This function is defined in auth.js
    });
  }

  // Loading contacts
  let contactsData = []; //store contats globally for search_contacts

function loadContacts() {
  if (contactsList) {
    fetch("../../api/RetrieveContact.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          contactsData = data.contacts; 

          // send to search_contact
          if (typeof window.setContactsData === "function") {
            window.setContactsData(contactsData);
          }
          displayContacts(contactsData);
        } else {
          contactsList.innerHTML = `
            <tr>
              <td colspan="4" class="text-center text-danger">
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
            <td colspan="4" class="text-center text-danger">
              An error occurred while loading contacts. Please try again.
            </td>
          </tr>
        `;
      });
  }
}

// dinamycally display contacts 
function displayContacts(contacts) {
  contactsList.innerHTML = ""; 

  if (contacts.length === 0) {
    contactsList.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">No contacts found. Add your first contact above!</td>
      </tr>
    `;
    return;
  }

  contacts.forEach((contact) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${contact.name}</td>
      <td>${contact.email}</td>
      <td>${contact.phone}</td>
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

  addContactButtonListeners();
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
          .then(response => response.json())
          .then(data => {
            if (data.success && data.contact) {
              const contact = data.contact;
              const row = this.closest("tr");
              
              // Inline edit form with separate first and last name fields
              row.innerHTML = `
                <td>
                  <div class="row">
                    <div class="col">
                      <input type="text" class="form-control" placeholder="First name" value="${contact.first}" id="edit-first-${contactId}">
                    </div>
                    <div class="col">
                      <input type="text" class="form-control" placeholder="Last name" value="${contact.last}" id="edit-last-${contactId}">
                    </div>
                  </div>
                </td>
                <td>
                  <input type="email" class="form-control" placeholder="Email" value="${contact.email}" id="edit-email-${contactId}">
                  <input type="tel" class="form-control mt-2" placeholder="Phone (optional)" value="${contact.phone || ''}" id="edit-phone-${contactId}">
                </td>
                <td>
                  <button class="btn btn-success btn-sm save-edit" data-id="${contactId}">Save</button>
                  <button class="btn btn-secondary btn-sm cancel-edit" data-id="${contactId}">Cancel</button>
                </td>
              `;

              // Add save and cancel handlers
              row.querySelector(".save-edit").addEventListener("click", function () {
                const updatedFirst = document.getElementById(`edit-first-${contactId}`).value.trim();
                const updatedLast = document.getElementById(`edit-last-${contactId}`).value.trim();
                const updatedEmail = document.getElementById(`edit-email-${contactId}`).value.trim();
                const updatedPhone = document.getElementById(`edit-phone-${contactId}`).value.trim();

                // Create JSON data for the update
                const contactData = {
                  CONTACT_ID: contactId,
                  FIRST: updatedFirst,
                  LAST: updatedLast,
                  EMAIL: updatedEmail,
                  PHONE_NUMBER: updatedPhone
                };

                fetch("../../api/UpdateContact.php", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(contactData),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.success) {
                      loadContacts(); // reloading contacts list
                    } else {
                      alert("Failed to update contact: " + (data.message || "Unknown error"));
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
            } else {
              alert("Failed to retrieve contact details");
            }
          })
          .catch(error => {
            console.error("Error fetching contact details:", error);
            alert("An error occurred. Please try again.");
          });
      });
    });

    // Delete contact buttons
    document.querySelectorAll(".delete-contact").forEach((button) => {
      button.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this contact?")) {
          const contactId = this.getAttribute("data-id");

          // Create JSON data for the delete request
          const deleteData = {
            CONTACT_ID: contactId
          };

          fetch("../../api/DeleteContact.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(deleteData),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                loadContacts(); // reloading contacts list
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

  // Load contacts when dashboard page loads
  if (contactsList) {
    loadContacts();
  }
}); 

