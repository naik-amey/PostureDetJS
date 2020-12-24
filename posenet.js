let video;
let poseNet;
let poses = [];
var started = false;
var startTime, endTime;
var total_hunched_time = 0; // in seconds
var total_correct_time = 0; // in seconds
var correct_time_before_hunch = 0; // in seconds.
let global_nose_posX=0;
let global_nose_posY=0;
const HunchTimeOut = 2;
let nose_pos;
let l_eye_pos;
let r_eye_pos;
let tri_area
let avg_eye_level
let beep
let corr_pos = {nose_pos: 0, l_eye: 0, r_eye: 0, tri_area: 0};
let hunch_pos = {nose_pos: 0, l_eye: 0, r_eye: 0, tri_area: 0};
let eye_th
let tri_area_th

function preload() {
  beep = loadSound("beep-10.mp3"); 
}

function setup() {
  let constraints = {
    video: {
      mandatory: {
        minWidth: 640,
        minHeight: 480
      },
      //optional: [{ maxFrameRate: 2 }]
    },
    audio: false 
  };

  //soundFormats('mp3', 'ogg');

  // https://p5js.org/reference/#/p5/createCapture
  // createCapture(constraints, function(stream) {
  //   console.log(stream);
  // });
  const canvas = createCanvas(640, 480);
  canvas.parent('videoContainer');

  // Video capture
  video = createCapture(constraints,VIDEO);
  video.size(width, height); // 640, 480

  // Create a new poseNet method with a single detection
  var posenetoptions = { 
    //architecture: 'ResNet50',
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 0.8,
    maxPoseDetections: 1, //detect only single pose
    scoreThreshold: 0.5,
    nmsRadius: 20,
    detectionType: 'single', //detect only single pose
    multiplier: 0.75,
  };
  //In order to change the detectionType to single on video, you need to pass it into the constructor directly rather than in the object.
  // https://github.com/ml5js/ml5-library/issues/355#issuecomment-500931951
  // https://github.com/ml5js/ml5-library/pull/514#issue-294370528
  // NOT WORKINGposeNet = ml5.poseNet(video, 'single', modelReady);
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
    document.getElementById('myText').innerHTML = total_hunched_time;
    if (started) {
        image(video, 0, 0, width, height);
        // We can call both functions to draw all keypoints and the skeletons
        drawKeypoints();
        keyPressed();
        //check_posture();
        //drawSkeleton();
        //fill(0,255,0);
        //ellipse(global_nose_posX,global_nose_posY,50);
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
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.8
      if (keypoint.score > 0.8) {
      //if (keypoint.score > 0.5) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      } 
    }
    nose_pos = pose.keypoints[0];
    l_eye_pos = pose.keypoints[1];
    r_eye_pos = pose.keypoints[2];
    stroke(0, 0, 255);
    line(nose_pos.position.x, nose_pos.position.y, l_eye_pos.position.x, l_eye_pos.position.y);
    line(nose_pos.position.x, nose_pos.position.y, r_eye_pos.position.x, r_eye_pos.position.y);
    text('('+str(int(nose_pos.position.x))+','+str(int(nose_pos.position.y))+')',nose_pos.position.x, nose_pos.position.y+10)
    text('('+str(int(l_eye_pos.position.x))+','+str(int(l_eye_pos.position.y))+')',l_eye_pos.position.x+0, l_eye_pos.position.y-10)
    text('('+str(int(r_eye_pos.position.x))+','+str(int(r_eye_pos.position.y))+')',r_eye_pos.position.x-10, r_eye_pos.position.y-10)
    // area of triangle
    tri_area = abs(nose_pos.position.x*(l_eye_pos.position.y - r_eye_pos.position.y) + l_eye_pos.position.x*(r_eye_pos.position.y - nose_pos.position.y) + r_eye_pos.position.x*(nose_pos.position.y - l_eye_pos.position.y))/2;
    avg_eye_level = (l_eye_pos.position.y + r_eye_pos.y)/2

    let mid_pt_x = (nose_pos.position.x + l_eye_pos.position.x + r_eye_pos.position.x) / 3
    let mid_pt_y = (nose_pos.position.y + l_eye_pos.position.y + r_eye_pos.position.y) / 3
    text('('+str(int(tri_area))+')',mid_pt_x, mid_pt_y)
    //text("HI",mid_pt_x, mid_pt_y)

  }
}

function record_posture1() {
  if (mouseIsPressed) {
    if (mouseButton === LEFT) {
      stroke(0, 0, 255);
      text('('+str(int(tri_area))+')',50, 50)
      print(mouseButton);
      //beep.play();
    }
  }
}

function keyPressed() {
  text(`${key} ${keyCode}`, 10, 40);
  print(key, ' ', keyCode);
  if (keyCode == 32){ // recording the correct post
    corr_pos.nose_pos = nose_pos
    corr_pos.l_eye = l_eye_pos.position.y
    corr_pos.r_eye = r_eye_pos.position.y
    corr_pos.tri_area = tri_area
    text(corr_pos.tri_area,10,50)
  } else if (keyCode == 40) { // down arrow
    hunch_pos.nose_pos = nose_pos
    hunch_pos.l_eye = l_eye_pos.position.y
    hunch_pos.r_eye = r_eye_pos.position.y
    hunch_pos.tri_area = tri_area
    text(hunch_pos.l_eye,10,80)
  } else { // any other key
    eye_th = ((corr_pos.l_eye + hunch_pos.l_eye)/2 + (corr_pos.r_eye + hunch_pos.r_eye)/2)/2 //FIXME redundant
    text(eye_th,10,80)
    check_posture();
  }
  return false; // prevent default
}

function check_posture() {
  // if (mouseIsPressed) {
  //   if (mouseButton === LEFT) {
  //     stroke(0, 0, 255);
  //     text('('+str(int(tri_area))+')',50, 50)
  //     print(mouseButton);
  //     beep.play();
  //   }
  // }
  //if (tri_area > 1500) {
  let eye_level = (l_eye_pos.position.y + r_eye_pos.position.y)/2
  if ( eye_level > eye_th) {
    beep.play()
    text('eye level = '+int(eye_level)+' eye_th = '+int(eye_th), 10,100)
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
    starttimer();
  }
  
  // This function stops the experiment
  function stop() {
    select('#startbutton').html('start')
    document.getElementById('startbutton').addEventListener('click', start);
    removeBlur();
    started = false;
    noLoop();
  }

  function starttimer() {
    startTime = new Date();
  };
  
  function endtimer() {
    endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    // strip the ms
    timeDiff /= 1000;

    console.log(startTime)
    //console.log(endTime)
  
    // get seconds 
    var seconds = Math.round(timeDiff);
    console.log(seconds + " seconds");

    correct_time_before_hunch = seconds;
    console.log("total correct time = " + total_correct_time) 
    console.log("correct hunch time " + correct_time_before_hunch)

  }

  function set_started() {
    started = true;
    console.log("set_started called")
    starttimer();
  }