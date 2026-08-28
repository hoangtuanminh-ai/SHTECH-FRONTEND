import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Cuộn lên đầu trang ngay lập tức
  }, [pathname]); // Chạy mỗi khi pathname (route) thay đổi

  return null;
}