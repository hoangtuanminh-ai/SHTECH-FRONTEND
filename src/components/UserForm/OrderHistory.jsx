// thêm mới file copy cả file vào
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { getUserOrderHistory } from "../../api/orderApi";

export default function OrderHistory() {
  const { userInfo } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 4; // 4 đơn hàng mỗi trang

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Lấy tất cả đơn hàng, không phân trang từ API
        const data = await getUserOrderHistory(userInfo.id, 0, 1000); // size lớn để lấy tất cả
        console.log("API Response:", data);

        // Chuyển đổi và sắp xếp đơn hàng theo orderDate giảm dần
        const sortedOrders = (data.content || []).sort((a, b) => {
          const dateA = parseDate(a.orderDate);
          const dateB = parseDate(b.orderDate);
          return dateB - dateA; // Giảm dần
        });

        setOrders(sortedOrders);
        setTotalPages(Math.ceil(sortedOrders.length / pageSize));
        // Cắt danh sách cho trang hiện tại
        setDisplayedOrders(sortedOrders.slice(page * pageSize, (page + 1) * pageSize));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.id) {
      fetchOrders();
    }
  }, [userInfo, page]);

  // Hàm chuyển đổi chuỗi ngày "dd/MM/yyyy" thành Date
  const parseDate = (dateString) => {
    if (!dateString) return new Date(0); // Ngày mặc định nếu không có
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day); // month - 1 vì Date dùng 0-11
  };

  // Hàm chuyển đổi chuỗi ngày "dd/MM/yyyy" sang định dạng hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dateString;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      // Cập nhật danh sách hiển thị cho trang mới
      setDisplayedOrders(orders.slice(newPage * pageSize, (newPage + 1) * pageSize));
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Đang tải...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#9c5136]">
        Lịch sử mua hàng
      </h2>
      {displayedOrders.length === 0 ? (
        <p className="text-center text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((order, index) => (
            <div
              key={order.orderId || index}
              className="border rounded-lg p-4 shadow-md bg-white"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    Mã đơn hàng: {order.orderId || "N/A"}
                  </p>
                  <p>Ngày đặt: {formatDate(order.orderDate)}</p>
                  <p>Trạng thái: {order.status || "N/A"}</p>
                  <p>
                    Tổng tiền: {order.totalAmount != null ? order.totalAmount.toLocaleString("vi-VN") : "0"} VNĐ
                  </p>
                  <p>Địa chỉ giao: {order.deliveryAddress || "N/A"}</p>
                  {order.note && <p>Ghi chú: {order.note}</p>}
                </div>
                <div>
                  <p className="font-semibold">Sản phẩm:</p>
                  <ul className="list-disc pl-5">
                    {(order.orderDetails || []).map((item, index) => (
                      <li key={index}>
                        {item.product?.productname || "N/A"} (x{item.quantity || 0})
                        {item.promotionalPrice != null ? ` - ${item.promotionalPrice.toLocaleString("vi-VN")} VNĐ` : ""}
                        {item.product?.productSizes?.length > 0 ? ` (${item.product.productSizes[0].label})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages - 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}