import axios from './axios';

// Lấy danh sách kho
export const getDropdownStore = async () => {
    const res = await axios.get('/api/kiem-ke/dropdown/store'); // Dùng chung API kho có sẵn
    return res.data;
};

// Lấy danh sách người dùng
export const getDropdownUsers = async () => {
    const res = await axios.get('/api/kiem-ke/dropdown/users');
    return res.data;
};

// Lấy danh sách quy cách cho kế hoạch tháng
export const getDropdownQuyCach = async () => {
    const res = await axios.get('/api/kiem-ke/dropdown/quycach');
    return res.data;
};

// Lưu kế hoạch tháng (Gửi kèm 31 ngày)
export const saveKeHoachThang = async (payload) => {
    try {
        const response = await axios.post('/api/thanhhinh/kehoach/save-thang', payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Lỗi kết nối" };
    }
};