var faded_en = 0;
var faded_it = 145;
var startFader=false;
var demoFader=false;
var opb=0;
var radarOn=false;
var demoOn=false;
var eng=true;
var ita=false;
var transTime=250;
var rot=0;
var climbOn=false;
var backMenu=false;
var colorList = ['#9FD3D6','#EAEEEF','#F48021','#F29C4E','#FAFAFB','#488282']; //159,211,214 (0-bg), 234,238,239 (1-button), 244,128,33 (2-textOrange), 242,156,78 (3-textOrange2),250,250,251(4-buttonPressed),72,130,130 (5-darkBlue)
var titleScreenOn = true;
var infoOn=false;
var infoButtonShow=false;
var c=-150;

var myData, //segnaposto JSON

    posRelMe = [], //Oggetto Posizioni oggetti rispetto alla mia posizione
    myLat= 45.504996, //mia posizione Lat (Se si vuole mettere una fittizia, aggiungerla qui e disattivare getLocationUpdate() nel setup()) [Esempio: 45.504996]
    myLon=  9.166526, //mia posizione Lon (Se si vuole mettere una fittizia, aggiungerla qui e disattivare getLocationUpdate() nel setup()) [Esempio: 9.166526]
    heading, //mia direzione

    posXPointer, //posizione centro radar
    posYPointer, //posizione centro radar

    zoom = 1024; //var zoom
    limSupZoom = 2048;
    limInfZoom = 524288;

    distCliccable = 50; //distanza dalla cui si può selezionare (in metri)

    nordIsUp = true;

    imgLinkGray = [];
    imgLinkColore = [];


function preload() { //tutti i preload delle immagini e i font
  console.time('preload');
  ubuntuMedium=loadFont('./fonts/Ubuntu-M.ttf');
  ubuntuMediumItalic=loadFont('./fonts/Ubuntu-MI.ttf');
  ubuntuBold=loadFont('./fonts/Ubuntu-B.ttf');
  ubuntuBoldItalic=loadFont('./fonts/Ubuntu-BI.ttf');
  ubuntuRegular=loadFont('./fonts/Ubuntu-R.ttf');
  ubuntuRegularItalic=loadFont('./fonts/Ubuntu-RI.ttf');
  flag_en = loadImage('./assets/lang_en.png');
  flag_it = loadImage('./assets/lang_it.png');
  pointer = loadImage('./assets/pointer.png');
  hyperion_col = loadImage('./assets/hyperion_col.png');
  burj_col = loadImage('./assets/burj_col.png');
  cloud = loadImage('./assets/cloud.png');
  sequoia_bg = loadImage('./assets/sequoia_bg.png');
  sequoia_climb = loadImage('./assets/sequoia_climb.png');
  infoButtonIco = loadImage('./assets/infoButtonIco.png');
  SU_logo = loadImage('./assets/SU_logo.png');

  myData = loadJSON('./assets/heights.json');

    console.timeEnd('preload');
}

function setup() { //tutti i default dell'interfaccia
  createCanvas(innerWidth,innerHeight);
  rectMode(CENTER);
  textAlign(CENTER);
  angleMode(DEGREES);
  textFont(ubuntuMediumItalic);

  //getLocationUpdate()
  calcPosRelMe()

  for (var i=0; i < myData.landmarks_en.length; i++) {
    imgLinkGray.push("assets/"+myData.landmarks_en[i].img_gray);
    imgLinkColore.push("assets/"+myData.landmarks_en[i].img_color);
    imgLinkGray[i] = loadImage(imgLinkGray[i]);
    imgLinkColore[i] = loadImage(imgLinkColore[i]);
    }
  }

