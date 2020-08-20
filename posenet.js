let video;
let poseNet;
let poses = [];
var started = false;

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent('videoContainer');

  // Video capture
  video = createCapture(VIDEO);
  video.size(width, height); // 640, 480

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
    //console.log(poses); 
  });
  
  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {
    if (started) {
        image(video, 0, 0, width, height);

        // We can call both functions to draw all keypoints and the skeletons
        drawKeypoints();
        drawSkeleton();
    }
}

function modelReady() {
    select('#status').html('model Loaded')
}

// A function to draw ellipses over the detected keypoints
var defaultNosePosition = []
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    //console.log(pose.keypoints[0].position); 
    let nose_pos = pose.keypoints[0].position;
    //Position of eyes when a human opens experiment page. Start position.
    while(defaultNosePosition.length < 1) {
        console.log('in this while loop');
        defaultNosePosition.push(nose_pos);
        console.log(defaultNosePosition);
      }
    if (Math.abs(nose_pos.y - defaultNosePosition[0].y) > 15) { //nose_pos.y > 200) {
        alert("hunched");
        console.log(nose_pos);
        console.log(defaultNosePosition);
    }
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.8
      if (keypoint.score > 0.8) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

// This function turns on AI
function start() {
    select('#startbutton').html('stop')
    document.getElementById('startbutton').addEventListener('click', stop);
    started = true;
    console.log(started);
    loop();
  }
  
  // This function stops the experiment
  function stop() {
    select('#startbutton').html('start')
    document.getElementById('startbutton').addEventListener('click', start);
    removeBlur();
    started = false;
    noLoop();
  }