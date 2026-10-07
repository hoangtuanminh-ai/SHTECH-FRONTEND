import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  deleteEquipmentPermission,
  listActiveEquipment,
  listAdminResource,
  listEquipmentPermissions,
  saveEquipmentPermission,
} from "../../api/adminApi";
import "./admin.css";

const EMPTY_FORM = {
  userId: "",
  employeeCode: "",
  userName: "",
  loginName: "",
  userGroupId: "",
  userGroupName: "",
  equipmentId: "",
  equipmentName: "",
  idEquipment: "",
  storeId: "",
  storeName: "",
  permissionType: true,
  display: true,
  required: false,
  requestExport: false,
  inventory: false,
  adjustments: false,
  requestPurchase: false,
  storeImport: false,
  storeExport: false,
  toolInventory: false,
  toolInventoryAdjustment: false,
  toolImport: false,
  toolExport: false,
  toolView: false,
  locationStore: "",
  storeType: "",
  lockData: false,
  note: "",
};

const equipmentCode = (equipment) => equipment.equipmentID ?? equipment.equipmentId ?? "";

const EQUIPMENT_COLUMNS = [
  ["selected", "Selected", "boolean"],
  ["primaryKey", "PrimaryKey_UserId_EquipmentID"],
  ["userId", "UserId"],
  ["employeeCode", "EmployeeCode"],
  ["userName", "UserName"],
  ["loginName", "LoginName"],
  ["storeId", "StoreID"],
  ["storeName", "StoreName"],
  ["userGroupId", "UserGroupId"],
  ["userGroupName", "UserGroupName"],
  ["id", "ID"],
  ["idEquipment", "IDEquipment"],
  ["equipmentId", "EquipmentID"],
  ["equipmentName", "EquipmentName"],
  ["permissionType", "PermissionType", "boolean"],
  ["display", "isDisplay", "boolean"],
  ["required", "isRequire", "boolean"],
  ["requestExport", "isRequestXuat", "boolean"],
  ["inventory", "isInventory", "boolean"],
  ["adjustments", "isAdjustments", "boolean"],
  ["requestPurchase", "isRequestMua", "boolean"],
  ["storeImport", "isStoreImport", "boolean"],
  ["storeExport", "isStoreExport", "boolean"],
  ["toolInventory", "isDugcuTonkho", "boolean"],
  ["toolInventoryAdjustment", "isDungcuKiemkedieuChinh", "boolean"],
  ["toolImport", "isDungcuNhapkho", "boolean"],
  ["toolExport", "isDungcuXuatkho", "boolean"],
  ["toolView", "isDungcuXem", "boolean"],
  ["locationStore", "LocationStore"],
  ["storeType", "StoreType"],
  ["departmentId", "DepartmentID"],
  ["departmentName", "DepartmentName"],
  ["factoryId", "FactoryID"],
  ["factoryName", "FactoryName"],
  ["factoryDepartmentId", "FactoryID_DepartmentID"],
  ["stt", "STT"],
  ["shift", "shift"],
  ["yearMonthDay", "YearMonthDay"],
  ["yearMonthDayShift", "YearMonthDayShift"],
  ["lockData", "LockData", "boolean"],
  ["latchData", "latchData", "boolean"],
  ["note", "Note"],
  ["computerName", "ComputerName"],
  ["computerId", "ComputerID"],
  ["ipAddress", "IPAddress"],
  ["dateModified", "dateModified", "date"],
  ["userIdModified", "UserId_Modified"],
  ["userNameModified", "UserName_Modified"],
  ["userIdCreated", "UserId_Creat"],
  ["userNameCreated", "UserName_Creat"],
  ["createdAt", "CreatDate", "date"],
  ["checkBackup", "CheckBackup", "boolean"],
];

const formatValue = (value, type) => {
  if (type === "boolean") {
    return <input type="checkbox" checked={Boolean(value)} readOnly aria-label="Trạng thái" />;
  }
  if (type === "date" && value) return new Date(value).toLocaleString("vi-VN");
  return value ?? "";
};

