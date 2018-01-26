var faded_en = 0;
var faded_it = 145;
var radarOn=false;
var eng=true;
var ita=false;
var transTime=150;
var rot=0;
var climbOn=false;
var backMenu=false;
var colorList = ['#9FD3D6','#EAEEEF','#F48021','#F29C4E','#FAFAFB','#488282']; //159,211,214 (0-bg), 234,238,239 (1-button), 244,128,33 (2-textOrange), 242,156,78 (3-textOrange2),250,250,251(4-buttonPressed),72,130,130 (5-darkBlue)
var titleScreenOn = true;
var infoOn=false;
var infoButtonShow=false;
var instOn=true;
var c=-150;
var sequoiaDemoOn=false;
var burjDemoOn=false;
var demoTitlesOn=false;

var check_scal=false; //la scalata è iniziata, si può iniziare il conteggio dei metri
var scelto=-1;//id globale dell'edificio scelto

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
    imgLinkBack = [];
    imgLink = [];
    nameLink_en = [];
    descLink_en = [];
    nameLink_it = [];
    descLink_it = [];

    heightLink = [];

    hit_struct = [];

    //variabili scalata+geolocalizzazione

var latitude,
    longitude,
    accuracy,

    numeroAgg = -1,
    metriTOT = 0,
    metriPrec = 0,
    veli = 0,
    tempo = 0,
    backUpPositionLat = [],
    backUpPositionLon = [],
    backUpPositionDist = [],

    stabilizzato = false, //inizia con la propriteà non stabilizzata
    backUpstabilizzation = [], //crea la array dei valori per stabilizzare
    stabilizzationTOT = 0,
    accuracyLimit = 0.4, //valore in metri che deve avere la sommatoria della array precedente per essere considerata accettabile
    maxStabilizzationArray = 4, //massimo numero di valori che l'array di sopra può tenere (maggiore è più preciso è)

    conv=0, //conversione da m in pixel di scalata

    imgMask,

    position,
    geoLoc;

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
  sequoia_button = loadImage('./assets/sequoia_button.png');
  burijKalifa_button = loadImage('./assets/burijKalifa_button.png');
  cloud = loadImage('./assets/cloud.png');
  infoButtonIco = loadImage('./assets/infoButtonIco.png');
  SU_logo = loadImage('./assets/SU_logo.png');
  camminaIco = loadImage('./assets/camminaIco.png');
  drittoIco = loadImage('./assets/drittoIco.png');

  myData = loadJSON('./assets/heights.json');

    console.timeEnd('preload');
}

function setup() { //tutti i default dell'interfaccia
  imgClone  = createGraphics(720, 1280);
  mask = createGraphics(720, 1280); //crea il segnaposto per la mascherma sotto (le grandezze qui si ripetono poi sotto)

  createCanvas(innerWidth,innerHeight);
  rectMode(CENTER);
  textAlign(CENTER);
  angleMode(DEGREES);
  textFont(ubuntuMediumItalic);

  getLocationUpdate()
  calcPosRelMe()

  for (var i=0; i < myData.landmarks_en.length; i++) {
    imgLinkGray.push("assets/"+myData.landmarks_en[i].img_gray);
    imgLinkColore.push("assets/"+myData.landmarks_en[i].img_color);
    imgLinkBack.push("assets/"+myData.landmarks_en[i].img_back);
    imgLink.push("assets/"+myData.landmarks_en[i].img);
    imgLinkGray[i] = loadImage(imgLinkGray[i]);
    imgLinkColore[i] = loadImage(imgLinkColore[i]);
    imgLinkBack[i] = loadImage(imgLinkBack[i]);
    imgLink[i] = loadImage(imgLink[i]);

    nameLink_en.push(myData.landmarks_en[i].name);
    descLink_en.push(myData.landmarks_en[i].Description);

    nameLink_it.push(myData.landmarks_it[i].name);
    descLink_it.push(myData.landmarks_it[i].Description);

    heightLink.push(myData.landmarks_en[i].height);
    }
  }

