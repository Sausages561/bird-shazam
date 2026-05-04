let mediaRecorder;
let audioChunks = [];
let isRecording = false;

const recordBtn = document.getElementById('recordBtn');
const resultText = document.getElementById('result');

recordBtn.addEventListener('click', async () => {
    // 1. Prevent double-tapping
    if (isRecording) return;

    try {
        // 2. Request Microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            analyzeBird(audioBlob);
        };

        // 3. Start Recording Logic
        mediaRecorder.start();
        isRecording = true;
        recordBtn.innerText = "LISTENING...";
        recordBtn.style.background = "#ff4444";
        resultText.innerText = "Recording bird sound...";

        // 4. Automatic 5-Second Stop
        setTimeout(() => {
            if (mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
                isRecording = false;
            }
        }, 5000);

    } catch (err) {
        // FAIL ROUTE: Mic blocked or not supported
        console.error(err);
        resultText.innerText = "Error: Allow mic access!";
        alert("Please ensure you are on HTTPS and allow microphone access.");
    }
});

async function analyzeBird(blob) {
    recordBtn.innerText = "WAIT";
    resultText.innerText = "Analyzing sound...";

    const formData = new FormData();
    formData.append('audio', blob);

    try {
        // Using BirdNET's public API endpoint
        const response = await fetch('https://birdnet.cornell.edu/api/v1/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Server Busy");

        const data = await response.json();

        // 5. Success/Fail Identification Logic
        if (data.results && data.results.length > 0 && data.results[0].confidence > 0.4) {
            const birdName = data.results[0].species_common_name;
            const cert = Math.round(data.results[0].confidence * 100);
            resultText.innerText = `${birdName} (${cert}%)`;
        } else {
            resultText.innerText = "No match found. Try again!";
        }

    } catch (e) {
        resultText.innerText = "Check connection & try again.";
    } finally {
        recordBtn.innerText = "LISTEN";
        recordBtn.style.background = "#1DB954";
        isRecording = false;
    }
}
