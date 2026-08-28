import axios from './axios'; // Using the custom axios instance if available

// Fetch dropdown users
export const getDropdownUsers = async () => {
  try {
    const response = await axios.get('/api/kiem-ke/dropdown/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Fetch dropdown quy cach
export const getDropdownQuyCach = async () => {
  try {
    const response = await axios.get('/api/kiem-ke/dropdown/quycach');
    return response.data;
  } catch (error) {
    console.error('Error fetching quy cach:', error);
    throw error;
  }
};

// Fetch dropdown store
export const getDropdownStore = async () => {
  try {
    const response = await axios.get('/api/kiem-ke/dropdown/store');
    return response.data;
  } catch (error) {
    console.error('Error fetching store:', error);
    throw error;
  }
};

// Fetch dropdown equipment (if needed)
export const getDropdownEquipment = async () => {
  try {
    const response = await axios.get('/api/kiem-ke/dropdown/equipment');
    return response.data;
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
};

// Save Kiem Ke
export const saveKiemKe = async (payload) => {
  try {
    const response = await axios.post('/api/kiem-ke/save', payload);
    return response.data;
  } catch (error) {
    console.error('Error saving kiem ke:', error);
    if (error.response && error.response.data) {
      return error.response.data; // return backend error message
    }
    throw error;
  }
};
