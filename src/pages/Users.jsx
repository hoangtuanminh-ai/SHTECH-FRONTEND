import { useState, useEffect } from "react";
import { getAllUsers, createUser, updateUser, deleteUser } from "../api/userApi";

function Users() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    fullName: "",
    address: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    role: "",
    username: "",
    password: "",
    gender: "",
  });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers(); // gọi API
      setUsers(data.content); // chỉ lấy mảng user
    } catch (err) {
      console.error("Lỗi khi load users:", err);
    }
  };

  // Chuyển đổi ngày hiển thị dạng dd/MM/yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openModal = (user = null) => {
    if (user) {
      setNewUser({
        ...user,
        dateOfBirth: user.dateOfBirth?.split("T")[0] || "", // giữ ISO format yyyy-MM-dd
      });
      setEditId(user.id);
    } else {
      setNewUser({
        fullName: "",
        address: "",
        dateOfBirth: "",
        phoneNumber: "",
        email: "",
        role: "",
        username: "",
        password: "",
        gender: "",
      });
      setEditId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

 const handleSave = async () => {
  try {
    const userToSave = {
      ...newUser,
      dateOfBirth: newUser.dateOfBirth, // giữ nguyên yyyy-MM-dd
    };

    if (editId) {
      await updateUser(editId, userToSave);
    } else {
      await createUser(userToSave);
    }

    fetchUsers();
    closeModal();
  } catch (err) {
    console.error("Lỗi khi lưu user:", err);
  }
};


  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi xóa user:", err);
    }
  };

  // Phân trang thủ công
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = users.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="p-4 ml-20 mr-90">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý người dùng</h1>
      <button
        onClick={() => openModal()}
        className="mb-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        Thêm người dùng
      </button>

      {/* Bảng */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border p-3">ID</th>
              <th className="border p-3">Họ tên</th>
              <th className="border p-3">Địa chỉ</th>
              <th className="border p-3">Ngày sinh</th>
              <th className="border p-3">SĐT</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Giới tính</th>
              <th className="border p-3">Vai trò</th>
              <th className="border p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="border p-3">{u.id}</td>
                <td className="border p-3">{u.fullName}</td>
                <td className="border p-3">{u.address}</td>
                <td className="border p-3">{formatDate(u.dateOfBirth)}</td>
                <td className="border p-3">{u.phoneNumber}</td>
                <td className="border p-3">{u.email}</td>
                <td className="border p-3">{u.gender}</td>
                <td className="border p-3">{u.role}</td>
                <td className="border p-3">
                  <button
                    onClick={() => openModal(u)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md bg-gray-200 disabled:opacity-50"
        >
          Trước
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded-md ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md bg-gray-200 disabled:opacity-50"
        >
          Sau
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50"
>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-700">
              {editId ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Họ tên"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                className="border rounded-md p-2"
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={newUser.address}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                className="border rounded-md p-2"
              />
              <input
                type="date"
                value={newUser.dateOfBirth}
                onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                className="border rounded-md p-2"
              />
              <input
                type="text"
                placeholder="SĐT"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                className="border rounded-md p-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="border rounded-md p-2"
              />
              <select
                value={newUser.gender}
                onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                className="border rounded-md p-2"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="border rounded-md p-2"
              >
                <option value="">Chọn vai trò</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
              <input
                type="text"
                placeholder="Username"
                value={newUser.userName}
                onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                className="border rounded-md p-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="border rounded-md p-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded-md">
                Hủy
              </button>
              <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                {editId ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
