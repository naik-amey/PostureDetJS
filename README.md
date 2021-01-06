# Overview
This is javascript based browser application with uses [p5.js](https://p5js.org) and [ml5js](https://ml5js.org) to detect the posture and analyze. This could be used for ergonomic assessment. 

# System Requirements
This code can be downloaded locally and can run on any browser like safari or chrome. 
Alternatively, you can launch this [here](https://humming-an.github.io/PostureDetJS/). 

# System

**Inputs** : Webcam input
**Outputs** : Detects if posture is incorrect, alerts you with a buzz and provides ergonomic stats.

# Details
System takes webcam input, uses posenet model to determine eyes and nose. The co-ordinates of eyes, nose and triangular area formed with these is fed to a neural network to train and classify the posture. 

The idea behind using triangle area is to comprehend depth (distance between plane formed with face and the camera).

# Sources: 
1. https://www.analyticsvidhya.com/blog/2019/06/build-machine-learning-model-in-your-browser-tensorflow-js-deeplearn-js/
2. https://gist.github.com/mohdsanadzakirizvi/ce95bcb560eeae899ff6852fda8757a6


## Issues:
1. Shoulder points are not detected in the front view of the camera

## Pending work
* can you run p5.js with external webcam instead of inbuilt camera?
* try this instead of posenet since it might be fast? https://learn.ml5js.org/#/reference/face-api

* http://127.0.0.1:5501/index.html