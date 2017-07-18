package model;

import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.imageio.ImageIO;


public class NhatVat extends View {
    public int posW;              //vị trí ban đầu theo x của board1 
    public int posH;               //vị trí ban đầu theo y của board1
    public boolean LaNguoiChoi;
    public boolean LaBenNao;         //true : là phe ta, địch là false
       
    public int KhoangNgauNhien;      //
    public int Huong;       //huong ngau nhien khi khong co dich
    public boolean  status  = false ; // trang thai co chay  
    private BufferedImage carDich, carTa ,carNC, diemKetThuc ;
    Random random = new Random();
    private  int SPRITE_ROWS = 5;
    private  int SPRITE_COLUMNS = 4;
    private  int DELAY = 250;

    private int DIM_W;
    private int DIM_H;

    private int x1Src;
    private int y1Src;
    private int x2Src;
    private int y2Src;

    private BufferedImage img;
    private int  tdH ;    // xat dinh huong di cua car
    private int  tdW  ;
    String action  ; 
    int levelGhost = 1 ; // thay doi icon con ma
    public NhatVat(int KhoangNgauNhien,int huong,int posW,int posH , boolean KoOrCo, boolean LaBenNao , boolean status) { 
        this.KhoangNgauNhien = KhoangNgauNhien;
        this.Huong= huong;
        this.posW = posW;
        this.posH = posH;
        this.LaNguoiChoi = KoOrCo;                             // Có phải là ô tô của người chơi hay không
        this.LaBenNao = LaBenNao;
        
        this.tdH =  posH ;
        this.tdW = posW ;
        this.action = "w" ;
        
        
        this.status = status ;
        
        if(KoOrCo){
            SPRITE_ROWS = 5;
            SPRITE_COLUMNS = 4;
         try {
            img = ImageIO.read(new File("man2.png"));
        } catch (IOException ex) {
            
        }
        }else{
             SPRITE_ROWS = 3;
            SPRITE_COLUMNS = 4;
            if(LaBenNao) {
            try {
            img = ImageIO.read(new File("efect/ta.png"));
        } catch (IOException ex) {
        }
            }else{
         try {
            img = ImageIO.read(new File("efect/conma1.png"));
        } catch (IOException ex) {
        }
        }
        }
        DIM_W = img.getWidth() / SPRITE_ROWS;
        DIM_H = img.getHeight() / SPRITE_COLUMNS;
        y1Src = 0;
        x2Src = x1Src + DIM_W;
        y2Src = y1Src + DIM_H ;
        javax.swing.Timer timer = new javax.swing.Timer(DELAY, new ActionListener() {
          
            public void actionPerformed(ActionEvent e) {
               
                  if (x1Src >= img.getWidth() - DIM_H - 5) {  // 5 to take care of precision loss
                    x1Src = 0;
                    x2Src = x1Src + DIM_W;
                      
                   } else {
                   //   System.out.println(x1Src +" " +y1Src + " || " +x2Src + " " +y2Src);
                    x1Src += DIM_W;
                    x2Src = x1Src + DIM_W;
                   }
                 
             
            }
        });
        timer.start();
    }
   // cat anh 
     public  void maychoi(int tdw , int tdh ,int w ,int  h) {
        String event = check(tdw, tdh, w, h) ;
       if(!action.equals(event)){ // kiem tra xem nhan vat co quay khong
         if(event.equals("w")){
                    y1Src = + DIM_H +DIM_H+DIM_H ;
                    y2Src = y1Src + DIM_H ;
                     action ="w" ;
              } else
             if(event.equals("d")){
              y1Src = +DIM_H +DIM_H;
                    y2Src = y1Src + DIM_H ;
                     action ="d" ;       
             }else
                 if(event.equals("s")){                     
                     y1Src = 0;
                     y2Src = y1Src + DIM_H ;         
                     action ="s" ;
                 }else
                     if(event.equals("a")) {
                       y1Src = + DIM_H;
                    y2Src = y1Src + DIM_H ;
                     action ="a" ;
                     }
        }
    }
    public  void nguoichoi(int tdw , int tdh ,int w ,int  h) {
        String event = check(tdw, tdh, w, h) ;
       if(!action.equals(event)){ // kiem tra xem nhan vat co quay khong
         if(event.equals("w")){
             y1Src = 0;
             y2Src = y1Src + DIM_H ;         
             action ="w" ;
         } else
             if(event.equals("d")){
                y1Src = + DIM_W;
                    y2Src = y1Src + DIM_H ;
                     action ="d" ;
             }else
                 if(event.equals("s")){
                    y1Src = +DIM_H +DIM_W;
                    y2Src = y1Src + DIM_H ;
                     action ="s" ;
                 }else
                     if(event.equals("a")) {
                   y1Src = + DIM_W +DIM_W+DIM_W;
                    y2Src = y1Src + DIM_H ;
                     action ="a" ;
                     }
        }
    }
    // kiem tra xem nhan vat di huong nao
    public String  check(int tdw , int tdh ,int w ,int  h) {
       if(w ==tdw && h!=tdH) {
         if(h <= tdh){
          return "w" ;
         }else{
          return  "s" ;
         }
       }
       if(h == tdh && w!=tdw){
         if(w<= tdw) {
          return  "a" ;
         }else{
          return  "d" ;
         }
       }
       return "underfound" ;
    }
    public static BufferedImage drop(BufferedImage img, int x1Src, int  y1Src,int  x2Src,int y2Src) { 
         int w = 300 ;
         int h  = 250 ;
    BufferedImage dimg = new BufferedImage(w,h, BufferedImage.TYPE_INT_ARGB);
    Graphics2D g2d = dimg.createGraphics();
    g2d.drawImage(img, 0, 0, w, h, x1Src, y1Src, x2Src, y2Src, null);
    g2d.dispose();
    return resize(dimg, 32, 32);
}  
    public static BufferedImage drop2(BufferedImage img, int x1Src, int  y1Src,int  x2Src,int y2Src) { 
         int w = img.getWidth()/5 ;
         int h  = img.getHeight()/4 ;
    BufferedImage dimg = new BufferedImage(w,h, BufferedImage.TYPE_INT_ARGB);
    Graphics2D g2d = dimg.createGraphics();
    g2d.drawImage(img, 0, 0, w, h, x1Src, y1Src, x2Src, y2Src, null);
    g2d.dispose();
    return dimg;
}  
    // thay doi kich thuoc hinh anh 
   public static BufferedImage resize(BufferedImage img, int newW, int newH) { 
    Image tmp = img.getScaledInstance(newW, newH, Image.SCALE_SMOOTH);
    BufferedImage dimg = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_ARGB);

