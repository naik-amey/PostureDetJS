let video;
let poseNet;
let poses = [];
var started = false;
var startTime, correct_currTime;
var total_hunched_time = 0; // in seconds
var total_correct_time = 0; // in seconds
var correct_time_before_hunch = 0; // in seconds.
const HunchTimeOut = 2;
let nose_pos;
let l_eye_pos;
let r_eye_pos;
let tri_area
let beep
let corr_pos = {nose_pos: 0, l_eye: 0, r_eye: 0, tri_area: 0};
let hunch_pos = {nose_pos: 0, l_eye: 0, r_eye: 0, tri_area: 0};
let eye_th
let tri_area_th
let label
let hunch_seconds, prev_hunch_seconds

// MODEL
let model;
let state = 'collection'
let state2 = 'sitting'

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

  let options = {
    inputs: ['lx', 'ly', 'rx', 'ry', 'nx', 'ny', 'area'],
    outputs: ['label'],
    task: 'classification',
    debug: 'true'
  };

  // default nn has 16 nodes in dense hidden layer with [inputs -> 16_dense_hidden_nodes->dense_softmax]
  model = ml5.neuralNetwork(options)

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
  poseNet = ml5.poseNet(video, options=posenetoptions, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  
  // Hide the video element, and just show the canvas
  video.hide();

  // start timer
  startTime = new Date();
  correct_currTime = startTime;
  hunch_seconds = 0
  prev_hunch_seconds = 0
}

function draw() {
    if (started) {
        image(video, 0, 0, width, height);
        // We can call both functions to draw all keypoints and the skeletons
        drawKeypoints();
        key_operations();
        if (state == 'prediction') {
          color_background();
          //measure_time();
        }
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
    //for (let j = 0; j < pose.keypoints.length; j++) {
    for (let j = 0; j < 3; j++) { //because we only need nose and eyes
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.8
      if (keypoint.score > 0.8) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      } 
    }
    nose_pos = pose.keypoints[0];
    l_eye_pos = pose.keypoints[1];
    r_eye_pos = pose.keypoints[2];
    if (nose_pos.score > 0.8 &&  l_eye_pos.score > 0.8 && r_eye_pos.score > 0.8) {
      state2 = 'sitting'
      stroke(0, 0, 255);
      line(nose_pos.position.x, nose_pos.position.y, l_eye_pos.position.x, l_eye_pos.position.y);
      line(nose_pos.position.x, nose_pos.position.y, r_eye_pos.position.x, r_eye_pos.position.y);
      text('('+str(int(nose_pos.position.x))+','+str(int(nose_pos.position.y))+')',nose_pos.position.x, nose_pos.position.y+10)
      text('('+str(int(l_eye_pos.position.x))+','+str(int(l_eye_pos.position.y))+')',l_eye_pos.position.x+0, l_eye_pos.position.y-10)
      text('('+str(int(r_eye_pos.position.x))+','+str(int(r_eye_pos.position.y))+')',r_eye_pos.position.x-10, r_eye_pos.position.y-10)
      // area of triangle
      tri_area = abs(nose_pos.position.x*(l_eye_pos.position.y - r_eye_pos.position.y) + l_eye_pos.position.x*(r_eye_pos.position.y - nose_pos.position.y) + r_eye_pos.position.x*(nose_pos.position.y - l_eye_pos.position.y))/2;

      let mid_pt_x = (nose_pos.position.x + l_eye_pos.position.x + r_eye_pos.position.x) / 3
      let mid_pt_y = (nose_pos.position.y + l_eye_pos.position.y + r_eye_pos.position.y) / 3
      text('('+str(int(tri_area))+')',mid_pt_x, mid_pt_y)
    } else {
      state2 = 'invalid' //face out of frame
    }

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

function key_operations() {
  if (keyIsPressed === true && state == 'collection') {
    text(`${key} ${keyCode}`, 10, 40);
    print(key, ' ', keyCode);
    let inputs = {
      lx: l_eye_pos.position.x,
      ly: l_eye_pos.position.y,
      rx: r_eye_pos.position.x,
      ry: r_eye_pos.position.y,
      nx: nose_pos.position.x,
      ny: nose_pos.position.y,
      area: tri_area
    }
    console.log(inputs)
    if (keyCode == 32){ // recording the correct post "space" key
      text('space key', 50,50)
      let target = {
        label: 'correct'
      }
      model.addData(inputs,target)
    } else if (keyCode == 40) { // down arrow
      text('down key', 50,50)
      let target = {
        label: 'wrong'
      }
      model.addData(inputs,target)
    } else if (key = 't') { 
      console.log('starting training');
      state = 'training';
      model.normalizeData();
      let options = {
        epochs: 200
      };
      model.train(options, whileTraining, finishedTraining);
   }
  } else {
    if (state == 'prediction') {
      text('PREDICTION',110,110)
      if (state2 == 'sitting') {
      check_posture();
      }
    }
  }
  return false; // prevent default
}

function whileTraining(epoch, loss) {
  console.log(epoch);
}

function finishedTraining() {
  console.log('finished training.');
  state = 'prediction';
}

function check_posture() {
  let inputs = {
    lx: l_eye_pos.position.x,
    ly: l_eye_pos.position.y,
    rx: r_eye_pos.position.x,
    ry: r_eye_pos.position.y,
    nx: nose_pos.position.x,
    ny: nose_pos.position.y,
    area: tri_area
  }
  model.classify(inputs, get_results);
}

function get_results(error, results) {
  if (error) {
    console.error(error)
    return;
  }
  label = results[0].label; 
  console.log(label)
  if (label == 'wrong') {
    stroke(0, 0, 255);
    //text('WRONG~~~~~~~~~~~~~~~~~~~~~~', 1,1)
    beep.play()
  } else {
    //text('CORREC~~~~~~~~~~~~~~~~~~~~~~T', 1,1)
  }
}

function timer2() {
  let currTime = new Date();
  var timeDiff = currTime - correct_currTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds 
  let seconds = Math.round(timeDiff);

  //console.log(seconds + " seconds");
  //text("time elapsed:"+hunch_seconds, 100, 170);
  return seconds
}


function timer1() {
  let currTime = new Date();
  var timeDiff = currTime - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds 
  var seconds = Math.round(timeDiff);
  //console.log(seconds + " seconds");
  text("time elapsed:"+seconds, 100, 150);
}

function color_background() {
  if (state == 'prediction') {
    timer1()
    if (label == 'wrong') {
      let seconds = timer2()
      prev_hunch_seconds = hunch_seconds+seconds
      text("time elapsed:"+prev_hunch_seconds, 100, 170);
      background(100,0,0,100) //r,g,b,opacity
    } else {
      hunch_seconds = prev_hunch_seconds
      correct_currTime = new Date();
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
    starttimer();
  }
  
  // This function stops the experiment
  function stop() {
    select('#startbutton').html('start')
    document.getElementById('startbutton').addEventListener('click', start);
    started = false;
    noLoop();
  }

  function starttimer() {
    startTime = new Date();
  };
  