/**
 * Human Pose Detection Demo Project.
 * p5.js and ml5.js PoseNet has been used in this Project.
 * A custom machine model has been trained on top of ml5.js' PoseNet to recognize human poses.
 * @author :ahmettekeli1991@hotmail.com
 */

// Video and PoseNet
let video;
let poseNet;
let poses = [];

// Neural Network
let brain;

// Interface
let dataButton;
let loadModelButton;
let predictionResult;
let trainedPosesP;

//Variables to reduce frame count for request animation frame loop.
let fps = 3,
	fpsInterval,
	startTime,
	now,
	then,
	elapsed;

/**
 * p5.js Setup function.
 */
function setup() {
	createCanvas(640, 480);
	video = createCapture(VIDEO);
	video.size(width, height);

	// Create a new poseNet method with a single detection
	poseNet = ml5.poseNet(video, modelReady);
	// This sets up an event that fills the global variable "poses"
	// with an array every time new poses are detected
	poseNet.on("pose", function (results) {
		poses = results;
	});
	// Hide the video element, and just show the canvas
	video.hide();

	predictionResult = createElement("h1", "waiting to predict");
	trainedPosesP = createElement("h3", "Trained movements are: Neutral, Hands Up, Squat, Leg Stretch");

	dataButton = createButton("predict");
	loadModelButton = createButton("load model");
	dataButton.mousePressed(startPredicting);
	loadModelButton.mousePressed(loadCustomModel);

	// Neural network options.
	const options = {
		task: "classification", // or 'regression'
	};

	modelOptions = {
		model: "models/model.json",
		metadata: "models/model_meta.json",
		weights: "models/model.weights.bin",
	};
	brain = ml5.neuralNetwork(options);
}

/**
 * Starts the animation loop.(Update loop)
 * @param {number} fps = frames per second for update loop.
 */
function startAnimating(fps) {
	fpsInterval = 1000 / fps;
	then = Date.now();
	startTime = then;
	animate();
}

/**
 * Starts a request animation frame loop and overclocks the fps for performance.
 */
function animate() {
	requestAnimationFrame(animate);
	// calc elapsed time since last loop
	now = Date.now();
	elapsed = now - then;
	// if enough time has elapsed, draw the next frame
	if (elapsed > fpsInterval) {
		// Get ready for next frame by setting then=now, but also adjust for your
		// specified fpsInterval not being a multiple of RAF's interval (16.7ms)
		then = now - (elapsed % fpsInterval);
		// Put your drawing code here
		classify();
	}
}

/**
 * Starts predicting the pose of the human body.
 */
function startPredicting() {
	startAnimating(fps);
}

/**
 * Loads the custom machine model in order to be able to classify human poses.
 */
function loadCustomModel() {
	brain.load(modelOptions, finishedLoading);
}

function finishedLoading() {
	//Do something when custom model loading is finished.
	console.log("finished loading the custom model");
}

/**
 * Checks if the pose is a human pose and classifies it.
 */
function classify() {
	if (poses.length > 0) {
		let inputs = getInputs();
		brain.classify(inputs, gotResults);
	}
}

/**
 * Prints the results of the prediction. (On predictions results are ready)
 * @param {String} error - error message.
 * @param {Object} results - results of the prediction.
 */
function gotResults(error, results) {
	//  Log output
	predictionResult.html(`${results[0].label} ${floor(results[0].confidence * 100)}%`);
	if (error) {
		console.error(error);
	}
}

/**
 * Converts the joint coordinates to a format that can be used by the neural network.
 * @returns Array of joint positions for the neural network.
 */
function getInputs() {
	let keypoints = poses[0].pose.keypoints;
	let inputs = [];
	for (let i = 0; i < keypoints.length; i++) {
		inputs.push(keypoints[i].position.x);
		inputs.push(keypoints[i].position.y);
	}
	return inputs;
}

function modelReady() {
	//Do something when posenet human body recognizing model is ready.
	console.log("posenet model loaded");
	loadCustomModel();
}

/**
 * Draws PoseNet joint points on the canvas.
 */
function draw() {
	image(video, 0, 0, width, height);
	strokeWeight(2);
	// For one pose only (use a for loop for multiple poses!)
	if (poses.length > 0) {
		let pose = poses[0].pose;
		for (let i = 0; i < pose.keypoints.length; i++) {
			fill(213, 0, 143);
			noStroke();
			ellipse(pose.keypoints[i].position.x, pose.keypoints[i].position.y, 8);
		}
	}
}
