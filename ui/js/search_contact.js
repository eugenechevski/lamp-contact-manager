document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchContact");
    const searchButton = document.getElementById("searchButton");
    const contactsList = document.getElementById("contactsList");
    
    let contactsData = []; 
  
    function filterContacts(searchQuery = "") {
      // regex search filter
      const filteredContacts = contactsData.filter(contact => {
        const name = `${contact.name}`.toLowerCase();
        const regex = new RegExp(searchQuery, "i"); 
        return regex.test(name);
      });
  
      // update contact list
      contactsList.innerHTML = "";
  
      if (filteredContacts.length === 0) {
        contactsList.innerHTML = `
          <tr>
            <td colspan="4" class="text-center text-muted">No contacts found.</td>
          </tr>
        `;
        return;
      }
  
      // display searched contacs 
      filteredContacts.forEach(contact => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${contact.name}</td>
          <td>${contact.email}</td>
          <td>${contact.phone}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-contact" data-id="${contact.id}">Edit</button>
            <button class="btn btn-danger btn-sm delete-contact" data-id="${contact.id}">Delete</button>
          </td>
        `;
        contactsList.appendChild(row);
      });
  
      // edit and delete buttons
      addContactButtonListeners();
    }
  
    // button click
    if (searchButton) {
      searchButton.addEventListener("click", function () {
        const searchQuery = searchInput.value.trim().toLowerCase();
        filterContacts(searchQuery);
      });
    }
  
    // recieve contacts from dashboard
    function setContactsData(data) {
      contactsData = data;
    }
  
    window.setContactsData = setContactsData;
  });
  