# BÁO CÁO CÔNG VIỆC THÁNG 9/2026

Người thực hiện: Hoàng Tuấn Minh  
Vị trí: Fullstack Developer  
Dự án: Hệ thống giám sát và quản trị sản xuất MES DRC  
Thời gian báo cáo: Từ ngày 01/09/2026 đến ngày 30/09/2026

## 1. Nội dung công việc chung trong tháng

Trong tháng 9, công việc của tôi tập trung vào hai phần chính là làm, chỉnh sửa dashboard và viết tài liệu hướng dẫn cho hệ thống. Trong khoảng 10 ngày đầu tháng, tôi chủ yếu xử lý các vấn đề trên dashboard, từ bố cục giao diện, biểu đồ thống kê, bộ lọc dữ liệu đến tốc độ tải và cách trình bày số liệu. Các phần được tập trung nhiều là dashboard tổng quan, báo cáo kế hoạch và sản lượng của xưởng Cắt vải, Thành hình, báo cáo sản xuất theo năm và phần lịch sử thông số hoạt động của máy.

Sau giai đoạn chỉnh sửa dashboard, tôi chuyển dần sang rà soát các chức năng để chuẩn bị viết hướng dẫn. Công việc từ giữa tháng đến cuối tháng chủ yếu là tổng hợp lại cách sử dụng website, mô tả các thao tác trên từng màn hình, viết hướng dẫn cài đặt và chạy dự án, đồng thời viết hướng dẫn deploy để phục vụ việc triển khai và tiếp nhận hệ thống sau này.

Khi làm tài liệu, tôi tập trung vào những nội dung người đọc thực sự cần để có thể làm theo, như vào chức năng ở đâu, chọn bộ lọc thế nào, đọc số liệu ra sao, cần chuẩn bị gì trước khi chạy dự án và kiểm tra những gì khi đưa website lên máy chủ. Tôi cũng dành thời gian chỉnh lại cách diễn đạt để tài liệu dễ hiểu với cả người sử dụng phần mềm và người phụ trách kỹ thuật.

## 2. Tuần 1: Từ ngày 01/09 đến ngày 06/09

### Công việc chính: Làm và chỉnh sửa dashboard

Trong tuần đầu tiên của tháng, tôi tập trung vào các màn hình dashboard đang được sử dụng để theo dõi tình hình sản xuất. Tôi xem lại cách sắp xếp các khối thông tin, cách hiển thị kế hoạch và sản lượng thực tế, các biểu đồ theo thời gian và phần thống kê trạng thái thiết bị. Mục tiêu là để người dùng mở dashboard lên có thể nhìn được các thông tin cần thiết, đồng thời hạn chế việc phải thao tác nhiều mới xem được số liệu của từng công đoạn.

Một phần công việc trong tuần là chỉnh sửa báo cáo sản xuất nhiều năm. Tôi thực hiện cập nhật báo cáo từ phạm vi 5 năm sang hiển thị 10 năm liên tiếp, đồng bộ lại phần lấy dữ liệu và phần biểu đồ trên giao diện. Khi người dùng chọn năm mốc, báo cáo thể hiện dải năm tương ứng để thuận tiện theo dõi biến động sản lượng trong thời gian dài. Với những năm không có dữ liệu, phần hiển thị vẫn giữ đủ mốc năm để biểu đồ không bị thiếu cột hoặc làm người xem hiểu nhầm về khoảng thời gian thống kê.

Tôi chỉnh lại biểu đồ theo hướng sử dụng biểu đồ cột rõ ràng, thể hiện sản lượng từng năm và bổ sung bảng số liệu bên dưới. Trong quá trình sửa, tôi điều chỉnh khoảng cách giữa các cột, nhãn số liệu và phần hiển thị trên màn hình nhỏ. Những chi tiết trang trí làm biểu đồ rối hoặc khó theo dõi được lược bớt để người sử dụng tập trung vào số liệu. Tên menu cũng được cập nhật cho phù hợp với nội dung báo cáo 10 năm.

