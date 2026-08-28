import React from "react";
import { CreditCard, Truck, Building2, Smartphone } from "lucide-react";

export default function PaymentPolicy() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#003830] mb-6">
            CHÍNH SÁCH THANH TOÁN
          </h1>
          <p className="text-lg text-[#003830]/80 max-w-3xl mx-auto leading-relaxed">
            Tại Am Roaster, việc thanh toán cũng nhẹ nhàng và đơn giản như cách tụi mình thưởng thức một tách cà phê vậy.<br />
            Để thuận tiện nhất cho bạn khi mua sắm, Am Roaster hỗ trợ đa dạng các hình thức thanh toán sau đây. Bạn cứ thong thả chọn cách nào phù hợp với mình nhất nhé!
          </p>
        </div>

        {/* Section 1: COD */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Truck className="w-8 h-8 text-[#003830]" />
            1. Thanh toán tiền mặt khi nhận hàng (COD)
          </h2>
          <p className="text-[#003830]/80 mb-4">
            Đây là hình thức được nhiều bạn thương nhà Am lựa chọn nhất vì sự tiện lợi và an tâm.
          </p>
          <ul className="space-y-3 text-[#003830]/80">
            <li>• <strong>Cách thức:</strong> Bạn đặt hàng trên Website/Fanpage → Am đóng gói và gửi đi → Shipper giao đến tận nhà.</li>
            <li>• <strong>Thực hiện:</strong> Bạn được quyền kiểm tra ngoại quan gói hàng, sau đó thanh toán trực tiếp tổng số tiền (Giá trị đơn hàng + Phí ship nếu có) cho nhân viên giao hàng.</li>
            <li>• <strong>Lưu ý:</strong> Với các đơn hàng sỉ hoặc giá trị cao (trên 2.000.000đ), Am xin phép yêu cầu bạn đặt cọc trước một phần nhỏ để đảm bảo đơn hàng nhé.</li>
          </ul>
        </div>

        {/* Section 2: Chuyển khoản */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-[#003830]" />
            2. Chuyển khoản ngân hàng (Khuyên dùng)
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Am khuyến khích bạn sử dụng hình thức này để giao dịch nhanh chóng, không phải lo chuẩn bị tiền lẻ khi shipper đến. Đặc biệt, Am thường xuyên có ưu đãi nhỏ cho các đơn hàng chuyển khoản trước.
          </p>
          <div className="bg-[#003830]/5 rounded-xl p-6 text-[#003830]">
            <p><strong>Thông tin tài khoản chính chủ của Am Roaster:</strong></p>
            <ul className="mt-4 space-y-2">
              <li>🏦 Ngân hàng: [Tên ngân hàng]</li>
              <li>💳 Số tài khoản: [Số tài khoản]</li>
              <li>👤 Chủ tài khoản: [Tên chủ tài khoản]</li>
              <li>📝 Nội dung chuyển khoản: [Tên của bạn] + [Số điện thoại] hoặc [Mã đơn hàng]</li>
            </ul>
            <p className="mt-4">
              Sau khi chuyển khoản, bạn vui lòng chụp màn hình giao dịch và gửi qua Zalo/Fanpage để Am xác nhận và cho đơn đi ngay lập tức nha.
            </p>
          </div>
        </div>

        {/* Section 3: Thanh toán trực tiếp */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#003830]" />
            3. Thanh toán trực tiếp tại văn phòng
          </h2>
          <p className="text-[#003830]/80 mb-4">
            Nếu bạn ghé thăm Am để nhận hàng trực tiếp tại Bình Thạnh, bạn có thể thanh toán tại chỗ bằng:
          </p>
          <ul className="space-y-3 text-[#003830]/80">
            <li>• Tiền mặt.</li>
            <li>• Quét mã QR chuyển khoản nhanh (VietQR).</li>
          </ul>
          <p className="text-[#003830]/80 mt-6">
            📍 <strong>Địa chỉ:</strong> Tầng trệt toà nhà Babylon The Signature, số 35 Nguyễn Văn Đậu, Phường Bình Lợi Trung, Bình Thạnh, TP.HCM.
          </p>
        </div>

        {/* Section 4: Lưu ý an toàn */}
        <div className="bg-gradient-to-br from-[#003830] to-[#002922] rounded-2xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-3">
            <Smartphone className="w-8 h-8" />
            4. Lưu ý quan trọng về an toàn bảo mật
          </h2>
          <p className="mb-6">
            Để đảm bảo an toàn tài chính cho bạn, Am Roaster xin lưu ý:
          </p>
          <ul className="space-y-4 max-w-3xl mx-auto">
            <li>• <strong>Chỉ chuyển khoản vào tài khoản chính chủ:</strong> Am chỉ sử dụng DUY NHẤT thông tin tài khoản ngân hàng đã niêm yết ở mục 2. Tuyệt đối không chuyển tiền vào bất kỳ tài khoản cá nhân lạ nào khác nếu không được xác nhận từ Hotline/Fanpage chính thức của Am.</li>
            <li>• <strong>Không chia sẻ mã OTP:</strong> Nhân viên của Am sẽ KHÔNG BAO GIỜ yêu cầu bạn cung cấp mã OTP, mật khẩu ngân hàng hay số thẻ tín dụng qua điện thoại/tin nhắn. Hãy cảnh giác nhé!</li>
            <li>• <strong>Xác nhận giao dịch:</strong> Nếu sau khi chuyển khoản mà đơn hàng trên web chưa cập nhật trạng thái, bạn đừng lo, hãy nhắn tin ngay cho Am để tụi mình kiểm tra (đôi khi hệ thống ngân hàng bị chậm xíu thôi nè).</li>
          </ul>
        </div>

        {/* Closing */}
        <div className="text-center">
          <p className="text-2xl font-bold text-[#003830]">
            Cảm ơn bạn đã tin tưởng và ủng hộ nông sản Việt cùng Am Roaster! 🌿
          </p>
        </div>
      </div>
    </div>
  );
}