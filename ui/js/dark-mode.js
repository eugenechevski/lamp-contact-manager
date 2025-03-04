document.addEventListener("DOMContentLoaded", function () {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;
  
    // check what mode the user last used
    if (localStorage.getItem("darkMode") === "enabled") {
      enableDarkMode();
    }
  
    // toggle dark mode
    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", function () {
        if (body.classList.contains("dark-mode")) {
          disableDarkMode();
        } else {
          enableDarkMode();
        }
      });
    }
  
    function enableDarkMode() {
      body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
      
      // Update icon for light mode toggle
      if (darkModeToggle.classList.contains('dark-mode-toggle')) {
        darkModeToggle.innerHTML = '<i class="bi bi-sun"></i>';
        darkModeToggle.setAttribute('aria-label', 'Toggle light mode');
      }
    }
  
    function disableDarkMode() {
      body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
      
      // Update icon for dark mode toggle
      if (darkModeToggle.classList.contains('dark-mode-toggle')) {
        darkModeToggle.innerHTML = '<i class="bi bi-moon-stars"></i>';
        darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
      }
    }
  });
  