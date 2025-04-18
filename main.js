// Main theme handling functionality
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

function updateTheme(e) {
  if (e.matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

if (isStandalone) {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Initial theme setup
  updateTheme(darkModeMediaQuery);
  
  // Listen for system theme changes
  darkModeMediaQuery.addEventListener('change', updateTheme);
}