function draw() {
  translate(width/2,height/2); //un classico
  background(colorList[0]);
  // infoOn=true;
  // climbMode();
  // demoTitles();
  // radar();
  if(titleScreenOn==true) { //tutte le variabili booleane che finiscono con "on" servono per attivare le schermate
  titleScreen();
}

  //Attiva la modalità radar con il fade (opb gestisce l'opacità)
  if(startFader==true || demoFader==true) {
    if(opb<=255){opb+=30}
    background(159,211,214,opb);
    if(opb>255 && startFader==true){ //finito di opacizzarsi avvia il radar

      radar();

    }

    if(opb>255 && demoFader==true){ //finito di opacizzarsi avvia il menu demo

      demoTitles();
    }
  }

if(climbOn==true) { //avvia la modalità scalata (climbOn viene impostato come true solo dopo la pressione del pulsante della squoia, per ora)
  demoOn=false;
  climbMode();
};

if(backMenu==true) { //se true fa comparire il menu per tornare indietro
  bMenu();
}

if(infoOn==true) { //se true fa comparire la schermata con le informazioni sulla struttura
  infoScreen();
  if(infoButtonShow==true){infoButton()};
  }
} //draw END

function titleScreen() {
  titleScreenOn = true; //ogni schermata mette se stessa come true e le altre come false
  radarOn=false;
  demoOn=false;
  climbOn=false;
  backMenu=false;
  infoOn=false;
  c+=0.1;
  if(c>400) {c=-400};
  push();
  background(159,211,214);

  push();
  scale(0.5);
  image(cloud,c,height/15);
  pop();

  push();
  imageMode(CENTER);
  scale(0.85);
  image(SU_logo,0,-height/6);
  pop();

  rectMode(CENTER); //localmente testi e rettangoli vengono messi in rectMode(CENTER) per comodità
  textAlign(CENTER);
  startButton('start');
  demoButton('demo');
  flag_ita(faded_it);
  flag_eng(faded_en);

  pop();
}

function backArrow() {
  var posX=-width/2.15
  var posY=-height/2.25
  var hit_back=false;
  push();
  noFill();
  stroke(45,45,45,90);
  strokeWeight(5);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  beginShape();
  vertex(posX+9,posY-9);
  vertex(posX,posY);
  vertex(posX+9,posY+9);
  endShape();
  push();
  rectMode(CORNER); //attiva il codice commentato sottostante per mostrare la posizione dell'area di collisione
  // stroke(255);
  // strokeWeight(1);
  // rect(-width/2.15-12,-height/2.25-27,40,52);
  hit_back = collidePointRect(mouseX-width/2,mouseY-height/2,-width/2.15-12,-height/2.25-27,40,52); //funzione di collide2D.p5
  if(hit_back==true && mouseIsPressed==false) { //effetti della collisione

      if(demoOn==true && climbOn==false || radarOn==true){ //se il pulsante si trova nel menu della demo o nel radar si torna al titleScreen
      titleScreen();

      startFader=false;
      demoFader=false;
      opb=0;
      radarOn=false;
      demoOn=false;
      climbOn=false;
      r=65;
    }
    // else if(climbOn==true) {
    //   climbOn=false;
    //   demoOn=true;
    //   demoTitles();
    // }

    if(climbOn==true) { //se il pulsante si trova nella schermata della scalata attiva il menu per tornare indietro
    backMenu=true;
  }

}
pop();
pop();
  }


var r = 65;

