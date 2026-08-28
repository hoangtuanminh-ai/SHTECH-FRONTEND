import React from "react";
import { Shield, Lock, UserCheck, Mail, Phone, MapPin } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="mt-20 min-h-screen bg-[#f8f9fa] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#003830] mb-6">
            CHÍNH SÁCH BẢO MẬT THÔNG TIN
          </h1>
          <p className="text-lg text-[#003830]/80 max-w-3xl mx-auto leading-relaxed">
            Tại Am Roaster, sự riêng tư của bạn cũng quý giá như những hạt cà phê chất lượng mà tụi mình gìn giữ.<br />
            Cảm ơn bạn đã tin tưởng truy cập và mua sắm tại website của Am Roaster. Tụi mình hiểu rằng bạn rất quan tâm đến việc thông tin cá nhân của mình được sử dụng và bảo mật ra sao. Am cam kết sẽ bảo vệ sự riêng tư của bạn bằng tất cả trách nhiệm và sự tôn trọng.
          </p>
        </div>

        {/* Section 1: Thu thập thông tin gì */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-[#003830]" />
            1. Am thu thập những thông tin gì?
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Để xử lý đơn hàng và giao cà phê đến tận tay bạn, Am cần một số thông tin cơ bản khi bạn đặt hàng hoặc đăng ký thành viên:
          </p>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#003830] font-bold text-sm">•</span>
              </div>
              <span><strong>Thông tin định danh:</strong> Họ và tên.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#003830] font-bold text-sm">•</span>
              </div>
              <span><strong>Thông tin liên lạc:</strong> Số điện thoại, Địa chỉ email.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#003830] font-bold text-sm">•</span>
              </div>
              <span><strong>Thông tin giao hàng:</strong> Địa chỉ nhà riêng hoặc cơ quan (nơi bạn muốn nhận cà phê).</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#003830] font-bold text-sm">•</span>
              </div>
              <span><strong>Lịch sử mua hàng:</strong> Các loại hạt bạn đã mua, gu cà phê bạn thích (để Am tư vấn tốt hơn cho những lần sau).</span>
            </li>
          </ul>
        </div>

        {/* Section 2: Dùng thông tin để làm gì */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6">
            2. Am dùng thông tin đó để làm gì?
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Tụi mình chỉ sử dụng thông tin của bạn cho các mục đích chính đáng sau:
          </p>
          <ul className="space-y-4 text-[#003830]/80">
            <li>• Xử lý đơn hàng: Gọi điện xác nhận, đóng gói và giao hàng.</li>
            <li>• Chăm sóc khách hàng: Giải đáp thắc mắc, hỗ trợ đổi trả hoặc xử lý sự cố.</li>
            <li>• Gửi ưu đãi (nếu bạn đồng ý): Gửi thông tin về mùa vụ mới, các chương trình khuyến mãi hoặc quà tặng sinh nhật. Yên tâm nhé, Am ghét Spam, nên tụi mình sẽ không bao giờ làm phiền bạn bằng những tin nhắn rác.</li>
          </ul>
        </div>

        {/* Section 3: Ai tiếp cận thông tin */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Lock className="w-8 h-8 text-[#003830]" />
            3. Ai có thể tiếp cận thông tin của bạn?
          </h2>
          <p className="text-[#003830]/80 mb-6 font-bold">
            Am Roaster cam kết KHÔNG BÁN, KHÔNG CHIA SẺ thông tin cá nhân của bạn cho bất kỳ bên thứ 3 nào với mục đích thương mại.
          </p>
          <p className="text-[#003830]/80">
            Thông tin của bạn chỉ được chia sẻ trong 2 trường hợp bắt buộc:
          </p>
          <ul className="space-y-4 text-[#003830]/80 mt-4">
            <li>• <strong>Đơn vị vận chuyển:</strong> (Ví dụ: Giao Hàng Tiết Kiệm, Viettel Post...) Tụi mình cần cung cấp Tên, Số điện thoại và Địa chỉ của bạn để shipper có thể giao hàng.</li>
            <li>• <strong>Yêu cầu pháp lý:</strong> Trong trường hợp hiếm hoi bị yêu cầu bởi cơ quan pháp luật (Am hy vọng không bao giờ xảy ra chuyện này).</li>
          </ul>
        </div>

        {/* Section 4: Bảo mật thế nào */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#003830]" />
            4. Dữ liệu được bảo mật thế nào?
          </h2>
          <ul className="space-y-4 text-[#003830]/80">
            <li>• Thông tin của bạn được lưu trữ trên hệ thống máy chủ an toàn và chỉ có nhân viên quản lý đơn hàng của Am mới có quyền truy cập.</li>
            <li>• Tụi mình không lưu trữ thông tin thẻ tín dụng hay tài khoản ngân hàng của bạn trên website (Việc thanh toán được thực hiện trực tiếp qua ứng dụng ngân hàng hoặc cổng thanh toán bảo mật).</li>
          </ul>
        </div>

        {/* Section 5: Quyền lợi của bạn */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6">
            5. Quyền lợi của bạn
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Bạn là chủ nhân của thông tin, nên bạn có toàn quyền:
          </p>
          <ul className="space-y-4 text-[#003830]/80">
            <li>• Yêu cầu Am kiểm tra, cập nhật hoặc chỉnh sửa thông tin cá nhân.</li>
            <li>• Yêu cầu Am xóa thông tin của bạn khỏi hệ thống dữ liệu bất cứ lúc nào.</li>
            <li>• Từ chối nhận email/tin nhắn quảng cáo nếu cảm thấy bị làm phiền.</li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div className="bg-gradient-to-br from-[#003830] to-[#002922] rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Thông tin liên hệ</h2>
          <p className="mb-6">
            Nếu bạn có bất kỳ thắc mắc nào về vấn đề bảo mật, hoặc muốn cập nhật thông tin, đừng ngần ngại liên hệ với tụi mình nhé:
          </p>
          <div className="space-y-4 max-w-2xl mx-auto text-left">
            <p className="flex items-center justify-center gap-3">
              <MapPin className="w-6 h-6" />
              <span><strong>Địa chỉ cửa hàng:</strong> Tầng trệt toà nhà Babylon The Signature, số 35 Nguyễn Văn Đậu, Phường Bình Lợi Trung, Bình Thạnh, TP.HCM.</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <MapPin className="w-6 h-6" />
              <span><strong>Địa chỉ Farm:</strong> Thôn Phúc Thanh, Xã Phúc Thọ, Huyện Lâm Hà, Tỉnh Lâm Đồng.</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <Phone className="w-6 h-6" />
              <span>Hotline: <strong>083 337 1111</strong></span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <Mail className="w-6 h-6" />
              <span>Email: thuydung15.tnmt@gmail.com</span>
            </p>
          </div>
          <p className="mt-8 text-xl font-bold">
            Cảm ơn bạn đã tin tưởng chọn Am là người bạn đồng hành! 🌿
          </p>
        </div>
      </div>
    </div>
  );
}