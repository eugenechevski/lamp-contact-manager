// User authentication and session management

// Check if user is logged in by making a request to the server
async function isUserLoggedIn() {
  try {
    const response = await fetch('../../api/CheckSession.php');
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
}

// Logout function - calls the server to destroy the session
function logout() {
  return fetch('../../api/Logout.php')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = '../../index.html';
      } else {
        console.error('Logout failed:', data.error);
      }
    })
    .catch(error => {
      console.error('Error during logout:', error);
    });
}

// Redirect to login if not authenticated
async function requireAuth() {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) {
    window.location.href = '../../index.html';
  }
}

// Redirect to dashboard if already authenticated
async function redirectIfLoggedIn() {
  const loggedIn = await isUserLoggedIn();
  if (loggedIn) {
    window.location.href = 'ui/pages/dashboard.html';
  }
}

// Get current user data
async function getCurrentUser() {
  try {
    const response = await fetch('../../api/RetrieveUser.php');
    const data = await response.json();
    
    if (data.success) {
      return {
        id: data.id,
        firstName: data.first,
        lastName: data.last,
        contacts: data.listOfContacts || []
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
} 