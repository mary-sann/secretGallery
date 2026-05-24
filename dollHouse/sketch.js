//モデル
let geom;
let geom2;
//ロード防止
let ready = false;
//減衰
let angle = 0;
let vx = 0;
//GUI
let msg;
let msg2;
let myInput;
let myPicker;
let mySelect;
let myData;
let checkbox;
let slider;
let slider2;
//シェーダー
let myshader;
let myshader2;
let shaderProgram;
let myBuffer;

//stats.js
//FPStest
/*
window.addEventListener('load', function() {
  const stats = new Stats();
  document.body.appendChild(stats.domElement);
  setInterval(function () {stats.update();}, 1000 / 60);
},false);
*/

function preload() {
  myData = loadJSON('data/memo.json');
}

async function setup() {
  //canvas設定
  const canvas = createCanvas(max(windowWidth,360), max(windowHeight,600),WEBGL);
  canvas.parent("canvas-wrapper");
  
  frameRate(12);
  pixelDensity(1);
  noStroke();
  noSmooth();

  //3dモデル
  //console.log(THREE.REVISION);//181
  geom = await plyToP5geom("data/div2.ply","div");
  geom2 = await plyToP5geom("data/div-line-g4.ply","divline");

  //輪郭抽出
  myshader = createFilterShader(sobel);
  myshader2 = createFilterShader(frag);
  shaderProgram = createShader(depth_vert, depth_frag);

  //バッファ
  myBuffer = createFramebuffer({ antialias: false });
  myBuffer.pixelDensity(1);

  //GUIワッパー
  const ui = createDiv();
  ui.parent("canvas-wrapper");
  ui.id('ui-wrapper');
  ui.position(width*0.05,height*0.0);

  //タイトル
  const title = createP("DOLLHOUSE建設中...");
  title.parent("ui-wrapper");
  title.style('font-size', ' 24px'); 

  //説明
  const dcmt = createP(`かわいいゲーム待機画面っぽいものをつくりたい場所<br>
                        div(デイブ)ちゃんの中身はまだ空っぽです<br>
                        なにを表示しようかな`);
  dcmt.parent("ui-wrapper");
  dcmt.style('font-size', ' 14px'); 
  
  //文字入力表示
  msg = createP("hello,world!");
  msg.parent("ui-wrapper");
  msg.style('width', 'fit-content');
  msg.style('border', '1px solid #000');
  msg.style('border-radius', '6px');
  msg.style('background', '#f2f2f2');
  msg.style('text-align', 'left');
  msg.style('font-family', '"Hiragino Sans", sans-serif');
  msg.style('font-size', ' 16px'); 
  msg.style('color','black');

  myInput = createInput("ここに入力してね");
  myInput.parent("ui-wrapper");

  //背景色
  const cpic = createDiv();
  cpic.parent("ui-wrapper");
  cpic.id("bg");
  const cp = createP("背景色:");
  cp.parent("bg");
  cp.style('display','inline');
  myPicker = createColorPicker("#b5c9da");
  myPicker.parent("bg");
  myPicker.style('display','inline');
  const button = createButton('reset');
  button.parent("bg");
  button.style('display','inline');
  button.mousePressed(() => {myPicker.elt.value = "#b5c9da";});

  //メモ表示
  msg2 = createP("");
  msg2.parent("ui-wrapper");
  msg2.style('width', 'fit-content');
  msg2.style('border', '1px solid #000');
  msg2.style('border-radius', '6px');
  msg2.style('background', '#f2f2f2');
  msg2.style('text-align', 'left');
  msg2.style('font-family', '"Hiragino Sans", sans-serif');
  msg2.style('font-size', ' 16px'); 
  msg2.style('color','black');

  //jsonメモ
  const memo = createDiv();
  memo.parent("ui-wrapper");
  memo.id("memo");
  const slt = createP("jsonに書いた適当メモ:");
  slt.parent("memo");
  slt.style('display','inline');
  mySelect = createSelect();
  mySelect.parent("memo");
  mySelect.style('display','inline');
  mySelect.option('1',myData.a);
  mySelect.option('2',myData.b);
  mySelect.option('3',myData.c);
  mySelect.option('4',myData.d);
  mySelect.selected('1');

  //線画
  checkbox = createCheckbox(' 線画表示ON/OFF', true);
  checkbox.parent("ui-wrapper");

  //操作
  const oprt = createP(`操作説明:<br>
                      マウス左ボタンを横にドラックすると<br>
                      divちゃんが回転するよ！<br>
                      スマホはタッチ⇔<br>
                      スライダーでカメラズームと上下移動↓`);
  oprt.parent("ui-wrapper");
  slider = createSlider(-80, 80, 0, 0);
  slider.size(80);
  slider.parent("ui-wrapper");
  slider2 = createSlider(-50, 50, 0, 0);
  slider2.size(80);
  slider2.parent("ui-wrapper");

  //戻る
  const back = createA('../rooms/room1.html', '←部屋に戻る')
  back.parent("ui-wrapper");
  back.style('display','block');

  ready = true;
}