function demoTitles(){
  titleScreenOn = false;
  radarOn=false;
  demoOn=true;
  // climbOn=false;
  var hyperionTitle;
  var hit_hyperion=false;
  var hit_burj=false;
  if(eng==true) {hyperionTitle="Redwood Hyperion"};
  if(ita==true) {hyperionTitle="Sequoia Hyperion"};
  push();
  textAlign(CENTER);
  backArrow();
  fill(colorList[3]);
  textSize(52);
  text('demo',0,-height/3.2);
  noStroke();

  fill(45,45,45,45);
  rect(0+1,-height/10+1,width/1.15,height/3.7,3); //drop shadow

  fill(colorList[1]);
  rect(0,-height/10,width/1.15,height/3.7,3);

  fill(45,45,45,45);
  rect(0+1,height/4.7+1,width/1.15,height/3.7,3); //drop-shadow

  fill(colorList[1]);
  rect(0,height/4.7,width/1.15,height/3.7,3);

  imageMode(CENTER);
  textAlign(LEFT);
  fill(45,45,45);
  textSize(28);
  textFont(ubuntuMedium);
  text(hyperionTitle, width/11,-height/25,width/3,height/4);
  text('Burj Khalifa',width/11,height/3.8,width/3,height/4);
  push();
  scale(0.68);
  image(hyperion_col,-width/2.5,-height/7.4);
  pop();

  push();
  scale(0.75);
  image(burj_col,-width/2.7,height/3.63);

  push();
  noFill();
  rectMode(CORNER); //attiva il codice commentato sottostante per mostrare la posizione dell'area di collisione
  // stroke(45);
  // strokeWeight(1);
  // rect(-width/2.3,-height/4.2,width/1.15,height/3.65);
  hit_hyperion = collidePointRect(mouseX-width/2,mouseY-height/2,-width/2.3,-height/4.2,width/1.15,height/3.65);
  if(hit_hyperion==true && mouseIsPressed) {
    fill(colorList[4]);
    climbOn=true;
  };
  pop();

  hit_burj = collidePointRect(mouseX-width/2,mouseY-height/2,-width/2.3,height/13,width/1.15,height/3.65);
  if(hit_burj==true && mouseIsPressed) {
    fill(colorList[4]);
  };
  pop();

// console.log(hit_hyperion);
// console.log(hit_burj);

  pop();
}
var f=300;
function climbMode() { //attualmente composta da un'interfaccia e una struttura
  demoOn=false;
  // background(colorList[0]);
  // climbStructure();
  // climbInterface();
  // backArrow();
  // completed();
  if(f>1800){f=1800};
  if(f>1000){
    background(colorList[0]);
    climbStructure();
    climbInterface();
    backArrow();
    // completed();
  };
  push();
  f+=50;
  rectMode(CORNER);
  fill(colorList[0]);
  noStroke();

  rect(width,height-f,-width*2,800);
  pop();


};

function climbInterface() {
  var strHeight=50; //strHeight dovrà andare a prendere l'effettiva altezza della struttura per settarla come punto di arrivo finale
  textAlign(CENTER);
  push();
  translate(0,-height/2.6);
  textFont(ubuntuBoldItalic);
  textSize(38);
  fill(colorList[5]);
  text(strHeight+'m',0,0);
  pop();
}

function climbStructure() {
  push();
  imageMode(CENTER);
  push();

  scale(0.5);
  image(cloud,width/1.4,-height/1.25);
  pop();

  push();
  if(innerHeight<=512) {
    scale(width/1000);
  // translate(0,-height/20);


}
else{
  scale(width/850);

}
  translate(0,-height/20);
  image(sequoia_climb,0,height/50);
  pop();

  push();
  if(innerHeight<=512) {
  translate(0,-height/8.3);
}
else{
  translate(0,-height/23);
}
  scale(width/1080);
  image(sequoia_bg,0,0);

  pop();
  pop();
};
var movY=0;
var movSwitcher=false;


function completed() {
  push();
  var txtCompleted;
  var timeCompleted='30 sec';
  if(movSwitcher==false) {
    if(movY<80){movY+=2};
    if(movY>=80){movY=80; movSwitcher=true;};
  }
    if(movSwitcher==true) {
      movY-=2;
      if(movY<=0) {
        movY=0;
        setTimeout(function() {
          infoOn=true;
        },500)
      };
    }
  // console.log(movY);
  if(eng==true) {txtCompleted="completed!"}
  if(ita==true) {txtCompleted="completata!"}
  textSize(46);
  textFont(ubuntuBold);

  push();
  noStroke();
  fill(45,45,45,45);
  rect(0,-height/movY+10,width+100,height/4);
  fill(245,245,245,205);
  rect(0,-height/movY+8,width+100,height/4);
  pop();
  fill(45,45,45,45);
  text(txtCompleted,0+2,height/movY+2);
  fill(colorList[3]);
  text(txtCompleted,0,height/movY);
  // push();
  // textSize(12);
  // fill(45,45,45,45);
  // text('in '+timeCompleted,0+1,height/movY+31);
  // fill(85,85,85);
  // text('in '+timeCompleted,0,height/movY+30);
  // pop();
  pop();
  pop();
}

