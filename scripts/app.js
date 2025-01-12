// Redirect to Dashboard
const getStartedButton = document.getElementById('get-started');
if (getStartedButton) {
    getStartedButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
}