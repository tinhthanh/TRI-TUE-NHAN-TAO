/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package Map;


import java.util.Random;

/**
 *
 * @author Huynh Thanh
 */
public class RandomMap {
    final static int backgroundCode = 0;
    final static int wallCode = 1;
    final static int pathCode = 2;
    final static int emptyCode = 0;
    final static int visitedCode = 4;
    final  int SOLUONGAGENT = 12;
 int rows ;
    int columns  ;
    int maze[][] ;
   
    public RandomMap(int rows , int columns){
     this.rows = rows ;
     this.columns = columns ;
    
    }
     // ham nay ramdom ra ban do (em dang nghien cuu hibi)

    public int[][] createMap() { 
            if (maze == null)
            maze = new int[rows][columns];
        int i,j;
        int emptyCt = 0; 
        int wallCt = 0;  
        int[] wallrow = new int[(rows*columns)/2]; 
        int[] wallcol = new int[(rows*columns)/2];
        for (i = 0; i<rows; i++)  
            for (j = 0; j < columns; j++)
                maze[i][j] = wallCode;
        for (i = 1; i<rows-1; i += 2) 
            for (j = 1; j<columns-1; j += 2) {
                emptyCt++;
                maze[i][j] = -emptyCt;  
                if (i < rows-2) { 
                    wallrow[wallCt] = i+1;
                    wallcol[wallCt] = j;
                    wallCt++;
                }
                if (j < columns-2) { 
                    wallrow[wallCt] = i;
                    wallcol[wallCt] = j+1;
                    wallCt++;
                }
            }

        int r;
        for (i=wallCt-1; i>0; i--) {
            r = (int)(Math.random() * i); 
            tearDown(wallrow[r],wallcol[r]);
            wallrow[r] = wallrow[i];
            wallcol[r] = wallcol[i];
        }
        for (i=1; i<rows-1; i++)  {
            for (j=1; j<columns-1; j++)
                if (maze[i][j] < 0)
                    maze[i][j] = emptyCode;
        }
        
   return maze ;
    }
  public   synchronized void tearDown(int row, int col) {
        if(row % 2 == 1 && maze[row][col-1] != maze[row][col+1]) {
          
            fill(row, col-1, maze[row][col-1], maze[row][col+1]);
            maze[row][col] = maze[row][col+1];

            try { wait(1); }
            catch (InterruptedException e) { }
        }
        else if (row % 2 == 0 && maze[row-1][col] != maze[row+1][col]) {
  
            fill(row-1, col, maze[row-1][col], maze[row+1][col]);
            maze[row][col] = maze[row+1][col];

            try { wait(1); }
            catch (InterruptedException e) { }
        }
    }
 public   void fill(int row, int col, int replace, int replaceWith) {
        
        if (maze[row][col] == replace){
            maze[row][col] = replaceWith;
            fill(row+1,col,replace,replaceWith);
            fill(row-1,col,replace,replaceWith);
            fill(row,col+1,replace,replaceWith);
            fill(row,col-1,replace,replaceWith);
        }
    }
  
    public String print(int maze[][]) {
     if(maze==null){
     return  "No file loading ...";
     }else{
     String rt = "";
    for(int i = 0 ; i< maze.length ; i++){
      for(int j =0 ; j< maze[0].length ; j++){
       rt+= maze[i][j]+" " ;
      }
      rt+="\n";
     }
    return  rt ;
     }      
    }
    public int[][] dirty(int dirty, int[][]  map) {
       int count  = 0 ;
        boolean temp[][] = new boolean[map.length][map[0].length];
       // tao bien cua vi tra da co rac tranh trung lap du lieu
        int arr[] = new int[dirty*2]; 
        int arrcount = 0 ;
        Random rd = new Random();
        int x   ; 
        int y  ; 
        while(count < dirty) {  
               x  = (int)rd.nextInt(map.length); 
               y  = (int)rd.nextInt(map[0].length); 
               if(map[x][y]!=1 && temp[x][y]== false){
                   arr[arrcount] = x ;
                      arrcount++ ;
                   arr[arrcount] = y ;
                     arrcount++;
                  temp[x][y] =  true;
               count++;
               }
        }
        
        int k  = 0 ; 
        int res[][] = new int[dirty][2];
           for(int i = 0 ; i< res.length ;i++){
            for(int j = 0 ; j< res[0].length ; j++){
              res[i][j] = arr[k];
              k++;                      
            }
           }
           
        
//           res[0][0] =arr[0];
//           res[0][1]=arr[1];
//           res[1][0]=arr[2];
//           res[1][1]=arr[3]; 
//           res[2][0]=arr[4]; 
//           res[2][1]=arr[5]; 
//           res[3][0]=arr[6]; 
//           res[3][1]=arr[7]; 
//           res[4][0]=arr[8]; 
//           res[4][1]=arr[9]; 
//           res[5][0]=arr[10]; 
//           res[5][1]=arr[11];
             return  res;
             
    }
    public int soLuong(){
     return this.SOLUONGAGENT;
    }
public static void main(String [] ags) {
   RandomMap map = new RandomMap(15, 15) ;
    int temp[][] = map.createMap() ;
    System.out.print( map.print(temp));
 }
    
}