var infoOpen=true;

function infoScreen() {
  if(infoOpen==true){
  var hit_infoOk=false;
  if(eng==true){
    var infoTxt="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    var structName="Redwood Hyperion";
  }
  if(ita==true){
    var infoTxt="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    var structName="Sequoia Hyperion";
  }
  push();

  textFont(ubuntuBold);
  noStroke();
  fill(45,45,45,45);
  rect(0+2,-height/15+2,width/1.1,height/1.8,3);
  fill(colorList[1]);
  rect(0,-height/15,width/1.1,height/1.8,3);
  fill(45,45,45,175);
  textSize(14);
  textAlign(LEFT);
  text(infoTxt,0,height/25,width/1.3,height/2);
  textSize(26);
  fill(45,45,45,185);
  text(structName,0,0,width/1.3,height/1.7);

  push();
  noFill();
  stroke(45,45,45,45);
  strokeWeight(3);
  rect(0,height/10,width/5,height/12,3);
  pop();

  push();
  fill(45,45,45,125);
  textSize(21);
  textAlign(CENTER);
  noStroke();
  text('ok',0,height/8.7);

  rectMode(CORNER); //attiva il codice commentato sottostante per mostrare la posizione dell'area di collisione
  // stroke(255);
  // strokeWeight(1);
  // rect(-width/9,height/18,width/4.5,height/11);
  hit_infoOk = collidePointRect(mouseX-width/2,mouseY-height/2,-width/9,height/18,width/4.5,height/11); //funzione di collide2D.p5
  if(hit_infoOk==true && mouseIsPressed==false) {
    infoOpen=false;
    infoButtonShow=true;
  } //effetti della collisione


  pop();

  pop();
}
}

function infoButton() {
  var hit_infoButton=false;
  push();

  push();
  imageMode(CENTER);
  image(infoButtonIco,width/2.5,height/2.4);
  pop();

  // fill('red');
  // ellipse(width/2.5,height/2.4,width/10);

  hit_infoButton=collidePointCircle(mouseX-width/2,mouseY-height/2,width/2.5,height/2.4,width/10);
  if(hit_infoButton==true) {
    infoOpen=true;
  }
  pop();

}

function radar() {
  titleScreenOn = false;
  radarOn=true;
  demoOn=false;
  climbOn=false;
  radarQuadrant();
  var locationTitle;
  var locationTxt;
  if(eng==true) {locationTitle='location'; locationTxt='Milan';};
  if(ita==true) {locationTitle='luogo'; locationTxt='Milano';};
  fill(72,130,130);
  textSize(12);
  textAlign(RIGHT);
  push();
  text(locationTitle,width/2.35,-height/2.2);
  pop();
  fill(69,76,96);
  textSize(43);
  text(locationTxt,width/2.3,-height/2.2+40);
  backArrow(); //posX, posY
  push();
  // infoPoint(50,10);
  pop();
  rot+=0.01;
  pointerIcon(heading); //rotation, parametro da collegare all'heading se decidiamo di far muovere il puntatore e non il radar
  drawIconOnRadar()

  function pointerIcon(rotation) { //funzione che disegna il puntatore
    push();
    fill(63,169,245);
    ellipse(0,height/11,20,20);
    translate(0,height/11);

    rotate(rotation);
    // rect(0,height/45,20,20);
    triangle(-9.5,height/123,9.5,height/123,0,height/123+16);
    pop();
  }
  // function infoPoint(posX,posY) { //i parametri x e y assoluti per posizionare l'icona nel radar presi dall'angolo in alto a sx dell'icona
  // var hit_infoPoint = false;
  // push();
  // fill(45,45,95,45);
  // ellipse(posX+15,posY+80,35,20);
  // image(infoPoint_nv,posX,posY);
  // pop();
  // push();
  // rectMode(CORNER);
  // // stroke(255);
  // // noFill();
  // // strokeWeight(1);
  // // rect(width/45,height/20,width/10,-height/6);
  // // rect(width/45,-height/8,width/10,height/5.6);
  // // rect(posX,posY,28,80);
  // hit_infoPoint = collidePointRect(mouseX-width/2,mouseY-height/2,posX,posY,28,80);
  // if(hit_infoPoint==true && mouseIsPressed==true) {
  //   console.log("infoPoint");
  // }
  // console.log(hit_infoPoint);
  // pop();
  // }

  function radarQuadrant() { //disegna il quadrante del radar. da valutare se utilizzare valori assoluti per facilitare la gestione con le coordinate GPS
    var rSignal=350;
    var rOp=90;
    var radarQuadrantSwitch=false;
    if(radarOn==true) {radarQuadrantSwitch=true;}
    if (radarQuadrantSwitch==true) {r-=23}
    if (r<=0) {r=0};
  noStroke();
  fill(45,45,45,45);
  fill(45,45,45,45);
  ellipse(0,height/11,70+width/1+2-r); //drop-shadow
  fill(245,245,245);
  ellipse(0,height/11,70+width/1-r);
  fill(240,240,240);
  ellipse(0,height/11,70+width/1-105-r);
  fill(235,235,235);
  ellipse(0,height/11,70+width/1-230-r);
  fill(123,206,239,rOp);
  ellipse(0,height/11,70+width/1-rSignal-r);
  fill(235,235,235);
  ellipse(0,height/11,70+width/1-380-r);
  }
}

