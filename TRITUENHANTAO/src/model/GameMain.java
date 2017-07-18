
package model;
import java.awt.*;
import java.awt.event.*;

import java.io.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.*;
import Testview.Mypanel;
import sun.audio.AudioPlayer;
import sun.audio.AudioStream;



class Mang        // class này lưu trữ tọa độ của n những chiếc xe đầu tiên, dc khởi tạo , và một số thứ ....
{
    static int [][] a;  // dt vi tri cac nhan vat
    static int n;  // so nhan vat
    static int x,y;  // vi tri cua nguoi choi
    static int DiemTa = 0 , DiemDich = 0;          // Điểm ban đầu của 2 đội bằng nhau và = 0.
    static int tuong;                              // cho biết , các hình ảnh ban đầu là gì; bằng cách dùng random
    static int speed  = 500;
} 

class DoRongDai{
    static int cellW = 32;                         //độ rộng của 1 ô
    static int cellH = 32;                         //độ cao của 1 ô.
    static int countW = 19;                        // số ô hàng ngang tối đa
    static int countH = 19;                        //số ô hàng dọc tối đa
    
    static int Them = 200;                         // thêm chiều ngang + 200
    static int [][] b;                             // Mảng này lưu tọa độ nhập từ file để vẽ map.
}


public class GameMain extends JFrame implements  MouseListener{
    // thanh
    Mypanel movex = new Mypanel();
    Mypanel movey = new Mypanel();
     Container cp = this.getContentPane();
        GameManager gm = new GameManager();
    // thanh
     public GameMain(){
        addMouseListener(this);
        initComponents();
        initEvents();
        initWindow();
    }
     private void initComponents() {
       
        //cp.setLayout(null);
        
     
        gm.setFocusable(true); //xem một thành phần có thể đạt được sự tập trung
        this.setLayout(new BorderLayout());   
           
          MoveLayerGame();
        
        cp.add(gm, BorderLayout.CENTER);
         cp.add(movex, BorderLayout.WEST);
         cp.add(movey, BorderLayout.NORTH);
    }
     // thanh v
     public void MoveLayerGame(){
           movex.setOpaque(false);           
           movey.setOpaque(false);
           movex.setPreferredSize(new Dimension(200, 0));
           movey.setPreferredSize(new Dimension(0, 80));
     }
     public  void setMoveLayer(int w, int h ){
     //  System.out.println(w+" "+ this.getWidth() +" "+h+"  "+this.getHeight());
     
         movex.setPreferredSize(new Dimension(w, 0));
         movey.setPreferredSize(new Dimension(0, h));
         cp.revalidate();
        
         
         
     }
     private void initEvents() {
    }  
    private void initWindow() {
        //this.setSize(300, 300);  
         this.setUndecorated(true);
   
       this.setExtendedState(JFrame.MAXIMIZED_BOTH); 
       this.setBackground(new Color(0, 0, 0, 0));
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.setVisible(true);
              
    }
    public static void main(String[] args) throws FileNotFoundException, IOException {
        final MoveRandom dc = new MoveRandom();
        int nhac = dc.RanDom(3);
        InputStream is = new FileInputStream(new File("media/gio.wav"));
            AudioStream as = new AudioStream(is);
            AudioPlayer.player.start(as);
                System.out.print(Mang.DiemDich +" -----------------------");
            javax.swing.Timer timer = new javax.swing.Timer(70000, new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                Mang.tuong = dc.RanDom(2);                                // Đổi Nhạc, đổi tường, đổi car
//                Mang.car = dc.RanDom(5);  
                InputStream is = null;
                try {
                    is = new FileInputStream(new File("media/gio.wav"));
                } catch (FileNotFoundException ex) {
                    Logger.getLogger(GameMain.class.getName()).log(Level.SEVERE, null, ex);
                }
                AudioStream as = null;
                try {
                    as = new AudioStream(is);
                } catch (IOException ex) {
                    Logger.getLogger(GameMain.class.getName()).log(Level.SEVERE, null, ex);
                }
                AudioPlayer.player.start(as);
            }
        }); 
        timer.start();   
                 
           new GameMain();
    }

 @Override
	public void mouseClicked(MouseEvent e) {
		
	}

	@Override
	public void mouseEntered(MouseEvent e) {
		
	}

	@Override
	public void mouseExited(MouseEvent e) {
		
	}

	@Override
	public void mousePressed(MouseEvent e) {
		int x = e.getX();
		int y = e.getY();
	//	System.out.println("Mouse Pressed at X: " + x + " - Y: " + y);
                setCursor(Cursor.getPredefinedCursor(Cursor.MOVE_CURSOR));
				repaint();
	}

	@Override
	public void mouseReleased(MouseEvent e) {
		int x = e.getX();
		int y = e.getY();
		//System.out.println("Mouse Released at X: " + x + " - Y: " + y);
                setMoveLayer(x, y);
                        repaint();
	}
   
}