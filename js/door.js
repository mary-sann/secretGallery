let geom;
let myshader;
let ready = false;
const param = {
        lookAt_TB: 0.0,
		lookAt_RL: 0.0,
		pos_FB: 0.0,
		pos_RL: 0.0,
        explode: function () {
          alert('◼︎カメラのせつめい\n下のスライダーを操作してカメラの向きを変えたり移動できます。いま、パソコンのマウスやスマホのタッチでカメラ操作できるものを作っているので、出来上がるまでこれを仮設してます。\n\n△▽:視線上下\n◁▷:視線左右\n↑↓:移動前後\n←→:移動左右\n');
        },
		reset: () => {}
  };

async function setup() {
  const wrapper = createDiv();
  wrapper.id("canvas-wrapper");
  wrapper.style("position", "relative");	
	
  const canvas = createCanvas(windowWidth, windowHeight,WEBGL);
  canvas.parent(wrapper);
  //canvas.parent("canvas-wrapper");
  //canvas.position(0,150);
  frameRate(12);
  pixelDensity(1);
  noStroke();
  noSmooth();
  
  //myshader = createShader(vert, frag);
  //shader(myshader);
  
  //console.log(THREE.REVISION);//181

  geom = await plyToP5geom("data/roji.ply","roji");

  //<p>
  const p = createP('工事中');
  p.parent(wrapper);
  p.position(width*0.5,height*0.5);
  // p.position(width*0.5,height*0.5,'absolute');
  p.style('transform', 'translate(-50%, -100%)');
  p.style('font-size','40px');
  p.style('color','white');

  //<a>
  const a = createA('room1.html', 'はいる');
  a.parent(wrapper);
  a.position(width*0.5,height*0.8);
  a.style('transform', 'translate(-50%, -50%)');
  a.style('font-size','20px');
  a.style('color','black');
  
  //dat.gui
  const gui = new dat.gui.GUI({ autoPlace: false });
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
  }
  gui.add(param,'reset').name("リセット");

  ready = true;
}

function draw() {
  //background("#C1E2FFFF");
  if (!ready) return;
  
	background(210,228,234);
    camera(-1100+param.pos_FB,param.pos_RL,150,
           0,param.lookAt_RL,150+param.lookAt_TB,
           0,0,-1);
    // camera(-1100,0,150,
    //        0,0,150,
    //        0,0,-1);
  	model(geom);
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
