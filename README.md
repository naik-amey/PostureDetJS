# Overview
This is javascript based browser application with uses [p5.js](https://p5js.org) and [ml5js](https://ml5js.org) to detect the posture and analyze. This could be used for ergonomic assessment. 

# System Requirements
This code can be downloaded locally and can run on any browser like safari or chrome. \
Alternatively, you can launch this [here](https://humming-an.github.io/PostureDetJS/). 

# System

**Inputs** : Webcam input\
**Outputs** : Detects if posture is incorrect, alerts you with a buzz and provides ergonomic stats.

# Details
System takes webcam input, uses posenet model to determine eyes and nose. The co-ordinates of eyes, nose and triangular area formed with these is fed to a neural network to train and classify the posture.  

The idea behind using triangle area is to comprehend depth (distance between plane formed with face and the camera).

# How to Use:
Initial:
Step1: Once the page is opened, click on "start" button. At this point you should be able to see yourself with markers around eyes and nose. 

Training:
Step2: Press "SPACE BAR" everytime you are in a ergonomically correct posture, you can turn your head sideways etc. Collect atleast 10 samples for better training.
Step3: Press "down arrow key" everytime you are in a ergonomically wrong posture, you can hunch or take any other wrong posture. Collect atleast 10 samples for better training.
- You can repeat step 2 & 3 any number of times you like, but make sure you don't take too many as this might slow down the training time.

Step4: Press "t" key to start the training. At this point you might have to wait for 200 epochs to be completed.

Classification
Step5: That's it! Once, the training is complete, you will be notified with a sound, everytime you hunch. Also, a timer is displayed to indicate the time you are infront of the computer and the time you were in wrong posture. 

# Sources: 
1. https://gist.github.com/mohdsanadzakirizvi/ce95bcb560eeae899ff6852fda8757a6


## Issues:
1. Shoulder points are not detected in the front view of the camera.

## Pending work
* can you run p5.js with external webcam instead of inbuilt camera?
* try this instead of posenet since it might be fast? https://learn.ml5js.org/#/reference/face-api

* http://127.0.0.1:5501/index.html
