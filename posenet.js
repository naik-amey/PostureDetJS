let video;
let poseNet;
let poses = [];
var started = false;
var startTime, correct_currTime, valid_startTime;
let nose_pos,l_eye_pos, r_eye_pos, tri_area;
let beep
let label
let hunch_seconds, prev_hunch_seconds
let valid_seconds, prev_valid_seconds
let button;
let font
let alert_en
let button_ss

// MODEL
let model;
let state = 'collection'
let state2 = 'sitting'

function preload() {
  beep = loadSound("beep-10.mp3"); 
  font = loadFont('assets/SourceSansPro-Regular.otf');
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

  // These are options for Neural Network trained on poseNet outputs. The inputs to this NN are nose, eye positions and triangle_area formed with nose and two eyes.
  let options = {
    inputs: ['lx', 'ly', 'rx', 'ry', 'nx', 'ny', 'area'],
    outputs: ['label'],
    task: 'classification',
    debug: 'true' // debug enables loss vs epoch plot.
  };

  // default nn has 16 nodes in dense hidden layer with [inputs -> 16_dense_hidden_nodes->dense_softmax]
  model = ml5.neuralNetwork(options)

  //const canvas = createCanvas(640, 480);
  const canvas = createCanvas(650, 500);
  canvas.parent('videoContainer');

  // Video capture
  video = createCapture(constraints,VIDEO);
  video.size(width, height); // 640, 480

  // Create a new poseNet method with a single detection; feed the options 
  var posenetoptions = { 
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
  poseNet = ml5.poseNet(video, options=posenetoptions, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  
  // Hide the video element, and just show the canvas
  video.hide();

  // button
  button = createButton('ALERT');
  button_ss = createButton('START');

}

function greet(){
  if (button.elt.outerText == "ALERT") {
    button.html("DON'T ALERT")
    alert_en = 1
  } else {
    button.html("ALERT")
    alert_en = 0
  }
}

function draw() {
    if (started) {
        image(video, 0, 0, width, height);
        drawKeypoints();
        key_operations();
        button.mousePressed(greet);
        if (state == 'prediction') {
          color_background();
        }
    } else {
      button_ss.mousePressed(start_stop)
    }
}

function modelReady() {
  select('#status').html('PoseNet model is now Loaded') // sets the status variable in index.html
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {

  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) { 
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;

    nose_pos = pose.keypoints[0];
    l_eye_pos = pose.keypoints[1];
    r_eye_pos = pose.keypoints[2];
    if (nose_pos.score > 0.8 &&  l_eye_pos.score > 0.8 && r_eye_pos.score > 0.8) {
      state2 = 'sitting'
      fill(255, 0, 0);
      noStroke();
      ellipse(nose_pos.position.x, nose_pos.position.y, 10, 10);
      ellipse(l_eye_pos.position.x, l_eye_pos.position.y, 10, 10);
      ellipse(r_eye_pos.position.x, r_eye_pos.position.y, 10, 10);
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

function key_operations() {
  if (keyIsPressed === true && state == 'collection') {
    let inputs = {
      lx: l_eye_pos.position.x,
      ly: l_eye_pos.position.y,
      rx: r_eye_pos.position.x,
      ry: r_eye_pos.position.y,
      nx: nose_pos.position.x,
      ny: nose_pos.position.y,
      area: tri_area
    }
    if (keyCode == 32){ // recording the correct post "space" key
      text('Space key', 50,50)
      let target = {label: 'correct'}
      model.addData(inputs,target)
    } else if (keyCode == 40) { // down arrow
      text('Down key', 50,50)
      let target = {label: 'wrong'}
      model.addData(inputs,target)
    } else if (key = 't') { 
      //textSize(40)
      text('Training started!', 50,50)
      state = 'training';
      model.normalizeData();
      let options = {epochs: 150}; //temp
      model.train(options, whileTraining, finishedTraining);
   }
  } else {
    if (state == 'prediction') {
      text('Now Predicting',50,50)
      select('#status1').html('Now Predicting') // sets the status variable in index.html
      if (state2 == 'sitting') {
      check_posture();
      }
    }
  }
  return false; // prevent default
}

function whileTraining(epoch, loss) {
  //textSize(40)
  text('Please wait while the training the going on!', 50,70)
}

function finishedTraining() {
  //textSize(40)
  text('Now Predicting!', 50,50)
  // After training has finished, start measuring the time.
  state = 'prediction';
  startTime = new Date();
  correct_currTime = startTime;
  valid_startTime = startTime
  hunch_seconds = 0
  prev_hunch_seconds = 0
  valid_seconds = 0
  prev_valid_seconds = 0
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
  text('Prediction:'+label, 50,80)
  if (label == 'wrong') {
    stroke(0, 0, 255);
    if (alert_en == 1){ 
      beep.play()
    }
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
  return seconds
}


function timer1() {
  let currTime = new Date();
  var timeDiff = currTime - valid_startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds 
  var tot_sec = Math.round(timeDiff);
  //console.log(seconds + " seconds");
  //text("time elapsed:"+seconds, 100, 150);
  return tot_sec
}

//let font;
let textString;

function color_background() {
  if (state == 'prediction') {
    //textAlign(CENTER);
    //text("Time spent at Desk: "+valid_seconds+" secs, Time you hunched for: "+hunch_seconds+" secs", 320, 490);
    textString = "Time spent at Desk: "+valid_seconds+" secs, Time you hunched for: "+hunch_seconds+" secs"
    let bbox = font.textBounds(textString, 320, 490, 15);
    fill(255);
    stroke(0);
    rect(bbox.x, bbox.y, bbox.w, bbox.h);
    fill(0);
    noStroke();
    textFont(font);
    textSize(12);
    textAlign(CENTER);
    text(textString, 320, 490);
    if (state2 == 'sitting') {
      let tot_sec = timer1()
      valid_seconds = prev_valid_seconds+tot_sec
      if (label == 'wrong') {
        let seconds = timer2()
        hunch_seconds = prev_hunch_seconds+seconds
        background(100,0,0,100) //r,g,b,opacity
      } else {
        prev_hunch_seconds = hunch_seconds
        correct_currTime = new Date();
      }
    } else {
      prev_valid_seconds = valid_seconds
      valid_startTime = new Date();
    }
  }
}

function start_stop() {
  if (button_ss.elt.outerText == "START") {
    button_ss.html("STOP")
    started = true
    loop();
    starttimer();
  } else {
    button_ss.html("START")
    alert_en = false
    noLoop();
  }
}

  function starttimer() {
    startTime = new Date();
  };
  