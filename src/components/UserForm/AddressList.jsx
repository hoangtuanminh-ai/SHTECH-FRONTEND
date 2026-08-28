import axios from "axios";
import { useEffect, useState } from "react";

export default function AddressList() {
  // State lưu danh sách địa chỉ
  const [addresses, setAddresses] = useState([]);
  // State bật/tắt popup thêm địa chỉ
  const [showPopup, setShowPopup] = useState(false);
  // State lưu dữ liệu form thêm/sửa địa chỉ
  const [formData, setFormData] = useState({
    fullname: "",
    address: "",
    phoneAddress: "",
  });

  // State phân trang: trang hiện tại
  const [page, setPage] = useState(0);
  // Tổng số trang
  const [totalPages, setTotalPages] = useState(0);

  // Lấy token từ localStorage hoặc sessionStorage
  const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");

  // Hàm fetch danh sách địa chỉ từ backend
  const fetchAddresses = async (page, token) => {
    if (!token) return; // nếu không có token thì không fetch
    try {
      const res = await axios.get(
        `http://localhost:8080/api/v1/addresses?size=3&page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(res.data.content || []); // set danh sách địa chỉ
      setTotalPages(res.data.totalPages); // set tổng số trang
    } catch (err) {
      console.error("Lỗi khi lấy address:", err);
      setAddresses([]);
      setTotalPages(0);
      if (err.response?.status === 403) {
        // Token hết hạn hoặc không có quyền
        alert(
          "Bạn không có quyền truy cập hoặc token hết hạn. Hãy đăng nhập lại."
        );
      }
    }
  };

  // Chạy khi component mount hoặc page thay đổi
  useEffect(() => {
    if (token) {
      fetchAddresses(page, token);
    } else {
      alert("Bạn cần đăng nhập để xem danh sách địa chỉ");
    }
  }, [page, token]);

  // Hàm xóa địa chỉ
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Nếu xóa xong chỉ còn 1 item trên trang và không phải trang đầu, lùi về trang trước
      if (addresses.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        fetchAddresses(page, token); // load lại danh sách
      }
    } catch (err) {
      console.error("Lỗi khi xóa address:", err);
      alert("Xóa địa chỉ thất bại");
    }
  };

  // Mở popup thêm địa chỉ, reset form
  const handleOpenPopup = () => {
    setFormData({ fullname: "", address: "", phoneAddress: "" });
    setShowPopup(true);
  };

  // Đóng popup
  const handleClosePopup = () => setShowPopup(false);

  // Cập nhật dữ liệu form khi input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Lưu địa chỉ mới
  const handleSave = async () => {
    if (!formData.fullname || !formData.address || !formData.phoneAddress) {
      alert("Vui lòng nhập đầy đủ thông tin"); // validate cơ bản
      return;
    }
    try {
      await axios.post("http://localhost:8080/api/v1/addresses", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses(page, token); // reload danh sách
      setShowPopup(false); // đóng popup
    } catch (err) {
      console.error("Lỗi khi thêm address:", err);
      alert("Thêm địa chỉ thất bại");
    }
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold text-[#9c5136] mb-6 border-b border-[#9c5136]/30">
        Danh sách địa chỉ nhận hàng
      </h1>

      {/* Nút mở popup thêm địa chỉ */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleOpenPopup}
          className="px-4 py-2 rounded text-white bg-[#9c5136] hover:bg-gray-500"
        >
          Nhập địa chỉ mới
        </button>
      </div>

      {/* Hiển thị danh sách địa chỉ */}
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="border rounded-lg p-3 shadow-sm">
            <p className="font-bold">{addr.fullname}</p>
            <p>Địa chỉ: {addr.address}</p>
            <p>Số điện thoại: {addr.phoneAddress}</p>
            <button
              onClick={() => handleDelete(addr.id)}
              className="mt-2 px-3 py-1 bg-[#9c5136] text-white rounded hover:bg-gray-500"
            >
              Xóa địa chỉ
            </button>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      <div className="flex gap-2 mt-4 items-center">
        {/* Nút trang trước */}
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 hover:bg-gray-500"
        >
          Trang trước
        </button>

        {/* Nút số trang */}
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-1 rounded ${
              page === i
                ? "bg-[#9c5136] text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}

        {/* Nút trang sau */}
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 hover:bg-gray-500"
        >
          Trang sau
        </button>
      </div>

      {/* Popup thêm địa chỉ */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Nhập địa chỉ mới</h3>
            <div className="space-y-3">
              <input
                type="text"
                name="fullname"
                placeholder="Tên người nhận"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="address"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="phoneAddress"
                placeholder="Số điện thoại"
                value={formData.phoneAddress}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#9c5136] text-white rounded hover:bg-gray-500"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
