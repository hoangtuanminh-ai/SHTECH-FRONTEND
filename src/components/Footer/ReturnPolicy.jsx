import React from "react";
import { CheckCircle, XCircle, Clock, Package, Phone, Mail, MapPin } from "lucide-react";

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 md:py-20 mt-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#003830] mb-6">
            CHÍNH SÁCH ĐỔI TRẢ
          </h1>
          <p className="text-lg text-[#003830]/80 max-w-3xl mx-auto">
            Chào bạn, người thương của Am Roaster!<br />
            Tại Am Roaster, chúng mình tâm niệm rằng mỗi hạt cà phê gửi đi đều gói ghém công sức của người nông dân Phúc Thọ và tâm huyết của người thợ rang. Tuy nhiên, nếu có bất kỳ sự cố nào khiến trải nghiệm của bạn chưa trọn vẹn, tụi mình luôn sẵn sàng lắng nghe và hỗ trợ theo chính sách minh bạch dưới đây.
          </p>
        </div>

        {/* Section 1: Khi nào đổi hàng mới */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-[#003830]" />
            1. Khi nào Am sẽ đổi hàng mới cho bạn?
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Tụi mình sẽ đổi mới 100% (và chịu hoàn toàn phí ship) nếu đơn hàng bạn nhận được gặp phải các vấn đề sau:
          </p>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#003830] font-bold text-sm">•</span>
              </div>
              <span>Sản phẩm không đúng với đơn đặt hàng (sai loại hạt, sai khối lượng).</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#003830] font-bold text-sm">•</span>
              </div>
              <span>Sản phẩm bị lỗi bao bì (rách, hở van, không còn nguyên seal) ảnh hưởng đến chất lượng cà phê bên trong.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#003830] font-bold text-sm">•</span>
              </div>
              <span>Sản phẩm có dấu hiệu hư hỏng, ẩm mốc, có mùi lạ hoặc không còn tươi mới khi vừa mở bao bì (mặc dù trường hợp này cực hiếm vì Am luôn rang mới mỗi ngày).</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#003830] font-bold text-sm">•</span>
              </div>
              <span>Sản phẩm đã hết hạn sử dụng ghi trên bao bì.</span>
            </li>
          </ul>
        </div>

        {/* Section 2: Trường hợp chưa hỗ trợ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            2. Một số trường hợp Am xin phép chưa hỗ trợ
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Vì cà phê là sản phẩm nông sản và mang tính "gu" riêng biệt, Am rất tiếc chưa thể hỗ trợ đổi trả trong các trường hợp:
          </p>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 font-bold text-sm">•</span>
              </div>
              <span>Sản phẩm đã qua sử dụng (đã pha thử) nhưng không hợp khẩu vị. <em>Mẹo nhỏ: Nếu bạn chưa rõ gu mình hợp loại nào, hãy nhắn tin để tụi mình tư vấn kỹ hoặc mua gói nhỏ uống thử trước nhé.</em></span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 font-bold text-sm">•</span>
              </div>
              <span>Sản phẩm bị hư hỏng do lỗi bảo quản từ phía khách hàng (để nơi ẩm ướt, tiếp xúc trực tiếp ánh nắng...).</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 font-bold text-sm">•</span>
              </div>
              <span>Quá thời hạn thông báo đổi trả quy định.</span>
            </li>
          </ul>
        </div>

        {/* Section 3: Thời gian đổi trả */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Clock className="w-8 h-8 text-[#003830]" />
            3. Thời gian đổi trả
          </h2>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-[#003830]" />
              </div>
              <span><strong>Thời gian thông báo:</strong> Bạn vui lòng liên hệ với Am Roaster trong vòng <strong>48 giờ</strong> kể từ khi nhận hàng thành công (căn cứ theo xác nhận của đơn vị vận chuyển).</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#003830]/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-[#003830]" />
              </div>
              <span><strong>Thời gian gửi hàng:</strong> Bạn gửi lại sản phẩm lỗi trong vòng <strong>03 - 05 ngày làm việc</strong> kể từ khi được Am Roaster xác nhận yêu cầu đổi trả.</span>
            </li>
          </ul>
        </div>

        {/* Section 4: Quy trình đổi trả */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-8">
            4. Quy trình đổi trả
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2,3,4].map((step) => (
              <div key={step} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#003830] text-[#f7dcb6] font-bold flex items-center justify-center text-xl flex-shrink-0">
                  {step}
                </div>
                <div className="text-[#003830]/80">
                  {step === 1 && <p><strong>Bước 1:</strong> Liên hệ ngay với tụi mình qua Hotline/Zalo: <strong>083 337 1111</strong> hoặc Fanpage Am Roaster.</p>}
                  {step === 2 && <p><strong>Bước 2:</strong> Cung cấp Mã đơn hàng kèm Hình ảnh/Video hiện trạng sản phẩm (chỗ bị rách, tem nhãn sai, hoặc hình ảnh hạt lỗi).</p>}
                  {step === 3 && <p><strong>Bước 3:</strong> Nhân viên Am Roaster sẽ tiếp nhận, thẩm định và phản hồi hướng xử lý trong vòng <strong>24h</strong>.</p>}
                  {step === 4 && <p><strong>Bước 4:</strong> Nếu lỗi do Am Roaster: Am sẽ gửi shipper đến thu hồi hàng hoặc hướng dẫn bạn gửi hàng về. Sau khi nhận được hàng hoàn, Am sẽ gửi sản phẩm mới (hoặc hoàn tiền) theo thỏa thuận.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Chi phí & Hoàn tiền */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-[#003830] mb-4">Chi phí vận chuyển</h3>
            <ul className="space-y-3 text-[#003830]/80">
              <li>• Lỗi từ Am Roaster: Am chịu <strong>100% chi phí 2 chiều</strong>.</li>
              <li>• Nhu cầu cá nhân: Bạn vui lòng thanh toán phí phát sinh.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-[#003830] mb-4">Phương thức hoàn tiền</h3>
            <ul className="space-y-3 text-[#003830]/80">
              <li>• Chuyển khoản ngân hàng: Hoàn trong <strong>1-3 ngày làm việc</strong>.</li>
              <li>• Voucher/Điểm tích lũy: Tặng Voucher cho lần mua sau.</li>
            </ul>
          </div>
        </div>

        {/* Liên hệ */}
        <div className="bg-gradient-to-r from-[#003830] to-[#002922] rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Mọi thắc mắc xin vui lòng liên hệ:</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="flex items-center justify-center gap-3">
              <MapPin className="w-6 h-6" />
              <span><strong>Địa chỉ cửa hàng:</strong> Tầng trệt toà nhà Babylon The Signature số 35 Nguyễn Văn Đậu - Phường Bình Lợi Trung - Bình Thạnh (đối diện Kingfood Mart), TP. Hồ Chí Minh</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <MapPin className="w-6 h-6" />
              <span><strong>Địa chỉ Farm:</strong> Thôn Phúc Thanh, Xã Phúc Thọ, Huyện Lâm Hà, Tỉnh Lâm Đồng</span>
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
        </div>
      </div>
    </div>
  );
}