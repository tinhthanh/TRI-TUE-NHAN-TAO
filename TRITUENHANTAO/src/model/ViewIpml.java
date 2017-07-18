
package model;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.imageio.ImageIO;
public class ViewIpml extends View{
    private BufferedImage anh, wall , nen , wing ,bangdiem ;
    public ViewIpml (){
 
    }
    @Override
    public void Draw(Graphics g) {          
        for (int i = 0; i < DoRongDai.countH; i++) {
            for (int j = 0; j < DoRongDai.countW; j++) {
                int x = j * DoRongDai.cellW;
                int y = i * DoRongDai.cellH;
                try {                  
                         nen = ImageIO.read(new File("grass1.png"));
                           g.drawImage(nen, x, y, DoRongDai.cellW, DoRongDai.cellH, null);
                    } catch (IOException ex) {
                        Logger.getLogger(ViewIpml.class.getName()).log(Level.SEVERE, null, ex);
                    }
                if( DoRongDai.b[i][j] == 1){              
                    try {
                   // wall = ImageIO.read(new File("wall"+Mang.tuong+".png"));
                        wall = ImageIO.read(new File("wall2.png"));
                } catch (IOException ex) {
                    Logger.getLogger(ViewIpml.class.getName()).log(Level.SEVERE, null, ex);
                }
                    g.drawImage(wall, x, y,32,32, null);
                }
                else if( DoRongDai.b[i][j] == 0  ){
                    
                }
            }
        }
         
       
       BufferedImage logout = null ;
        try {
            wing = ImageIO.read(new File("Angle.png"));
            logout = ImageIO.read(new File("efect/out.png"));
        } catch (IOException ex) {
            Logger.getLogger(ViewIpml.class.getName()).log(Level.SEVERE, null, ex);
        }
        g.drawImage(wing, DoRongDai.cellH*DoRongDai.countW,340 , null);
        
        
        
        
        g.drawImage(logout, DoRongDai.cellH*DoRongDai.countW+50,DoRongDai.cellH*DoRongDai.countH-32 , null);
        
        
        
        
        
        
        g.setColor(Color.WHITE);
        g.setFont(new Font("Serif", Font.PLAIN, 35));
        try {
                 bangdiem = ImageIO.read(new File("bangdiem.png"));
                    g.drawImage(bangdiem,DoRongDai.cellH*DoRongDai.countW, 170, null);
                    g.setColor(Color.BLACK);
                    g.drawString(""+ Mang.DiemTa,DoRongDai.cellH*DoRongDai.countW + 250, 300);
                   g.drawString(""+ Mang.DiemDich,DoRongDai.cellH*DoRongDai.countW+250, 340);
        } catch (IOException ex) {
            Logger.getLogger(ViewIpml.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        
    }
    
   

}