Đối với bộ lọc máy, tôi tách riêng lựa chọn của Cắt vải và Thành hình. Trước đó, việc dùng chung bộ lọc có thể khiến thao tác ở một khu vực ảnh hưởng đến phần còn lại, làm người dùng khó đối chiếu hai công đoạn. Sau khi điều chỉnh, mỗi khu vực có bộ chọn máy riêng và tải lại dữ liệu theo lựa chọn tương ứng. Cách này giúp người xem có thể kiểm tra một máy cụ thể của Cắt vải trong khi vẫn giữ được thông tin đang xem của Thành hình.

Tôi cũng sửa nội dung hiển thị khi di chuột lên biểu đồ. Phần thông tin này được làm rõ hơn về sản lượng thực tế, mức tăng hoặc giảm so với năm trước và tỷ lệ phần trăm tương ứng. Với trường hợp năm trước không có sản lượng, cần xử lý riêng để tránh đưa ra một tỷ lệ tăng trưởng không có ý nghĩa. Đây là chi tiết nhỏ trên giao diện nhưng ảnh hưởng trực tiếp đến cách người dùng hiểu số liệu, nên tôi dành thời gian rà soát lại cách tính và cách diễn đạt.

Về hình thức, tôi chỉnh phông chữ, độ đậm, khoảng cách và một số thành phần chọn dữ liệu để chữ tiếng Việt hiển thị dễ đọc hơn. Các bộ lọc, nút bấm và nhãn trên biểu đồ được điều chỉnh để thống nhất với nhau. Tôi chú ý đến những vị trí chữ bị quá đậm hoặc chen chúc, vì dashboard có nhiều thông tin nên nếu cách trình bày không rõ thì người dùng sẽ khó theo dõi trong quá trình làm việc.

Một nội dung khác là điều chỉnh thời gian mặc định của phần lịch sử thông số hoạt động máy. Khoảng thời gian ban đầu được đổi từ 24 giờ về 12 giờ gần nhất ở các màn hình liên quan đến máy Thành hình và Cắt vải. Việc này giúp khi mở lịch sử, người dùng xem ngay được khoảng dữ liệu gần với thời điểm đang vận hành, đồng thời thu hẹp lượng dữ liệu cần truy vấn ban đầu.

Bên cạnh giao diện, tôi xử lý cách tải dữ liệu của dashboard. Những nguồn dữ liệu độc lập được tổ chức gọi song song để từng khu vực có thể hiển thị khi nhận được kết quả. Nhờ đó, một phần dữ liệu trả về chậm không nhất thiết làm toàn bộ dashboard phải chờ theo. Tôi cũng rà soát cơ chế cập nhật tự động và phần ghi nhận thời gian phản hồi để thuận tiện theo dõi khi cần kiểm tra lỗi.

Trong tuần, tôi đối chiếu các nhóm số liệu kế hoạch, sản lượng thực tế, tỷ lệ hoàn thành và trạng thái máy với nguồn dữ liệu liên quan. Việc kiểm tra tập trung vào các màn hình đang chỉnh sửa để bảo đảm nội dung hiển thị phù hợp với bộ lọc và thời gian được chọn. Song song với đó, tôi điều chỉnh bố cục trên màn hình nhỏ, bổ sung vùng cuộn ngang cho biểu đồ hoặc bảng có nhiều cột, tránh việc cố ép toàn bộ dữ liệu vào một khung quá hẹp.

Sau các thay đổi, tôi thực hiện đóng gói frontend để kiểm tra khả năng biên dịch của dự án. Theo nhật ký đầu tháng, bản dựng đã được tạo và cập nhật lên web server nội bộ để kiểm tra lại phần hiển thị và kết nối API. Đây cũng là cơ sở để tổng hợp những bước triển khai cần đưa vào tài liệu ở giai đoạn cuối tháng.

### Kết quả trong tuần

Trong tuần đầu, công việc tập trung nhiều nhất vào dashboard và các báo cáo liên quan. Báo cáo sản xuất 10 năm đã được điều chỉnh về dữ liệu, biểu đồ và bộ lọc; phần lịch sử máy được thay đổi thời gian mặc định; giao diện được chỉnh lại để dễ đọc hơn. Cách tải dữ liệu và cách trình bày trên thiết bị có màn hình nhỏ cũng được rà soát, tạo nền tảng cho việc tiếp tục hoàn thiện trong những ngày đầu tuần tiếp theo.