export default function EquipmentPermissionPage() {
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedKey, setSelectedKey] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRows = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listEquipmentPermissions(filterUserId, keyword);
      setRows(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không tải được phân quyền máy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([listAdminResource("users"), listActiveEquipment()])
      .then(([userRows, equipmentRows]) => {
        setUsers(Array.isArray(userRows) ? userRows : []);
        setEquipment(Array.isArray(equipmentRows) ? equipmentRows : []);
      })
      .catch((requestError) => setError(
        requestError.response?.data?.message || "Không tải được danh mục người dùng/máy."));
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedUser = useMemo(() => users.find((item) => item.userId === form.userId), [users, form.userId]);
  const selectedEquipment = useMemo(() => equipment.find((item) => equipmentCode(item) === form.equipmentId), [equipment, form.equipmentId]);

  const chooseUser = (userId) => {
    const user = users.find((item) => item.userId === userId);
    setForm((current) => ({
      ...current,
      userId,
      employeeCode: user?.employeeCode || userId,
      userName: user?.userName || "",
      loginName: user?.loginName || "",
      userGroupId: user?.userGroupId || "",
      userGroupName: user?.groupName || "",
      departmentId: user?.departmentId || "",
      departmentName: user?.departmentName || "",
      factoryId: user?.factoryId || "",
      factoryName: user?.factoryName || "",
      factoryDepartmentId: user?.factoryDepartmentId || "",
    }));
  };

  const chooseEquipment = (equipmentId) => {
    const item = equipment.find((candidate) => equipmentCode(candidate) === equipmentId);
    setForm((current) => ({
      ...current,
      equipmentId,
      equipmentName: item?.equipmentName || "",
      idEquipment: item?.spare_5 || equipmentId,
    }));
  };

  const selectRow = (row) => {
    setSelectedKey(row.primaryKey);
    setForm({ ...EMPTY_FORM, ...row });
  };

  const startNew = () => {
    setSelectedKey("");
    setForm(EMPTY_FORM);
  };

  const save = async () => {
    if (!form.userId || !form.equipmentId || !form.equipmentName) {
      toast.warning("Vui lòng chọn người dùng và máy.");
      return;
    }
    setLoading(true);
    try {
      const saved = await saveEquipmentPermission(form, selectedKey);
      setSelectedKey(saved.primaryKey || selectedKey);
      await loadRows();
      toast.success(selectedKey ? "Đã cập nhật phân quyền máy." : "Đã thêm phân quyền máy.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Không thể lưu phân quyền máy.");
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!selectedKey) {
      toast.info("Hãy chọn một dòng cần xóa.");
      return;
    }
    if (!window.confirm("Xóa phân quyền máy đã chọn?")) return;
    setLoading(true);
    try {
      await deleteEquipmentPermission(selectedKey);
      startNew();
      await loadRows();
      toast.success("Đã xóa phân quyền máy.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Không thể xóa phân quyền máy.");
      setLoading(false);
    }
  };

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="admin-page">
      <section className="admin-window">
        <header className="admin-titlebar">
          <h1>Phân quyền máy theo người dùng</h1>
          <span className="admin-count">Tổng số: {rows.length}</span>
        </header>
        <div className="admin-toolbar">
          <button className="admin-tool-button primary" onClick={startNew}>＋ Tạo mới</button>
          <button className="admin-tool-button primary" onClick={save} disabled={loading}>💾 Lưu</button>
          <button className="admin-tool-button danger" onClick={remove} disabled={!selectedKey || loading}>✕ Xóa</button>
          <button className="admin-tool-button" onClick={loadRows} disabled={loading}>↻ Làm tươi</button>
          <span className="admin-toolbar-spacer" />
          <input
            className="admin-search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") loadRows(); }}
            placeholder="Tìm nhân viên hoặc máy..."
          />
          <button className="admin-tool-button" onClick={loadRows}>Tìm</button>
        </div>

        <div className="admin-editor">
          <div className="admin-field">
            <label>Mã nhân viên</label>
            <select value={form.userId} onChange={(event) => chooseUser(event.target.value)}>
              <option value="">Chọn người dùng</option>
              {users.map((user) => (
                <option key={`${user.userId}-${user.loginName}`} value={user.userId}>
                  {user.employeeCode || user.userId} - {user.userName}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label>Tên nhân viên</label>
            <input value={selectedUser?.userName || form.userName || ""} readOnly />
          </div>
          <div className="admin-field">
            <label>Nhóm User</label>
            <input value={form.userGroupId || ""} readOnly />
          </div>
          <div className="admin-field">
            <label>Tên nhóm chức năng</label>
            <input value={form.userGroupName || ""} readOnly />
          </div>
          <div className="admin-field">
            <label>Mã máy</label>
            <select value={form.equipmentId} onChange={(event) => chooseEquipment(event.target.value)}>
              <option value="">Chọn máy</option>
              {equipment.map((item) => (
                <option key={equipmentCode(item)} value={equipmentCode(item)}>
                  {equipmentCode(item)} - {item.equipmentName}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field wide">
            <label>Tên máy</label>
            <input value={selectedEquipment?.equipmentName || form.equipmentName || ""} readOnly />
          </div>
          <div className="admin-field">
            <label>ID thiết bị</label>
            <input value={form.idEquipment || ""} onChange={(event) => setField("idEquipment", event.target.value)} />
          </div>
          <div className="admin-field">
            <label>Mã kho</label>
            <input value={form.storeId || ""} onChange={(event) => setField("storeId", event.target.value)} />
          </div>
          <div className="admin-field">
            <label>Tên kho</label>
            <input value={form.storeName || ""} onChange={(event) => setField("storeName", event.target.value)} />
          </div>
          <div className="admin-field">
            <label>Vị trí kho</label>
            <input value={form.locationStore || ""} onChange={(event) => setField("locationStore", event.target.value)} />
          </div>
          <div className="admin-field">
            <label>Loại kho</label>
            <input value={form.storeType || ""} onChange={(event) => setField("storeType", event.target.value)} />
          </div>
          <div className="admin-field wide">
            <label>Ghi chú</label>
            <input value={form.note || ""} onChange={(event) => setField("note", event.target.value)} />
          </div>
          {[
            ["permissionType", "Có quyền"],
            ["display", "Hiển thị"],
            ["required", "Bắt buộc"],
            ["requestExport", "Yêu cầu xuất"],
            ["inventory", "Kiểm kê"],
            ["adjustments", "Điều chỉnh"],
            ["requestPurchase", "Yêu cầu mua"],
            ["storeImport", "Nhập kho"],
            ["storeExport", "Xuất kho"],
            ["toolInventory", "Tồn kho dụng cụ"],
            ["toolInventoryAdjustment", "Kiểm kê/điều chỉnh dụng cụ"],
            ["toolImport", "Nhập kho dụng cụ"],
            ["toolExport", "Xuất kho dụng cụ"],
            ["toolView", "Xem dụng cụ"],
            ["lockData", "Khóa dữ liệu"],
          ].map(([field, label]) => (
            <label className="admin-check-field" key={field}>
              <input
                type="checkbox"
                checked={Boolean(form[field])}
                onChange={(event) => setField(field, event.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>

        {error && <div className="admin-error">{error}</div>}
        <div className="admin-inline-filters">
          <div className="admin-field">
            <label>Lọc theo người dùng</label>
            <select value={filterUserId} onChange={(event) => setFilterUserId(event.target.value)}>
              <option value="">Tất cả người dùng</option>
              {users.map((user) => (
                <option key={`filter-${user.userId}-${user.loginName}`} value={user.userId}>
                  {user.employeeCode || user.userId} - {user.userName}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ justifyContent: "end" }}>
            <button className="admin-tool-button" onClick={loadRows}>Áp dụng bộ lọc</button>
          </div>
        </div>
        <div className="admin-table-caption">Danh sách phân quyền user theo thiết bị: {rows.length}</div>
        <div className="admin-table-wrap">
          {loading && !rows.length ? <div className="admin-loading">Đang tải dữ liệu...</div> : (
            <table className="admin-grid">
              <thead>
                <tr>
                  <th>Chọn</th>
                  {EQUIPMENT_COLUMNS.map(([field, label]) => <th key={field}>{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.primaryKey}
                    className={selectedKey === row.primaryKey ? "selected" : ""}
                    onClick={() => selectRow(row)}
                  >
                    <td className="center"><input type="radio" checked={selectedKey === row.primaryKey} readOnly /></td>
                    {EQUIPMENT_COLUMNS.map(([field, , type]) => (
                      <td className={type === "boolean" ? "center" : ""} key={field}>
                        {formatValue(row[field], type)}
                      </td>
                    ))}
                  </tr>
                ))}
                {!rows.length && !loading && (
                  <tr><td className="admin-empty" colSpan={EQUIPMENT_COLUMNS.length + 1}>Không có dữ liệu.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