function startButton(txtLabel) {
  var hit_start = false;
  noStroke();
  fill(45,45,45,45);
  rect(1,125+1,165,50,3); //drop-shadow
  fill(colorList[1]);

  push();
  rectMode(CORNER);
  // noFill();
  // stroke(255);
  // rect(-83,98,166,53);
  hit_start = collidePointRect(mouseX-width/2,mouseY-height/2,-83,98,166,53);
  pop();

  if(mouseIsPressed && hit_start==true) {
    fill(89,210,220);
    setTimeout(function() {startFader=true;},transTime);
}
  rect(0,125,165,50,3);
  fill(colorList[2]);
  textSize(32);
  text(txtLabel,0,135);
}
function demoButton(txtLabel) {
  var hit_demo = false;
  noStroke();
  fill(45,45,45,45);
  rect(1,185+1,115,35,3); //drop-shadow
  fill(colorList[1]);

  push();
  rectMode(CORNER);
  // stroke(255);
  // noFill();
  // rect(-62,165,123,38);
  hit_demo = collidePointRect(mouseX-width/2,mouseY-height/2,-62,155,123,38);
  pop();

  if(mouseIsPressed==true && hit_demo==true) {
    fill(colorList[4]);
    setTimeout(function() {demoFader=true;},transTime);
}

  rect(0,185,115,35,3);

  fill(102,102,102);
  textSize(21);
  text(txtLabel,0,192);
}

function flag_ita(faded) { //faded è il parametro che serve per opacizzare le bandiere nel caso siano deselezionate
  var hit_it = false;
  image(flag_it,1+width/2.78,-height/2.1); //ex height: -240
  fill(159,211,214,faded);
  rect(width/2.45,-height/2.16,width/8,-height/5);

  push();
  rectMode(CORNER);
  // stroke(255);
  // rect(1+width/2.85,-height/2.05,width/8.2,height/15)
  hit_it = collidePointRect(mouseX-width/2,mouseY-height/2,1+width/2.85,-height/2.05,width/8.2,height/15);
  if(hit_it==true) {
    faded_en=145;
    faded_it=0;
    eng=false;
    ita=true;
  }
  pop();
}

function flag_eng(faded) {
  var hit_en = false;
  image(flag_en,width/4.15,-height/2.1); //ex height: -240
  fill(159,211,214,faded);
  rect(width/3.5,-height/2.16,width/8,-height/5);

  push();
  rectMode(CORNER);
  // stroke(255);
  // rect(1+width/4.6,-height/2.05,width/8.2,height/15)
  hit_en = collidePointRect(mouseX-width/2,mouseY-height/2,1+width/4.6,-height/2.05,width/8.2,height/15);
  if(hit_en==true) {
    faded_en=0;
    faded_it=145;
    eng=true;
    ita=false;
  }
  pop();
}

