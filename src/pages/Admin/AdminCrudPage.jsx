import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  createAdminResource,
  deleteAdminResource,
  listAdminResource,
  updateAdminResource,
} from "../../api/adminApi";
import "./admin.css";

const text = (name, label, options = {}) => ({ name, label, type: "text", ...options });
const check = (name, label, options = {}) => ({ name, label, type: "checkbox", ...options });

const PAGE_CONFIGS = {
  users: {
    resource: "users",
    title: "Danh sách người dùng (Users)",
    caption: "Danh sách người dùng",
    key: "loginName",
    required: ["userId", "userName", "loginName"],
    defaults: {
      mustChangePassword: false,
      cannotChangePassword: false,
      inactive: false,
      admin: false,
      deleted: false,
      lockData: false,
    },
    fields: [
      text("employeeCode", "Mã NV"),
      text("userId", "UserId"),
      text("userName", "Họ và tên", { wide: true }),
      text("loginName", "Tên đăng nhập"),
      text("password", "Mật khẩu", { inputType: "password", placeholder: "Để trống khi không đổi" }),
      text("quyenId", "Mã quyền"),
      text("quyenName", "Tên quyền"),
      text("userGroupId", "Nhóm User"),
      text("groupName", "Tên nhóm User"),
      text("phoneNumber", "Số điện thoại"),
      text("email", "Email", { inputType: "email" }),
      text("address", "Địa chỉ", { wide: true }),
      text("factoryId", "Mã xí nghiệp"),
      text("factoryName", "Tên xí nghiệp"),
      text("departmentId", "Mã bộ phận"),
      text("departmentName", "Tên bộ phận"),
      text("workTeam", "Tổ công tác"),
      text("positionGroupId", "Mã nhóm vị trí"),
      text("positionGroupName", "Nhóm vị trí công việc"),
      text("positionId", "Mã vị trí"),
      text("positionName", "Tên vị trí công việc"),
      text("note", "Ghi chú", { wide: true }),
      check("mustChangePassword", "Phải đổi mật khẩu khi đăng nhập"),
      check("cannotChangePassword", "Không được đổi mật khẩu"),
      check("inactive", "Không sử dụng người dùng này"),
      check("admin", "Quản trị hệ thống"),
    ],
    columns: [
      ["formSelected", "formSelected", "boolean"],
      ["userId", "UserId"],
      ["employeeCode", "Mã NV"],
      ["userName", "Họ tên"],
      ["firstName", "FirstName"],
      ["lastName", "LastName"],
      ["hasLoginPassword", "LoginPass", "secret"],
      ["loginName", "LoginName"],
      ["userIdTheoGroups", "UserId_theoGroups"],
      ["quyenId", "QuyenID"],
      ["quyenName", "QuyenName"],
      ["mustChangePassword", "isMustChangePass", "boolean"],
      ["cannotChangePassword", "isNotChagePass", "boolean"],
      ["adLoginName", "AdLoginName"],
      ["email", "Email"],
      ["inactive", "IsNotActive", "boolean"],
      ["lastLogin", "LastLogin", "date"],
      ["admin", "isAdmin", "boolean"],
      ["deleted", "isNotDeleted", "boolean"],
      ["companyId", "CompanyId"],
      ["mailUserLogin", "MailUserLogin"],
      ["hasMailPassword", "MailUserPassword", "secret"],
      ["phoneNumber", "phoneNumber"],
      ["address", "Address_"],
      ["factoryDepartmentId", "FactoryID_DepartmentID"],
      ["factoryId", "FactoryID"],
      ["factoryName", "FactoryName"],
      ["departmentId", "DepartmentID"],
      ["departmentName", "DepartmentName"],
      ["userGroupId", "UserGroupId"],
      ["groupName", "GroupName"],
      ["workTeam", "To_noiLamViec"],
      ["workGroup", "Nhom_Noilamviec"],
      ["positionGroupId", "ID_nhom_vitri_Congiec"],
      ["positionGroupName", "Nhom_vitri_Congiec"],
      ["positionId", "ID_VI_TRI_CONG_VIEC"],
      ["positionName", "VI_TRI_CONG_VIEC"],
      ["stt", "STT"],
      ["shift", "shift"],
      ["yearMonthDay", "YearMonthDay"],
      ["yearMonthDayShift", "YearMonthDayShift"],
      ["latchData", "latchData", "boolean"],
      ["lockData", "LockData", "boolean"],
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
    ],
  },
  "user-groups": {
    resource: "user-groups",
    title: "Danh sách nhóm người dùng (User Groups)",
    caption: "Danh mục nhóm phân quyền",
    key: "userGroupId",
    required: ["userGroupId", "groupName"],
    defaults: { lockData: false },
    fields: [
      text("id", "ID"),
      text("userGroupId", "Mã nhóm"),
      text("groupName", "Tên nhóm", { wide: true }),
      text("workDescription", "Mô tả công việc", { wide: true }),
      text("factoryDepartmentId", "ID xí nghiệp/phòng"),
      text("departmentId", "Mã bộ phận"),
      text("departmentName", "Tên bộ phận"),
      text("factoryId", "Mã xí nghiệp"),
      text("factoryName", "Tên xí nghiệp"),
      text("note", "Ghi chú", { wide: true }),
      check("lockData", "Khóa dữ liệu"),
    ],
    columns: [
      ["selected", "Selected_", "boolean"],
      ["id", "ID"],
      ["userGroupId", "UserGroupId"],
      ["groupName", "GroupName"],
      ["workDescription", "WorkDescription"],
      ["factoryDepartmentId", "FactoryID_DepartmentID"],
      ["departmentId", "DepartmentID"],
      ["departmentName", "DepartmentName"],
      ["factoryId", "FactoryID"],
      ["factoryName", "FactoryName"],
      ["stt", "STT"],
      ["shift", "shift"],
      ["yearMonthDay", "YearMonthDay"],
      ["yearMonthDayShift", "YearMonthDayShift"],
      ["lockData", "LockData", "boolean"],
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
    ],
  },
  permissions: {
    resource: "permissions",
    title: "Danh sách phân quyền (Permission list)",
    caption: "Danh mục các quyền",
    key: "quyenId",
    required: ["quyenId"],
    defaults: { lockData: false },
    fields: [
      text("quyenId", "Permission ID"),
      text("quyenName", "Permission Name", { wide: true }),
      text("note", "Ghi chú", { wide: true }),
      check("lockData", "Khóa dữ liệu"),
    ],
    columns: [
      ["formSelected", "formSelected", "boolean"],
      ["quyenId", "QuyenID"],
      ["quyenName", "QuyenName"],
      ["stt", "STT"],
      ["shift", "shift"],
      ["yearMonthDay", "YearMonthDay"],
      ["yearMonthDayShift", "YearMonthDayShift"],
      ["lockData", "LockData", "boolean"],
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
    ],
  },
  "software-keys": {
    resource: "software-keys",
    title: "Danh sách key phần mềm (Serial list)",
    caption: "Danh sách các máy đăng ký key",
    key: "cpuId",
    required: ["cpuId", "computerName", "productId", "email", "id", "serial"],
    defaults: { lockData: false },
    fields: [
      text("cpuId", "ID CPU"),
      text("computerName", "Computer Name"),
      text("productId", "Product ID"),
      text("email", "Email", { inputType: "email" }),
      text("password", "Password", { inputType: "password", placeholder: "Để trống khi không đổi" }),
      text("id", "ID"),
      text("serial", "Serial", { wide: true }),
      text("note", "Ghi chú", { wide: true }),
      check("lockData", "Khóa dữ liệu"),
    ],
    columns: [
      ["cpuId", "CPU_ID"],
      ["computerName", "ComputerName"],
      ["productId", "ProducID"],
      ["email", "Email"],
      ["hasPassword", "PassWord", "secret"],
      ["id", "ID"],
      ["serial", "Seial"],
      ["shift", "shift"],
      ["yearMonthDay", "YearMonthDay"],
      ["yearMonthDayShift", "YearMonthDayShift"],
      ["lockData", "LockData", "boolean"],
      ["note", "Note"],
      ["auditComputerName", "ComputerName1"],
      ["computerId", "ComputerID"],
      ["ipAddress", "IPAddress"],
      ["dateModified", "dateModified", "date"],
      ["userIdModified", "UserId_Modified"],
      ["userNameModified", "UserName_Modified"],
      ["userIdCreated", "UserId_Creat"],
      ["userNameCreated", "UserName_Creat"],
      ["createdAt", "CreatDate", "date"],
      ["checkBackup", "CheckBackup", "boolean"],
    ],
  },
};

