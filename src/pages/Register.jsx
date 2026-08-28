import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/regist", form);
      alert("Đăng ký thành công, vui lòng đăng nhập!");
      navigate("/login");
    } catch (err) {
      alert("Đăng ký thất bại!");
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      <form onSubmit={handleRegister}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} /><br />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} /><br />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} /><br />
        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
}

export default Register;