    Graphics2D g2d = dimg.createGraphics();
    g2d.drawImage(tmp, 0, 0, null);

    return dimg;
   }   

    @Override
    public void Draw(Graphics g){
        if(LaNguoiChoi){
            nguoichoi(tdW, tdH, posW, posH);
            tdH = posH ;
            tdW =posW ;
           
            g.drawImage(drop(img, x1Src, y1Src, x2Src, y2Src), posW *DoRongDai.cellW, posH * DoRongDai.cellH, null);
           g.drawImage(drop2(img, x1Src, y1Src, x2Src, y2Src),DoRongDai.cellW*DoRongDai.countW +65, 100, null);

            //           System.out.println(" "+posW +"  -- " +posH );
       }    
        else if(LaBenNao == false){ 
            
             maychoi(tdW, tdH, posW, posH);
              // Nếu là đội địch
            tdH = posH ;
            tdW =posW ;
            g.drawImage(drop(img, x1Src, y1Src, x2Src, y2Src), posW *DoRongDai.cellW,posH * DoRongDai.cellH, null);
        } 
        else if(LaBenNao == true ){ 
              maychoi(tdW, tdH, posW, posH);
             tdH = posH ;
            tdW =posW ;
              g.drawImage(drop(img, x1Src, y1Src, x2Src, y2Src), posW *DoRongDai.cellW, posH * DoRongDai.cellH, null);// Nếu là Phe Ta             
           }
     
//        g.fillOval(posW *DoRongDai.cellW, posH * DoRongDai.cellH,DoRongDai.cellW,DoRongDai.cellH);    //vẽ chiếc xe
    //   if(DiemCuoi.DichConOrKhong){                   // Nếu đích còn thì mới vẽ ra chứ
           //try {
//               diemKetThuc = ImageIO.read(new File("thanh.png"));
        //        diemKetThuc = b.getImg() ;
          //  } catch (IOException ex) {
            //    Logger.getLogger(NhatVat.class.getName()).log(Level.SEVERE, null, ex);
             //}
           
        //g.drawImage(diemKetThuc, DiemCuoi.MucTieux *DoRongDai.cellW -15, DiemCuoi.MucTieuy * DoRongDai.cellH-15, null);
      // }
      // g.fillOval(DiemCuoi.MucTieux *DoRongDai.cellW, DiemCuoi.MucTieuy * DoRongDai.cellH,DoRongDai.cellW,DoRongDai.cellH);   //vẽ điềm kết thúc
        
     
   
       
    }  
      public void setImageLevel(BufferedImage img){
        this.img = img;
      }

    void botImg() {
        levelGhost++;
        if(levelGhost>6){
         levelGhost=6;
        }
        try {
            img = ImageIO.read(new File("efect/conma"+levelGhost+".png"));
        } catch (IOException ex) {
            Logger.getLogger(NhatVat.class.getName()).log(Level.SEVERE, null, ex);
        }
    } 
}