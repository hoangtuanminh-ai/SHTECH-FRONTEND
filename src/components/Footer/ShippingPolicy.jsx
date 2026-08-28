import React from "react";
import { Truck, Package, Clock, MapPin, Phone, Coffee } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="mt-20 min-h-screen bg-[#f8f9fa] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#003830] mb-6">
            CHÍNH SÁCH GIAO HÀNG
          </h1>
          <p className="text-lg text-[#003830]/80 max-w-3xl mx-auto leading-relaxed">
            Từ đồi cao Phúc Thọ, những hạt cà phê thơm lành đã sẵn sàng lên đường tìm về với bạn.<br />
            Tại Am Roaster, tụi mình hiểu rằng bạn đang rất mong ngóng được thưởng thức hương vị cà phê mới. Vì thế, quy trình đóng gói và vận chuyển luôn được tụi mình chăm chút kỹ lưỡng để đơn hàng đến tay bạn nhanh nhất và nguyên vẹn nhất.
          </p>
        </div>

        {/* Section 1: Thời gian xử lý đơn */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Clock className="w-8 h-8 text-[#003830]" />
            1. Thời gian "lên đơn" và chuẩn bị hàng
          </h2>
          <p className="text-[#003830]/80 mb-4">
            Vì Am luôn ưu tiên sự tươi mới (Freshness), nên ngay khi bạn đặt hàng, tụi mình mới bắt đầu quy trình đóng gói thành phẩm (hoặc rang mới nếu hết hàng trong kho).
          </p>
          <p className="text-[#003830]/80 mb-6">
            <strong>Thời gian xử lý:</strong> Đơn hàng sẽ được đóng gói và giao cho đơn vị vận chuyển trong vòng <strong>24h</strong> (trừ Chủ Nhật và Lễ Tết).
          </p>
          <p className="text-[#003830]/80 italic">
            Lưu ý nhỏ: Với các đơn hàng sỉ số lượng lớn hoặc yêu cầu xay đặc biệt, Am xin phép chuẩn bị lâu hơn một chút (1-2 ngày) để đảm bảo chất lượng tốt nhất nha.
          </p>
        </div>

        {/* Section 2: Thời gian vận chuyển */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Truck className="w-8 h-8 text-[#003830]" />
            2. Thời gian vận chuyển dự kiến
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Tùy vào nơi bạn sống mà thời gian "hàng về tay" sẽ khác nhau một chút:
          </p>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-[#003830]" />
              </div>
              <span><strong>Khu vực Nội thành & Lân cận:</strong> Bạn sẽ nhận được hàng sau <strong>1 - 2 ngày</strong>.</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-[#003830]" />
              </div>
              <span><strong>Khu vực Tỉnh/Thành phố khác:</strong> Thời gian giao hàng khoảng <strong>3 - 5 ngày</strong>.</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-[#003830]" />
              </div>
              <span><strong>Vùng sâu, vùng xa, hải đảo:</strong> Có thể lâu hơn một chút, khoảng <strong>5 - 7 ngày</strong> bạn nhé.</span>
            </li>
          </ul>
          <p className="text-[#003830]/80 mt-6 italic">
            Lưu ý: Thời gian có thể xê dịch nếu gặp mưa bão, thiên tai hoặc các dịp Sale lớn khiến đơn vị vận chuyển bị quá tải. Mong bạn thông cảm đợi Am xíu xiu nhé.
          </p>
        </div>

        {/* Section 3: Phí vận chuyển */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Package className="w-8 h-8 text-[#003830]" />
            3. Phí vận chuyển (Ship)
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Am Roaster luôn cố gắng hỗ trợ phí ship tốt nhất để bạn thoải mái thưởng thức cà phê mà không lo "đau ví":
          </p>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-[#003830]" />
              </div>
              <span><strong>Đồng giá ship:</strong> [Số tiền cụ thể] cho mọi đơn hàng trên toàn quốc.</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-[#003830]" />
              </div>
              <span><strong>Miễn phí vận chuyển (Freeship):</strong> Dành tặng cho mọi đơn hàng có giá trị từ [số tiền] trở lên.</span>
            </li>
          </ul>
        </div>

        {/* Section 4: Quy cách đóng gói */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Coffee className="w-8 h-8 text-[#003830]" />
            4. Quy cách đóng gói
          </h2>
          <p className="text-[#003830]/80">
            Để giữ trọn hương thơm của núi rừng Lâm Hà:
          </p>
          <ul className="space-y-3 text-[#003830]/80 mt-4">
            <li>• Cà phê luôn được đựng trong túi Kraft/Túi Zip chuyên dụng có van thở 1 chiều (giúp thoát khí CO2 và ngăn oxy xâm nhập).</li>
            <li>• Đơn hàng được bọc chống sốc cẩn thận và đóng trong hộp carton cứng cáp của Am Roaster.</li>
          </ul>
        </div>

        {/* Section 5: Lưu ý khi nhận hàng */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6">
            5. Lưu ý khi nhận hàng
          </h2>
          <p className="text-[#003830]/80 mb-4">
            Khi shipper gọi điện giao hàng, bạn nhớ giúp Am vài việc nhỏ này nha:
          </p>
          <ul className="space-y-3 text-[#003830]/80">
            <li>• <strong>Để ý điện thoại:</strong> Để shipper liên lạc được với bạn dễ dàng.</li>
            <li>• <strong>Kiểm tra ngoại quan:</strong> Bạn được phép kiểm tra hộp hàng bên ngoài. Nếu thấy hộp bị móp méo nặng, ướt, rách hoặc có dấu hiệu bị bóc trước đó, bạn vui lòng từ chối nhận hàng và báo ngay cho Am nhé.</li>
            <li>• <strong>Quay video:</strong> Như đã nói ở phần "Đổi trả", việc quay lại video lúc mở hộp sẽ giúp tụi mình bảo vệ quyền lợi cho bạn tốt nhất nếu có sự cố xảy ra.</li>
          </ul>
        </div>

        {/* Section 6: Giao gấp & Nhận trực tiếp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-[#003830] to-[#002922] rounded-2xl p-8 text-white">
            <h3 className="text-xl md:text-2xl font-bold mb-4">Cần giao gấp?</h3>
            <p className="mb-6">
              Nếu bạn đang cần cà phê gấp để biếu tặng hoặc "chữa cháy" cơn thèm, hãy nhắn tin Zalo hoặc gọi ngay cho Am qua số <strong>083 337 1111</strong>. Tụi mình sẽ cố gắng book ship hỏa tốc (nếu có thể) để hỗ trợ bạn!
            </p>
            <a href="tel:0833371111" className="inline-flex items-center gap-2 bg-[#f7dcb6] text-[#003830] px-6 py-3 rounded-full font-bold hover:bg-[#e8c89f] transition">
              <Phone className="w-5 h-5" />
              Gọi ngay
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#003830]/10">
            <h3 className="text-xl md:text-2xl font-bold text-[#003830] mb-4 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-[#003830]" />
              Ghé thăm Am & Nhận hàng trực tiếp
            </h3>
            <p className="text-[#003830]/80 mb-4">
              Nếu bạn đang ở Sài Gòn và muốn nhận cà phê ngay cho "nóng", hoặc tiện đường muốn ghé qua thăm tụi mình, Am rất sẵn lòng chào đón bạn tại văn phòng đại diện.
            </p>
            <p className="text-[#003830]/80 mb-6">
              Ghé lấy hàng trực tiếp vừa đỡ tốn phí ship, vừa có chỗ đậu xe siêu rộng rãi:<br />
              <strong>📍 Địa chỉ:</strong> Tầng trệt toà nhà Babylon The Signature. Số 35 Nguyễn Văn Đậu, Phường Bình Lợi Trung, Quận Bình Thạnh, TP. Hồ Chí Minh.<br />
              <strong>📌 Dễ tìm lắm:</strong> Tụi mình nằm ngay đối diện siêu thị Kingfood Mart.<br />
              <strong>🚗 Tiện ích:</strong> Có sân rộng đậu được ô tô thoải mái và an toàn.
            </p>
            <p className="text-[#003830]/80 italic">
              Lưu ý nhỏ xíu: Trước khi ghé, bạn thương vui lòng nhắn tin hoặc gọi trước cho Am khoảng 30 phút qua Hotline <strong>083 337 1111</strong> nhé. Để tụi mình soạn sẵn đơn hàng, bạn đến là nhận được liền!
            </p>
          </div>
        </div>

        {/* Closing */}
        <div className="text-center">
          <p className="text-2xl font-bold text-[#003830]">
            Hẹn gặp bạn tại Am Roaster! 🌿
          </p>
        </div>
      </div>
    </div>
  );
}