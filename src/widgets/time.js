export function initTime() {
    const timeDisplay = document.getElementById('time-display');
    const dateDisplay = document.getElementById('date-display');

    function updateTime() {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        dateDisplay.textContent = now.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    updateTime();
    setInterval(updateTime, 1000);
}
