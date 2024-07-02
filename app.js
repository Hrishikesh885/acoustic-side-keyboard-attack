let recognizer;

async function setupModel() {
  const URL = "https://teachablemachine.withgoogle.com/models/4sMNpqG7b/";

  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata

  recognizer = speechCommands.create(
    "BROWSER_FFT", // fourier transform type, not useful to change
    undefined, // speech commands vocabulary feature, not useful for your models
    checkpointURL,
    metadataURL);

  // check that model and metadata are loaded via HTTPS requests.
  await recognizer.ensureModelLoaded();
}

function startListening() {
  recognizer.listen(result => {
    const classLabels = recognizer.wordLabels();
    const transcriptElement = document.getElementById('transcript');
    transcriptElement.innerHTML = ""; // Clear previous transcript

    for (let i = 0; i < result.scores.length; i++) {
      const score = result.scores[i].toFixed(2);
      const label = classLabels[i];
      
      if (score >= 0.75) { // Adjust threshold as needed
        const prediction = `${label}: ${score}`;
        transcriptElement.innerHTML += `<div>${prediction}</div>`;
      }
    }
  }, {
    includeSpectrogram: false,
    probabilityThreshold: 0.75,
    invokeCallbackOnNoiseAndUnknown: true,
    overlapFactor: 0.50
  });
}

async function initializeApp() {
  await setupModel();
  startListening();
}

document.getElementById('startButton').addEventListener('click', initializeApp);
