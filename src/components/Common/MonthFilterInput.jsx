import React, { useRef, useState, useEffect } from 'react';

/**
 * MonthFilterInput
 * Hiển thị tháng/năm ở DẠNG SỐ MM/YYYY (Ví dụ: 09/2026) theo đúng yêu cầu
 * Hỗ trợ vừa gõ số trực tiếp, vừa có icon lịch mở picker chọn tháng
 */
const MonthFilterInput = ({
  value,
  onChange,
  placeholder = "MM/YYYY",
  style = {},
  isDropdown = false
}) => {
  // Chuyển value dạng YYYY-MM hoặc YYYYMM sang MM/YYYY để hiển thị thuần số
  const formatToDisplay = (val) => {
    if (!val) return '';
    if (typeof val !== 'string') val = String(val);
    if (val.includes('-')) {
      const parts = val.split('-');
      if (parts.length === 2) {
        return `${parts[1].padStart(2, '0')}/${parts[0]}`; // YYYY-MM -> MM/YYYY
      }
    }
    if (val.includes('/')) {
      return val;
    }
    if (/^\d{6}$/.test(val)) {
      // 202609 -> 09/2026
      return `${val.slice(4, 6)}/${val.slice(0, 4)}`;
    }
    return val;
  };

  // Chuyển MM/YYYY sang YYYY-MM để lưu state & gửi API
  const parseToStandard = (displayVal) => {
    if (!displayVal) return '';
    if (typeof displayVal !== 'string') displayVal = String(displayVal);
    displayVal = displayVal.trim();
    if (displayVal.includes('/')) {
      const parts = displayVal.split('/');
      if (parts.length === 2 && parts[0] && parts[1]) {
        const m = parts[0].padStart(2, '0');
        const y = parts[1];
        return `${y}-${m}`;
      }
    }
    if (/^\d{6}$/.test(displayVal)) {
      // MMYYYY (VD: 092026) -> 2026-09
      const m = displayVal.slice(0, 2);
      const y = displayVal.slice(2, 6);
      return `${y}-${m}`;
    }
    return displayVal;
  };

  const [inputText, setInputText] = useState(formatToDisplay(value));
  const hiddenPickerRef = useRef(null);

  useEffect(() => {
    setInputText(formatToDisplay(value));
  }, [value]);

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setInputText(raw);

    // Nếu người dùng gõ đủ dạng MM/YYYY (ví dụ: 09/2026)
    if (/^\d{2}\/\d{4}$/.test(raw)) {
      const std = parseToStandard(raw);
      console.log(`[MonthFilterInput] Nhập dạng số: ${raw} -> chuẩn: ${std}`);
      onChange(std);
    }
  };

  const handleBlur = () => {
    const raw = inputText ? inputText.trim() : '';
    if (/^\d{1,2}\/\d{4}$/.test(raw)) {
      const [m, y] = raw.split('/');
      const formatted = `${m.padStart(2, '0')}/${y}`;
      setInputText(formatted);
      const std = `${y}-${m.padStart(2, '0')}`;
      console.log(`[MonthFilterInput] Blur format số: ${formatted} -> ${std}`);
      onChange(std);
    } else if (/^\d{6}$/.test(raw)) {
      // Người dùng gõ 092026
      const m = raw.slice(0, 2);
      const y = raw.slice(2, 6);
      const formatted = `${m}/${y}`;
      setInputText(formatted);
      const std = `${y}-${m}`;
      console.log(`[MonthFilterInput] Blur parse 6 số: ${formatted} -> ${std}`);
      onChange(std);
    } else if (/^\d{4}-\d{2}$/.test(raw)) {
      const formatted = formatToDisplay(raw);
      setInputText(formatted);
      onChange(raw);
    } else if (!raw) {
      onChange('');
    } else {
      // Khôi phục lại giá trị hợp lệ trước đó
      setInputText(formatToDisplay(value));
    }
  };

  const openCalendar = () => {
    if (hiddenPickerRef.current) {
      if (typeof hiddenPickerRef.current.showPicker === 'function') {
        hiddenPickerRef.current.showPicker();
      } else {
        hiddenPickerRef.current.focus();
      }
    }
  };

  // Giá trị cho hidden month picker dạng YYYY-MM
  const pickerValue = value && value.includes('-') ? value : parseToStandard(value);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid #6890b0',
        borderRadius: 2,
        height: 24,
        padding: '0 4px',
        position: 'relative',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* Ô nhập hiển thị dạng số MM/YYYY (ví dụ: 09/2026) */}
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          border: 'none',
          outline: 'none',
          fontSize: 12,
          fontWeight: 600,
          color: '#1a3a5c',
          width: 62,
          textAlign: 'center',
          fontFamily: "'Segoe UI', sans-serif",
          padding: 0,
          background: 'transparent'
        }}
      />

      {/* Icon lịch hoặc mũi tên dropdown theo đúng ảnh mẫu */}
      <button
        type="button"
        onClick={openCalendar}
        title="Chọn tháng"
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          marginLeft: 2,
          display: 'flex',
          alignItems: 'center',
          color: '#46627f'
        }}
      >
        {isDropdown ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )}
      </button>

      {/* Hidden native input để mở popup lịch tháng của trình duyệt mà không lộ chữ */}
      <input
        ref={hiddenPickerRef}
        type="month"
        value={pickerValue || ''}
        onChange={(e) => {
          const newVal = e.target.value; // dạng YYYY-MM
          console.log(`[MonthFilterInput] Đã chọn tháng từ lịch: ${newVal} -> hiển thị: ${formatToDisplay(newVal)}`);
          onChange(newVal);
          setInputText(formatToDisplay(newVal));
        }}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
          border: 'none',
          padding: 0
        }}
        tabIndex={-1}
      />
    </div>
  );
};

export default MonthFilterInput;
