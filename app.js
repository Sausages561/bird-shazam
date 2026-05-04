// This function will now actually talk to the BirdNET engine
async function stopRecording(blob) {
    isRecording = false;
    recordBtn.innerText = "LISTEN";
    recordBtn.style.background = "#1DB954";
    resultText.innerText = "Identifying...";

    // We create a "Package" to send the audio to the BirdNET API
    const formData = new FormData();
    formData.append('audio', blob);

    try {
        // We send the audio to the public BirdNET analysis server
        const response = await fetch('https://birdnet.cornell.edu/api/v1/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        // If the AI finds a bird, we display the top result
        if (data.results && data.results.length > 0) {
            const topBird = data.results[0].species_common_name;
            const confidence = Math.round(data.results[0].confidence * 100);
            resultText.innerText = `It's a ${topBird}! (${confidence}% sure)`;
        } else {
            resultText.innerText = "No bird detected. Try getting closer!";
        }
    } catch (err) {
        resultText.innerText = "Analysis Error. Check your connection.";
    }
}
