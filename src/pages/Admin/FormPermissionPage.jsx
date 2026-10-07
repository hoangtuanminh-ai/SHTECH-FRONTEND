import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  deleteGroupPermission,
  deleteUserPermission,
  getGroupPermissions,
  getUserPermissions,
  listAdminResource,
  saveGroupPermissions,
  saveUserPermissions,
} from "../../api/adminApi";
import "./admin.css";

const RIGHTS = [
  ["readOnly", "readOnly", "Xem"],
  ["writePermission", "write", "Thêm mới"],
  ["updatePermission", "update", "Cập nhật"],
  ["deletePermission", "delete", "Xóa"],
  ["lockPermission", "lock", "Khóa"],
  ["unlockPermission", "unlock", "Mở khóa"],
  ["latchPermission", "latch", "Chốt"],
  ["unlatchPermission", "unlatch", "Mở chốt"],
  ["settingPermission", "setting", "Thiết lập"],
  ["settingGuiPermission", "settingGui", "Thiết lập GUI"],
];

const permissionColumns = (isUserMode) => [
  ["formSelected", "formSelected", "boolean"],
  ["primaryKey", "PrimaryKey"],
  ...(isUserMode
    ? [["userId", "UserId"]]
    : [["userGroupId", "UserGroupId"], ["groupName", "GroupName"], ["userId", "UserId"]]),
  ["permissionId", "PermissionId"],
  ["userOrGroup", "UserOrGroup"],
  ["userOrGroupId", "UserOrGroupId"],
  ["menuId", "MenuId"],
  ["menuName", "MenuName"],
  ["menuText", "MenuText"],
  ["formId", "FormID"],
  ["formName", "FormName"],
  ["formText", "FormText"],
  ["formGroups", "formGroups"],
  ["formGroupsFunction", "formGroupsFunction"],
  ["menuGroupId", "menuGroupID"],
  ["functionGroups", "functionGroups"],
  ["mainForm", "form_chinh", "boolean"],
  ["inactiveForm", "from_khongsudung", "boolean"],
  ...RIGHTS.map(([field, , label]) => [field, label, "right"]),
  ["projectId", "projectID"],
  ["projectName", "projectName"],
  ["other", "Orther"],
  ["customerUser", "UserKhachHang", "boolean"],
  ["quyenId", "QuyenID"],
  ["quyenName", "QuyenName"],
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
  ["assigned", "Đã phân quyền", "boolean"],
];

const displayValue = (value, type) => {
  if (type === "boolean") {
    return <input type="checkbox" checked={Boolean(value)} readOnly aria-label="Trạng thái" />;
  }
  if (type === "date" && value) return new Date(value).toLocaleString("vi-VN");
  return value ?? "";
};

