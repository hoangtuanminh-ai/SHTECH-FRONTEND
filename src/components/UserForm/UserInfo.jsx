// import { useEffect, useState } from "react";
// import { useOutletContext } from "react-router-dom";
// import axios from "axios";

// export default function UserInfo() {
//   // Lấy userInfo và setUserInfo từ Outlet context
//   const { userInfo, setUserInfo } = useOutletContext();

//   // State lưu dữ liệu form
//   const [formData, setFormData] = useState({});
//   // State quản lý chế độ chỉnh sửa
//   const [isEditing, setIsEditing] = useState(false);
//   // State loading khi gửi request
//   const [loading, setLoading] = useState(false);

//   // Lấy token từ localStorage hoặc sessionStorage
//   const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");

//   // Helper format date sang yyyy-MM-dd
//   const formatDate = (d) => {
//     if (!d) return "";
//     const dt = new Date(d);
//     return dt.toISOString().split("T")[0];
//   };

//   // Đồng bộ formData từ userInfo khi component mount hoặc userInfo thay đổi
//   useEffect(() => {
//     if (userInfo) {
//       setFormData({
//         id: userInfo.id,
//         fullName: userInfo.fullName || "",
//         userName: userInfo.userName || "",
//         gender: userInfo.gender || "Nam",
//         email: userInfo.email || "",
//         phoneNumber: userInfo.phoneNumber || "",
//         dateOfBirth: formatDate(userInfo.dateOfBirth),
//         address: userInfo.address || "",
//       });
//     }
//   }, [userInfo]);

//   // Cập nhật dữ liệu form khi input thay đổi
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Validate cơ bản form trước khi gửi
//   const validateForm = () => {
//     if (!formData.fullName) {
//       alert("Họ và tên không được để trống");
//       return false;
//     }
//     if (!formData.email) {
//       alert("Email không được để trống");
//       return false;
//     }
//     if (!formData.gender) {
//       alert("Giới tính không được để trống");
//       return false;
//     }
//     return true;
//   };

//   // Xử lý lưu thông tin user
//   const handleSave = async () => {
//     if (!formData.id) {
//       alert("Không xác định được ID người dùng!");
//       return;
//     }

//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const payload = {
//         fullName: formData.fullName,
//         gender: formData.gender,
//         email: formData.email,
//         phoneNumber: formData.phoneNumber,
//         dateOfBirth: formData.dateOfBirth || null, // yyyy-MM-dd
//         address: formData.address,
//       };

//       // PUT cập nhật user
//       await axios.put(`http://localhost:8080/user/${formData.id}`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // GET lại thông tin user mới
//       const res = await axios.get("http://localhost:8080/user/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // Cập nhật lại state userInfo và formData
//       setUserInfo(res.data);
//       setFormData({
//         id: res.data.id,
//         fullName: res.data.fullName || "",
//         userName: res.data.userName || "",
//         gender: res.data.gender || "Nam",
//         email: res.data.email || "",
//         phoneNumber: res.data.phoneNumber || "",
//         dateOfBirth: formatDate(res.data.dateOfBirth),
//         address: res.data.address || "",
//       });
//       setIsEditing(false);
//       alert("Cập nhật thông tin thành công!");
//     } catch (err) {
//       console.error(err);
//       alert(
//         "Cập nhật thất bại: " + (err.response?.data?.message || err.message)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mảng định nghĩa các trường hiển thị và chỉnh sửa
//   const userFields = [
//     { label: "Username", key: "userName", type: "text", disabled: true },
//     { label: "Họ và tên", key: "fullName", type: "text" },
//     {
//       label: "Giới tính",
//       key: "gender",
//       type: "select",
//       options: ["Nam", "Nữ"],
//     },
//     { label: "Email", key: "email", type: "email" },
//     { label: "Số điện thoại", key: "phoneNumber", type: "tel" },
//     { label: "Ngày sinh", key: "dateOfBirth", type: "date" },
//     { label: "Địa chỉ", key: "address", type: "text" },
//   ];

