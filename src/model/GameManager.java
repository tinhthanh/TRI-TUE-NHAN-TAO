
package model;

import Map.RandomMap;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.Area;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;
import java.util.logging.*;
import javax.swing.*;
import media.media;
import Testview.BigBang;
import Testview.Hoisinh;
import Testview.Locxoay;

final class GameManager extends JPanel implements Runnable ,    MouseListener{ 
    public NhatVat carNC;
    public ViewIpml board1 = new ViewIpml();
    MoveRandom dc = new MoveRandom();
    
   public Map <String,NhatVat> map = new HashMap<>();                    // Map này liên hệ giữa tên và chiếc car
    public Map <String,Astart> map1 = new HashMap<>();             // Mao này liên hẹ giữa tên car và thuật toán. 2 tên là cùng 1 car.
    private Thread threadT;
    
    public static float ThoiGianGame = 0;                             // Thời gian bắt đầu
public static float ThoiGianDich =0;                             // Thời gian để khởi tạo lại đích
    
   
   
    Locxoay locxouay ;
    BigBang big; 
    Hoisinh hoisinh ;
    
    media tangdiem = new media();
    public GameManager(){
        this.addMouseListener(this);
        // lam trong suot
       this.setOpaque(false); 
       // lam trong suot
      locxouay   = new Locxoay(this);
      big= new BigBang(this);
      hoisinh = new Hoisinh(this);
//     
       CacGiaTriKhoiDau();                                           // Các giá trị khởi đầu cho game
       addComponent();                                               //thêm các xe của máy
       for(String key: map1.keySet()) {  
           // cho các xe máy chạy thuật toán tìm kiếm A Sao
           if(map.get(key).status){        
           map1.get(key).ChayThuatToan();
           }
       }
       
       DiChuyenCarnguoiChoi();                                       //Người chới dc phép di chuyện
         
       threadT = new Thread(this);
       threadT.start();                                            //khi goi lenh nay se duoc chuyen den phuong thuc run() phia duoi
        
       
       
    }
    public void addComponent(){        
        //hàm này chứa các xe của phe mình và phe địch 
        for(int i = 0 ; i< Mang.n ; i++){
         for(int j =0 ; j< 1 ; j++){
             if(  i < (Mang.n/2)){
            map.put("nhanvat"+i,new NhatVat(5,2,Mang.a[i][j],Mang.a[i][j+1],false ,false , false)); 
            map1.put("nhanvat"+i, new Astart(Mang.a[i][j],Mang.a[i][j+1]));
             }else{
            map.put("nhanvat"+i,new NhatVat(5,2,Mang.a[i][j],Mang.a[i][j+1],false ,true , false)); 
            map1.put("nhanvat"+i, new Astart(Mang.a[i][j],Mang.a[i][j+1]));
             }
         }
          map.get("nhanvat0").status= true;
        }
//        map.put("NhatVat",new NhatVat(5,2,Mang.a[0][0],Mang.a[0][1],false ,false , true)); 
//        map1.put("NhatVat", new Astart(Mang.a[0][0],Mang.a[0][1]));
//        map.put("Car1",new NhatVat(5,2,Mang.a[1][0],Mang.a[1][1],false, false , false));  map1.put("Car1", new Astart(Mang.a[1][0],Mang.a[1][1]));
//        map.put("Car2",new NhatVat(5,2,Mang.a[2][0],Mang.a[2][1],false ,false , false));  map1.put("Car2", new Astart(Mang.a[2][0],Mang.a[2][1]));
//        map.put("Car3",new NhatVat(5,2,Mang.a[3][0],Mang.a[3][1],false, true , false));   map1.put("Car3", new Astart(Mang.a[3][0],Mang.a[3][1]));
//        map.put("Car4",new NhatVat(5,2,Mang.a[4][0],Mang.a[4][1],false , true , false));  map1.put("Car4", new Astart(Mang.a[4][0],Mang.a[4][1]));
//        map.put("Car5",new NhatVat(5,2,Mang.a[5][0],Mang.a[5][1],false , true ,false));  map1.put("Car5", new Astart(Mang.a[5][0],Mang.a[5][1]));
    }
    
