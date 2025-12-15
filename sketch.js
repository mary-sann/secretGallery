let obj1,obj2;
let myshader;
let toggleButton;
let isOpen = false;
let div1,div2,div3,div4;
let span1,span2,span3,span4;
let slider1,slider2,slider3,slider4;
let entered = false;
let enterButton;

async function plyToP5geom(path,id){
  const loader = new PLYLoader();
  const geometry = await loader.loadAsync(path);
	//console.log('loaded', geometry);
	
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color ? geometry.attributes.color.array : null;
    const indices = geometry.index ? geometry.index.array : null;
    
	const obj = new p5.Geometry();
  obj.gid = id;
	for(let i=0;i<positions.length;i+=3){
	  let v = createVector(positions[i], positions[i+1], positions[i+2]);
	  v.x *= -1;
	  v.mult(100);
      obj.vertices.push(v);
    }
	
	if(colors){
    for(let i=0;i<colors.length;i+=3){
	  obj.vertexColors.push(linearToSRGB(colors[i]),
	                        linearToSRGB(colors[i+1]),
							            linearToSRGB(colors[i+2]),
							            1.0);
	  }
  }
	
	if(indices){
    for(let i=0;i<indices.length;i+=3){
	  obj.faces.push([indices[i], indices[i+1], indices[i+2]]);
    }
  }
	
	return obj;
}

async function setup() {
  createCanvas(windowWidth, windowHeight,WEBGL);
  frameRate(12);
  pixelDensity(1);
  noStroke();
  
  //myshader = createShader(vert, frag);
  //shader(myshader);
  
  //console.log(THREE.REVISION);//181

  obj1 = await plyToP5geom("data/roji.ply","roji");
  obj2 = await plyToP5geom("data/room2.ply","room");
  
  gui();
  
  let div = createDiv("工事中");
  div.style('position','fixed');
  div.style('left', '50%');
  div.style('top', '50%');
  div.style('transform', 'translate(-50%, -50%)');
  div.style('font-size','40px');
  div.style('color','white');
}

function draw() {
  //background("#C1E2FFFF");
  
  if(entered){
    background("#C1E2FFFF");
	  camera(-550+slider3.value(),slider4.value(),150,
           0,slider2.value(),150+slider1.value(),
           0,0,-1);
	  model(obj2);
  }else {
	background(210,228,234);
    camera(-1100+slider3.value(),slider4.value(),150,
           0,slider2.value(),150+slider1.value(),
           0,0,-1);
  	model(obj1);
  }
  
}

function linear8bitToSRGB8bit(c) {
  // 0–255 → 0–1
  let x = c / 255;

  // Linear → sRGB
  if (x <= 0.0031308) {
    x = 12.92 * x;
  } else {
    x = 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  }

  // 0–1 → 0–255（丸め）
  return Math.round(
    Math.min(Math.max(x, 0), 1) * 255
  );
}

function linearRGBAtoSRGBA(r, g, b, a) {
  return [
    linear8bitToSRGB8bit(r),
    linear8bitToSRGB8bit(g),
    linear8bitToSRGB8bit(b),
    a // alphaは変換しない
  ];
}

//255
function linearRGBAtoSRGBA_fast(r, g, b, a) {
  return [
    Math.round(Math.pow(r / 255, 1 / 2.2) * 255),
    Math.round(Math.pow(g / 255, 1 / 2.2) * 255),
    Math.round(Math.pow(b / 255, 1 / 2.2) * 255),
    a
  ];
}

//0-1
function linearToSRGB(c) {
  return (c <= 0.0031308)
    ? 12.92 * c
    : 1.055 * Math.pow(c, 1/2.4) - 0.055;
}

function gui() {
  toggleButton = createButton("▶︎ Camera Control");
  toggleButton.mousePressed(toggle);
  toggleButton.position(0,0);
  toggleButton.size(200,50);
  toggleButton.style('text-align', 'center');
  toggleButton.style('font-size','20px');

  div1 = createDiv();
  div2 = createDiv();
  div3 = createDiv();
  div4 = createDiv();
  div1.hide();
  div2.hide();
  div3.hide();
  div4.hide();
  
  div1.position(0, 50);
  div1.size(200, 50);
  div1.style('background-color', 'white');
  div1.style('text-align', 'center');
  div2.position(0, 100);
  div2.size(200, 50);
  div2.style('background-color', 'white');
  div2.style('text-align', 'center');
  div3.position(0, 150);
  div3.size(200, 50);
  div3.style('background-color', 'white');
  div3.style('text-align', 'center');
  div4.position(0, 200);
  div4.size(200, 50);
  div4.style('background-color', 'white');
  div4.style('text-align', 'center');
  
  span1 = createSpan("△▽");
  span1.parent(div1);
  slider1 = createSlider(-200, 200, 0);
  slider1.parent(div1);
  span2 = createSpan("◁▷");
  span2.parent(div2);
  slider2 = createSlider(-200, 200, 0);
  slider2.parent(div2);
  span3 = createSpan("↓↑");
  span3.parent(div3);
  slider3 = createSlider(-50, 300, 0);
  slider3.parent(div3);
  span4 = createSpan("←→");
  span4.parent(div4);
  slider4 = createSlider(-100, 100, 0);
  slider4.parent(div4);
  
  enterButton = createButton("▲Enter");
  enterButton.style('position','fixed');
  enterButton.style('left', '50%');
  enterButton.style('top', '0%');
  enterButton.style('transform', 'translate(-50%, 0%)');
  enterButton.size(100,50);
  enterButton.style('text-align', 'center');
  enterButton.style('font-size','20px');
  enterButton.mousePressed(() => {
	entered = !entered; 
    slider1.value(0);
    slider2.value(0);
    slider3.value(0);
    slider4.value(0);
  if(entered){
    enterButton.html("▼Exit");
  }else{
    enterButton.html("▲Enter");
  }
  });
}

function toggle() {
  isOpen = !isOpen;

  if (isOpen) {
    toggleButton.html("▼ Camera Control");
	div1.show();
    div2.show();
    div3.show();
    div4.show();
  } else {
    toggleButton.html("▶︎ Camera Control");
    div1.hide();
    div2.hide();
    div3.hide();
    div4.hide();
  }
}

let vert = `
attribute vec3 aPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec4 vColor;

void main(void) {
  vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * viewModelPosition;
  vColor = aVertexColor;
}

//GLES300
// IN vec3 aPosition;
// IN vec4 aVertexColor;

// uniform mat4 uModelViewMatrix;
// uniform mat4 uProjectionMatrix;

// OUT vec4 vColor;

// void main(void) {
//   vec4 positionVec4 = vec4(aPosition, 1.0);
//   gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
//   vColor = aVertexColor;
// }
`;


let frag = `
precision highp float;
varying vec4 vColor;

void main(void) {
	//gl_FragColor = vColor;
  gl_FragColor = vec4(vColor.rgb, 1.0);
}

//GLES300
// IN vec4 vColor;
// void main(void) {
//   OUT_COLOR = vec4(vColor.rgb, 1.) * vColor.a;
// }
`;
