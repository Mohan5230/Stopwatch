// Ensures the script runs only after the entire HTML document has been loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const startStopBtn = document.getElementById('start-stop-btn');
    // FIX: Cast 'lapResetBtn' to HTMLButtonElement to access the 'disabled' property.
    const lapResetBtn = document.getElementById('lap-reset-btn') as HTMLButtonElement;
    const lapsList = document.getElementById('laps-list');

    // Check if all required elements are present on the page
    if (!display || !startStopBtn || !lapResetBtn || !lapsList) {
        console.error("A required stopwatch element could not be found in the DOM.");
        return;
    }

    let timer: number | null = null;
    let startTime = 0;
    let elapsedTime = 0;
    let isRunning = false;
    let lapNumber = 1;
    let lastLapTime = 0;

    function formatTime(time: number): string {
        const date = new Date(time);
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        const hundredths = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
        return `${minutes}:${seconds}.${hundredths}`;
    }

    function updateDisplay() {
        display.textContent = formatTime(elapsedTime);
    }

    function tick() {
        elapsedTime = Date.now() - startTime;
        updateDisplay();
        timer = requestAnimationFrame(tick);
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        startStopBtn.textContent = 'Stop';
        startStopBtn.classList.remove('start');
        startStopBtn.classList.add('stop');
        startStopBtn.setAttribute('aria-label', 'Stop stopwatch');

        lapResetBtn.textContent = 'Lap';
        lapResetBtn.disabled = false;
        lapResetBtn.setAttribute('aria-label', 'Record lap time');
        
        timer = requestAnimationFrame(tick);
    }

    function stop() {
        if (!isRunning) return;
        isRunning = false;
        if (timer) {
            cancelAnimationFrame(timer);
        }
        startStopBtn.textContent = 'Start';
        startStopBtn.classList.remove('stop');
        startStopBtn.classList.add('start');
        startStopBtn.setAttribute('aria-label', 'Start stopwatch');

        lapResetBtn.textContent = 'Reset';
        lapResetBtn.setAttribute('aria-label', 'Reset stopwatch');
    }

    function reset() {
        if (isRunning) return;
        elapsedTime = 0;
        lapNumber = 1;
        lastLapTime = 0;
        lapsList.innerHTML = '';
        updateDisplay();
        lapResetBtn.disabled = true;
    }

    function lap() {
        if (!isRunning) return;
        const currentLapTime = elapsedTime - lastLapTime;
        lastLapTime = elapsedTime;

        const li = document.createElement('li');
        const lapLabel = document.createElement('span');
        lapLabel.className = 'lap-label';
        lapLabel.textContent = `Lap ${lapNumber}`;
        
        const lapTime = document.createElement('span');
        lapTime.textContent = formatTime(currentLapTime);

        li.appendChild(lapLabel);
        li.appendChild(lapTime);
        lapsList.prepend(li); // Add new laps to the top
        lapNumber++;
    }

    startStopBtn.addEventListener('click', () => {
        if (isRunning) {
            stop();
        } else {
            start();
        }
    });

    lapResetBtn.addEventListener('click', () => {
        if (isRunning) {
            lap();
        } else {
            reset();
        }
    });

    // Initial state
    lapResetBtn.disabled = true;
    updateDisplay();
});