function draw() {
  if (!ready) {return;}

  msg.html('入力が表示されるよ！▼<br>'+myInput.value());
  msg2.html('選んだものが表示されるよ！▼<br>'+mySelect.selected());

if(mouseIsPressed){
    const dx = mouseX - pmouseX;
    vx += dx*0.001;
  }
  angle += vx;
  vx *= 0.87;

  //pg.background("#b5c9da");
  background(myPicker.color());
  camera(0,-80+slider2.value(),180+slider.value(),
        0,-80+slider2.value(),0,
        0,1,0
  );
  push();
  rotateY(angle);
  rotateX(PI/2);
  translate(0,0,sin(frameCount*0.1)*5);
  model(geom);
  pop();

  //輪郭抽出
  if (checkbox.checked()) {
  myBuffer.begin();
  clear();
  background("#000000");
  noLights();//ライトは何かしら絶対書かないとだめ
  shader(shaderProgram);
  camera(0,-80+slider2.value(),180+slider.value(),
        0,-80+slider2.value(),0,
        0,1,0
  );
  push();
  rotateY(angle);
  rotateX(PI/2);
  translate(0,0,sin(frameCount*0.1)*5);
  model(geom2);
  pop();
  filter(myshader);
  myBuffer.end();
  myshader2.setUniform('mytex', myBuffer.color)
  filter(myshader2);
  }
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

let frag = `
precision mediump float;

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 texelSize;

uniform sampler2D mytex;

void main() {

  vec2 uv = vTexCoord;
  //uv = vec2(uv.x, 1.0 - uv.y);

  vec4 tex = texture2D(tex0, uv); 
  vec4 tex2 = texture2D(mytex, uv);

  gl_FragColor = tex*tex2;
}
`;

//processing/libraries/PostFX/library/shader/sobelFrag.glsl参考
//このライブラリライセンスが書いてない
//ので書き直して使わせてもらいました
//PixelFlowがMITなのでそちらに変えるかもしれない
let sobel = `
precision mediump float;
varying vec2 vTexCoord;

uniform sampler2D tex0;
uniform vec2 texelSize;

//xKernel       yKernel       
//+1  0 -1      +1  +2  +1 
//+2  0 -2       0   0   0 
//+1  0 -1      -1  -2  -1 

void main(void) {
  vec4 xGrad= vec4(0.0);
  xGrad += texture2D( tex0, vTexCoord.st + vec2(-texelSize.s,-texelSize.t)) * -1.0;
  xGrad += texture2D( tex0, vTexCoord.st + vec2(-texelSize.s, 0.0)) * -2.0;
  xGrad += texture2D( tex0, vTexCoord.st + vec2(-texelSize.s,texelSize.t)) * -1.0;
  xGrad += texture2D( tex0, vTexCoord.st + vec2(texelSize.s,-texelSize.t)) * 1.0;
  xGrad += texture2D( tex0, vTexCoord.st + vec2(texelSize.s,0.0)) * 2.0;
  xGrad += texture2D( tex0, vTexCoord.st + vec2(texelSize.s,texelSize.t)) * 1.0;
  vec4 yGrad = vec4(0.0);
  yGrad += texture2D( tex0, vTexCoord.st + vec2(-texelSize.s,-texelSize.t)) * -1.0;
  yGrad += texture2D( tex0, vTexCoord.st + vec2(0.0,-texelSize.t)) * -2.0;
  yGrad += texture2D( tex0, vTexCoord.st + vec2(texelSize.s,-texelSize.t)) * -1.0;
  yGrad += texture2D( tex0, vTexCoord.st + vec2(-texelSize.s,texelSize.t)) * 1.0;
  yGrad += texture2D( tex0, vTexCoord.st + vec2(0.0,texelSize.t)) * 2.0;
  yGrad += texture2D( tex0, vTexCoord.st + vec2(texelSize.s,texelSize.t)) * 1.0;
  vec3 edge = sqrt((xGrad.rgb * xGrad.rgb) + (yGrad.rgb * yGrad.rgb));

  if(length(edge) < 0.4){ edge = vec3(0.0);} 
  gl_FragColor = vec4(vec3(1.0)-edge.rgb, 1.0);
}
`;

//https://github.com/processing/p5.js/blob/main/src/webgl/shaders/vertexColor.vert
let depth_vert = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec4 aVertexColor;

varying vec4 vColor;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
  vColor = aVertexColor;
}
`;

//depthで色を付けると値が流動的なので、他のパーツの色と差がついたり同じ値になったり
//改良が必要
//https://github.com/processing/p5.js/blob/main/src/webgl/shaders/vertexColor.frag
let depth_frag = `
precision highp float;
varying vec4 vColor;
void main(void) {
  vec4 col = vColor;
  if(vColor.r > 0.99){ col = vec4(vColor.rgb*abs(gl_FragCoord.z)*1.5, 1.0); }
  gl_FragColor = col;
}
`;