## 3. Tuần 2: Từ ngày 07/09 đến ngày 13/09

### Công việc chính: Tiếp tục sửa dashboard trong các ngày 07–10/09, sau đó chuyển sang chuẩn bị tài liệu

Trong những ngày đầu tuần thứ hai, tôi tiếp tục dành phần lớn thời gian cho việc sửa và hoàn thiện dashboard. Sau các thay đổi của tuần trước, công việc lúc này tập trung vào rà soát những chi tiết còn chưa đồng đều giữa các màn hình, đặc biệt là cách chọn thời gian, chọn máy, đọc thông tin trên biểu đồ và chuyển qua lại giữa các báo cáo.

Tôi xem lại các luồng thao tác thường dùng như mở trang tổng quan, chọn báo cáo theo tháng hoặc năm, thay đổi bộ lọc và xem dữ liệu của từng công đoạn. Trong quá trình này, tôi chú ý đến việc bộ lọc đang chọn có dễ nhận biết hay không và số liệu hiển thị có làm người dùng nhầm giữa dữ liệu tổng hợp với dữ liệu của một máy cụ thể hay không. Các điểm chưa rõ được ghi lại để chỉnh sửa hoặc giải thích thêm trong hướng dẫn sử dụng.

Phần giao diện tiếp tục được rà soát ở những vị trí có nhiều thông tin. Tôi tập trung vào nhãn của biểu đồ, đơn vị sản lượng, bảng thống kê bên dưới và các nút thao tác. Đối với Cắt vải và Thành hình, cách ghi đơn vị cần rõ ràng để tránh đọc nhầm số lượng bán thành phẩm với số lượng lốp. Những phần có cùng mục đích sử dụng cũng cần có cách đặt tên tương đối thống nhất để người dùng không phải làm quen lại khi chuyển trang.

Trong giai đoạn này, tôi đồng thời tổng hợp các tình huống có thể khiến người dùng nghĩ dashboard bị lỗi, chẳng hạn đang chọn sai khoảng thời gian, chọn máy chưa có dữ liệu hoặc dữ liệu chưa tải xong. Những tình huống này cần được giải thích trong tài liệu vì không phải lúc nào bảng trống hoặc chỉ số bằng 0 cũng có cùng một nguyên nhân. Việc ghi lại ngay trong lúc rà soát giúp phần hướng dẫn sau đó sát với các vướng mắc thường gặp hơn.

Đến khoảng ngày 10/09, trọng tâm công việc bắt đầu chuyển từ sửa dashboard sang chuẩn bị tài liệu. Tôi tổng hợp lại các chức năng cần được hướng dẫn và sắp xếp theo trình tự người dùng thường thao tác: truy cập website, đăng nhập, sử dụng menu, xem dashboard, chọn chức năng nghiệp vụ, lọc dữ liệu và xuất báo cáo. Với cách sắp xếp này, người mới sử dụng có thể đọc lần lượt để nắm được luồng cơ bản.

Tôi chia nội dung tài liệu thành ba nhóm chính. Nhóm đầu là hướng dẫn sử dụng web dành cho người thao tác hằng ngày. Nhóm thứ hai là hướng dẫn cài đặt và chạy dự án dành cho người tiếp nhận mã nguồn. Nhóm cuối là hướng dẫn deploy dành cho người đưa hệ thống lên môi trường sử dụng. Việc chia theo nhu cầu giúp mỗi tài liệu tập trung vào đúng phần người đọc cần, đồng thời tránh trộn quá nhiều thao tác kỹ thuật vào hướng dẫn nghiệp vụ.

Với hướng dẫn sử dụng, tôi chuẩn bị các nội dung cần mô tả cho từng màn hình: mục đích của chức năng, cách mở chức năng, ý nghĩa của các bộ lọc, cách thực hiện thao tác và kết quả cần quan sát. Các phần có nhiều nút bấm hoặc nhiều cột dữ liệu được ưu tiên giải thích kỹ hơn. Tôi cũng ghi lại những vị trí cần hình ảnh minh họa để sau này người đọc có thể đối chiếu trực tiếp với giao diện.

