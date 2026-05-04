let mediaRecorder;
let audioChunks = [];
let isRecording = false;

const recordBtn = document.getElementById('recordBtn');
const resultText = document.getElementById('result');

recordBtn.addEventListener('click', async () => {
    console.log("Button clicked!"); // Test Point 1
    
    if (isRecording) return; 

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            console.log("Recording stopped, starting analysis..."); // Test Point 2
            analyzeBird(audioBlob);
        };

        mediaRecorder.start();
        isRecording = true;
        recordBtn.innerText = "LISTENING...";
        recordBtn.style.background = "#ff4444";
        resultText.innerText = "Recording (5s)...";

        setTimeout(() => {
            if (mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
                isRecording = false;
            }
        }, 5000);

    } catch (err) {
        console.log("Error:", err);
        resultText.innerText = "Error: " + err;
    }
});

async function analyzeBird(blob) {
    recordBtn.innerText = "WAIT";
    resultText.innerText = "Identifying...";

    const formData = new FormData();
    formData.append('audio', blob);

    try {
        const response = await fetch('https://birdnet.cornell.edu/api/v1/analyze', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            resultText.innerText = "Match: " + data.results[0].species_common_name;
        } else {
            resultText.innerText = "No bird found. Try again!";
        }
    } catch (e) {
        resultText.innerText = "Server error. Check internet.";
    } finally {
        recordBtn.innerText = "LISTEN";
        recordBtn.style.background = "#1DB954";
    }
}
