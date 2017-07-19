/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package media;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import sun.audio.AudioPlayer;
import sun.audio.AudioStream;

/**
 *
 * @author Huynh Thanh
 */
public class media { 
    public void amThanhTangDiemTa()  {
     InputStream is;
        try 
        {
               AudioStream as;
            is = new FileInputStream(new File("media/score.wav"));
              as = new AudioStream(is);
              AudioPlayer.player.start(as);
        } catch (IOException  ex) {
            Logger.getLogger(media.class.getName()).log(Level.SEVERE, null, ex);
        }
         
      
           
    }
       public void amThanhTangDiemDich()  {
     InputStream is;
        try 
        {
               AudioStream as;
            is = new FileInputStream(new File("media/score2.wav"));
              as = new AudioStream(is);
              AudioPlayer.player.start(as);
        } catch (IOException  ex) {
            Logger.getLogger(media.class.getName()).log(Level.SEVERE, null, ex);
        }
         
      
           
    }
          public void amThanhTangCapTa()  {
     InputStream is;
        try 
        {
               AudioStream as;
            is = new FileInputStream(new File("media/pheta.wav"));
              as = new AudioStream(is);
             AudioPlayer.player.start(as);
        } catch (IOException  ex) {
            Logger.getLogger(media.class.getName()).log(Level.SEVERE, null, ex);
        }
         
      
           
    }
            public void amThanhTangCapDich()  {
     InputStream is;
        try 
        {
               AudioStream as;
            is = new FileInputStream(new File("media/doiban.wav"));
              as = new AudioStream(is);
              AudioPlayer.player.start(as);
        } catch (IOException  ex) {
            Logger.getLogger(media.class.getName()).log(Level.SEVERE, null, ex);
        }
         
      
           
    }
    public static  void main(String[] a) {
            new media().amThanhTangDiemTa();
    }
}