function draw() {

  if(mouseIsPressed==false) {mouseX=-100; mouseY=-100;}

  translate(width/2,height/2);
  background(colorList[0]);
  // instructions();
  // infoOn=true;
  // climbMode(sequoia_bg,sequoia,50,true,2,1.25,-700,200);
  // demoTitles();
  // radar();
  // titleScreenOn=false;
  if(titleScreenOn==true) {
    titleScreen();
  };

  if(radarOn==true){
    if(instOn==true) {
      instructions();
    }
    else{radar();}

  };

  if(demoTitlesOn==true){
    if(instOn==true) {
      instructions();
    }
    else{demoTitles();}
  };

  if(sequoiaDemoOn==true) { //avvia la modalità scalata (climbOn viene impostato come true solo dopo la pressione del pulsante della squoia, per ora)
    check_scal=true;
    scelto=7;
    climbMode(7,true,1.25,1.25,-700,200); //structNum,cloudBool,cloudX,cloudY,cloudMin,cloudMax
  };

  if(burjDemoOn==true) { //avvia la modalità scalata (climbOn viene impostato come true solo dopo la pressione del pulsante della squoia, per ora)
    check_scal=true;
    scelto=8;
    climbMode(8,true,15,2,-550,400); //structNum,cloudBool,cloudX,cloudY,cloudMin,cloudMax
  };

  for (var i=0; i < myData.landmarks_en.length; i++){
      if(hit_struct[i]==true){
          check_scal=true;
          radarOn=false;
          console.log("cliccato "+i);
          push();
          //translate(0,-posYPointer) //counter posYPointer
          scelto=i;
          climbMode(i,true,2,1.25,-700,200); //structNum,cloudBool,cloudX,cloudY,cloudMin,cloudMax
          pop();
        };
    };

if(backMenu==true) { //se true fa comparire il menu per tornare indietro
  bMenu();
}
  push();
  translate(-width/2,-height/2);
  textAlign(LEFT);
  textSize(12);
  textFont(ubuntuRegular);
  text('latitude: ' + latitude, 5, 30);
  text('longitude: ' + longitude, 5, 30 * 2);
  text('stabile: ' + stabilizzato + "/" + climbOn, 5, 30 * 3);
  text('accuracy: ' + accuracy, 5, 30 * 4);
  text('Aggiornamenti: ' + numeroAgg, 5, 30 * 5);
  text('Distanza Precedente: ' + metriPrec, 5, 30 * 6);
  text('conv: ' + conv, 5, 30 * 7);
  pop();
  // console.log('infoOn: '+infoOn);
  // console.log('infoButtonShow: '+infoButtonShow);
} //draw END