//   return (
//     <div className="w-full p-6">
//       <h1 className="text-2xl font-bold text-[#9c5136] mb-6 border-b border-[#9c5136]/30">
//         Tài khoản của bạn
//       </h1>

//       {!isEditing ? (
//         <>
//           {/* Hiển thị thông tin user dưới dạng table */}
//           <table className="w-full border border-[#9c5136] text-left rounded-lg overflow-hidden">
//             <tbody>
//               {userFields.map((item, idx) => (
//                 <tr
//                   key={idx}
//                   className="border-b border-[#9c5136]/20 last:border-b-0"
//                 >
//                   <td className="p-2 font-medium bg-gray-100 w-1/3">
//                     {item.label}
//                   </td>
//                   <td className="p-2">
//                     {item.key === "dateOfBirth" && formData[item.key]
//                       ? new Date(formData[item.key]).toLocaleDateString("vi-VN")
//                       : formData[item.key]}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Nút chuyển sang chế độ chỉnh sửa */}
//           <button
//             onClick={() => setIsEditing(true)}
//             className="mt-6 flex items-center gap-2 bg-[#9c5136] hover:bg-gray-500 text-white px-4 py-2 rounded-xl shadow cursor-pointer"
//           >
//             Chỉnh sửa thông tin cá nhân
//           </button>
//         </>
//       ) : (
//         <>
//           {/* Form chỉnh sửa thông tin user */}
//           <form className="space-y-4">
//             {userFields.map((item, idx) => (
//               <div key={idx}>
//                 <label htmlFor={item.key} className="block font-medium mb-1">
//                   {item.label}
//                 </label>
//                 {item.type === "select" ? (
//                   <select
//                     id={item.key}
//                     name={item.key}
//                     value={formData[item.key] || ""}
//                     onChange={handleChange}
//                     className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9c5136]"
//                   >
//                     {item.options.map((opt) => (
//                       <option key={opt} value={opt}>
//                         {opt}
//                       </option>
//                     ))}
//                   </select>
//                 ) : (
//                   <input
//                     id={item.key}
//                     type={item.type}
//                     name={item.key}
//                     value={formData[item.key] || ""}
//                     onChange={handleChange}
//                     disabled={item.disabled}
//                     className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9c5136] disabled:bg-gray-200"
//                   />
//                 )}
//               </div>
//             ))}
//           </form>

//           {/* Nút lưu hoặc hủy */}
//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={handleSave}
//               disabled={loading}
//               className="bg-[#9c5136] hover:bg-gray-500 text-white px-4 py-2 rounded-xl shadow disabled:opacity-50 cursor-pointer"
//             >
//               {loading ? "Đang lưu..." : "Lưu"}
//             </button>
//             <button
//               onClick={() => setIsEditing(false)}
//               className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-xl shadow cursor-pointer"
//             >
//               Hủy
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";

