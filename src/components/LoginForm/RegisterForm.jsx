import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";

export default function RegisterForm() {
  // ====== State lưu dữ liệu form ======
  const [userName, setUserName] = useState(""); // Tên đăng nhập
  const [fullName, setFullName] = useState(""); // Họ và tên
  const [email, setEmail] = useState(""); // Email
  const [dateOfBirth, setDateOfBirth] = useState(""); // Ngày sinh
  const [password, setPassword] = useState(""); // Mật khẩu
  const [confirmPassword, setConfirmPassword] = useState(""); // Xác nhận mật khẩu
  const [phoneNumber, setPhoneNumber] = useState(""); // Số điện thoại
  const [address, setAddress] = useState(""); // Địa chỉ
  const [gender, setGender] = useState("Nam"); // Giới tính mặc định Nam
  const [errors, setErrors] = useState({}); // Lưu lỗi validate
  const [locations, setLocations] = useState([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState(""); // số nhà, tên đường
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  // Countdown cho resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error("Error fetching provinces:", err));
  }, []);

  const districts = locations.find((p) => p.name === province)?.districts || [];
  const wards = districts.find((d) => d.name === district)?.wards || [];

  // ====== Hàm validate dữ liệu đầu vào ======
  const validate = () => {
    const newErrors = {};

    // Username
    if (!userName.trim())
      newErrors.userName = "Tên đăng nhập không được để trống";
    else if (userName.length < 6)
      newErrors.userName = "Tên đăng nhập phải có ít nhất 6 ký tự";

    // Full Name
    if (!fullName.trim()) newErrors.fullName = "Họ và tên không được để trống";

    // Email
    if (!email.trim()) newErrors.email = "Email không được để trống";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email))
      newErrors.email = "Email không hợp lệ";

    // Password
    if (!password) newErrors.password = "Mật khẩu không được để trống";
    else if (password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    // Confirm Password
    if (confirmPassword !== password)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    // Phone Number
    if (!phoneNumber.trim())
      newErrors.phoneNumber = "Số điện thoại không được để trống";
    else if (!/^[0-9]{10}$/.test(phoneNumber))
      newErrors.phoneNumber = "Số điện thoại phải đủ 10 chữ số";

    // Date of Birth
    if (!dateOfBirth) newErrors.dateOfBirth = "Ngày sinh không được để trống";

    // Address
    if (!street.trim() || !province || !district || !ward) {
      newErrors.address = "Địa chỉ không được để trống";
    } else if (street.includes(",")) {
      newErrors.address = "Số nhà, Tên đường không được chứa dấu phẩy (,)";
    }

    return newErrors; // Trả về object lỗi
  };

  // ====== Xử lý submit form ======
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn reload trang
    const newErrors = validate(); // Validate form
    setErrors(newErrors); // Hiển thị lỗi nếu có

    if (Object.keys(newErrors).length > 0) return; // Nếu có lỗi thì dừng

    try {
      const fullAddress = `${street}, ${ward}, ${district}, ${province}`;
      // Tạo payload gửi lên backend
      const payload = {
        userName,
        fullName,
        email,
        password,
        phoneNumber,
        address: fullAddress,
        gender, // enum "Nam" hoặc "Nữ"
        dateOfBirth, // yyyy-MM-dd
      };

      // Gọi API đăng ký
      const res = await axios.post(
        "http://localhost:8080/api/auth/register",
        payload
      );
      setShowOtpPopup(true);
      setResendCooldown(60); // set cooldown cho resend ngay lần đầu
    } catch (err) {
      console.error("Đăng ký thất bại:", err.response?.data || err.message);
      alert(
        "Đăng ký thất bại: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/resend-otp", { email });
      alert("OTP mới đã được gửi đến email của bạn.");
      setResendCooldown(60); // reset lại countdown
    } catch (err) {
      console.error("Gửi lại OTP thất bại:", err.response?.data || err.message);
      alert("Không thể gửi lại OTP, vui lòng thử lại sau.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrors({ otp: "Vui lòng nhập mã OTP" });
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/verify-otp", {
        email,
        otp,
      });
      alert("Xác thực thành công! Bạn có thể đăng nhập.");
      setShowOtpPopup(false);

      // clear form
      setUserName("");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhoneNumber("");
      setAddress("");
      setDateOfBirth("");
      setGender("Nam");
      setErrors({});
      setOtp("");

      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrors({
        otp: "Mã OTP không đúng hoặc đã hết hạn, vui lòng thử lại",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 mt-40 mb-16">
      <div className="bg-white shadow-md rounded-lg p-8 w-md">
        <h2 className="text-center text-2xl font-semibold text-[#A0522D] mb-6">
          Đăng ký tài khoản
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* ====== Username ====== */}
          <div>
            <label className="block mb-1 mt-2 text-sm font-medium text-gray-700">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            />
            {errors.userName && (
              <p className="text-red-500 text-sm">{errors.userName}</p>
            )}
          </div>

          {/* ====== Full Name ====== */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName}</p>
            )}
          </div>

          {/* ====== Date of Birth ====== */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Ngày sinh
            </label>
            <DatePicker
              selected={dateOfBirth}
              onChange={(date) => setDateOfBirth(date)}
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              className="w-full border px-3 py-2 rounded-lg"
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* ====== Email ====== */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* ====== Password ====== */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* ====== Confirm Password ====== */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          {/* ====== Phone Number ====== */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
          </div>

          {/* ====== Address ====== */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Địa chỉ
            </label>

            {/* Số nhà, tên đường */}
            <input
              type="text"
              placeholder="Số nhà, tên đường"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D] mb-2"
            />

            {/* Dropdown Tỉnh */}
            <select
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setDistrict("");
                setWard("");
              }}
              className="w-full px-2 py-2 border rounded-md mb-2"
            >
              <option value="">-- Chọn Tỉnh/Thành phố --</option>
              {locations.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Dropdown Quận */}
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setWard("");
              }}
              disabled={!province}
              className="w-full px-2 py-2 border rounded-md mb-2"
            >
              <option value="">-- Chọn Quận/Huyện --</option>
              {districts.map((d) => (
                <option key={d.code} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Dropdown Phường */}
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              disabled={!district}
              className="w-full px-2 py-2 border rounded-md"
            >
              <option value="">-- Chọn Phường/Xã --</option>
              {wards.map((w) => (
                <option key={w.code} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>

            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>

          {/* ====== Gender ====== */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Giới tính
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          {/* ====== Submit Button ====== */}
          <button
            type="submit"
            className="w-full bg-[#A0522D] text-white py-2 rounded-md hover:bg-[#8B4513] transition cursor-pointer mt-4"
          >
            ĐĂNG KÝ
          </button>
        </form>

        {/* ====== Link chuyển sang Login ====== */}
        <div className="mt-4 text-center text-sm">
          Quay lại trang{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            ĐĂNG NHẬP
          </Link>
        </div>
      </div>

      {/* ====== POPUP OTP ====== */}
      {showOtpPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center animate-zoomIn">
            <h3 className="text-lg font-semibold mb-3">Nhập mã OTP</h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
              placeholder="Nhập OTP"
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mb-2">{errors.otp}</p>
            )}

            {/* Nút resend */}
            <button
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className={`w-full cursor-pointer py-2 rounded-md mb-3 transition ${
                resendCooldown > 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {resendCooldown > 0
                ? `Gửi lại OTP sau ${resendCooldown}s`
                : "Gửi lại OTP"}
            </button>

            <div className="flex justify-between gap-3 mt-2">
              <button
                onClick={() => {
                  setShowOtpPopup(false);
                  setOtp("");
                  setErrors({});
                }}
                className="flex-1 bg-gray-200 text-black py-2 rounded-md hover:bg-gray-400 transition cursor-pointer"
              >
                Thoát
              </button>

              <button
                onClick={handleVerifyOtp}
                className="flex-1 bg-[#A0522D] text-white py-2 rounded-md hover:bg-[#8B4513] transition cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