    @Override
       protected  synchronized   void paintComponent(Graphics g) {
       
            super.paintComponent(g);          
            // lam trong suot
		Graphics2D g2d = (Graphics2D) g.create();
		g2d.setColor(new Color(0,0, 0, 170));
               
		Area fill = new Area(new Rectangle(new Point(0, 0), getSize()));
                // end lam trong suot
                
                
		g2d.fill(fill);
	
                
                
                g2d.dispose();
                // end 
            board1.Draw(g);
            
            carNC.Draw(g);
            for(String key: map.keySet()){
                if(map.get(key).status){
                map.get(key).Draw(g);
                }
            }
             
              
              //  } catch (IOException ex) {
                //    Logger.getLogger(NhatVat.class.getName()).log(Level.SEVERE, null, ex);
                 //}
               
            g.drawImage( big.getImg() , MucTieu.MucTieux *DoRongDai.cellW -45, MucTieu.MucTieuy * DoRongDai.cellH-65, null);
         
              g.drawImage(locxouay.getImg(),50,50, null);
              
      
            g.drawImage(hoisinh.getImg(),DoRongDai.cellW*DoRongDai.countW , 55, null);
        
        
    }
    public Dimension getPreferredSize() {       
        return new Dimension(DoRongDai.countW* DoRongDai.cellW + DoRongDai.Them,DoRongDai.countH *DoRongDai.cellH);
    }
    @Override
    public void run() {   
        int count  =  0  ;
       while(true){
         if(MucTieu.isMucTieu){
            
             System.out.print("Vitri Muc tieu " + MucTieu.MucTieux + " " + MucTieu.MucTieuy) ;
            for(String key : map.keySet()){
             //  if(map1.get(key).getTrunggian().isThanh()){
               map.get(key).posW = map1.get(key).getTrunggian().getFX();
               map.get(key).posH = map1.get(key).getTrunggian().getFY();
               if(map1.get(key).getTrunggian().getChildren() == null )           // nếu con của nó là null, cho nó  = target
                   map1.get(key).setTrunggian(map1.get(key).getTarget());       
               else                                                             // nếu nó có con, thò cho nó bằng con
                   map1.get(key).setTrunggian(map1.get(key).getTrunggian().getChildren());   

//            }else{
//                map1.remove(key);
//                 map.remove(key);
//                }
            }
            
           }else {            //Đây là khoảng thời gian không có đích nên chúng di chuyển ngẫu nhiên....
            for(String key : map.keySet()){
                   map.get(key).KhoangNgauNhien --;           
                   if(map.get(key).KhoangNgauNhien ==  0 ){
                       map.get(key).Huong = dc.TimHuongPhuHop(map.get(key).posW,map.get(key).posH);
                       map.get(key).KhoangNgauNhien = 3 + (int) (Math.random() * 5);              
                   }
                  if(map.get(key).KhoangNgauNhien > 0 ){
                       if(map.get(key).Huong == 1  && map.get(key).posW < DoRongDai.countW - 1 && !dc.KiemTra(map.get(key).posH,map.get(key).posW + 1))       
                           map.get(key).posW ++;       //đi sang phải
                       else if(map.get(key).Huong == 2  && map.get(key).posH < DoRongDai.countH - 1 && !dc.KiemTra(map.get(key).posH + 1,map.get(key).posW))   
                           map.get(key).posH ++;       // đi xuông
                       else if(map.get(key).Huong == 3  && map.get(key).posW >0 && !dc.KiemTra(map.get(key).posH,map.get(key).posW - 1))
                           map.get(key).posW --;        //di sang trai
                       else if(map.get(key).Huong == 4 && map.get(key).posH >0&& !dc.KiemTra(map.get(key).posH - 1,map.get(key).posW))   
                           map.get(key).posH --;        // di len tren                        
                   }                                 
                }     
        }
        
        // Nếu như chiếc xe chạm đích thì sẽ cộng 1 điểm và đích sẽ bị mất đi ....
        if(MucTieu.isMucTieu){
            if(dc.SoSanh(carNC.posW, carNC.posH, MucTieu.MucTieux, MucTieu.MucTieuy)){       ///nếu người chơi chạm đích
                    Mang.DiemTa ++;
                  
                       System.out.println();
                                      count++ ;
             System.out.println(count );
             System.out.println( "["+MucTieu.MucTieux + "  "+MucTieu.MucTieuy+"]") ;
                     
                     
                    tangdiem.amThanhTangDiemTa();
                       if(Mang.DiemTa%3==0){
                         for(String k : map.keySet()){
                             if(map.get(k).status == false && map.get(k).LaBenNao==true) {
                                  map.get(k).status = true;
                                  tangdiem.amThanhTangCapTa();
                                break; 
                             }  
                            }
                             }
                    
                    MucTieu.isMucTieu = false ;
                    ThoiGianDich = 0; 
            }
            else{
            for(String key : map.keySet()){      // Nếu đích đang còn thì mới cộng điểm        
                if(map.get(key).status == true) { // chi nhung vaccum dc phep chay
                if(dc.SoSanh(map.get(key).posW , map.get(key).posH, MucTieu.MucTieux, MucTieu.MucTieuy)){         
                    if(map.get(key).LaBenNao) {                    //Nếu là phe ta, thì cộng 1 điểm
                        Mang.DiemTa ++;
                          System.out.println();
                         count++ ;
             System.out.println(count );
             System.out.println( "["+MucTieu.MucTieux + "  "+MucTieu.MucTieuy+"]") ;
                        tangdiem.amThanhTangDiemTa(); 
                        if(Mang.DiemTa%3==0){
                         for(String k : map.keySet()){
                             if(map.get(k).status == false && map.get(k).LaBenNao==true) {
                                  map.get(k).status = true;
                                  tangdiem.amThanhTangCapTa();
                                break; 
                             }  
                            }
                            
                             }
                            if(Mang.DiemTa==12){
                            JOptionPane.showMessageDialog(null,
        "Bạn đã thắng ",
        "Backup problem",
        JOptionPane.INFORMATION_MESSAGE);
    System.exit(0);
                            }
                        
                    
                    }else if(!map.get(key).LaBenNao){
                        Mang.DiemDich ++;
                        
                                        count++ ;
                                        System.out.println();
             System.out.println(count );
             System.out.println( "["+MucTieu.MucTieux + "  "+MucTieu.MucTieuy+"]") ;
             
             
                         tangdiem.amThanhTangDiemDich();
                            map.get(key).botImg();
                         if(Mang.DiemDich%2==0){
                             Mang.speed-=50 ;
                             if( Mang.speed  < 100) {
                              Mang.speed+=50;
                             }
                            
                            for(String k : map.keySet()){
                             if(map.get(k).status == false && map.get(k).LaBenNao==false) {
                                  map.get(k).status = true;
                                   tangdiem.amThanhTangCapDich();                                 
                                break; 
                             }  
                            }
                         }
                        if(Mang.DiemDich==12){
                             JOptionPane.showMessageDialog(null,
        "Bạn đã thua ",
        "Backup problem",
        JOptionPane.INFORMATION_MESSAGE);
    System.exit(0);
                            }
                    }
                    MucTieu.isMucTieu = false ;             // Điểm cuối sẽ không còn nữa, vì bị bọn nó ăn mất rồi, bọn xe sẽ lại di chuyển ngẫu nhiên
                        ThoiGianDich = 0;                             // khởi tạo lại thời gian đích
                } 
                }
            }
            }         
        }    
        //  Sau 1 khoảng thời gian thì đích thay đổi , ...
        if(!MucTieu.isMucTieu )           //Nếu không còn đích
             ThoiGianDich += 0.5;  
        if(ThoiGianDich % 6.0f == 0 && ThoiGianDich != 0){        //Vì 0 chia hết cho tất cả các số
             
             ThoiGianDich = 0;                                   // Lại khởi tạo lại thời gian đích
             MucTieu.isMucTieu = true;                     // Sau 1 khoảng thời gian thì đích lại có
              while(true)
                {
                    MucTieu.MucTieux = (int) (Math.random() * DoRongDai.countW);            //Tạo 1 điểm ngẫu nhiên cho diểm cuối
                    MucTieu.MucTieuy = (int) (Math.random() * DoRongDai.countH);            // Nhưng nó không phải là tường
                    
                    if(dc.KiemTra(MucTieu.MucTieuy,MucTieu.MucTieux) ==  false)            //neu la duong di, thì break..
                         break;
                }
                for(String key : map1.keySet()){
                    if(map.get(key).status){
                   int x = map.get(key).posW;                    // Lưu lại tọa độ hiện tại
                   int y = map.get(key).posH;
                   map1.get(key).clear();                        // Clear lại thuật toán, vì điểm cuối đã thay đổi rồi...
                   map1.get(key).initThuatToan(x, y);            // Khởi tạo lại thuật toán với toa độ ban đầu là x,y
                   map1.get(key).ChayThuatToan();                // Chạy thuật toán lại
                   
                }
                }
        }                         
           try {
               threadT.sleep(Mang.speed);
           } catch (InterruptedException ex) {
               Logger.getLogger(GameManager.class.getName()).log(Level.SEVERE, null, ex);
           }      
           repaint(); 
           ThoiGianGame += 0.5f;                              // Thời gian thực của Game
         
       }
    }
    
   
    