function titleScreen() {
  titleScreenOn = true; //ogni schermata mette se stessa come true e le altre come false
  climbOn=false;
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
  if(hit_back==true) { //effetti della collisione

      if(demoTitlesOn==true && climbOn==false || radarOn==true){ //se il pulsante si trova nel menu della demo o nel radar si torna al titleScreen
      demoTitlesOn=false;
      titleScreenOn=true;
      radarOn=false;
      setTimeout(function() {r=65},200);
      hit_back=false;
    };

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
  infoOn=false;
  backMenu=false;
  climbOn=false;
  no_hype=true;
  var hyperionTitle;
  var hit_hyperion=false;
  var hit_burj=false;
  if(eng==true) {hyperionTitle="Redwood Hyperion"};
  if(ita==true) {hyperionTitle="Sequoia Hyperion"};
  push();
  textAlign(CENTER);
  backArrow();

  textSize(52);
  fill(45,45,45,45);
  text('demo',0+2,-height/3.2+2);
  fill(colorList[3]);
  text('demo',0,-height/3.2);
  noStroke();

  fill(45,45,45,45);
  rect(0+1,-height/10+1,width/1.15,138,3); //drop shadow

  fill(colorList[1]);
  rect(0,-height/10,width/1.15,138,3);

  fill(45,45,45,45);
  rect(0+1,height/4.7+1,width/1.15,138,3); //drop-shadow

  fill(colorList[1]);
  rect(0,height/4.7,width/1.15,138,3);

  imageMode(CENTER);
  textAlign(LEFT);
  fill(45,45,45);
  textSize(28);
  textFont(ubuntuMedium);
  text(hyperionTitle, width/11,-height/25,width/3,height/4);
  text('Burj Khalifa',width/11,height/3.8,width/3,height/4);
  push();
  scale(0.68);
  image(sequoia_button,-width/2.5,-height/7.3);
  pop();

  push();
  scale(0.75);
  image(burijKalifa_button,-width/2.7,height/3.62);

  push();
  noFill();
  rectMode(CORNER); //attiva il codice commentato sottostante per mostrare la posizione dell'area di collisione
  // stroke(45);
  // strokeWeight(1);
  // rect(-width/2.3,-height/4.2,width/1.15,height/3.65);
  hit_hyperion = collidePointRect(mouseX-width/2,mouseY-height/2,-width/2.3,-height/4.2,width/1.15,height/3.65);
  if(hit_hyperion==true) {
    fill(colorList[4]);
    // climbMode(sequoia_bg,sequoia,50,true,2,1.25,-700,200);
    sequoiaDemoOn=true;
    // infoOpen=false;
    hit_hyperion=false;
  };
  pop();

  hit_burj = collidePointRect(mouseX-width/2,mouseY-height/2,-width/2.3,height/13,width/1.15,height/3.65);
  if(hit_burj==true) {
    fill(colorList[4]);
    // climbMode(sequoia_bg,sequoia,50,true,2,1.25,-700,200);
    burjDemoOn=true;
    // infoOpen=false;
    hit_burj=false;
  };
  pop();

// console.log(hit_hyperion);
// console.log(hit_burj);

  pop();
}
var f=300;
var completedAnim=false;
function climbMode(structNum,cloudBool,cloudX,cloudY,cloudMin,cloudMax) { //structNum,cloudBool,cloudX,cloudY,cloudMin,cloudMax
  radarOn=false;
  climbOn=true;



  if(f>1800){f=1800} else{f+=50;}
  if(f>1000){
    demoTitlesOn=false;
    background(colorList[0]);
    climbStructure(structNum,cloudBool,cloudX,cloudY,cloudMin,cloudMax);
    climbInterface(structNum);
    backArrow();
    if(metriTOT>=heightLink[structNum]){
        check_scal=false;
        completedAnim=true;
        if (completedAnim==true) {
          completed();
        }
    }
      if(infoOn==true) { //se true fa comparire la schermata con le informazioni sulla struttura
        setTimeout(infoScreen(structNum),400);
        if(infoButtonShow==true){infoButton()};
        completedAnim=false;
        movY=0;
        movSwitcher=false;
      }
  };
  push();
  rectMode(CORNER);
  fill(colorList[0]);
  noStroke();

  rect(width,height-f,-width*2,800);
  pop();


};

function climbInterface(structNum) {

  textAlign(CENTER);
  push();
  translate(0,-height/2.6);
  textFont(ubuntuBoldItalic);
  textSize(40);
  fill(colorList[5]);
  text(Math.round(metriTOT*10)/10+'/'+myData.landmarks_en[scelto].height+'m',0,0);
  pop();
}
var cloudSwitch=false;
function climbStructure(structNum,cloudBool,cloudX,cloudY,cloudMin,cloudMax) {

  push();
  imageMode(CENTER);

  cloudSwitch=cloudBool;

  if(cloudSwitch==true) {
  //cloud
  push();
  c+=0.1;
  if(c>cloudMax) {c=cloudMin};
  scale(0.5);
  //image(cloud,width/cloudX+c,-height/cloudY);
  pop();
  }

  background
  push();
  if(innerHeight<=512) {
  translate(0,-height/8.3);
}
else{
  translate(0,-height/40);
}
  scale(width/720);

  image(imgLinkBack[structNum],0,0);
  pop();

  //structure
  push();
  if(innerHeight<=512) {
    scale(width/1000);
  }

else{
  scale(width/850);
}
  translate(0,height/6);
  mask.rect(0, 1280-conv, 720, 1280); //crea maschera da rettangolo
  //( imgClone = imgLink[structNum].get() ).mask( mask.get() );
  image(imgClone, 0,-height/40);
  //image(imgLink[structNum],0,-height/40);
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
        infoOn=true;
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

function infoScreen(structNum) {
  if(infoOpen==true){
  var hit_infoOk=false;
  if(eng==true){
    var infoTxt=descLink_en[structNum];
    var structName=nameLink_en[structNum];
  }
  if(ita==true){
    var infoTxt=descLink_it[structNum];
    var structName=nameLink_it[structNum];
  }
  push();

  textFont(ubuntuBold);
  noStroke();
  fill(45,45,45,45);
  rect(0+2,-height/10+2,width/1.1,250,3);
  fill(colorList[1]);
  rect(0,-height/10,width/1.1,250,3);
  fill(45,45,45,175);
  textSize(14);
  textAlign(LEFT);
  text(infoTxt,0,height/25,width/1.3,height/2);
  textSize(26);
  fill(45,45,45,185);
  text(structName,0,-height/120,width/1.3,height/1.7);

  push();
  noFill();
  stroke(45,45,45,45);
  strokeWeight(3);
  rect(0,height/24,width/5,45,3);
  pop();

  push();
  fill(45,45,45,125);
  textSize(21);
  textAlign(CENTER);
  noStroke();
  text('ok',0,height/18);

  rectMode(CORNER); //attiva il codice commentato sottostante per mostrare la posizione dell'area di collisione
  // stroke(255);
  // strokeWeight(1);
  // rect(-width/9,-height/280,width/4.5,45);
  hit_infoOk = collidePointRect(mouseX-width/2,mouseY-height/2,-width/9,-height/280,width/4.5,45); //funzione di collide2D.p5
  if(hit_infoOk==true) {
    infoOpen=false;
    infoButtonShow=true;
    hit_infoOk=false;
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
    hit_infoButton=false;
  }
  pop();

}

function instructions() {


  titleScreenOn = false;

  if(eng==true) {
    var topText="The human mind perceives distance and height in different ways.",
        questText="What happens if vertical becomes horizontal?",
        titleText="Instructions";
        camminaText="Choose one of the landmarks and begin to walk. Stop when you've completed the whole height.";
        drittoText="Tip: walk straight for the best experience.";

        if(stabilizzato==false) {stabileText="Stabilization in progress! Stand still for a moment..."}
        else{stabileText=""};
  }
  if(ita==true) {
    var topText="La mente umana percepisce l'altezza e la distanza in modo differente",
        questText="Cosa succede se il verticale diventa orizzontale?",
        titleText="Istruzioni",
        camminaText="Scegli uno dei punti di riferimento e inizia a camminare. Fermati quando avrai completato l'intera altezza",
        drittoText="Suggerimento: per un'esperienza migliore cammina in linea retta.";

    if(stabilizzato==false) {stabileText="Stabilizzazione in corso! Resta fermo un attimo..."}
    else{stabileText=""};
  }

  //icons
  push();
  imageMode(CENTER);
  background(colorList[0]);
  image(camminaIco,-width/3,height/60);
  image(drittoIco,-width/3,height/60+110);
  pop();

  //text
  push();
  textSize(17);
  textAlign(LEFT);
  textFont(ubuntuMedium);
  fill(224,108,13);
  text(topText,0,-height/3,width-45,height/5);
  textFont(ubuntuBoldItalic);
  textSize(21);
  text(titleText,0,-height/16,width-45,height/5);

  fill(110,110,110);
  textSize(18);
  textFont(ubuntuRegularItalic);
  text(questText,0,-height/4.8,width-45,height/5);

  fill(110,110,100);
  textSize(12);
  textFont(ubuntuMedium);
  text(camminaText,width/12,height/18,width-160,height/5);
  text(drittoText,width/12,height/18+110,width-160,height/5);

  push();
  textAlign(CENTER);
  fill(70,100,210);
  textSize(14);
  textFont(ubuntuBold);
  text(stabileText,0,height/2.15,width-155,height/5);
  pop();

  pop();
  if(stabilizzato==true) {
  instButtonStart();
  }
}

function instButtonStart() {
  if(ita==true) {var buttonText="inizia";}
  if(eng==true) {var buttonText="start";}
  //Button
  var hitInstStart=false;
  push();
  rectMode(CENTER);
  noStroke();
  fill(45,45,45,45);
  rect(0+1,height/2.6+1,120,40,4);
  fill(colorList[1]);
  rect(0,height/2.6,120,40,4);
  fill(110,110,110);
  textSize(23);
  textAlign(CENTER);
  text(buttonText,0,height/2.51)
  pop();

  push();
  rectMode(CORNER);
  // stroke(255);
  // noFill();
  // rect(-62,height/2.9,123,40);
  hit_instStart=collidePointRect(mouseX-width/2,mouseY-height/2,-62,height/2.9,123,40);
  if(hit_instStart==true) {
    instOn=false;
    hit_instStart=false;
  }
  pop();
  }

function radar() {
  var accuracyCircle=accuracy;
  var accuracyCircleCol=colorList[1];
  backMenuOn=false;
  infoOn=false
  titleScreenOn = false;
  demoTitlesOn==false;
  climbOn=false;
  zoomButtons();
  radarQuadrant();
  var locationTitle;
  var locationTxt;
  var signalTitle;
  if(eng==true) {locationTitle='location'; locationTxt='Milan'; signalTitle='signal accuracy'};
  if(ita==true) {locationTitle='luogo'; locationTxt='Milano'; signalTitle='accuratezza segnale'};

  push();
  if(accuracy>12) {accuracyCircle=12}
  if(accuracy<=4) {accuracyCircleCol='#ccfbff'}
  noFill();
  strokeWeight(3);
  stroke(104,222,232,45);
  ellipse(width/2.35-7,-height/2.2+57+1,2+accuracyCircle);
  stroke(accuracyCircleCol);
  ellipse(width/2.35-8,-height/2.2+57,2+accuracyCircle);
  fill(79,86,106);
  noStroke();
  textSize(12);
  text(signalTitle,width/2.35-23,-height/2.2+60);
  pop();

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
  drawIconOnRadar()
  pointerIcon(heading); //rotation, parametro da collegare all'heading se decidiamo di far muovere il puntatore e non il radar

  function zoomButtons() {
    push();
    var hit_zoomMinus=false;
    fill(45,45,45,45);
    ellipse(-width/2.35+1,-height/3.7+1,38.3);
    fill(245,245,245);
    stroke(220,220,220);
    strokeWeight(2);
    ellipse(-width/2.35,-height/3.7,35);
    textAlign(CENTER);
    textFont(ubuntuRegular);
    textSize(32);
    noStroke();
    fill(175,175,175);
    text('-',-width/2.35,-height/3.7+10);
    // stroke(45);
    // noFill();
    // ellipse(-width/2.35,-height/5.2,35);
    hit_zoomMinus=collidePointCircle(mouseX-width/2,mouseY-height/2,-width/2.35,-height/3.7,35);
    if(hit_zoomMinus==true) {
      console.log('-: '+hit_zoomMinus);
      zoomOut();
    }
    pop();

    push();
    var hit_zoomPlus=false;
    fill(45,45,45,45);
    ellipse(-width/3.4+1,-height/3+1,38.3);
    fill(245,245,245);
    stroke(220,220,220);
    strokeWeight(2);
    ellipse(-width/3.4,-height/3,35);
    textAlign(CENTER);
    textFont(ubuntuRegular);
    noStroke();
    fill(175,175,175);
    textSize(32);
    text('+',-width/3.4,-height/3+9);
    hit_zoomPlus=collidePointCircle(mouseX-width/2,mouseY-height/2,-width/3.4,-height/3,35);
    if(hit_zoomPlus==true) {
      console.log('+: '+hit_zoomPlus);
      zoomIn();
    }
    pop();
  }

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
  ellipse(0,height/11,70+180-rSignal-r);
  fill(235,235,235);
  ellipse(0,height/11,70+270-380-r);
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

  if(hit_start==true) {
    fill(89,210,220);
    setTimeout(function() {radarOn=true;},transTime);
    hit_start=false;
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

  if(hit_demo==true) {
    fill(colorList[4]);
    setTimeout(function() {demoTitlesOn=true;},transTime);
    hit_demo=false;
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
    hit_it=false;
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
    hit_en=false;
  }
  pop();
}

function bMenu() { //il menu per uscire dalla modalità scalata
var backTxt,
    yesTxt;
var hit_yes=false;
var hit_no=false;

if(eng==true) {
  if(sequoiaDemoOn==false && burjDemoOn==false) {
    backTxt="Back to radar?"; yesTxt="sì"; textSize(21);
  }
  else{backTxt="Back to demos?";}
  yesTxt="yes"; textSize(24);
};

if(ita==true) {
  if(sequoiaDemoOn==false && burjDemoOn==false) {
  backTxt="Tornare al radar?"; yesTxt="sì"; textSize(21);
  }
  else{backTxt="Tornare alle demo?";}
  yesTxt="sì"; textSize(24);
};
noStroke();
rectMode(CENTER);
fill(45,45,45,45);
rect(0+2,-height/12+2,width/1.2,height/4,3);
fill(colorList[1]);
rect(0,-height/12,width/1.2,height/4,3);
fill(45,45,45);
textAlign(CENTER);
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
textAlign(CENTER);
text(yesTxt,-width/6,-height/35);
text('no',width/6,-height/35);
pop();

push();
rectMode(CORNER);
// stroke(255);
// strokeWeight(1);
// rect(width/16,-height/11,width/4.7,height/10);
hit_yes = collidePointRect(mouseX-width/2,mouseY-height/2,-width/3.7,-height/11,width/4.7,height/10);
if(hit_yes==true) {
  metriTOT=0;

  backUpPositionDist=[];
  conv=0;
  mask.clear();
  (imgClone = imgLink[scelto].get()).mask( mask.get() );
  scelto=-1;
  check_scal=false;

  if(sequoiaDemoOn==false && burjDemoOn==false) {
    setTimeout(function() {
    burjDemoOn=false;
    titleScreenOn=false;
    demoTitlesOn=false;
    infoOn=false;
    infoOpen=false;
    backMenu=false;
    radarOn=true;

    f=300;
    hit_yes=false;
    },100);
  }

  else {
  setTimeout(function() {
  sequoiaDemoOn=false;
  burjDemoOn=false;
  titleScreenOn=false;
  demoTitlesOn=true;

  f=300;

  hit_yes=false;
  },100);
  }
};
hit_no = collidePointRect(mouseX-width/2,mouseY-height/2,width/16,-height/11,width/4.7,height/10);
if(hit_no==true) {
  backMenu=false;
  hit_no=false;
};
pop();

pop();
}

function windowResized() {resizeCanvas(innerWidth,innerHeight)} //ridimensionatore della schermata

function drawIconOnRadar() {
  var circle = (70+width/1-r),
      posXPointer = 0;
      posYPointer = height/11;

  push()
    imageMode(CENTER)
    translate(posXPointer,posYPointer)
    for (var i=0; i < myData.landmarks_en.length; i++) { //Disegna tutte le icone

      hit_struct[i] = false;

      if (dist(0,0,(posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1))>(circle/2)) {  //Se l'icona è fuori dal radar
        if (myData.landmarks_en[i].visit==false) {
          fill(45,45,95,70);
          ellipse((circle/2)*cos(posRelMe[i].Ang-90),(circle/2)*sin(posRelMe[i].Ang-90),65,15);
          image(imgLinkGray[i], (circle/2)*cos(posRelMe[i].Ang-90), (circle/2)*sin(posRelMe[i].Ang-90)-40,40,80);
        } //Se l'icona non è stat visitata
        else {
          fill(45,45,95,70);
          ellipse((circle/2)*cos(posRelMe[i].Ang-90),(circle/2)*sin(posRelMe[i].Ang-90),65,15);
          image(imgLinkColore[i], (circle/2)*cos(posRelMe[i].Ang-90), (circle/2)*sin(posRelMe[i].Ang-90)-40,40,80);
        } //Se l'icona è stat visitata
      }

      else if (posRelMe[i].dist<distCliccable) {
        fill(244,128,33,210);
        ellipse((posRelMe[i].Lon)*zoom,((posRelMe[i].Lat)*zoom*(-1)),65,15);
        image(imgLinkColore[i], (posRelMe[i].Lon)*zoom,((posRelMe[i].Lat)*zoom*(-1))-40,40,80);
      } //Se l'icona si trova nelle vicinanze

      else {  //Se l'icona è dentro il radar
        if (myData.landmarks_en[i].visit==false) {
          fill(45,45,95,70);
          ellipse((posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1),65,15);
          image(imgLinkGray[i], (posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1)-40,40,80);
        } //Se l'icona non è stat visitata
        else {
          fill(45,45,95,70);
          ellipse((posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1),65,15);
          image(imgLinkColore[i], (posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1)-40,40,80);
        } //Se l'icona è stat visitata
    }
    push();
    // noFill();
    // // stroke(45,45,45);
    // // strokeWeight(2);
    // // rectMode(CENTER);
    // rect( (posRelMe[i].Lon)*zoom,(posRelMe[i].Lat)*zoom*(-1)-35,40,80 );
    hit_struct[i]=collidePointRect(mouseX-width/2,mouseY-height/2,(posRelMe[i].Lon)*zoom-20,(posRelMe[i].Lat)*zoom*(-1)-17,40,80)
    // if(hit_struct[i]==true){
    //
    //   push();
    //   translate(0,-posYPointer) //counter posYPointer
    //   climbMode(i,true,2,1.25,-700,200); //structNum,cloudBool,cloudX,cloudY,cloudMin,cloudMax
    //   pop();
    //   hit_struct[i]=false;
    // };
    pop();
  }
  // console.log(hit_struct);
  pop();
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

function stabilizzation() {
  if (stabilizzato==false) { //Stabilizzazione
    if (isNaN(accuracy)==false) {backUpstabilizzation.push(accuracy);} //se la distanza è un valore numerico mettila nell Array della stabilizzazione
    if (backUpstabilizzation.length>maxStabilizzationArray) {backUpstabilizzation.shift()}
    if ((backUpstabilizzation.length==4)&&(stabilizzationTOT<accuracyLimit)) {stabilizzato=true; console.log("stabilizzato");}; //se la sommatoria delle

    stabilizzationTOT = (backUpstabilizzation.sum()/backUpstabilizzation.length)-accuracy;
  }
}

// Funzioni per chiamare getLocationUpdate() (funziona anche senza chiamere )

function showLocation(position) {
    latitude = position.coords.latitude; //prendi la latitudine dell'utente
    longitude = position.coords.longitude; //prendi la longitudine dell'utente
    accuracy = position.coords.accuracy; //prendi l'accuratezza della precisione dell'utente
    heading = position.coords.heading; //prendi la direzione rispetto al nord dell'utente

    numeroAgg++

    backUpPositionLat.push(latitude); //aggiungi la latitudine alla Array di backup delle latitudini
    backUpPositionLon.push(longitude); //aggiungi la longitudine alla Array di backup delle longitudini

    metriPrec = measure(backUpPositionLat[numeroAgg],backUpPositionLon[numeroAgg],backUpPositionLat[numeroAgg-1],backUpPositionLon[numeroAgg-1]) //calcola la distanza tra la posizione precedente è quella attuale
    metriPrec = Math.round(metriPrec*100)/100 //arrotonda la distanza precedente

    stabilizzation() //Stabilizzazione
    if(climbOn==true){

        console.log(conv);
       if ((stabilizzato==true)&&(metriTOT<myData.landmarks_en[scelto].height)&&(metriPrec>accuracyLimit)&&check_scal==true) {

          if (isNaN(metriPrec)==false) {backUpPositionDist.push(metriPrec);} //se gli aggiornamenti hanno raggiunto la quota di 15. inizia ad aggiungere le distanze percorse alla Array di tutte le distanze
          metriTOT = backUpPositionDist.sum(); //fai la sommatoria della Array di tutte le distanze percorse per sapere la distanza totale percorsa

          conv = map(metriTOT, 0, myData.landmarks_en[scelto].height, 0, myData.landmarks_en[scelto].hPx); //converte la distanza in m in pixel di scalata
          //conv=100;



          ( imgClone = imgLink[scelto].get() ).mask( mask.get() );

           //imposta la maschera appena creata al immagine imgClone


       }
       if(metriTOT>=myData.landmarks_en[scelto].height){
           metriTOT=myData.landmarks_en[scelto].height;
           conv=myData.landmarks_en[scelto].hPx;
           ( imgClone = imgLink[scelto].get() ).mask( mask.get() );
       }
    }
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

function getLocationUpdate(){
    if(navigator.geolocation){
     // timeout at 60000 milliseconds (60 seconds)
    var options = {
     timeout:60000,
     maximumAge:10000,
     enableHighAccuracy: true};

     geoLoc = navigator.geolocation;
     watchID = geoLoc.watchPosition(showLocation, errorHandler, options);
    }

    else{
      alert("Sorry, browser does not support geolocation!");
     }


    }

    function stopWatch(){
     geoLoc.clearWatch(watchID);
    }

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
