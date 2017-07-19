/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package Testview;

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */



import java.awt.BorderLayout;
import java.awt.event.*;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.Timer;

public final class test extends JPanel {
    private static final int SPRITE_ROWS = 5;
    private static final int SPRITE_COLUMNS = 4;
    private static final int DELAY = 100;

    private int DIM_W;
    private int DIM_H;

    private int x1Src;
    private int y1Src;
    private int x2Src;
    private int y2Src;

    private BufferedImage img;

 Timer timer  ;
    public test() {
         this.setLayout(new BorderLayout());
         JButton b1 =new JButton("TREN");
          JButton b2 =new JButton("PHAI");
           JButton b3 =new JButton("DUOI");
            JButton b4 =new JButton("TRAI");
            JPanel p1 = new JPanel();
               p1.add(b1);
               p1.add(b2);
               p1.add(b3); 
               p1.add(b4);
      this.add(p1,  BorderLayout.SOUTH);
   
      b1.addActionListener(new ActionListener() {

             @Override
             public void actionPerformed(ActionEvent e) {
                   y1Src = 0;
                    y2Src = y1Src + DIM_H ;
                 }
         });
      b2.addActionListener(new ActionListener() {

             @Override
             public void actionPerformed(ActionEvent e) {
                  y1Src = + DIM_W;
                    y2Src = y1Src + DIM_H ;
                 }
         });
      b3.addActionListener(new ActionListener() {

             @Override
             public void actionPerformed(ActionEvent e) {
                    y1Src = +DIM_H +DIM_W;
                    y2Src = y1Src + DIM_H ;
                 }
         });
      b4.addActionListener(new ActionListener() {

             @Override
             public void actionPerformed(ActionEvent e) {
                   y1Src = + DIM_W +DIM_W+DIM_W;
                    y2Src = y1Src + DIM_H ;
                 }
         });

        try {
            img = ImageIO.read(new File("efect/phaohoa.png"));
        } catch (IOException ex) {
            
        }
        DIM_W = img.getWidth() / SPRITE_ROWS;
        DIM_H = img.getHeight() / SPRITE_COLUMNS;
        y1Src = 0;
        x2Src = x1Src + DIM_W;
        y2Src = y1Src + DIM_H ;
         timer = new Timer(DELAY, new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                 if (x1Src >= img.getWidth() - DIM_H - 5) {  // 5 to take care of precision loss
                    x1Src = 0;
                    x2Src = x1Src + DIM_W;
                    if (y1Src >= img.getHeight() - DIM_H - 5) { // 5 to take care of precision loss
                        y1Src =  0;
                        y2Src = y1Src + DIM_H;
                       //  stop();
                    } else {
                        y1Src += DIM_H;
                        y2Src = y1Src + DIM_H;
                     }

                } else {
                    x1Src += DIM_W;
                    x2Src = x1Src + DIM_W;
                 }
                 
                repaint();
            }
        });
       
        timer.start();
        
    }
    public void stop(){
    
    timer.stop();
    }
    
  
   public static BufferedImage drop(BufferedImage img, int x1Src, int  y1Src,int  x2Src,int y2Src) { 
         int w = 300 ;
         int h  = 250 ;
    BufferedImage dimg = new BufferedImage(w,h, BufferedImage.TYPE_INT_ARGB);

    Graphics2D g2d = dimg.createGraphics();
    g2d.drawImage(img, 0, 0, w,h, x1Src, y1Src, x2Src, y2Src, null);
    g2d.dispose();
    return dimg;
}  
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        g.drawImage( drop(img, x1Src, y1Src, x2Src, y2Src), 0, 0, null);
    }

    @Override
    public Dimension getPreferredSize() {
        return (img == null) ? new Dimension(600, 600) : new Dimension(DIM_W, DIM_H);
    }

    public static void main(String[] args) {
      
                JFrame frame = new JFrame();
                frame.add(new test());
                frame.setSize(600, 600);
                frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
              
                frame.setLocationRelativeTo(null);
                frame.setVisible(true);
            }
       
    
}
