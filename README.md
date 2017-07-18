TÌM ĐƯỜNG ĐI NGẮN BẰNG THUẬT TOAN A*  TRONG MÔI TRƯỜNG GIẢ LẬP NxN Ô VUÔNG  

NGÔN NGỮ JAVA

CÔNG CỤ LẬP TRÌNH : Netbaens 7.3.1

Giao diện game 

![gaiodien2](https://user-images.githubusercontent.com/28096471/28323487-27edb97e-6c03-11e7-9c44-86c11ba1d1fa.png)


#Hiện Thực :
1. Huỳnh Tính Thành - 14130111
2. Trương Tam Lang 

 Khoa Công nghệ thông tin  , Trường Đại học Nông Lâm TP .HCM 
 
 	1.Giới thiệu
Trong lý thuyết đồ thị, bài toán tìm đường đi ngắn nhất nguồn đơn là bài toán tìm đường đi giữa hai đỉnh sao cho tổng các trọng số của các cạnh tạo nên đường đi đó là nhỏ nhất.Từ trước đến nay có nhiều thuật toán để giải quyết bài toán này như Dijkstra, Bellman-Ford, Floyd-Warshall, A*….Ứng dụng các giải thuật vào môn học trí tuệ nhân tạo để giải quyết bài toán tìm đường đi nhóm em quyết định dùng thuật toán A* để xây dựng game “Người chăn cừu” nhầm nghiên cứu và áp dụng các giải thuật vào việc lập trình.


2.Mô Tả bài toán
Người chăn cừu là mini game với cốt truyện người chăn cừu bị bầy sói cướp mất hết cừu để giải cứu bầy cừu của mình người chăn cừu phải thu thập đủ 30 hạt đậu thần trước bầy sói
bắt đầu game người chăn cừu và bầy sói xuất phát ở những vị trí ngẫu nhiên trên bản đồ, bản đồ trong trò chơi có những bức tường chắc phân cách bản đồ thành những lối đi phức tạp. Người chơi dùng các phím điều khiển để nhặt các hạt đậu rơi trên bản đồ 
Hạt đậu thần sẽ được rơi vào các vị trí ngẫu nhiên trên bản đồ từ vị trí của mình cả hai bên phải tìm kiếm các bước đi phù hợp để tìm đến hạt đậu sớm hơn đối thủ. Mỗi lần một hạt đậu bị cướp thì một hạt mới sẽ xuất hiện.Nếu mỗi bên nhặt được liên tiếp 3 hạt đậu thì sẽ triệu gọi được một đồng minh hỗ trợ nhặt đậu, mỗi hạt đậu nhặt được sẽ được tính một điểm

3.Hiện thực

	3.1 Thuật toán áp dụng A*

A* là một thuật toán tìm kiếm trong đồ thị, tìm đường từ nút khởi đầu đến một nút đích cho trước sử dụng một hàm Heuristic ước lượng khoảng cách từ nút hiện tại đến nút đích (trạng thái đích), và nó duyệt đồ thị theo thứ tự ước lượng Heuristic này.

    3.2 Hiện thực bài toán

Thuật toán A* được áp dụng để giúp máy có thể tương tác và tìm những đường  đi hợp lý nhất để giành điểm trước người chơi.Máy được xây dựng như những Agent có thể phản xạ và tìm những đường đi hợp lý tránh chướng ngại vật, đối với máy là đồng minh nó có thể hỗ trợ người chơi giành điểm trước máy địch

4.Chi Tiết Hiện thực

TÓM TẮT : Trong bài báo này, em xin trình bài  một phương pháp tìm đường đi tối ưu từ điểm xuất phát đến đích  trong môi trường có vật cản bằng thuât toán A* hay còn được gọi là ‘’Vết dầu loang ‘’
Hàm “heuristics” dánh giá  vượt qua hoặc tránh chướng ngại vật
’Vết dầu loang ‘’sẽ loang theo đường tròn tức là những điểm cùng khoảng cách so với tâm vết loang thì vết dầu đến cùng lúc. Đây cũng là điều khá thú vị, bất kể điểm nào trên mặt nước có liên thông với với tâm vết dầu thì sẽ loang đến đó. 
Hàm “PathCode” tính tổng chi phí đường đi


1.1. Vấn đề di chuyển đường đi 

Trong không gian di chuyển được chia thành các ô hình vuông có các vật cản , tìm đường đi nhanh nhất từ ô xuất phát đến ô đích biết rằng  Con Sói  chỉ di chuyển được qua những ô có cạnh chung. Trong bài toán này cần định nghĩa các các vật cản xung quanh nó.  Với định nghĩa này Con Sói  có thể phát hiện được vật cản trong phạm vi bán kính nào đó gọi là bán kính quét. 

Ví dụ 1. Hình 1 mô tả bài toán tìm đường đi  từ ô A đến ô B trong không gian có kích thước hình chữ nhật MxN với các ô có vật cản được tô màu đen.

![2017-07-18_212530](https://user-images.githubusercontent.com/28096471/28322200-b01978a0-6bff-11e7-972e-4ad99ac982f2.png)


1.2. Lập luận nghiên cứu và phương pháp tiếp cận


Giải pháp của bài toán dựa trên 2 giai đoạn như sau:
Giai đoạn 1: Dựa trên thuật toán A* nguyên lý vết dầu loang để xây dựng ma trận chi phí đến đích:
Nguyên lý của dầu khi loang trên môi trường lỏng là loang đều ra các điểm xung quanh, những điểm ở gần         	được loang đến trước, những điểm ở ra được loang đến sau. 	 
	Ta xây dựng ma trận chi phí đến đích bằng cách bắt đầu loang từ vị trí đích. Cách làm này cho chúng 	ta biết được trước chi phí thời gian di chuyển từ một vị trí nào đó đến đích, do đó, cho phép ta chọn 	được đường đi tốt nhất từ vị trí đó đến đích nếu trên đường đi hiện tại xuất hiện vật cản.
       Quá trình loang bắt đầu từ ô đích. Con số trong mỗi ô thể hiện chi phí (số lần dịch chuyển) từ ô đó đến            đích.
       
 Hình 2 mô tả bài toán tìm đường đi với ô bắt đầu có màu xanh, ô đích có màu đỏ, các ô có vật cản có màu đen.



![2017-07-18_212752](https://user-images.githubusercontent.com/28096471/28322331-0c0c3cc4-6c00-11e7-8167-1ffabfa94f31.png)



![2017-07-18_212928](https://user-images.githubusercontent.com/28096471/28322416-419df260-6c00-11e7-94b4-796c71f4a023.png)


![img5](https://user-images.githubusercontent.com/28096471/28322509-8100e412-6c00-11e7-87af-c3c773531e91.png)


![mg6](https://user-images.githubusercontent.com/28096471/28322574-a7691458-6c00-11e7-8653-e93c43a95aad.png)


![img8](https://user-images.githubusercontent.com/28096471/28322716-02f7657c-6c01-11e7-9d61-db358991a2f8.png)


![mg10](https://user-images.githubusercontent.com/28096471/28322827-4fbf7e8a-6c01-11e7-9e90-81b62df76e7f.png)

