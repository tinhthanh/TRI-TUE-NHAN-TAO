
package model;

public class Node {
    private boolean start ;     //có phải là điểm bắt đầu hay không
    private boolean target ;     // có phải là điểm kết thúc hay không
    private boolean wall;        // có phải là tường hay không
    private int xPos,yPos;       // tọa độ thực trong tọa đô Jpanel 
    private int fx,fy ;          // chỉ số ô trong mảng Node 
    private Node parent;         // Node cha của nó.
    private Node children;
//    private boolean onPath;      
    private int H;
    private int G;
    private int F;
    private boolean open = false;
    private boolean close = false; 
    
  //  boolean thanh = true ;
    public Node(int x,int y){
         initNode(x,y);
    }
    public void initNode(int x,int y){
        H = 0;
        G = 0;
        F = 0;
        start = false;
        target = false;
        wall = false;
        children = null;
        parent = null;
        fx = x;
        fy = y;
    }
    
    public void clear(){
        start = false;
	target = false;
	wall = false;
	//onPath = false;
        parent = null;
        children = null;
    }

    
    public void calcH(Node target,int h){
        H = (int)((Math.sqrt((target.fx - fx)*(target.fx - fx) + (target.fy - fy)*(target.fy - fy)))*10);
    }
    public int calcG(Node n){
        int temp = n.getG();
        if(fx != n.fx && fy != n.fy) {         //nếu node1 đang xét không là node theo đường chéo của node.
	    temp += 14;
	}
	else temp += 200;                      //là node theo đường dọc , đường ngang
	    return temp;
    }
    public int getF() {
        return G + H;
    }
    public void setF(int giatri){
        F = giatri;
    }

    
    
    
    public boolean isStart() {
        return start;
    }

    public boolean isTarget() {
        return target;
    }

    public boolean isWall() {
        return wall;
    }

    public int getxPos() {
        return xPos;
    }

    public int getyPos() {
        return yPos;
    }

    public int getFX() {
        return fx;
    }

    public int getFY() {
        return fy;
    }

    public Node getParent() {
        return parent;
    }
    
    public Node getChildren(){
        return children;
    }
    public void setChilden(Node children){
        this.children = children;
    }
    public int getH() {
        return H;
    }

    public int getG() {
        return G;
    }

    public boolean isOpen() {
        return open;
    }

    public boolean isClose() {
        return close;
    }

    public void setStart(boolean start) {
        this.start = start;
    }

    public void setTarget(boolean target) {
        this.target = target;
    }

    public void setWall(boolean wall) {
        this.wall = wall;
    }

    public void setxPos(int xPos) {
        this.xPos = xPos;
    }

    public void setyPos(int yPos) {
        this.yPos = yPos;
    }

    
    
    public Node setX(int x) {
	xPos = x;
	return this;
    }
	
    public Node setY(int y) {
	yPos = y;
	return this;
    }

    public void setParent(Node parent) {
        this.parent = parent;
    }

    public void setH(int H) {
        this.H = H;
    }

    public void setG(int G) {
        this.G = G;
    }

    
    public void setOpen() {
		open = true;
	}
    public void setClosed() {
	close = true;
    }

//    public boolean isOnPath() {
//        return onPath;
//    }
//
//    public void setPath() {
//	onPath = true;
//    }    

//    public boolean isThanh() {
//        return thanh;
//    }
//
//    public void setThanh(boolean thanh) {
//        this.thanh = thanh;
//    }
    
    
    
}
