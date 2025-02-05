// declare global variable
let video = null; // video element
let detector = null; // detector object
let detections = []; // store detection result
let videoVisibility = true;
let detecting = false;

// global HTML element
const toggleVideoEl = document.getElementById('toggleVideoEl');
const toggleDetectingEl = document.getElementById('toggleDetectingEl');

// set cursor to wait until video elment is loaded
document.body.style.cursor = 'wait';

// The preload() function if existed is called before the setup() function
function preload() {
    // create detector object from "cocossd" model
    detector = ml5.objectDetector('cocossd');
    console.log('detector object is loaded');
}

// The setup() function is called once when the program starts.
function setup() {
    // create canvas element with 640 width and 480 height in pixel
    createCanvas(540, 380);
    // Creates a new HTML5 <video> element that contains the audio/video feed from a webcam.
    // The element is separate from the canvas and is displayed by default.
    video = createCapture(VIDEO);
    video.size(540, 380);
    console.log('video element is created');
    video.elt.addEventListener('loadeddata', function() {
        // set cursor back to default
        if (video.elt.readyState >= 2) {
            document.body.style.cursor = 'default';
            console.log('video element is ready! Click "Start Detecting" to see the magic!');
        }
    });
}

// the draw() function continuously executes until the noLoop() function is called
function draw() {
    if (!video || !detecting) return;
    // draw video frame to canvas and place it at the top-left corner
    image(video, 0, 0);
    // draw all detected objects to the canvas
    for (let i = 0; i < detections.length; i++) {
        drawResult(detections[i]);
    }
}

/*
Exaple of an detect object
{
    "label": "person",
    "confidence": 0.8013999462127686,
    "x": 7.126655578613281,
    "y": 148.3782720565796,
    "width": 617.7880859375,
    "height": 331.60210132598877,
}
*/
function drawResult(object) {
    drawBoundingBox(object);
    drawLabel(object);
}

// draw bounding box around the detected object
function drawBoundingBox(object) {
    // Sets the color used to draw lines.
    stroke('green');
    // width of the stroke
    strokeWeight(4);
    // Disables filling geometry
    noFill();
    // draw an rectangle
    // x and y are the coordinates of upper-left corner, followed by width and height
    rect(object.x, object.y, object.width, object.height);
}

// draw label of the detected object (inside the box)
function drawLabel(object) {
    // Disables drawing the stroke
    noStroke();
    // sets the color used to fill shapes
    fill('white');
    // set font size
    textSize(24);
    // draw string to canvas
    text(object.label, object.x + 10, object.y + 24);
}

// callback function. it is called when object is detected
function onDetected(error, results) {
    if (error) {
        console.error(error);
    }
    detections = results;
    // keep detecting object
    if (detecting) {
        detect();
    }
}

function detect() {
    // instruct "detector" object to start detect object from video element
    // and "onDetected" function is called when object is detected
    detector.detect(video, onDetected);
}

function toggleVideo() {
    if (!video) return;
    if (videoVisibility) {
        video.hide();
        toggleVideoEl.innerText = 'Show Video';
    } else {
        video.show();
        toggleVideoEl.innerText = 'Hide Video';
    }
    videoVisibility = !videoVisibility;
}

function toggleDetecting() {
    if (!video || !detector) return;
    if (!detecting) {
        detect();
        toggleDetectingEl.innerText = 'Stop Detecting';
    } else {
        toggleDetectingEl.innerText = 'Start Detecting';
    }
    detecting = !detecting;
}

















// Function to take attendance when a person is detected
function takeAttendance() {
    if (!video || !detector) return;

    // Pause detection temporarily to capture the current frame
    detecting = false;

    // Capture current frame
    captureImage();
}

// Function to capture the current frame and prompt for saving
function captureImage() {
    // Get the current frame from the video element
    let canvas = document.createElement('canvas');
    canvas.width = video.width;
    canvas.height = video.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(video.elt, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a data URL
    let dataURL = canvas.toDataURL('image/png');

    // Prompt for name and save the image
    saveImage(dataURL);
}

// Function to save the captured image
function saveImage(dataURL) {
    let name = prompt('Enter a name for the attendance record:');
    if (name) {
        // Format the current date and time
        let now = new Date();
        let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let formattedDate = now.toLocaleDateString('en-US', options);

        let day = now.getDate();
        let suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3) ? 0 : ((day % 100 - day % 10 != 10) ? day % 10 : 0)];
        formattedDate = formattedDate.replace(day, `${day}${suffix}`);

        let hours = now.getHours();
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        let time = `${hours}:${minutes}${ampm}`;

        formattedDate += ` present at ${time}`;

        let filename = `${name}_${formattedDate.replace(/[\s,]/g, '_')}.png`;

        console.log(filename);












        // Create a link element to trigger download
        let link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        link.click();

        // Resume detection after saving image
        detecting = true;
    } else {
        // If no name entered, resume detection without saving
        detecting = true;
    }
}