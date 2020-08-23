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