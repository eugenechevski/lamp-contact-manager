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
      darkModeToggle.textContent = "Light Mode";
    }
  
    function disableDarkMode() {
      body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
      darkModeToggle.textContent = "Dark Mode";
    }
  });
  