//キャンバス
let geom;
let myshader;
let ready = false;
let wrapper;
//カメラ  
let cam;
const camEye = {x:0,y:-150,z:1100};
const camLook = {x:0,y:-150,z:0};
const config = {
  pan : 0,
  tilt : 0,
  PAN_MIN : -0.9,
  PAN_MAX :  0.9,
  TILT_MIN : -0.5,
  TILT_MAX :  0.5,
  sens : 0.5
};
const boundingBox = {
	X_MIN : -100,
	X_MAX : 100,
	Y_MIN : -250,
	Y_MAX : -50,
	Z_MIN : 600,
	Z_MAX : 1200
};
let bBoxShape;
let isBoundingBox = false;
//デバックカメラ
let debugCam;
let isDebugCam = false;
const param = {
    lookAt_TB: 0.0,
		lookAt_RL: 0.0,
		pos_FB: 0.0,
		pos_RL: 0.0,
    explode: function () {
      alert('◼︎カメラのせつめい\n下のスライダーを操作してカメラの向きを変えたり移動できます。\n\n△▽:視線上下\n◁▷:視線左右\n↑↓:移動前後\n←→:移動左右\n');
    },
		reset: () => {}
  };
//gui
let camGuide;

document.oncontextmenu = (e) => { e.preventDefault(); }

async function setup() {
  wrapper = createDiv();
  wrapper.id("canvas-wrapper");
  wrapper.style("position", "relative");	
  const canvas = createCanvas(windowWidth, windowHeight,WEBGL);
  canvas.parent(wrapper);
  
  frameRate(12);
  pixelDensity(1);
  noStroke();
  noSmooth();
  
  //myshader = createShader(vert, frag);
  //shader(myshader);
  
  //console.log(THREE.REVISION);//181
  geom = await plyToP5geom("data/roji.ply","roji");//パスがね、jsを読み込んでるhtml基準の相対だよ
  
  //camera
  cam = createCamera();
  let eye = createVector(camEye.x,camEye.y,camEye.z);
  let look = createVector(0,0,-1);
  look.normalize();
  let center = eye.copy().add(look);
  cam.setPosition(eye.x,eye.y,eye.z);
  cam.lookAt(center.x,center.y,center.z);
  
  this.canvas.onwheel = () => false;
  this.canvas.style['touch-action'] = 'none';
  
  //debugCamera
  if(isDebugCam){
    setDebugCam();
    setCamera(debugCam);
    this.canvas.onwheel = () => true;
  }

  //バウンディングボックス表示用
  if(isBoundingBox){
    bBoxShape = getBoundingBox(boundingBox);
  }

  //dom
  //カメラ説明
  let guide1 = '🎥カメラの説明を見る';
  let guide2 =  '◼︎マウス🖱️🐭<br>'
                +'左ドラック視点移動←↑↓→<br>'
				        +'ホイール前後移動▲▼<br>'
				        +'右ドラックカメラ移動◁△▽▷<br>'
                +'◼︎タッチ👆<br>'
				        +'1本指視点移動←↑↓→<br>'
				        +'2本指で上下になぞる前後移動▲▼<br>'
				        +'3本指カメラ移動◁△▽▷<br>'
				        +'クリックで閉じる';
  camGuide = getMyGUI(guide1,guide2);
  camGuide.btn.position(0,0);
	camGuide.desc.position(0,0);
	camGuide.btn.style('color','black');
  camGuide.btn.style('text-shadow',
  '-1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff'
  );
  if(isDebugCam){
	  camGuide.btn.hide();
	  camGuide.desc.hide();
  }

  //<p>
  const p = createP('工事中⛑️🚧🪏<br>'
                     +'電獏堂へようこそ<br>'
					           +'ここは3Dの画廊空間サイトです<br>'
					           +'マウスやタッチで操作ができます<br>'
					           +'これから部屋をどんどん増やしていって<br>'
					           +'探索ゲームを作る予定へ向け工事中です<br>'
					           +'🐏');
  p.parent(wrapper);
  p.style('width', 'fit-content');
  //p.style('height', 'fit-content');//高さは基本自動らしい
  //p.style('font-size','20px');
  p.position(width*0.5-p.size().width*0.5,height*0.5-p.size().height*0.5);
  p.style('color','white');

  //<a>
  const a = createA('rooms/room1.html', 'はいる');
  a.parent(wrapper);
  a.style('font-size','20px');
  a.position(width*0.5-a.size().width*0.5,height*0.75-a.size().height*0.5);
  a.style('color','black');

  ready = true;
}

