function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Function to display alert if not a mobile device
function showAlertIfNotMobile() {
  if (!isMobileDevice()) {
    document.write("server error");
      window.location.replace("login.html");
  }
}

// Call the function when the page loads
window.onload = showAlertIfNotMobile;