Với hướng dẫn chạy dự án, tôi tập hợp các bước từ chuẩn bị môi trường, mở đúng thư mục mã nguồn, cài thư viện, cấu hình địa chỉ API đến khởi động frontend và backend. Nội dung được viết theo góc nhìn của người nhận dự án trên một máy tính khác, vì trên máy đang phát triển thường đã có sẵn nhiều công cụ và cấu hình nên rất dễ bỏ sót các bước chuẩn bị.

### Kết quả trong tuần

Khoảng thời gian từ 07–10/09 tiếp tục được dùng để chỉnh sửa và rà soát dashboard, đúng với trọng tâm của 10 ngày đầu tháng. Những ngày còn lại chuyển sang tổng hợp chức năng và chuẩn bị nội dung cho bộ tài liệu. Kết quả chính là xác định được phạm vi của từng hướng dẫn, trình tự cần trình bày và các nội dung cần giải thích kỹ để người sử dụng hoặc người tiếp nhận dự án có thể làm theo.

## 4. Tuần 3: Từ ngày 14/09 đến ngày 20/09

### Công việc chính: Viết chi tiết hướng dẫn sử dụng website

Trong tuần thứ ba, tôi tập trung viết hướng dẫn sử dụng web dựa trên các nhóm chức năng đã tổng hợp. Phần đầu tài liệu giới thiệu cách truy cập, đăng nhập và sử dụng thanh menu. Tôi trình bày theo thứ tự thao tác thực tế, để người đọc biết cần bắt đầu từ đâu trước khi đi vào các màn hình báo cáo hoặc nghiệp vụ có nhiều thông tin hơn.

Đối với menu, tôi mô tả các nhóm chức năng chính và cách tìm đến màn hình cần sử dụng. Hệ thống có nhiều nhánh liên quan đến dashboard, Thành hình, Cắt vải và KCS nên phần này cần đủ rõ để người mới không bị lúng túng. Thay vì chỉ liệt kê tên menu, tôi bổ sung mục đích của từng nhóm và giải thích khi nào người dùng cần vào nhóm đó.

Phần dashboard tổng quan được viết tương đối kỹ vì đây là màn hình người dùng thường xem trước tiên. Tôi mô tả khu vực thống kê trạng thái thiết bị, các khối kế hoạch và sản lượng thực tế, tỷ lệ hoàn thành theo ca, tháng, năm và các biểu đồ theo dõi sản xuất. Những chữ viết tắt như KH, SX hoặc BTP được giải thích để người đọc hiểu rõ ý nghĩa khi đối chiếu số liệu trên màn hình.

Tôi bổ sung cách đọc trạng thái máy và sự khác nhau giữa máy đang chạy, máy đang dừng, máy báo lỗi và máy mất kết nối. Nội dung này giúp người sử dụng hiểu rằng trạng thái thiết bị và sản lượng là những thông tin có liên quan nhưng không thể thay thế cho nhau. Khi cần xem kỹ một máy, người dùng được hướng dẫn chuyển sang màn hình chi tiết hoặc phần lịch sử tương ứng.

Đối với các báo cáo kế hoạch và sản xuất theo tháng, năm hoặc nhiều năm, tôi viết cách chọn thời gian, chọn máy và đọc biểu đồ. Tôi giải thích sự khác nhau giữa cột kế hoạch và cột thực tế, cách xem giá trị trên biểu đồ, cũng như cách đối chiếu với bảng số liệu bên dưới. Riêng báo cáo 10 năm có thêm nội dung về dải năm thống kê và việc sử dụng bộ lọc riêng cho Cắt vải, Thành hình.

Một phần khác của tài liệu là hướng dẫn xem lịch sử thông số máy. Tôi mô tả việc chọn khoảng thời gian, lựa chọn đúng nhóm thông số cần xem và kiểm tra lại bộ lọc khi không thấy kết quả. Khoảng thời gian mặc định 12 giờ gần nhất cũng được giải thích để người dùng hiểu vì sao lúc vừa mở màn hình chưa thấy dữ liệu của một ngày xa hơn. Người đọc được hướng dẫn điều chỉnh thời gian trước khi kết luận rằng hệ thống không có dữ liệu.