const formatValue = (value, type) => {
  if (type === "boolean") {
    return <input type="checkbox" checked={Boolean(value)} readOnly aria-label="Trạng thái" />;
  }
  if (type === "secret") return value ? "••••••••" : "";
  if (type === "date" && value) return new Date(value).toLocaleString("vi-VN");
  return value ?? "";
};

const createEmptyForm = (config) => {
  const result = { ...config.defaults };
  config.fields.forEach((field) => {
    if (!(field.name in result)) result[field.name] = field.type === "checkbox" ? false : "";
  });
  return result;
};

export default function AdminCrudPage({ page }) {
  const config = PAGE_CONFIGS[page];
  const emptyForm = useMemo(() => createEmptyForm(config), [config]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedKey, setSelectedKey] = useState("");
  const [mode, setMode] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (search = keyword) => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminResource(config.resource, search);
      setRows(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm(createEmptyForm(config));
    setSelectedKey("");
    setMode("");
    setKeyword("");
    load("");
    // config được lấy từ hằng số và chỉ đổi khi page đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const selectRow = (row) => {
    const key = String(row[config.key] ?? "");
    setSelectedKey(key);
    if (mode === "edit") setForm({ ...emptyForm, ...row, password: "" });
  };

  const beginCreate = () => {
    setSelectedKey("");
    setForm(emptyForm);
    setMode("create");
  };

  const beginEdit = () => {
    const row = rows.find((item) => String(item[config.key]) === selectedKey);
    if (!row) {
      toast.info("Hãy chọn một dòng cần sửa.");
      return;
    }
    setForm({ ...emptyForm, ...row, password: "" });
    setMode("edit");
  };

  const save = async () => {
    const missing = config.required.find((name) => !String(form[name] ?? "").trim());
    if (missing) {
      const label = config.fields.find((field) => field.name === missing)?.label || missing;
      toast.warning(`Vui lòng nhập ${label}.`);
      return;
    }
    if (mode === "create" && page === "users" && !String(form.password || "").trim()) {
      toast.warning("Vui lòng nhập mật khẩu cho người dùng mới.");
      return;
    }
    setLoading(true);
    try {
      const saved = mode === "edit"
        ? await updateAdminResource(config.resource, selectedKey, form)
        : await createAdminResource(config.resource, form);
      setSelectedKey(String(saved?.[config.key] ?? form[config.key] ?? selectedKey));
      setMode("");
      setForm(emptyForm);
      await load();
      toast.success(mode === "edit" ? "Đã cập nhật dữ liệu." : "Đã thêm dữ liệu.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Không thể lưu dữ liệu.");
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!selectedKey) {
      toast.info("Hãy chọn một dòng cần xóa.");
      return;
    }
    const wording = page === "users" ? "ngưng sử dụng người dùng" : "xóa dòng";
    if (!window.confirm(`Bạn chắc chắn muốn ${wording} đã chọn?`)) return;
    setLoading(true);
    try {
      await deleteAdminResource(config.resource, selectedKey);
      setSelectedKey("");
      setMode("");
      setForm(emptyForm);
      await load();
      toast.success(page === "users" ? "Đã ngưng sử dụng người dùng." : "Đã xóa dữ liệu.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Không thể xóa dữ liệu.");
      setLoading(false);
    }
  };

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="admin-page">
      <section className="admin-window">
        <header className="admin-titlebar">
          <h1>{config.title}</h1>
          <span className="admin-count">Tổng số: {rows.length}</span>
        </header>

        <div className="admin-toolbar">
          <button className="admin-tool-button primary" onClick={beginCreate}>＋ Tạo mới</button>
          <button className="admin-tool-button" onClick={beginEdit} disabled={!selectedKey}>✎ Chỉnh sửa</button>
          <button className="admin-tool-button primary" onClick={save} disabled={!mode || loading}>💾 Lưu</button>
          <button className="admin-tool-button danger" onClick={remove} disabled={!selectedKey || loading}>✕ Xóa</button>
          <button className="admin-tool-button" onClick={() => load()} disabled={loading}>↻ Làm tươi</button>
          <button
            className="admin-tool-button"
            onClick={() => { setMode(""); setForm(emptyForm); }}
            disabled={!mode}
          >
            Đóng nhập liệu
          </button>
          <span className="admin-toolbar-spacer" />
          <input
            className="admin-search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") load(); }}
            placeholder="Tìm theo mã, tên, tài khoản..."
          />
          <button className="admin-tool-button" onClick={() => load()}>Tìm</button>
        </div>

        <div className="admin-editor">
          {config.fields.map((field) => field.type === "checkbox" ? (
            <label className="admin-check-field" key={field.name}>
              <input
                type="checkbox"
                checked={Boolean(form[field.name])}
                disabled={!mode}
                onChange={(event) => setField(field.name, event.target.checked)}
              />
              {field.label}
            </label>
          ) : (
            <div
              className={`admin-field${field.wide ? " wide" : ""}${field.full ? " full" : ""}`}
              key={field.name}
            >
              <label htmlFor={`${page}-${field.name}`}>{field.label}</label>
              <input
                id={`${page}-${field.name}`}
                type={field.inputType || "text"}
                value={form[field.name] ?? ""}
                disabled={!mode || (mode === "edit" && field.name === config.key)}
                placeholder={field.placeholder || ""}
                onChange={(event) => setField(field.name, event.target.value)}
              />
            </div>
          ))}
        </div>

        {error && <div className="admin-error">{error}</div>}
        <div className="admin-table-caption">{config.caption}: {rows.length}</div>
        <div className="admin-table-wrap">
          {loading && !rows.length ? <div className="admin-loading">Đang tải dữ liệu...</div> : (
            <table className="admin-grid">
              <thead>
                <tr>
                  <th className="center">Chọn</th>
                  {config.columns.map(([name, label]) => <th key={name}>{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const key = String(row[config.key] ?? "");
                  return (
                    <tr
                      key={key}
                      className={selectedKey === key ? "selected" : ""}
                      onClick={() => selectRow(row)}
                      onDoubleClick={beginEdit}
                    >
                      <td className="center">
                        <input type="radio" checked={selectedKey === key} readOnly aria-label="Chọn dòng" />
                      </td>
                      {config.columns.map(([name, , type]) => (
                        <td key={name} className={type === "boolean" ? "center" : ""}>
                          {formatValue(row[name], type)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {!rows.length && !loading && (
                  <tr><td className="admin-empty" colSpan={config.columns.length + 1}>Không có dữ liệu.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
