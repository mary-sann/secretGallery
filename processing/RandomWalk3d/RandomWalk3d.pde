
/*
*      ╲⠀╲ ⋆⠀╲         ╲
*        ╲⠀╲     ☾⋆.˚ ⠀ ╲ ⋆｡
*          ☆⠀ ╲⠀⠀ ⊹   ⠀.   ☆
*                    ⊹ ⠀⠀ ★
*             ꒰ა ໒꒱
*
*    ⊹ ࣪ ˖˚₊‧
*      ✦
*      ၊|
*      |
*     ⊹₊⋆ 
*
*license　CC BY-NC-ND 4.0
*このコードはメリーが書きました。
*processing4.5.2
*The Nature of Code/Daniel Shiffman/http://natureofcode.com
*↑からランダムウォーカークラスを参照
*セルやグリッドの管理をするクラスを追加して線が重ならないようにしたいですね
*再帰構造のクラスにして枝分かれさせるのも今後書きたい
*rキーでdxf保存
*/
import processing.dxf.*;
import peasy.*;

Walker w;
PeasyCam cam;
boolean isRecord;

void setup() {
  size(800,800,P3D);
  //randomSeed(0);
  
  //始点,値はx[0,width],y[0,hight],z[0,width]の範囲じゃないと動きません
  w = new Walker(new PVector(0,0,0));
  for(int i=0; i<1600; i++){
  w.step();//丸角
  //w._step();//直角
  }
  //PeasyCamライブラリ
  cam = new PeasyCam(this,500);
}

void draw() {
  background(255);
  
  if (isRecord) {
    beginRaw(DXF, "pipe.dxf");
  }
  
  w.display();
  
  if (isRecord) {
    endRaw();
    isRecord = false;
  }
  
  //領域の表示
  noFill();
  stroke(0);
  strokeWeight(2);
  pushMatrix();
  translate(width/2,height/2,width/2);
  box(width);
  popMatrix();
}

void keyPressed() {
  if (key == 'r') {
    isRecord = true;
  }
}
