import React from "react";
import { Shield, CheckCircle, XCircle, Package,Coffee, Clock, Phone, Mail } from "lucide-react";

export default function WarrantyPolicy() {
  return (
    <div className="mt-20 min-h-screen bg-[#f8f9fa] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#003830] mb-6">
            CHÍNH SÁCH BẢO HÀNH
          </h1>
          <p className="text-lg text-[#003830]/80 max-w-3xl mx-auto leading-relaxed">
            Tại Am Roaster, "tờ phiếu bảo hành" uy tín nhất chính là hương vị trong từng tách cà phê bạn uống.<br />
            Vì cà phê là nông sản tự nhiên, không phải máy móc, nên Am không có chính sách sửa chữa. Thay vào đó, tụi mình gửi đến bạn Chính sách Cam kết Chất lượng 100%. Đây là lời hứa danh dự từ những người làm nghề tại Phúc Thọ, Lâm Hà để bạn hoàn toàn yên tâm khi sử dụng.
          </p>
        </div>

        {/* Section 1: Đối với Cà phê Rang Xay */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Coffee className="w-8 h-8 text-[#003830]" />
            1. Đối với Cà Phê Rang Xay (Dạng Hạt & Dạng Bột)
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Khi bạn cầm trên tay gói cà phê của Am, bạn đang sở hữu sản phẩm được bảo đảm bởi Quy tắc “3 KHÔNG - 3 CÓ”:
          </p>

          <h3 className="text-xl font-bold text-[#003830] mb-4">Cam kết 3 CÓ:</h3>
          <ul className="space-y-4 text-[#003830]/80 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span><strong>Có nguồn gốc rõ ràng:</strong> 100% hạt cà phê từ vùng nguyên liệu Phúc Thọ, Lâm Hà, Lâm Đồng.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span><strong>Có sự tươi mới:</strong> Cà phê luôn được rang mới (Fresh Roast), không bán hàng tồn kho quá hạn (Date cũ).</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span><strong>Có trách nhiệm:</strong> Nếu cà phê bị lỗi do sản xuất (hôi, mốc, có vật lạ), Am cam kết đổi mới 1 đổi 1 ngay lập tức.</span>
            </li>
          </ul>

          <h3 className="text-xl font-bold text-[#003830] mb-4">Cam kết 3 KHÔNG:</h3>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <span>Không tẩm ướp: Giữ nguyên hương vị mộc mạc của hạt cà phê.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <span>Không độn: Không trộn bắp, đậu nành hay các loại ngũ cốc khác.</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <span>Không chất bảo quản: An toàn tuyệt đối cho sức khỏe.</span>
            </li>
          </ul>

          <p className="text-[#003830]/80 mt-6 italic">
            Lưu ý: "Bảo hành" hương vị tốt nhất của cà phê là trong vòng <strong>45-60 ngày</strong> sau khi rang. Bạn nhớ dùng sớm để cảm nhận độ ngon nhất nhé!
          </p>
        </div>

        {/* Section 2: Đối với Cà phê Nhân Xanh */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Package className="w-8 h-8 text-[#003830]" />
            2. Đối với Cà Phê Nhân Xanh (Green Bean)
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Dành cho các Home Roaster (người tự rang tại nhà) hoặc các đối tác mua sỉ, Am bảo đảm chất lượng nhân xanh như sau:
          </p>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span><strong>Đúng sàng, đúng chuẩn:</strong> Giao đúng loại hạt (S18, S16, Cululi...) và phương pháp sơ chế (Honey, Natural, Washed) như mô tả trên web.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span><strong>Tỷ lệ lỗi thấp:</strong> Cam kết tỷ lệ hạt lỗi đen/vỡ nằm trong mức cho phép của tiêu chuẩn cà phê chất lượng cao.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span><strong>Độ ẩm chuẩn:</strong> Hạt được bảo quản ở độ ẩm lý tưởng (11.5% - 12.5%), không bị ám mùi lạ hay ẩm mốc trong quá trình lưu kho.</span>
            </li>
          </ul>
        </div>

        {/* Section 3: Điều kiện bảo hành */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#003830]" />
            3. Điều kiện "Bảo hành" (Đổi mới)
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Am Roaster sẽ chịu trách nhiệm thu hồi và đổi mới miễn phí trong các trường hợp:
          </p>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span>Cà phê có dấu hiệu bị mốc, lên men hỏng khi vừa mở túi.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span>Cà phê có mùi lạ (mùi dầu hôi, mùi hóa chất) không phải mùi đặc trưng của cà phê.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span>Có vật thể lạ lẫn trong túi cà phê.</span>
            </li>
          </ul>
          <p className="text-[#003830]/80 mt-6 italic">
            Lưu ý: Thời hạn tiếp nhận phản hồi là <strong>48 giờ</strong> kể từ khi bạn nhận hàng.
          </p>
        </div>

        {/* Section 4: Quy trình bảo hành */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-8">
            4. Quy trình gửi bảo hành
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Nếu chẳng may gặp sản phẩm lỗi, bạn đừng lo lắng, hãy làm theo các bước đơn giản sau:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2,3,4,5].map((step) => (
              <div key={step} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#003830] text-[#f7dcb6] font-bold flex items-center justify-center text-xl flex-shrink-0">
                  {step}
                </div>
                <div className="text-[#003830]/80">
                  {step === 1 && <p><strong>Bước 1:</strong> Giữ nguyên hiện trạng sản phẩm (đừng vứt bỏ vội nhé).</p>}
                  {step === 2 && <p><strong>Bước 2:</strong> Liên hệ với Am qua Hotline/Zalo: <strong>083 337 1111</strong> hoặc nhắn tin Fanpage.</p>}
                  {step === 3 && <p><strong>Bước 3:</strong> Gửi video/hình ảnh tình trạng lỗi để kỹ thuật viên của Am kiểm tra sơ bộ.</p>}
                  {step === 4 && <p><strong>Bước 4:</strong> Gửi sản phẩm về trung tâm bảo hành của Am Roaster tại: Tầng trệt toà nhà Babylon The Signature, số 35 Nguyễn Văn Đậu, Phường Bình Lợi Trung, Bình Thạnh, TP.HCM. (Bạn nhớ bọc gói cẩn thận nhé!)</p>}
                  {step === 5 && <p><strong>Bước 5:</strong> Am sẽ kiểm tra và đổi mới rồi gửi lại tận tay cho bạn.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Chi phí */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6 flex items-center gap-3">
            <Package className="w-8 h-8 text-[#003830]" />
            5. Chi phí bảo hành
          </h2>
          <ul className="space-y-4 text-[#003830]/80">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span><strong>Miễn phí 100%:</strong> Đối với các lỗi thuộc về nhà sản xuất trong thời gian bảo hành.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#003830] flex-shrink-0 mt-1" />
              <span><strong>Có tính phí (Hỗ trợ):</strong> Đối với các lỗi do người dùng hoặc hết hạn bảo hành, Am sẽ hỗ trợ sửa chữa với chi phí ưu đãi nhất.</span>
            </li>
          </ul>
        </div>

        {/* Lời nhắn bảo quản */}
        <div className="bg-gradient-to-br from-[#003830] to-[#002922] rounded-2xl p-8 md:p-12 text-white text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Lời nhắn nhỏ về bảo quản</h2>
          <p className="text-lg leading-relaxed">
            Cà phê cũng giống như thực phẩm tươi, "bảo hành" tốt nhất chính là cách bạn bảo quản.<br />
            Sau khi cắt bao bì, bạn nhớ zip kín miệng túi hoặc đựng trong hũ kín, để nơi thoáng mát tránh ánh nắng trực tiếp để hương vị luôn trọn vẹn nhé!
          </p>
        </div>

        {/* Liên hệ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003830] mb-6">
            Am Roaster luôn ở đây để lắng nghe!
          </h2>
          <p className="text-[#003830]/80 mb-6">
            Mọi thắc mắc về chất lượng hay bảo hành, bạn cứ thoải mái liên hệ để tụi mình giải đáp nhanh nhất nha.
          </p>
          <div className="space-y-4 max-w-lg mx-auto">
            <p className="flex items-center justify-center gap-3 text-lg">
              <Phone className="w-6 h-6 text-[#003830]" />
              <strong>Hotline hỗ trợ: 083 337 1111</strong>
            </p>
            <p className="flex items-center justify-center gap-3 text-lg">
              <Mail className="w-6 h-6 text-[#003830]" />
              <strong>Email: thuydung15.tnmt@gmail.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}