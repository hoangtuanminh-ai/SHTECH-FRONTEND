import React from "react";
import { FaEnvelope, FaFacebookF, FaInstagram, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#f8f4f4] text-[#003830] py-12 px-4 border-t border-[#003830]/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        {/* Cột 1: Thương hiệu & Mạng xã hội */}
        <div>
          <h3 className="text-2xl font-bold text-[#003830] mb-6">AM ROASTER</h3>
          <p className="mb-6 leading-relaxed text-[#003830]/80">
            Theo dõi hành trình từ hạt đến ly của chúng mình nhé!
          </p>
          <div className="flex gap-5 text-xl">
            <a href="mailto:thuydung15.tnmt@gmail.com" className="hover:text-[#D4AF37] transition">
              <FaEnvelope />
            </a>
            <a href="https://facebook.com/amroaster" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com/amroaster" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition">
              <FaInstagram />
            </a>
            <a href="tel:0833371111" className="hover:text-[#D4AF37] transition">
              <FaPhone />
            </a>
          </div>
        </div>

        {/* Cột 2: Danh mục sản phẩm */}
        <div>
          <h3 className="text-lg font-semibold text-[#003830] mb-5">Danh mục sản phẩm</h3>
          <ul className="space-y-3">
            <li>
              <Link to="/danh-muc-san-pham/ca-phe-nhan-xanh" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                Nhân xanh
              </Link>
            </li>
            <li>
              <Link to="/danh-muc-san-pham/tat-ca-san-pham" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                Cà phê rang xay
              </Link>
            </li>
            <li>
              <Link to="/danh-muc-san-pham/phin-va-dung-cu" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                Phin & dụng cụ pha
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Cửa hàng & Bản đồ */}
        <div>
          <h3 className="text-lg font-semibold text-[#003830] mb-5">Cửa hàng của chúng tôi</h3>
          <p className="mb-4 leading-relaxed text-[#003830]/80">
            Tầng trệt toà nhà Babylon The Signature<br />
            Số 35 Nguyễn Văn Đậu, Phường Bình Lợi Trung<br />
            Quận Bình Thạnh, TP. Hồ Chí Minh
          </p>

          {/* Google Map */}
          <div className="rounded-xl overflow-hidden shadow-lg mt-6 border border-[#003830]/10">
            <iframe
              title="Vị trí cửa hàng Am Roaster"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.469493346613!2d106.69827827584534!3d10.77688925917772!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f409d3e6f4d%3A0xd57f54e875b82644!2sSaigon%20Centre!5e0!3m2!1svi!2s!4v1730381189530!5m2!1svi!2s"
              width="100%"
              height="200"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0"
            ></iframe>
          </div>
        </div>

        {/* Cột 4: Liên kết nhanh + Chính sách đổi trả mới thêm */}
        <div>
          <h3 className="text-lg font-semibold text-[#003830] mb-5">Thông tin & Hỗ trợ</h3>
          <ul className="space-y-3">
            <li>
              <Link to="/gioi-thieu" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                Về chúng tôi
              </Link>
            </li>
            <li>
              <Link to="/doi-tra" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link to="/van-chuyen" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                Chính sách vận chuyển
              </Link>
            </li>
            <li>
              <Link to="/bao-hanh" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                Chính sách bảo hành
              </Link>
            </li>
              <li>
                <Link to="/bao-mat" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                  Chính sách bảo mật
                </Link>
              </li>
               <li>
                <Link to="/thanh-toan-chinh-sach" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                  Chính sách thanh toán 
                </Link>
              </li>
            <li>
              <Link to="/lien-he" className="hover:text-[#D4AF37] transition underline-offset-2 hover:underline">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 pt-8 border-t border-[#003830]/10 text-center text-[#003830]/70 text-sm">
        <p>© 2025 Am Roaster. Tất cả quyền được bảo lưu.</p>
        <p className="mt-2">Bền vững từ hạt nhân xanh.</p>
      </div>
    </footer>
  );
};

export default Footer;