function draw() {
	
  if (!ready) {return;}

	background(210,228,234);
	
	myCamera();
  //orbitControl();
	//デバック用
  if(isDebugCam){
    useDebugCam();	
  }

  //カメラの領域表示
  if(isBoundingBox){
    stroke(0);
    noFill();
    model(bBoxShape);
    fill(255);//適当な数字入れると色、元に戻る
	}

	push();
  rotateY(PI/2);
  rotateX(PI/2)
  model(geom);
  pop();
}

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
	
	//geometry.attributes.color.convertLinearToSRGB();//threejsにあった、知らんかった〜
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

//0-1
function linearToSRGB(c) {
  return (c <= 0.0031308)
    ? 12.92 * c
    : 1.055 * Math.pow(c, 1/2.4) - 0.055;
}

function getBoundingBox(bBox) {
  let w = bBox.X_MAX - bBox.X_MIN;
  let h = bBox.Y_MAX - bBox.Y_MIN;
  let d = bBox.Z_MAX - bBox.Z_MIN;
  let x = bBox.X_MIN + w/2;
  let y = bBox.Y_MIN + h/2;
  let z = bBox.Z_MIN + d/2;
	
  beginGeometry();
  
  noFill();
  stroke(0);
  strokeWeight(1);
  push();
  translate(x,y,z);
  box(w,h,d);
  pop();
  
  let shape = endGeometry();

  return shape;
}

function myCamera() {
  //let x = movedX;//movedX = mouseX - pmouseX.こっちうごかん
	//let y = movedY;
  let x = mouseX - pmouseX;
  let y = mouseY - pmouseY;
	if(mouseIsPressed){
    if(mouseButton === LEFT || touches.length === 1){
      let dx = x * 0.001;
      let dy = y * 0.001;
      let vx = config.pan + dx;
      let vy = config.tilt + dy;
      //let target = createVector(cam.centerX,cam.centerY,cam.centerZ);
      if(config.PAN_MIN < vx && vx < config.PAN_MAX){
        config.pan += dx;
        //cam.pan(dx);
        let target = createVector(cam.centerX,cam.centerY,cam.centerZ);
        target.add(-tan(dx),0,0);//tanじゃあ危なすぎる
        cam.lookAt(target.x,target.y,target.z);
      }
      if(config.TILT_MIN < vy && vy < config.TILT_MAX){
        config.tilt += dy;	
        //cam.tilt(-dy);
        let target = createVector(cam.centerX,cam.centerY,cam.centerZ);
        target.add(0,-tan(dy),0);
        cam.lookAt(target.x,target.y,target.z);
      }
    }
	  if(mouseButton === RIGHT || touches.length === 3){
      let mvX = getMove(cam,-x,0,0);
      if(checkBBox(mvX)){
        cam.move(-x,0,0);
      }
      let mvY = getMove(cam,-x,-y,0);
      if(checkBBox(mvY)){
        cam.move(0,-y,0);
      }
    }
	  if(touches.length === 2){
      let dy = y * config.sens;
		   let mv = getMove(cam,0,0,dy);
      if(checkBBox(mv)){
        cam.move(0,0,dy);
      }
    }
  }
}

function mouseWheel(e) {
  let d = e.delta * config.sens;
	let mv = getMove(cam,0,0,d);
  if(checkBBox(mv)){
    cam.move(0,0,d);
  }
  //return false; // ページスクロール防止
}

function checkBBox(v){
  if(boundingBox.X_MIN < v.x && v.x < boundingBox.X_MAX){
    if(boundingBox.Y_MIN < v.y && v.y < boundingBox.Y_MAX){
      if(boundingBox.Z_MIN < v.z && v.z < boundingBox.Z_MAX){
        return true;
      }
    }
  }
  return false;
}

