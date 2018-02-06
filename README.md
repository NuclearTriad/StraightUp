# StraightUp

## 1.Idea

### What about heights?
We perceive distance and height in different ways.
The purpose of the experience is to get the user to perceive the heights of the buildings that they see every day. If we rise our eyes they look very high. But can our perception change if we could walk them horizontally?

![alt text](https://raw.githubusercontent.com/NuclearTriad/straightup/master/assets/idea-img.png "Can our perception change if we could walk them horizontally?")

In the main mode the radar allows to find all the nearest buildings, helping the user to reach them. The building will be available only if the user in near to his base. In this way we can see the building with our eyes. When the user will tap on it, the climb mode will start and the user will be able to walk its whole height. As the user walks, the structure will be completed on the screen, till it's whole visible.

![alt text](https://raw.githubusercontent.com/NuclearTriad/straightup/master/assets/idea-diagram2.png "The User Experience")

If the user is far away from all the available structures, the demo mode will allow the user to try out the experience with two of the tallest things on this planet: the highest tree in the world and the highest skyscraper.

### Tips for a better experience
1.Walking in a straight line will give a better perception of the walked distance;

2.The GPS signal works better in open sky, away from very narrow roads or high trees. (accuracy and heading can give approximated results if the user is inside a building or in case of interfered signal).


## 2.Libraries used

### HTML5 Geolocation API
![alt text](https://raw.githubusercontent.com/NuclearTriad/straightup/master/assets/html5_geolocation_api.png "HTML5 Geolocation API")

To be able to obtain the user’s walked distances to ensure a basic user experience, we needed a method to calculate its movements.
At the beginning we evaluated several ways to collect these parameters, but we then opted to take the data through GPS localization. With this method we can keep track of the user's movements and calculate the distance he traveled. We can also collect other data such as heading, accuracy and speed, to ensure a better user experience. The geolocation data are also useful to place the "climbable" landmark inside the radar in the exact real coordinates, and also to inform the user if he/she is close enough to start climbing it.

### p5.collide2D
![alt text](https://raw.githubusercontent.com/NuclearTriad/straightup/master/assets/p5collide2d.png "p5.collide2D")

For an easier and quicker implementation of the UI, we choose to use the "p5.collider2D" library which allowed us to calculate accurately if certain elements of the interface are triggered.


## 3.Problems & Solutions

### p5.geolocation compatibility
```
Problem: p5.geolocation library has compatibility issues with some devices.
```
```
Solution: We avoided this problem using the HTML5 Geolocation API without any additional library. 
We also integrated it with additional code to calculate the distance between two points.
```
### Heading control
```
Problem: 
During the climb mode of the chosen structure it's suggested to walk straight, 
in order to perceive the distance better.
We’ve decided not to limit the user’s possibilities forcing him to restart. 
He we’ll only be warned to walk in the original direction. 
This control is done using the heading parameter obtained with the API. 
Usually it has a long refresh time when starting to walk. This time is independent by the accuracy. 
```
```
Solution: 
Starting the climb mode there will be a steady number of position updates allowing the stabilization. 
However this control will be more effective on long distances and with high values of accuracy. 
```
### Signal stabilization
```
Problem: 
initial stabilization of GPS signal for more precision. 
Sometimes the GPS detects movements that are not corresponding to real movements of the user.
```
```
Solution:
when the page is loaded the sketch will proceed to calculate the accuracy of the signal 
collecting the fluctuating values untill they'll stay under a certain threshold. 
This need a short time asking to the user to stand still.
```
### Image loading
```
Problem: 
long loading time due to big filesizes of png images.
```
```
Solution: 
images have been compressed and the ones that are not essential 
are loaded only when they’re required by the page.
```
### Touch interferences
```
Problem: 
when the user touches the screen, the touch persists even when the touch is released 
interfering with other buttons.
```
```
Solution: 
when the touch is released the coordinates of the touch are set outside of the canvas.
```
### Climb mode not fully responsive
```
Problem: 
making the climb mode responsive, while taking into consideration the mask of the structure.
```
```
Solution: 
remap hPx parameter stored in the Json file on the new height of the structure defined 
by the height of the canvas.



