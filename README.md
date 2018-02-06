# StraightUp

## 1.Idea

### What about heights?
We perceive distance and height in different ways.
The purpose of the experience is to get the user to perceive the heights of the buildings that they see every day. Rising our eyes they look like very high. What would be the effect if we could walk them horizontally?

In the main mode the radar allows to find all the nearest buildings, helping the user to reach them. The building will be available only if the user in near to his base. In this way we can see the building with our eyes. Beginning the climb mode the user will walk the whole height of the chosen structure.

If we are away from all the available structures, the demo mode allow the user to climb the highest tree in the world and the highest skyscraper.

### Tips for a better experience:
walking in a straight line will give a better perception of the walked distance;
the GPS signal works better in a opensky place, away from high buildings or trees.
            (inside buildings or in case of interfered signal accuracy and heading can give approximated results).

## 2.Used libraries

### HTML5 Geolocation API:

To be able to calculate the user’s movements to ensure a basic user experience, we needed a method to calculate this movements.
At the beginning we evaluated several ways to collect this data, but we then opted to take the data through GPS localization. With this method we can keep track of the user's movements and calculate the distance he traveled. We can also collect other data such as heading, accuracy and speed, to ensure a better user experience. The geolocation data are also useful to lead the user to the "scalable" structures, and also to inform him when these can be climbed.

### p5.collide2D:

To ensure an optimal user experience, we choose to use the "p5.collider2D" library which allow us to calculate quickly and accurately if certain elements of the UI are triggered.

## 3.Problems & Solutions

Problem: p5.geolocation library has compatibility issues with some devices.
Solution: We avoid this problem using the HTML5 Geolocation API without any additional library, integrated with additional code to calculate the distance between two points.
```
### Problem: 
During the climb mode of the chosen structure is suggested to walk straight, in order to perceive better the distance. We’ve decided to not limit the user’s possibilities forcing him to restart. He we’ll be only warned to walk in the original direction. This control is done using the heading parameter obtained with the API. Usually it has a long refresh time when starting to walk. This time is independent by the accuracy. 
### Solution: 
Starting the climb mode there will be a steady number of position updates allowing the stabilization. However this control will be more effective on long distances and with high values of accuracy. 

### Problem: 
initial stabilization of GPS signal for more precision. Sometimes the GPS detects movements that are not corresponding to real movements of the user.
### Solution:
when the page is loaded the sketch will proceed to calculate the accuracy of the signal in order to obtain casual movements of the position under a fixed value. This need a short time asking to the user to stand still.

### Problem: 
long loading time due to big png images.
### Solution: 
images have been compressed and loaded only when they’re required by the page.

### Problem: 
when the user touches the screen, the touch permain interfering with other buttons.
### Solution: 
when the muse is not pressed the coordinates of the touch are set outside of the canvas.

### Problem: 
make the climb mode responsive, considering the mask of the structure.
### Solution: 
remap hPx parameter stored in the Json file on the new height of the structure defined by the height of the canvas.



