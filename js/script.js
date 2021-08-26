var imgBase;
var imgNormal;
var imgSpecular;
let arrayOfBase;
let arrayOfNormal;
let arrayOfSpecular;
let cameraZ = 10;
let lightZ = 200;
let observerMatrix;
let lightMatrix;
let rangeLight;
let onlySpecular = false;
let onlyDifuse = false;

function preload() {
  imgBase = loadImage("./Texturas/char2_d.png");
  imgNormal = loadImage("./Texturas/char2_n.png");
  imgSpecular = loadImage("./Texturas/char2_s.png");
  
}

function setup() {
  createCanvas(imgBase.width, imgBase.height);
  observerMatrix = generateObserverMatrix(width, height);
  

  image(imgNormal, 0, 0);
  loadPixels();
  arrayOfNormal = pixelsToArray(imgNormal);

  image(imgSpecular, 0, 0);
  loadPixels();
  arrayOfSpecular = pixelsToArray(imgSpecular);
  

  image(imgBase, 0 , 0);
  loadPixels();
  arrayOfBase = pixelsToArray(imgBase);
  print("Ready");
  lightMatrix = generateLightMatrix(0, 0);
  phongLight();
  
}


function onDistanceChange(){
  lightZ = document.getElementById("lightValue").value;
  cameraZ = document.getElementById("cameraValue").value;
  observerMatrix = generateObserverMatrix(width, height);
  lightMatrix = generateLightMatrix(width/2, height/2);
  phongLight();
}





function pixelsToArray(img) {
  let newMatrix = [];
  for (let x = 0; x < width; x++) {
    let temp = []
    for (let y = 0; y < height; y++) {
      let currentRGB = normalizeColor(img.get(x, y));
      let r = currentRGB[0];
      let g = currentRGB[1];
      let b = currentRGB[2];

      let v = createVector(r, g, b);
      temp.push(v);
    }
    newMatrix.push(temp);
  }
  return newMatrix;
}

function phongLight(){
  let r = document.getElementById("redColor").value/255;
  let g = document.getElementById("greenColor").value/255;
  let b = document.getElementById("blueColor").value/255;
  let htmlSpecular = document.getElementById("specular");
  let htmlDifuse = document.getElementById("difuse");

  if(htmlSpecular.checked && !htmlDifuse.checked){
    onlySpecular = true;
  }else if(!htmlSpecular.checked && htmlDifuse.checked){
    onlyDifuse = true;
  }else{
    onlySpecular = false;
    onlyDifuse = false;
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let ambientLight = createVector(0, 0, 0);

      rangeLight = createVector(r, g, b);
      let difuseLight = createVector(0, 0, 0);
      let normalAndLight = Math.max(arrayOfNormal[x][y].dot(lightMatrix[x][y]), 0);
      p5.Vector.mult(arrayOfBase[x][y], normalAndLight, difuseLight);
      
      let mirrorMath = createVector(0, 0, 0);
      let mirrorLight = createVector(0, 0, 0);
      p5.Vector.mult(arrayOfNormal[x][y], 2*normalAndLight, mirrorMath);
      p5.Vector.sub(lightMatrix[x][y], mirrorMath, mirrorLight);

      let specularMath = Math.max(observerMatrix[x][y].dot(mirrorLight), 0)**2;
      let specularLight = createVector(0, 0, 0);
      p5.Vector.mult(arrayOfSpecular[x][y], specularMath, specularLight);

      let difuseAndSpecular = createVector(0, 0, 0);
      let finalMath = createVector(0, 0, 0);
      if(onlySpecular){
        p5.Vector.add(createVector(0, 0, 0), specularLight, difuseAndSpecular);
      }else if(onlyDifuse){
        p5.Vector.add(difuseLight, createVector(0, 0, 0), difuseAndSpecular);
      }else{
        p5.Vector.add(difuseLight, specularLight, difuseAndSpecular);
      }
      p5.Vector.mult(rangeLight, difuseAndSpecular, finalMath)

      
      let finalLight = createVector(0, 0, 0);
      
      p5.Vector.add(finalMath, ambientLight, finalLight);
      
      let color = [finalLight.x, finalLight.y, finalLight.z, 1];
      set(x, y, denormalizeColor(color));
    }
  }
  updatePixels();
}

function mouseMoved(){
  lightMatrix = generateLightMatrix(mouseX, mouseY);
  phongLight();
}

function mouseClicked(){
  observerMatrix = generateObserverMatrix(mouseX, mouseY);
  phongLight();
}

function normalizeColor(color) {
  let r = color[0];
  let g = color[1];
  let b = color[2];
  let a = color[3];

  r = r / 255;
  g = g / 255;
  b = b / 255;
  a = a / 255;

  return [r, g, b, a];
}

function denormalizeColor(color){
  let r = color[0];
  let g = color[1];
  let b = color[2];
  let a = color[3];

  r = r * 255;
  g = g * 255;
  b = b * 255;
  a = a * 255;

  return [r, g, b, a];
}


function generateObserverMatrix(x, y){
  let newMatrix = [];
  let cameraX = x;
  let cameraY = y;
  for (let x = 0; x < width; x++) {
    let temp = [];
    for (let y = 0; y < height; y++) {
      let v = createVector(Math.abs(cameraX - x), Math.abs(cameraY - y), cameraZ);
      temp.push(v.normalize());
    }
    newMatrix.push(temp);
  }
  return newMatrix;
}

function generateLightMatrix(x, y){
  let newMatrix = [];
  let LightX = x;
  let LightY = y;
  for (let x = 0; x < width; x++) {
    let temp = [];
    for (let y = 0; y < height; y++) {
      let v = createVector(Math.abs(LightX - x), Math.abs(LightY - y), lightZ);
      temp.push(v.normalize());
    }
    newMatrix.push(temp);
  }
  return newMatrix;
}