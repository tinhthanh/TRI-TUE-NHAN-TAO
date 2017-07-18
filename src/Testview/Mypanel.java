package Testview;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.geom.Area;
import javax.swing.JPanel;
public class Mypanel extends JPanel {
	Image backgound;
	   public Mypanel() {
		// TODO Auto-generated constructor stub		   
	}
	 
	@Override
	protected void paintComponent(Graphics g) {
		super.paintComponent(g);	
		if (backgound != null) {
			g.drawImage(backgound, 0, 0, null);
		}
                	Graphics2D g2d = (Graphics2D) g.create();
		g2d.setColor(new Color(0, 0, 0, 170));
		Area fill = new Area(new Rectangle(new Point(0, 0), getSize()));
                // end lam trong suot
                
//		if (selectionBounds != null) {
//			fill.subtract(new Area(selectionBounds));
//		}
		g2d.fill(fill);
//		if (selectionBounds != null) {
//			g2d.setColor(Color.BLACK);
//			g2d.draw(selectionBounds);
//		}
		g2d.dispose();
}
	public void setBackGound(Image img) {
		backgound = img;
		repaint();
	}
}