Tôi tiếp tục viết phần hướng dẫn các màn hình kế hoạch sản xuất. Nội dung tập trung vào thông tin chung của kế hoạch, lựa chọn ngày và ca, chọn máy, nhập hoặc xem các dòng quy cách, kiểm tra số lượng và thực hiện thao tác lưu hoặc in theo chức năng tương ứng. Những nút như làm mới, làm trống và lưu được mô tả riêng để người sử dụng hiểu rõ mục đích trước khi thao tác.

Với các màn hình Cắt vải và báo cáo KCS, tôi mô tả cách chọn bộ lọc, cách đọc các cột dữ liệu chính và cách tìm thông tin cần tra cứu. Tôi cũng bổ sung nội dung hướng dẫn xuất Excel, xuất PDF hoặc in ở những màn hình có hỗ trợ. Trong phần này, tôi nhấn mạnh việc kiểm tra điều kiện lọc trước khi xuất để file nhận được đúng với kỳ báo cáo hoặc phạm vi dữ liệu đang cần sử dụng.

Trong lúc soạn, tôi sắp xếp phần hình ảnh minh họa đi kèm với nội dung giải thích. Những màn hình nhiều thành phần được chia thành các khu vực nhỏ để mô tả lần lượt, tránh đưa một ảnh lớn nhưng không chỉ rõ người đọc cần chú ý ở đâu. Cách diễn đạt cũng được chỉnh lại nhiều lần để bớt nặng thuật ngữ kỹ thuật, nhất là ở những đoạn dành cho người chỉ sử dụng website trong công việc hằng ngày.

Tôi bổ sung các tình huống thường gặp như không thấy dữ liệu sau khi chọn bộ lọc, chưa nhìn đủ cột trên màn hình nhỏ, cần làm mới số liệu hoặc chưa xác định được đang xem báo cáo của máy nào. Các tình huống được viết theo hướng chỉ ra những bước nên kiểm tra trước. Qua đó, tài liệu có thể hỗ trợ người sử dụng tự xử lý các vướng mắc cơ bản mà không cần hỏi lại ngay từ những thao tác đầu tiên.

### Kết quả trong tuần

Tuần thứ ba tập trung hình thành nội dung chi tiết cho hướng dẫn sử dụng website. Tài liệu bao quát các thao tác cơ bản, phần đọc dashboard, các bộ lọc báo cáo, lịch sử máy và các nhóm chức năng nghiệp vụ liên quan. Nội dung được trình bày theo luồng sử dụng và có giải thích mục đích của thao tác, thay vì chỉ ghi tên nút hoặc tên màn hình.

## 5. Tuần 4: Từ ngày 21/09 đến ngày 27/09

### Công việc chính: Viết hướng dẫn chạy dự án và hướng dẫn deploy

Trong tuần thứ tư, tôi chuyển trọng tâm sang tài liệu kỹ thuật, bao gồm cách cài đặt và chạy dự án trên máy tính, cùng với quy trình deploy lên máy chủ. Đây là phần phục vụ người tiếp nhận mã nguồn hoặc người phụ trách triển khai, nên tôi viết chi tiết các bước chuẩn bị, thứ tự thực hiện và những điểm cần kiểm tra sau mỗi giai đoạn.

Đầu tiên, tôi mô tả các thành phần của hệ thống để người đọc hiểu mối liên hệ giữa frontend, backend và cơ sở dữ liệu. Phần frontend là giao diện người dùng truy cập qua trình duyệt, trong khi dữ liệu của các màn hình cần được cung cấp từ backend. Việc giải thích này giúp người chạy dự án hiểu rằng mở được giao diện chưa đồng nghĩa với việc toàn bộ chức năng đã có thể sử dụng, nhất là những chức năng phải lấy dữ liệu hoặc xác thực tài khoản.

Với phần chuẩn bị môi trường, tôi viết các nội dung về công cụ cần có, kiểm tra môi trường Node.js và npm, chuẩn bị mã nguồn và mở cửa sổ dòng lệnh tại đúng thư mục. Tôi mô tả vai trò của những thư mục, tệp thường gặp như src, public, package.json và dist để người đọc nhận biết được mình đang làm việc ở đâu. Các bước được sắp theo trình tự từ lúc nhận dự án đến khi có thể khởi động thử.

