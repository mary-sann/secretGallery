class Walker {
  PVector pv,v,next;
  int count;//歩数
  int axis;//進む方向x=1,y=2,z=3
  int sign;//-1or1
  int len;//歩幅
  ArrayList<Pipe> pipes;
  boolean isCheck;
  boolean isBezier;

  Walker(PVector v) {
    pv = new PVector(0,0,0);
    this.v = v.copy();//始点
    next = new PVector(0,0,0);
    reset();
	  axis = int(random(1,4));
	  dir();
	  len = 10;
	  pipes = new ArrayList();
	  isCheck = false;
    isBezier = false;
  }
  
  void display() {
    noFill();
    randomSeed(0);
    bezierDetail(5);
    for(Pipe p: pipes){
      float r = random(1);
      if(r<0.6){
        stroke(0);
        strokeWeight(3);
        p.display();
      }else if(r<0.9){
        stroke(100);
        strokeWeight(8);
        p.display();
      }else{
        stroke(100);
        strokeWeight(12);
        p.display();
      }
    }
  }
  
  void step(){
    pv = v.copy();
    //次の進む場所が領域からはみ出てるかチェック
    //はみ出てたら座標修正、ベジェで曲がる
    PVector c = v.copy();
    walk(c);
    if(check(c)){
      reset();
      dir();
      c = v.copy();
      walk(c);
      if(check(c)){
        sign *= -1;
        c = v.copy();
        walk(c);
      }
      if(pipes.size() > 0){
        isBezier =true;
      }
    }
    v = c.copy();
    count--;//どこで減らすか
    
    if(count == 0){
      //0になったら進行方向チェックしてベジェ
      reset();//ここでカウントの値リセットされてる
      dir();
      c = v.copy();
      walk(c);
      if(check(c)){
        sign *= -1;
        c = v.copy();
        walk(c);
      }
      next = c.copy();
      //pipes.add(new Pipe(pv.copy(),v.copy(),next.copy()));
      addBezier(pv.copy(),v.copy(),next.copy());
      count--;//一個先の使ってるからね
      v = next.copy();
    }else{
      if(isBezier){
        PVector start = pipes.get(pipes.size()-1).start.copy();
        pipes.remove(pipes.size()-1);
        //pipes.add(new Pipe(start.copy(),pv.copy(),v.copy()));
        addBezier(start.copy(),pv.copy(),v.copy());
        isBezier = false;
      }else{
      //直進
        pipes.add(new Pipe(pv.copy(),v.copy()));
      }
    } 
  }
  
  //直角テスト用
  void _step(){
    pv = v.copy();
    PVector c = v.copy();
    walk(c);
    if(check(c)){
      reset();
      dir();
      c = v.copy();
      walk(c);
      if(check(c)){
        sign *= -1;
        c = v.copy();
        walk(c);
      }
    }
    v = c.copy();
    pipes.add(new Pipe(pv.copy(),v.copy()));//直角の角
    count--;
    if(count == 0){
      reset();
      dir();
      c = v.copy();
      walk(c);
      if(check(c)){
        sign *= -1;
      }
    }
  }
  
  void addBezier(PVector start,PVector control,PVector end){
    if(pipes.get(pipes.size()-1).isBezier){
      //連続でベジェになった場合
      PVector e = PVector.sub(pipes.get(pipes.size()-1).end,
                             pipes.get(pipes.size()-1).control);
      e.mult(0.5);
      e.add(pipes.get(pipes.size()-1).control);
      pipes.get(pipes.size()-1).isCheck = true;
      pipes.get(pipes.size()-1).end = e.copy();
      pipes.add(new Pipe(e.copy(),control,end));
      pipes.get(pipes.size()-1).isCheck = true;
      
      //なぜかこっちで問題ないんだ,よくわからんね
      //pipes.get(pipes.size()-1).isCheck = true;
      //pipes.add(new Pipe(start,control,end));
      //pipes.get(pipes.size()-1).isCheck = true;
      
      println("!");
    }else{
      pipes.add(new Pipe(start,control,end));
    }
    isBezier = false;
  }
  
  void walk(PVector a){
    if(axis == 1){
      a.x += sign*len;
    }else if(axis == 2){
      a.y += sign*len;
    }else if(axis == 3){
      a.z += sign*len;
    }
  }
  
  void reset(){
    count = int(random(3,20));//min2、3以下にするとベジェがおかしくなるのでやめて
  }
  
  void dir(){
    sign = int(pow(-1,int(random(2))));//aの0乗は1
    if(axis == 1){
      axis = random(1)>0.5 ? 2 : 3;
    }else if(axis == 2){
      axis = random(1)>0.5 ? 1 : 3;
    }else if(axis == 3){
      axis = random(1)>0.5 ? 1 : 2;
}
  }
  
  boolean check(PVector a){
    if(a.x < 0 || width < a.x){
      return true;
    }
    if(a.y < 0 || height < a.y){
      return true;
    }
    if(a.z < 0 || width < a.z){
      return true;
    }
    return false;
    }
  
}
