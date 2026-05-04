// State variables
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// UI Elements
const recordBtn = document.getElementById('recordBtn');
const resultText = document.getElementById('result');

// The main action
recordBtn.addEventListener('click', async () => {
    
    // Safety check: Don't start twice
    if (isRecording) return;

    try {
        // Request Microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup recorder
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            sendToBirdNet(audioBlob);
        };

        // UI Update: Start
        mediaRecorder.start();
        isRecording = true;
        recordBtn.innerText = "LISTENING...";
        recordBtn.style.background = "#ff4444";
        resultText.innerText = "Recording for 5 seconds...";

        // Automatic Stop after 5s
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop()); // Turn off mic hardware
                isRecording = false;
            }
        }, 5000);

    } catch (err) {
        // Error Route: Mic denied or unsupported
        console.error(err);
        resultText.innerText = "Error: Mic access denied";
        alert("Please allow microphone access to identify birds.");
    }
});

async function sendToBirdNet(blob) {
    recordBtn.innerText = "WAIT";
    resultText.innerText = "Analyzing sound waves...";

    const formData = new FormData();
    formData.append('audio', blob);

    try {
        // Cornell University BirdNET API
        const response = await fetch('https://birdnet.cornell.edu/api/v1/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("API Offline");

        const data = await response.json();

        // Success vs Fail Route
        if (data.results && data.results.length > 0 && data.results[0].confidence > 0.4) {
            const bird = data.results[0].species_common_name;
            const score = Math.round(data.results[0].confidence * 100);
            resultText.innerText = `${bird} (${score}%)`;
        } else {
            resultText.innerText = "No match. Try moving closer.";
        }

    } catch (e) {
        resultText.innerText = "Connection error. Try again.";
    } finally {
        // Reset UI to start over
        recordBtn.innerText = "LISTEN";
        recordBtn.style.background = "#1DB954";
        isRecording = false;
    }
}
