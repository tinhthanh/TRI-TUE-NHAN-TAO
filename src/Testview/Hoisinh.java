/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package Testview;



import java.awt.event.*;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
import javax.swing.JPanel;
import javax.swing.Timer;

public final class Hoisinh {
    private static final int SPRITE_ROWS = 5;
    private static final int SPRITE_COLUMNS = 4;
    private static final int DELAY = 200;

    private int DIM_W;
    private int DIM_H;
    private int x1Src;
    private int y1Src;
    private int x2Src;
    private int y2Src;
    private BufferedImage img;
    JPanel p ;
    public Hoisinh(final JPanel p) {   
        this.p = p;
        try {
            img = ImageIO.read(new File("efect/hoisinh2.png"));
        } catch (IOException ex) {
            
        }
        DIM_W = img.getWidth() / SPRITE_ROWS;
        DIM_H = img.getHeight() / SPRITE_COLUMNS;
        y1Src = 0;
        x2Src = x1Src + DIM_W;
        y2Src = y1Src + DIM_H ;
        Timer timer = new Timer(DELAY, new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                 if (x1Src >= img.getWidth() - DIM_H - 5) {  // 5 to take care of precision loss
                    x1Src = 0;
                    x2Src = x1Src + DIM_W;
                    if (y1Src >= img.getHeight() - DIM_H - 5) { // 5 to take care of precision loss
                        y1Src =  0;
                        y2Src = y1Src + DIM_H;
                    } else {
                        y1Src += DIM_H;
                        y2Src = y1Src + DIM_H;
                     }

                } else {
                    x1Src += DIM_W;
                    x2Src = x1Src + DIM_W;
                 }
                 p.repaint();
            }  
            
        });
        timer.start();
    }
   public BufferedImage getImg(){
     return drop(img, x1Src, y1Src, x2Src, y2Src);
   } 
   
   public static BufferedImage resize(BufferedImage img, int newW, int newH) { 
    Image tmp = img.getScaledInstance(newW, newH, Image.SCALE_SMOOTH);
    BufferedImage dimg = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_ARGB);

    Graphics2D g2d = dimg.createGraphics();
    g2d.drawImage(tmp, 0, 0, null);
    g2d.dispose();

    return dimg;
   }   
  
   public static BufferedImage drop(BufferedImage img, int x1Src, int  y1Src,int  x2Src,int y2Src) { 
         int w = img.getWidth()/5 ;
         int h  = img.getHeight()/6 ;
    BufferedImage dimg = new BufferedImage(w,h, BufferedImage.TYPE_INT_ARGB);

    Graphics2D g2d = dimg.createGraphics();
    g2d.drawImage(img, 0, 0, w, h, x1Src, y1Src, x2Src, y2Src, null);
    g2d.dispose();
    return dimg;
}  


//    public static void main(String[] args) {
//      
//                JFrame frame = new JFrame();
//                frame.add(new BigBang());
//                frame.setSize(600, 600);
//                frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
//              
//                frame.setLocationRelativeTo(null);
//                frame.setVisible(true);
//            }
       
    
}
