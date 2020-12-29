# How to run this tool

1. In VS code: right click on html and select "open with Live Server" (add live server extension if you don't have it already)

# PostureDetJS
JavaScript based Posture Detection model using PosNet model. Detects if you are slouching at desk using front camera

Sources: 
1. https://www.analyticsvidhya.com/blog/2019/06/build-machine-learning-model-in-your-browser-tensorflow-js-deeplearn-js/
2. https://gist.github.com/mohdsanadzakirizvi/ce95bcb560eeae899ff6852fda8757a6


Features to be added
1. start the timer and record the number of minutes you hunch. 
2. keep a display for timers/number of times hunched - keep updating this every framesecond.
3. currently you are reducing the framerate, but make sure you are also running posenet model at a lower speed.
4. or just check after 5 seconds after subject has hunched.
5. decide if someone is in the frame/ or no one at desk. if 
6. Use lerp for smooth interpolation and
7. use distance from nose to eye for depth sensing. 
https://youtu.be/EA3-k9mnLHs - coding train example. 

# https://stackoverflow.com/questions/41632942/how-to-measure-time-elapsed-on-javascript/41633001


https://ml5js.org/reference/api-PoseNet/
https://www.w3schools.com/js/js_events.asp

1. creating index.html - then type !<TAB> generates some boilerplate code for yoou in VScode.
2. Java Script beginers tutorial - https://www.youtube.com/watch?v=W6NZfCO5SIk


#///----------------------/// Dec 16, 2020:
Subtasks:
1. DrawKeypoints -
    i. join each eye to nose. 
    ii. join both shoulder pointers
    iii. join nose to mid point of should points.

## Useful notes:
Id	Part
0	nose
1	leftEye
2	rightEye
3	leftEar
4	rightEar
5	leftShoulder
6	rightShoulder
7	leftElbow
8	rightElbow
9	leftWrist
10	rightWrist
11	leftHip
12	rightHip
13	leftKnee
14	rightKnee
15	leftAnkle
16	rightAnkle

## Issues:
1. Shoulder points are not detected in the front view of the camera

# https://discourse.processing.org/t/p5-loadsound-not-defined/2291

# can you run p5.js with external webcam instead of inbuilt camera?
# try this instead of posenet since it might be fast? https://learn.ml5js.org/#/reference/face-api

#http://127.0.0.1:5501/index.html