//p5.Camera.js/.move()コピペしてきた
function getMove(cam,x,y,z) {
    const local = cam._getLocalAxes();
	
    const dx = [local.x[0] * x, local.x[1] * x, local.x[2] * x];
    const dy = [local.y[0] * y, local.y[1] * y, local.y[2] * y];
    const dz = [local.z[0] * z, local.z[1] * z, local.z[2] * z];
    
	return createVector(cam.eyeX + dx[0] + dy[0] + dz[0],
                        cam.eyeY + dx[1] + dy[1] + dz[1],
                        cam.eyeZ + dx[2] + dy[2] + dz[2]);
}

function setDebugCam() {
  //デバック用
  debugCam = createCamera();
  debugCam.setPosition(camEye.x,camEye.y,camEye.z);
  debugCam.lookAt(camLook.x,camLook.y,camLook.z);
  //dat.gui
  const gui = new dat.gui.GUI({ autoPlace: false,closed: true });
  //gui.close();
  //gui.domElement.style.display = 'none';//非表示
  //gui.domElement.style.display = 'block';//表示
  wrapper.child(gui.domElement);
  gui.domElement.style.position = 'absolute';
	
  gui.add(param, 'explode').name("カメラのせつめい");
  gui.add(param, 'lookAt_TB').min(-400).max(400).step(1.0).name("△▽");
  gui.add(param, 'lookAt_RL').min(-500).max(500).step(1.0).name("◁▷");
  gui.add(param, 'pos_FB').min(-100).max(400).step(1.0).name("↑↓");
  gui.add(param, 'pos_RL').min(-100).max(100).step(1.0).name("←→");
  
  param.reset = () => {
	  param.lookAt_TB = 0.0;
	  param.lookAt_RL = 0.0;
	  param.pos_FB = 0.0;
	  param.pos_RL = 0.0;
	  for (const controller of gui.__controllers) {
	  	controller.updateDisplay();
	  }
	  debugCam.setPosition(camEye.x,camEye.y,camEye.z);
      debugCam.lookAt(camLook.x,camLook.y,camLook.z);
  }
  gui.add(param,'reset').name("リセット");
}

function useDebugCam() {
	debugCam.setPosition(camEye.x+param.pos_RL, camEye.y,camEye.z-param.pos_FB);
  debugCam.lookAt(camLook.x+param.lookAt_RL,camLook.y-param.lookAt_TB,camLook.z);
}

class MyGUI{
	constructor(){
    //これbuttonかdivかどっちかに統一したほうがいいかも
    //buttonはentar/spaceキーで操作できる(<a>もできる)、でもフォントの設定が他と違う、変わる
    //divはキー操作できないけどフォントの設定はサイトから引き継ぎ
    //uiならbuttonの方がいいかもな...
	  //divは隠しリンクや透明ボタンに有効かもね、tabで見つかると困るもの
		this.btn = createButton();
		this.desc = createButton();
    //this.desc = createDiv();
		this.desc.hide();
		
		this.btn.mouseClicked(() => {
      this.btn.hide();
      this.desc.show();
    });
    this.desc.mouseClicked(() => {
      this.desc.hide();
      this.btn.show();
    });

    this.btnSize;
    this.descSize;
	}

  setSize(){
    this.btnSize = this.btn.size();
    this.desc.show(); 
    this.descSize  = this.desc.size();
    this.desc.hide(); 
  }
	
	update(x,y,x2,y2){
        this.btn._translate(x,y);
        this.desc._translate(x2,y2);
	}
}

function getMyGUI(html1,html2) {
  const gui = new MyGUI();
	
  gui.btn.html(html1);
  gui.btn.parent(wrapper);
  gui.btn.style('border', 'none');
  gui.btn.style('background', 'none');
  //gui.btn.style('outline', 'none'); 
  gui.btn.style('padding', '0');
  gui.btn.style('margin', '0');
  gui.btn.style('font-weight', '500');
  gui.btn.style('font-family', '"Hiragino Sans", sans-serif');
  gui.btn.style('font-size', ' 16px'); 
  gui.btn.style('color','black');

  gui.desc.html(html2);
  gui.desc.parent(wrapper);
  gui.desc.style('width', 'fit-content');
  gui.desc.style('border', '1px solid #000');
  gui.desc.style('border-radius', '6px');
  gui.desc.style('background', '#f2f2f2');
  gui.desc.style('text-align', 'left');
  gui.desc.style('font-family', '"Hiragino Sans", sans-serif');
  gui.desc.style('font-size', ' 16px'); 
  gui.desc.style('color','black');

  gui.setSize();

  return gui;
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
