const recordBtn = document.getElementById('recordBtn');
const resultText = document.getElementById('result');

let isRecording = false;

recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
        try {
            // This line pops up the "Allow Microphone" box on your iPhone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            isRecording = true;
            recordBtn.innerText = "LISTENING...";
            recordBtn.style.background = "#ff4444"; // Change button to red
            resultText.innerText = "Listening for birds...";

            // For now, we will just simulate a "listen" for 3 seconds
            setTimeout(() => {
                stopRecording();
            }, 3000);

        } catch (err) {
            resultText.innerText = "Mic Error: " + err;
        }
    }
});

function stopRecording() {
    isRecording = false;
    recordBtn.innerText = "LISTEN";
    recordBtn.style.background = "#1DB954"; // Change back to green
    resultText.innerText = "Analysis coming soon...";
}
