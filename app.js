let model, recognizer;

async function createModel() {
  const URL = "https://teachablemachine.withgoogle.com/models/4sMNpqG7b/";

  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata

  const recognizer = speechCommands.create(
    "BROWSER_FFT", // fourier transform type, not useful to change
    undefined, // speech commands vocabulary feature, not useful for your models
    checkpointURL,
    metadataURL);

  // check that model and metadata are loaded via HTTPS requests.
  await recognizer.ensureModelLoaded();

  return recognizer;
}

async function init() {
  const recognizer = await createModel();
  const classLabels = recognizer.wordLabels(); // get class labels
  const labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = ""; // Clear previous labels if any

  for (let i = 0; i < classLabels.length; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  // listen() takes two arguments:
  // 1. A callback function that is invoked anytime a word is recognized.
  // 2. A configuration object with adjustable fields
  recognizer.listen(result => {
    const scores = result.scores; // probability of prediction for each class

    // Find the index with the highest probability
    const highestProbabilityIndex = scores.indexOf(Math.max(...scores));
    const highestProbability = scores[highestProbabilityIndex];

    // If highest probability is 100%, type the key in the text box
    if (highestProbability === 1.0) {
      const highestProbabilityKey = classLabels[highestProbabilityIndex];
      typeKeyInTextBox(highestProbabilityKey);
    }

    // Render the probability scores per class
    for (let i = 0; i < classLabels.length; i++) {
      const classPrediction = classLabels[i] + ": " + scores[i].toFixed(2);
      labelContainer.childNodes[i].innerHTML = classPrediction;
    }
  }, {
    includeSpectrogram: false, // We don't need the spectrogram for key press detection
    probabilityThreshold: 0.75,
    invokeCallbackOnNoiseAndUnknown: true,
    overlapFactor: 0.50 // Adjust as needed
  });

  // Stop the recognition after a set time or based on user interaction
  // setTimeout(() => recognizer.stopListening(), 5000);
}

function typeKeyInTextBox(key) {
  const textBox = document.getElementById('keyTextBox');
  textBox.value += key;
}

async function checkMicrophonePermissionAndInit() {
  try {
    const permissionStatus = await navigator.permissions.query({ name: 'microphone' });

    if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
      // Permission is granted or prompt is required, proceed to access microphone
      await navigator.mediaDevices.getUserMedia({ audio: true });
      init(); // Initialize your model and start listening
    } else {
      // Permission denied, show appropriate message or handle gracefully
      console.error('Microphone access denied.');
      document.getElementById('label-container').innerText = 'Microphone access denied. Please allow access in your browser settings.';
    }
  } catch (error) {
    console.error('Error accessing microphone:', error);
    document.getElementById('label-container').innerText = 'Error accessing microphone. Check console for details.';
  }
}

document.getElementById('startButton').addEventListener('click', checkMicrophonePermissionAndInit);