function bMenu() { //il menu per uscire dalla modalità scalata
var backTxt,
    yesTxt;
var hit_yes=false;
var hit_no=false;

if(eng==true) {backTxt="Back to demo screen?"; yesTxt="yes"; textSize(24);};
if(ita==true) {backTxt="Tornare alle demo?"; yesTxt="sì"; textSize(21);};
noStroke();
rectMode(CENTER);
fill(45,45,45,45);
rect(0+2,-height/12+2,width/1.2,height/4,3);
fill(colorList[1]);
rect(0,-height/12,width/1.2,height/4,3);
fill(45,45,45);
text(backTxt,0,-height/8);

push();
noFill();
stroke(45,45,45,45);
strokeWeight(3);
rect(-width/6,-height/25,width/5,height/12,3);
rect(width/6,-height/25,width/5,height/12,3);

push();
noStroke();
fill(45,45,45,125);
text(yesTxt,-width/6,-height/35);
text('no',width/6,-height/35);
pop();

push();
rectMode(CORNER);
// stroke(255);
// strokeWeight(1);
// rect(width/16,-height/11,width/4.7,height/10);
hit_yes = collidePointRect(mouseX-width/2,mouseY-height/2,-width/3.7,-height/11,width/4.7,height/10);
if(hit_yes==true && mouseIsPressed==false) {
  titleScreen();
};
hit_no = collidePointRect(mouseX-width/2,mouseY-height/2,width/16,-height/11,width/4.7,height/10);
if(hit_no==true && mouseIsPressed==false) {
  backMenu=false;
};
pop();

pop();
}

function windowResized() {resizeCanvas(innerWidth,innerHeight)} //ridimensionatore della schermata

function drawIconOnRadar() {
  var hit_struct=false;
  var circle = (70+width/1-r),
      posXPointer = 0;
      posYPointer = height/11;

  push()
    imageMode(CENTER)
    translate(posXPointer,posYPointer)
    for (var i=0; i < myData.landmarks_en.length; i++) { //Disegna tutte le icone

      if (dist(0,0,(posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1))>(circle/2)) {  //Se l'icona è fuori dal radar
        if (myData.landmarks_en[i].visit==false) {
          fill(45,45,95,70);
          ellipse((circle/2)*cos(posRelMe[i].Ang-90),(circle/2)*sin(posRelMe[i].Ang-90),65,15);
          image(imgLinkGray[i], (circle/2)*cos(posRelMe[i].Ang-90), (circle/2)*sin(posRelMe[i].Ang-90)-57,60,114);
        } //Se l'icona non è stat visitata
        else {
          fill(45,45,95,70);
          ellipse((circle/2)*cos(posRelMe[i].Ang-90),(circle/2)*sin(posRelMe[i].Ang-90),65,15);
          image(imgLinkColore[i], (circle/2)*cos(posRelMe[i].Ang-90), (circle/2)*sin(posRelMe[i].Ang-90)-57,60,114);
        } //Se l'icona è stat visitata
      }

      else if (posRelMe[i].dist<distCliccable) {
        fill(45,45,95,70);
        ellipse((posRelMe[i].Lon)*zoom,((posRelMe[i].Lat)*zoom*(-1)),65,15);
        image(imgLinkColore[i], (posRelMe[i].Lon)*zoom,((posRelMe[i].Lat)*zoom*(-1))-57,60,114);
      } //Se l'icona si trova nelle vicinanze

      else {  //Se l'icona è dentro il radar
        if (myData.landmarks_en[i].visit==false) {
          fill(45,45,95,70);
          ellipse((posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1),65,15);
          image(imgLinkGray[i], (posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1)-57,60,114);
        } //Se l'icona non è stat visitata
        else {
          fill(45,45,95,70);
          ellipse((posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1),65,15);
          image(imgLinkColore[i], (posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1)-57,60,114);
        } //Se l'icona è stat visitata
    }
    push();
    //noFill();
    //stroke(45,45,45);
    //strokeWeight(2);
    //rectMode(CENTER);
    //rect( (posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1)-35,40,80 );
    hit_struct=collidePointRect(mouseX-width/2,mouseY-height/2,(posRelMe[i].Lon)*zoom-20,(posRelMe[i].Lat)*zoom*(-1)-17,40,80)
    if(hit_struct==true && mouseIsPressed){
      console.log('OK');
    }
    pop();
  }
  pop()
}

