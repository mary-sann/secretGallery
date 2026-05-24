class Pipe{
	PVector start,end;
	boolean isBezier;
	PVector control;
	boolean isCheck = false;
	
	Pipe(PVector start,PVector end){
		this.start = start;
		this.end = end;
		isBezier = false;
	}
	Pipe(PVector start,PVector control,PVector end){
		this.start = start;
		this.end = end;
		this.control = control;
		isBezier = true;
	}
	
	void display(){
		//if(isCheck)stroke(255,0,0);
		if(isBezier){
			bezier(start.x,start.y,start.z,
				   control.x,control.y,control.z,
				   control.x,control.y,control.z,
				   end.x,end.y,end.z);
		}else{
			line(start.x,start.y,start.z,
				 end.x,end.y,end.z);
		}
	}
}
