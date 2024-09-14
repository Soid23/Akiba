// Import AOS and its CSS
import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS
AOS.init();

// Check if script is loaded
console.log('Main.js loaded');

// Hide loading screen and show content after the page has loaded
window.addEventListener('load', () => {
    console.log('Window loaded');
    document.getElementById('loading-screen').style.display = 'none';
    document.querySelector('body').style.overflow = 'auto'; // Restore body scroll if disabled
});

// Auto-hide flash messages after 5 seconds
document.querySelectorAll('.flash').forEach(flash => {
  console.log('Flash element found');
  setTimeout(() => {
    flash.classList.remove('show');
  }, 5000); // Adjust timing as needed
});