export default function UserInfo() {
  const { userInfo, setUserInfo } = useOutletContext();
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==== Địa chỉ giống RegisterForm ====
  const [locations, setLocations] = useState([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");

  const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toISOString().split("T")[0];
  };

  // Fetch provinces
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error("Error fetching provinces:", err));
  }, []);

  // Sync formData từ userInfo
  useEffect(() => {
    if (userInfo) {
      setFormData({
        id: userInfo.id,
        fullName: userInfo.fullName || "",
        userName: userInfo.userName || "",
        gender: userInfo.gender || "Nam",
        email: userInfo.email || "",
        phoneNumber: userInfo.phoneNumber || "",
        dateOfBirth: userInfo.dateOfBirth
          ? new Date(userInfo.dateOfBirth)
          : null,
        address: userInfo.address || "",
      });

      // parse address thành street, ward, district, province
      if (userInfo.address) {
        const parts = userInfo.address.split(",").map((p) => p.trim());
        setStreet(parts[0] || "");
        setWard(parts[1] || "");
        setDistrict(parts[2] || "");
        setProvince(parts[3] || "");
      }
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName) {
      alert("Họ và tên không được để trống");
      return false;
    }
    if (!formData.email) {
      alert("Email không được để trống");
      return false;
    }
    if (!street || !province || !district || !ward) {
      alert("Địa chỉ không được để trống");
      return false;
    }
    if (street && street.includes(",")) {
    alert("Số nhà, Tên đường không được chứa dấu phẩy (,)");
    return false;
  }
    return true;
  };

  const handleSave = async () => {
    if (!formData.id) {
      alert("Không xác định được ID người dùng!");
      return;
    }
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fullAddress = `${street}, ${ward}, ${district}, ${province}`;
      const payload = {
        fullName: formData.fullName,
        gender: formData.gender,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        address: fullAddress,
      };

      await axios.put(`http://localhost:8080/user/${formData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await axios.get("http://localhost:8080/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserInfo(res.data);
      setFormData({
        id: res.data.id,
        fullName: res.data.fullName || "",
        userName: res.data.userName || "",
        gender: res.data.gender || "Nam",
        email: res.data.email || "",
        phoneNumber: res.data.phoneNumber || "",
        dateOfBirth: formatDate(res.data.dateOfBirth),
        address: res.data.address || "",
      });

      // parse lại address
      if (res.data.address) {
        const parts = res.data.address.split(",").map((p) => p.trim());
        setStreet(parts[0] || "");
        setWard(parts[1] || "");
        setDistrict(parts[2] || "");
        setProvince(parts[3] || "");
      }

      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error(err);
      alert(
        "Cập nhật thất bại: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const districts = locations.find((p) => p.name === province)?.districts || [];
  const wards = districts.find((d) => d.name === district)?.wards || [];

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold text-[#9c5136] mb-6 border-b border-[#9c5136]/30">
        Tài khoản của bạn
      </h1>

      {!isEditing ? (
        <>
          <table className="w-full border border-[#9c5136] text-left rounded-lg overflow-hidden">
            <tbody>
              <tr>
                <td className="p-2 font-medium bg-gray-100 w-1/3">Username</td>
                <td className="p-2">{formData.userName}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium bg-gray-100">Họ và tên</td>
                <td className="p-2">{formData.fullName}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium bg-gray-100">Giới tính</td>
                <td className="p-2">{formData.gender}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium bg-gray-100">Email</td>
                <td className="p-2">{formData.email}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium bg-gray-100">Số điện thoại</td>
                <td className="p-2">{formData.phoneNumber}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium bg-gray-100">Ngày sinh</td>
                <td className="p-2">
                  {formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toLocaleDateString("vi-VN")
                    : ""}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium bg-gray-100">Địa chỉ</td>
                <td className="p-2">{formData.address}</td>
              </tr>
            </tbody>
          </table>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-6 bg-[#9c5136] hover:bg-gray-500 text-white px-4 py-2 rounded-xl shadow cursor-pointer"
          >
            Chỉnh sửa thông tin cá nhân
          </button>
        </>
      ) : (
        <>
          <form className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="block font-medium mb-1">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-medium mb-1">Số điện thoại</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block font-medium mb-1">Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block font-medium mb-1">Ngày sinh</label>
              <DatePicker
                selected={formData.dateOfBirth}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, dateOfBirth: date }))
                }
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            {/* Address giống RegisterForm */}
            <div>
              <label className="block font-medium mb-1">Địa chỉ</label>
              <input
                type="text"
                placeholder="Số nhà, tên đường"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg mb-2"
              />

              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setDistrict("");
                  setWard("");
                }}
                className="w-full border px-3 py-2 rounded-lg mb-2"
              >
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {locations.map((p) => (
                  <option key={p.code} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setWard("");
                }}
                disabled={!province}
                className="w-full border px-3 py-2 rounded-lg mb-2"
              >
                <option value="">-- Chọn Quận/Huyện --</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                disabled={!district}
                className="w-full border px-3 py-2 rounded-lg"
              >
                <option value="">-- Chọn Phường/Xã --</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#9c5136] hover:bg-gray-500 text-white px-4 py-2 rounded-xl shadow disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 hover:bg-gray-400 text-black px-4 py-2 rounded-xl shadow cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </>
      )}
    </div>
  );
}