   public void CacGiaTriKhoiDau(){
       Mang.tuong = dc.RanDom(39);                                  // random các loại tường
//       Mang.car = dc.RanDom(5);                                    // random cac loại car
       NhapMapTuFile("map7.txt");                   //nhập map và tọa độ các xe  : map là random.....từ 1 trong 20 map
       carNC = new NguoiChoi(4,1,Mang.x,Mang.y,true,true,true);      // sau khi nhập file thì ta mới có tọa độ của carNC, nên nó phải đặt ở dưới
   }   
    private void DiChuyenCarnguoiChoi() {
        this.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
               int key = e.getKeyCode();
                if(key == KeyEvent.VK_ENTER){
                     // Mang.a[carNC.posW][carNC.posH] = 1;
                  System.out.println("\n"+ carNC.posW +" "+carNC.posH);
                   
                }
                if (key == KeyEvent.VK_LEFT  ||key == KeyEvent.VK_A){
                    if (carNC.posW > 0 && !dc.KiemTra(carNC.posH,carNC.posW-1)){
                    carNC.posW--;
                }}
                else if (key == KeyEvent.VK_RIGHT ||key == KeyEvent.VK_D){
                   if( carNC.posW < DoRongDai.countW-1 && !dc.KiemTra(carNC.posH,carNC.posW+1)){
                    carNC.posW++;
                }
                } else if (key == KeyEvent.VK_UP ||key == KeyEvent.VK_W){
                    if(carNC.posH > 0 && !dc.KiemTra(carNC.posH - 1,carNC.posW))
                {    carNC.posH--;
                }
                }else if (key == KeyEvent.VK_DOWN ||key == KeyEvent.VK_S ){ if(carNC.posH < DoRongDai.countH-1 && !dc.KiemTra(carNC.posH + 1,carNC.posW))
                {   carNC.posH++;
                }
                }
                repaint();
            }
        });     
   } 
   public void NhapMapTuFile1(String tenFile){
    
            Mang.x = 1;               // tọa độ xe người chơi : x,y
            Mang.y = 1;
            MucTieu.MucTieux = 1;   // tọa độ điểm cuối : target : x,y
            MucTieu.MucTieuy = 1;
            
            
           RandomMap createmap = new RandomMap(DoRongDai.countW,DoRongDai.countH);
            
            System.out.print("Target Fx " + MucTieu.MucTieux + " " + MucTieu.MucTieuy );
            Mang.n = createmap.soLuong(); // so luong agent
             int demo[][] = createmap.createMap() ;
            Mang.a = createmap.dirty(Mang.n, demo);

            System.out.println("");
             System.out.println(createmap.print(demo));
          DoRongDai.b = demo;
          // thanh
//            for(int i = 0; i < DoRongDai.countW ; i++){
//                for(int j = 0; j< DoRongDai.countH ; j++){
//                    DoRongDai.b[i][j] = sc.nextInt();
//                }}
            
      
    }
      public void NhapMapTuFile(String tenFile){
        Mang.x = 1;               // tọa độ xe người chơi : x,y
            Mang.y = 1;
            MucTieu.MucTieux = 1;   // tọa độ điểm cuối : target : x,y
            MucTieu.MucTieuy = 1;
            
            
           RandomMap createmap = new RandomMap(DoRongDai.countW,DoRongDai.countH);
            
            System.out.print("Target Fx " + MucTieu.MucTieux + " " + MucTieu.MucTieuy );
            Mang.n = createmap.soLuong(); // so luong agent
            
            
            
             int demo[][] = null;
        try {
            BufferedReader bfr = new BufferedReader(new FileReader(tenFile));
            String line  =  bfr.readLine() ;
            demo = new int[Integer.valueOf(line)][Integer.valueOf(line)];
            int i  = 0 , j=0 ;
            while((line = bfr.readLine())!=null){
            StringTokenizer token  = new StringTokenizer(line, " ");
            j=0 ;
            while(token.hasMoreTokens()) {
                demo[i][j] = Integer.valueOf(token.nextToken()) ;
              j++;
            } i++;
            }
        } catch (IOException  ex) {
            Logger.getLogger(GameManager.class.getName()).log(Level.SEVERE, null, ex);
        }
             
             
            Mang.a = createmap.dirty(Mang.n, demo);
          
            System.out.println("");
             DoRongDai.b = demo;
             System.out.println(createmap.print(demo));
            
    }

	public void mouseClicked(MouseEvent e) {
		int x = e.getX();
		int y = e.getY();
		System.out.println("Mouse Clicked at X: " + x + " - Y: " + y);
                Rectangle res = new Rectangle(DoRongDai.cellH*DoRongDai.countW+50,DoRongDai.cellH*DoRongDai.countH-30 ,90,30);
               if(res.contains(x,y)){
                System.exit(1);
               }
        }

	@Override
	public void mouseEntered(MouseEvent e) {
		int x = e.getX();
		int y = e.getY();
		System.out.println("Mouse Entered frame at X: " + x + " - Y: " + y);
	}

	@Override
	public void mouseExited(MouseEvent e) {
		int x = e.getX();
		int y = e.getY();
		System.out.println("Mouse Exited frame at X: " + x + " - Y: " + y);
	}

	@Override
	public void mousePressed(MouseEvent e) {
		int x = e.getX();
		int y = e.getY();
		System.out.println("mousePressed X: " + x + " - Y: " + y);
	}

	@Override
	public void mouseReleased(MouseEvent e) {
		int x = e.getX();
		int y = e.getY();
		System.out.println("Mouse Released at X: " + x + " - Y: " + y);   
	}
  
}
