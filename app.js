let mediaRecorder;
let audioChunks = [];

recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                analyzeBird(audioBlob); // The "Analysis" Route
            };

            // Start recording
            mediaRecorder.start();
            isRecording = true;
            recordBtn.innerText = "LISTENING...";
            recordBtn.style.background = "#ff4444";
            resultText.innerText = "Recording (5s)...";

            // AUTOMATIC 5-SECOND WINDOW
            setTimeout(() => {
                if (isRecording) {
                    mediaRecorder.stop();
                    // Stop all mic tracks to turn off the green dot on iPhone
                    stream.getTracks().forEach(track => track.stop());
                }
            }, 5000);

        } catch (err) {
            resultText.innerText = "Mic access denied.";
        }
    }
});

async function analyzeBird(blob) {
    recordBtn.innerText = "WAIT";
    resultText.innerText = "Analyzing sound...";

    const formData = new FormData();
    formData.append('audio', blob);

    try {
        const response = await fetch('https://birdnet.cornell.edu/api/v1/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // THE "ROUTE" LOGIC
        if (data.results && data.results.length > 0 && data.results[0].confidence > 0.5) {
            // SUCCESS ROUTE
            const bird = data.results[0].species_common_name;
            resultText.innerText = `Matched: ${bird}!`;
        } else {
            // FAIL ROUTE: Sound was recorded, but no bird was identified
            resultText.innerText = "Identification failed. Sound might be too faint.";
        }

    } catch (err) {
        // ERROR ROUTE: Connection or server issues
        resultText.innerText = "Connection lost. Try again?";
    } finally {
        // RESET UI
        isRecording = false;
        recordBtn.innerText = "LISTEN";
        recordBtn.style.background = "#1DB954";
    }
}