Phần cài thư viện được trình bày cùng với những dấu hiệu cần kiểm tra khi quá trình cài đặt gặp lỗi. Tôi đưa vào hướng dẫn cách nhận biết lỗi môi trường, lỗi phụ thuộc hoặc trường hợp thực hiện lệnh sai thư mục. Mục đích là để người nhận dự án biết nên kiểm tra vấn đề ở bước nào, thay vì tiếp tục chạy các lệnh phía sau khi bước chuẩn bị trước đó chưa hoàn tất.

Tôi viết rõ phần cấu hình kết nối API, trong đó có việc kiểm tra địa chỉ backend theo môi trường chạy thực tế. Nếu frontend chạy trên một máy còn backend nằm ở máy khác thì cấu hình cần phản ánh đúng địa chỉ có thể truy cập. Tôi cũng giải thích những trường hợp giao diện mở được nhưng bảng và biểu đồ không có dữ liệu, để người đọc kiểm tra backend, địa chỉ API và kết nối mạng trước khi nghĩ rằng toàn bộ frontend bị lỗi.

Tiếp theo là phần hướng dẫn chạy dự án ở chế độ phát triển. Tôi mô tả cách khởi động, xem địa chỉ được hiển thị trong terminal, truy cập bằng trình duyệt và nhận biết khi tiến trình vẫn đang chạy. Phần backend được đưa vào trình tự chung để người đọc hiểu cần khởi động các thành phần liên quan trước khi kiểm tra các chức năng có dữ liệu. Các tình huống như cổng đang được sử dụng, mở sai địa chỉ hoặc dừng nhầm tiến trình cũng được ghi lại để bổ sung phần xử lý lỗi.

Tôi phân biệt các lệnh chạy phát triển, đóng gói và xem thử bản đóng gói của frontend. Trong tài liệu, các lệnh npm run dev, npm run build và npm run preview được giải thích theo mục đích sử dụng. Thư mục dist được mô tả là đầu ra của quá trình build, giúp người triển khai biết phần nào cần đưa lên web server và tránh nhầm với thư mục mã nguồn đang chỉnh sửa.

Đối với tài liệu deploy, tôi viết quy trình từ chuẩn bị cấu hình môi trường, tạo bản dựng, kiểm tra đầu ra, cập nhật lên máy chủ đến kiểm tra website sau triển khai. Tôi chú ý tách phần phục vụ các tệp giao diện với phần vận hành dịch vụ backend để người đọc không nhầm hai thành phần là một. Các nội dung về đường dẫn API và cấu hình chuyển tiếp yêu cầu được giải thích trong mối liên hệ với việc website lấy dữ liệu sau khi đưa lên server.

Tôi cũng tổng hợp các điểm cần mô tả ở môi trường triển khai như thư mục chứa bản dựng, dịch vụ phục vụ website, tiến trình backend và vị trí xem log khi gặp lỗi. Với cấu hình Docker có trong dự án, nội dung hướng dẫn đề cập đến vai trò của giai đoạn build frontend và giai đoạn phục vụ tài nguyên tĩnh bằng Nginx. Những thông tin phụ thuộc máy chủ cụ thể được trình bày để người triển khai thay theo môi trường thực tế.

Phần kiểm tra sau deploy được viết thành các bước dễ thực hiện: mở trang web, kiểm tra đăng nhập, chuyển sang một số màn hình chính, xem dữ liệu dashboard, đổi bộ lọc và tải lại trang ở một đường dẫn bên trong ứng dụng. Tôi bổ sung những dấu hiệu lỗi thường gặp như không tải được tài nguyên giao diện, API không phản hồi hoặc đường dẫn con không mở được khi truy cập trực tiếp. Việc nêu rõ các bước này giúp người đọc có cơ sở kiểm tra sau khi cập nhật bản mới.

Ngoài quy trình triển khai, tôi bổ sung nội dung lưu lại cấu hình và bản đang sử dụng trước khi thay đổi để thuận tiện đối chiếu hoặc khôi phục khi cần. Phần xử lý sự cố được viết theo hướng đi từ biểu hiện trên trình duyệt đến kiểm tra cấu hình, dịch vụ và log. Trọng tâm của tuần này là mô tả quy trình triển khai trong tài liệu, giúp người tiếp nhận hiểu và có thể thực hiện lại các bước cần thiết.