//Aggiungi dati al oggetto posRelMe per calcolare tutti i dati che ci servono per le icone sul radar:
  function calcPosRelMe() {
    for (var i=0; i < myData.landmarks_en.length; i++) {
      posRelMe[i] = {"name": "", "Lat": "", "Lon": "", "Ang": "", "distX": "" , "distY": "", "dist": ""},
      posRelMe[i].name = myData.landmarks_en[i].name;
      posRelMe[i].Lat = myData.landmarks_en[i].Lat - myLat;
      posRelMe[i].Lon = myData.landmarks_en[i].Lon - myLon;

      posRelMe[i].distX = measure(myData.landmarks_en[i].Lat, 0, myLat, 0);
      posRelMe[i].distY = measure(0, myData.landmarks_en[i].Lon, 0, myLon);

      posRelMe[i].dist = measure(myData.landmarks_en[i].Lat, myData.landmarks_en[i].Lon, myLat, myLon);

      var headingAng = 0;
      if (nordIsUp == false) {headingAng = heading;}

      if ((posRelMe[i].Lon>0)&&(posRelMe[i].Lat>0)) {posRelMe[i].Ang = (atan(posRelMe[i].distY/posRelMe[i].distX))+headingAng;}
      if ((posRelMe[i].Lon>0)&&(posRelMe[i].Lat<0)) {posRelMe[i].Ang = 180-(atan(posRelMe[i].distY/posRelMe[i].distX))+headingAng;}
      if ((posRelMe[i].Lon<0)&&(posRelMe[i].Lat<0)) {posRelMe[i].Ang = 180+(atan(posRelMe[i].distY/posRelMe[i].distX))+headingAng;}
      if ((posRelMe[i].Lon<0)&&(posRelMe[i].Lat>0)) {posRelMe[i].Ang = 360-(atan(posRelMe[i].distY/posRelMe[i].distX))+headingAng;}


  }
}

//Funzioni di Interazione

function keyTyped() {
  if (key== "q") {zoomIn()}
  else if (key== "w") {zoomOut()}
}

function zoomIn() {
  if (zoom<limInfZoom) {zoom*=2; /*console.log(zoom)*/}
  else {console.log("Limite zoom In raggiunto")}
}
function zoomOut() {
  if (zoom>limSupZoom) {zoom/=2; /*console.log(zoom)*/}
  else {console.log("Limite zoom Out raggiunto")}
}


//Funzioni di Geolocalizzazione più opizioni

function getLocationUpdate() {
  if (navigator.geolocation) {
    var options = {
      timeout:60000,
      maximumAge:10000,
      enableHighAccuracy: true};

      geoLoc = navigator.geolocation;
      watchID = geoLoc.watchPosition(showLocation, errorHandler, options);
    }

  else{alert("Sorry, browser does not support geolocation!");}
}

function showLocation(position) {
  myLat = position.coords.latitude;
  myLon = position.coords.longitude;

  if (isNaN(position.coords.heading)==false) {heading = position.coords.heading;} //definisci l'heading solo se è un numero, altrimenti è 0.
  else {heading = 0;}

  calcPosRelMe()
}

function errorHandler(err) {
  if (err.code == 1) {
    alert("Error: Access is denied!");
   }

  else if ( err.code == 2) {
    alert("Error: Position is unavailable!");
  }

  else if ( err.code == 3) {
    alert("Error: Timeout");
  }

  else if ( err.code == 0) {
    alert("Error: an unkown error occurred");
  }
}

function stopWatch(){geoLoc.clearWatch(watchID);}


//Function Aggiuntive

function measure(lat1, lon1, lat2, lon2) {  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
  }

Array.prototype.sum = function() {
  var total = 0;
  for(var i = 0; i < this.length; i += 1) {total += this[i];}
  return total;
};