export default function FormPermissionPage({ mode }) {
  const isUserMode = mode === "user";
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [rows, setRows] = useState([]);
  const [dirty, setDirty] = useState(new Set());
  const [selectedForm, setSelectedForm] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [formSearch, setFormSearch] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subjectKey = isUserMode ? "userId" : "userGroupId";
  const columns = useMemo(() => permissionColumns(isUserMode), [isUserMode]);
  const subjectTitle = isUserMode ? "Danh sách user phân quyền" : "Danh sách nhóm user phân quyền";
  const pageTitle = isUserMode
    ? "Phân quyền người dùng (Permission User)"
    : "Phân quyền nhóm người dùng (Permission User Groups)";

  const loadSubjects = async () => {
    try {
      const data = await listAdminResource(isUserMode ? "users" : "user-groups");
      setSubjects(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không tải được danh sách đối tượng phân quyền.");
    }
  };

  const loadPermissions = async (subject = selectedSubject, search = formSearch) => {
    if (!subject) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const key = subject[subjectKey];
      const data = isUserMode
        ? await getUserPermissions(key, search)
        : await getGroupPermissions(key, search);
      setRows(Array.isArray(data) ? data : []);
      setDirty(new Set());
      setSelectedForm("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Không tải được danh sách phân quyền.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedSubject(null);
    setRows([]);
    setDirty(new Set());
    loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (selectedSubject) loadPermissions(selectedSubject, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  const visibleSubjects = useMemo(() => {
    const search = subjectSearch.trim().toLocaleLowerCase("vi");
    if (!search) return subjects;
    return subjects.filter((subject) => Object.values(subject).some((value) =>
      String(value ?? "").toLocaleLowerCase("vi").includes(search)));
  }, [subjects, subjectSearch]);

  const projects = useMemo(() => Array.from(new Set(rows
    .map((row) => row.projectId)
    .filter(Boolean))).sort(), [rows]);

  const visibleRows = useMemo(() => {
    if (!projectId) return rows;
    return rows.filter((row) => row.projectId === projectId);
  }, [rows, projectId]);

  const toggleRight = (formName, field, checked) => {
    setRows((current) => current.map((row) => row.formName === formName
      ? { ...row, [field]: checked }
      : row));
    setDirty((current) => new Set(current).add(formName));
  };

  const toggleAllVisible = (checked) => {
    const names = visibleRows.map((row) => row.formName);
    setRows((current) => current.map((row) => names.includes(row.formName)
      ? RIGHTS.reduce((next, [field]) => ({ ...next, [field]: checked }), { ...row })
      : row));
    setDirty((current) => {
      const next = new Set(current);
      names.forEach((name) => next.add(name));
      return next;
    });
  };

  const permissionPayload = (row) => {
    const payload = {
      primaryKey: row.primaryKey || undefined,
      permissionId: Number(row.permissionId ?? row.formId) || 0,
      formId: String(row.formId ?? ""),
      formName: row.formName,
      formText: row.formText,
      projectId: row.projectId,
      projectName: row.projectName,
      menuId: row.menuId == null ? "" : String(row.menuId),
      menuName: row.menuName,
      menuText: row.menuText,
      userOrGroup: row.userOrGroup || (isUserMode ? "User" : "Group"),
      userOrGroupId: row.userOrGroupId
        || String(selectedSubject?.[subjectKey] ?? "").slice(0, 4),
      other: row.other,
      customerUser: Boolean(row.customerUser),
      quyenId: row.quyenId,
      quyenName: row.quyenName,
      lockData: Boolean(row.lockData),
      note: row.note,
    };
    RIGHTS.forEach(([rowField, requestField]) => {
      payload[requestField] = Boolean(row[rowField]);
    });
    if (isUserMode) {
      payload.userId = selectedSubject.userId;
    } else {
      payload.userGroupId = selectedSubject.userGroupId;
      payload.groupName = selectedSubject.groupName;
    }
    return payload;
  };

  const save = async () => {
    if (!selectedSubject) {
      toast.info("Hãy chọn người dùng hoặc nhóm cần phân quyền.");
      return;
    }
    const changedRows = rows.filter((row) => dirty.has(row.formName));
    if (!changedRows.length) {
      toast.info("Chưa có quyền nào thay đổi.");
      return;
    }
    setLoading(true);
    try {
      const payloads = changedRows.map(permissionPayload);
      if (isUserMode) await saveUserPermissions(payloads);
      else await saveGroupPermissions(payloads);
      await loadPermissions();
      toast.success(`Đã lưu ${payloads.length} dòng phân quyền.`);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Không thể lưu phân quyền.");
      setLoading(false);
    }
  };

  const removeSelectedPermission = async () => {
    const row = rows.find((item) => item.formName === selectedForm);
    if (!row?.primaryKey) {
      toast.info("Dòng này chưa có bản ghi phân quyền để xóa.");
      return;
    }
    if (!window.confirm(`Xóa phân quyền của giao diện ${row.formText || row.formName}?`)) return;
    setLoading(true);
    try {
      if (isUserMode) await deleteUserPermission(row.primaryKey);
      else await deleteGroupPermission(row.primaryKey);
      await loadPermissions();
      toast.success("Đã xóa bản ghi phân quyền.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Không thể xóa phân quyền.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <section className="admin-window">
        <header className="admin-titlebar">
          <h1>{pageTitle}</h1>
          <span className="admin-count">Đã thay đổi: {dirty.size}</span>
        </header>
        <div className="admin-toolbar">
          <button className="admin-tool-button primary" onClick={save} disabled={!dirty.size || loading}>💾 Lưu</button>
          <button className="admin-tool-button danger" onClick={removeSelectedPermission} disabled={!selectedForm || loading}>✕ Xóa</button>
          <button className="admin-tool-button" onClick={() => loadPermissions()} disabled={!selectedSubject || loading}>↻ Làm tươi</button>
          <button className="admin-tool-button" onClick={() => toggleAllVisible(true)} disabled={!visibleRows.length}>Chọn tất cả</button>
          <button className="admin-tool-button" onClick={() => toggleAllVisible(false)} disabled={!visibleRows.length}>Bỏ chọn tất cả</button>
          <span className="admin-toolbar-spacer" />
          <input
            className="admin-search"
            value={formSearch}
            onChange={(event) => setFormSearch(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") loadPermissions(); }}
            placeholder="Tìm giao diện, chức năng..."
          />
          <button className="admin-tool-button" onClick={() => loadPermissions()}>Tìm</button>
        </div>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-split">
          <aside className="admin-subject-panel">
            <div className="admin-subject-title">{subjectTitle}: {visibleSubjects.length}</div>
            <div style={{ padding: 7 }}>
              <input
                className="admin-search"
                value={subjectSearch}
                onChange={(event) => setSubjectSearch(event.target.value)}
                placeholder={isUserMode ? "Tìm mã NV, tên NV..." : "Tìm mã nhóm, tên nhóm..."}
              />
            </div>
            {visibleSubjects.map((subject) => {
              const key = String(subject[subjectKey] ?? "");
              const selected = String(selectedSubject?.[subjectKey] ?? "") === key;
              return (
                <div
                  className={`admin-subject-row${selected ? " selected" : ""}`}
                  key={`${key}-${subject.loginName || subject.groupName || ""}`}
                  onClick={() => setSelectedSubject(subject)}
                >
                  <input type="radio" checked={selected} readOnly aria-label="Chọn đối tượng" />
                  <span>{isUserMode ? subject.employeeCode || subject.userId : subject.userGroupId}</span>
                  <span>{isUserMode ? subject.userName : subject.groupName}</span>
                </div>
              );
            })}
          </aside>

          <div className="admin-permission-panel">
            <div className="admin-inline-filters">
              <div className="admin-field">
                <label>Đối tượng đang chọn</label>
                <input
                  value={selectedSubject
                    ? `${selectedSubject[subjectKey]} - ${isUserMode ? selectedSubject.userName : selectedSubject.groupName}`
                    : ""}
                  readOnly
                  placeholder="Chọn ở danh sách bên trái"
                />
              </div>
              <div className="admin-field">
                <label>Nhóm chức năng</label>
                <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
                  <option value="">Tất cả nhóm chức năng</option>
                  {projects.map((project) => <option key={project} value={project}>{project}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Số giao diện</label>
                <input value={visibleRows.length} readOnly />
              </div>
              <label className="admin-check-field">
                <input
                  type="checkbox"
                  checked={visibleRows.length > 0 && visibleRows.every((row) => RIGHTS.every(([field]) => Boolean(row[field])))}
                  onChange={(event) => toggleAllVisible(event.target.checked)}
                />
                Tất cả quyền của danh sách đang lọc
              </label>
            </div>

            <div className="admin-table-caption">Danh sách các form phân quyền: {visibleRows.length}</div>
            <div className="admin-table-wrap">
              {loading && !rows.length ? <div className="admin-loading">Đang tải dữ liệu...</div> : (
                <table className="admin-grid">
                  <thead>
                    <tr>
                      <th className="center">Chọn</th>
                      {columns.map(([field, label, type]) => (
                        <th className={type === "right" ? "admin-rights-cell" : ""} key={field}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr
                        key={row.formName}
                        className={selectedForm === row.formName ? "selected" : ""}
                        onClick={() => setSelectedForm(row.formName)}
                      >
                        <td className="center">
                          {dirty.has(row.formName)
                            ? <span className="admin-dirty-dot" title="Chưa lưu" />
                            : <input type="radio" checked={selectedForm === row.formName} readOnly />}
                        </td>
                        {columns.map(([field, label, type]) => (
                          <td
                            className={type === "right" || type === "boolean" ? "admin-rights-cell" : ""}
                            key={field}
                          >
                            {type === "right" ? (
                              <input
                                aria-label={`${label} ${row.formName}`}
                                type="checkbox"
                                checked={Boolean(row[field])}
                                onChange={(event) => toggleRight(row.formName, field, event.target.checked)}
                              />
                            ) : displayValue(row[field], type)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {!visibleRows.length && !loading && (
                      <tr><td className="admin-empty" colSpan={columns.length + 1}>
                        {selectedSubject ? "Không có giao diện phù hợp." : "Hãy chọn đối tượng phân quyền ở bên trái."}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