### Kết quả trong tuần

Trong tuần thứ tư, nội dung hướng dẫn chạy dự án và hướng dẫn deploy được xây dựng chi tiết hơn. Các bước từ chuẩn bị môi trường, cài thư viện, cấu hình API, chạy frontend và backend đến tạo bản dựng, cập nhật máy chủ và kiểm tra sau triển khai đã được sắp xếp theo trình tự. Phần hướng dẫn sử dụng web cũng tiếp tục được bổ sung để thống nhất thuật ngữ với các tài liệu kỹ thuật.

## 6. Tuần 5: Từ ngày 28/09 đến ngày 30/09

### Công việc chính: Rà soát, bổ sung và tổng hợp các tài liệu cuối tháng

Trong ba ngày cuối tháng, tôi tập trung đọc lại các tài liệu đã viết để chỉnh những đoạn còn thiếu ý, khó hiểu hoặc bị lặp. Sau khi viết riêng từng phần, cần xem lại tổng thể để bảo đảm người đọc có thể đi từ bước đầu đến bước cuối mà không bị thiếu thông tin ở giữa. Tôi ưu tiên những bước dễ bị bỏ qua, như chuẩn bị cấu hình trước khi chạy, kiểm tra bộ lọc trước khi xuất báo cáo và kiểm tra kết nối dữ liệu sau khi deploy.

Đối với hướng dẫn sử dụng web, tôi rà lại tên các màn hình, tên nút thao tác và thứ tự hướng dẫn. Các nội dung về dashboard được xem lại theo những thay đổi đầu tháng, đặc biệt là báo cáo sản xuất 10 năm, bộ lọc riêng của hai công đoạn và khoảng thời gian mặc định trong phần lịch sử máy. Những chỗ sử dụng nhiều thuật ngữ được chỉnh cách diễn đạt để người dùng dễ hiểu hơn.

Tôi tiếp tục sắp xếp hình ảnh và phần giải thích để nội dung minh họa nằm gần thao tác tương ứng. Với những mục dài, tôi chia thành các đoạn ngắn theo từng bước hoặc từng nhóm thông tin để thuận tiện tra cứu. Tài liệu vẫn ưu tiên đầy đủ nội dung, nhưng cách trình bày cần giúp người đọc tìm được phần đang cần mà không phải đọc lại từ đầu.

Đối với hướng dẫn chạy dự án, tôi rà lại trình tự chuẩn bị môi trường, cài thư viện, cấu hình và khởi động các thành phần. Tôi bổ sung giải thích ở những chỗ người mới tiếp nhận có thể làm theo lệnh nhưng chưa hiểu mục đích. Những phần phụ thuộc vào địa chỉ máy chủ hoặc cách tổ chức thư mục cũng được diễn đạt rõ hơn để tránh hiểu rằng có thể dùng nguyên cấu hình của một máy cho mọi môi trường.

Với hướng dẫn deploy, tôi tập trung làm rõ các bước trước và sau khi cập nhật bản dựng. Nội dung cần thể hiện được rằng việc đưa tệp lên máy chủ chỉ là một phần của quy trình; sau đó vẫn phải kiểm tra trang web, tài nguyên giao diện và kết nối đến backend. Các tình huống lỗi được đặt gần phần liên quan để người triển khai dễ tra cứu khi gặp vấn đề ở từng giai đoạn.

Cuối cùng, tôi tổng hợp lại nội dung công việc trong tháng, từ phần chỉnh sửa dashboard ở đầu tháng đến phần soạn tài liệu ở cuối tháng. Tôi sắp xếp các tài liệu theo mục đích sử dụng để thuận tiện lưu trữ và phục vụ việc trao đổi, hỗ trợ hoặc bàn giao về sau. Các nội dung có thể thay đổi khi chức năng hoặc môi trường triển khai được cập nhật cũng được xác định để tiếp tục bổ sung trong quá trình sử dụng.

### Kết quả trong tuần

Ba ngày cuối tháng chủ yếu dành cho việc hoàn thiện nội dung và cách diễn đạt của bộ tài liệu. Hướng dẫn sử dụng web, hướng dẫn chạy dự án và hướng dẫn deploy được rà soát lại về thứ tự, thuật ngữ và những lưu ý cần thiết. Công việc cuối tháng tập trung vào việc giúp tài liệu có thể dùng để tra cứu và làm theo, đồng thời phản ánh những phần đã chỉnh sửa trên hệ thống.

## 7. Khó khăn trong quá trình thực hiện

Trong giai đoạn làm dashboard, khó khăn chủ yếu là phải xử lý đồng thời giao diện và cách thể hiện dữ liệu. Một màn hình có thể hiển thị đầy đủ các thành phần nhưng người dùng vẫn khó đọc nếu bộ lọc chưa rõ, nhãn chưa thống nhất hoặc biểu đồ có quá nhiều chi tiết. Vì vậy, ngoài việc sửa theo yêu cầu, tôi cần xem lại toàn bộ luồng thao tác để các thay đổi phù hợp với cách sử dụng thực tế.

Các số liệu trên dashboard cũng có nhiều phạm vi khác nhau, từ từng máy đến từng công đoạn, từ ca sản xuất đến tháng và năm. Khi rà soát, cần chú ý đúng điều kiện lọc và thời gian đang xem, tránh so sánh các số liệu không cùng phạm vi. Những trường hợp thiếu dữ liệu hoặc không có số liệu của kỳ trước cũng cần có cách giải thích phù hợp để người dùng không hiểu sai biểu đồ.

Đến giai đoạn viết tài liệu, khó khăn là diễn đạt sao cho đủ chi tiết nhưng người không trực tiếp phát triển hệ thống vẫn hiểu được. Những thao tác quen thuộc với người viết mã chưa chắc đã rõ với người mới. Tôi phải tách các thao tác thành từng bước, bổ sung mục đích và kết quả cần quan sát, đồng thời giảm bớt những cách giải thích quá thiên về kỹ thuật trong hướng dẫn sử dụng web.

Đối với hướng dẫn chạy dự án và deploy, môi trường máy tính hoặc máy chủ có thể khác nhau nên không thể chỉ ghi lại vài lệnh là đủ. Tài liệu cần giải thích cả phần cấu hình, điều kiện cần có và cách kiểm tra khi không chạy được. Tôi xử lý bằng cách viết theo trình tự công việc, bổ sung các tình huống lỗi thường gặp và làm rõ những thông tin cần thay theo môi trường thực tế.

## 8. Tổng kết công việc tháng 9

Trong tháng 9, khoảng 10 ngày đầu tôi chủ yếu làm và sửa dashboard của hệ thống MES DRC. Nội dung bao gồm điều chỉnh báo cáo sản xuất 10 năm, tách bộ lọc máy của Cắt vải và Thành hình, chỉnh biểu đồ và thông tin khi xem chi tiết, cải thiện cách tải dữ liệu, sửa giao diện trên màn hình nhỏ và cập nhật khoảng thời gian mặc định của lịch sử máy. Các công việc này tập trung vào việc giúp dashboard rõ ràng hơn và thuận tiện hơn khi theo dõi tình hình sản xuất.

Từ sau giai đoạn đó đến cuối tháng, tôi chuyển dần sang viết và hoàn thiện các tài liệu hướng dẫn. Hướng dẫn sử dụng web tập trung vào thao tác của người dùng và cách đọc thông tin trên từng màn hình. Hướng dẫn chạy dự án mô tả các bước chuẩn bị môi trường, cài đặt, cấu hình và khởi động hệ thống. Hướng dẫn deploy trình bày quy trình tạo bản dựng, đưa lên máy chủ và kiểm tra sau triển khai.

Nhìn chung, công việc tháng này vừa tiếp tục hoàn thiện phần mềm, vừa tổng hợp lại cách sử dụng và cách vận hành để phục vụ công việc về sau. Qua quá trình viết tài liệu, tôi cũng hệ thống lại được các chức năng, các bước kỹ thuật và những tình huống cần lưu ý, giúp việc hỗ trợ người dùng hoặc tiếp nhận lại dự án thuận tiện hơn.
