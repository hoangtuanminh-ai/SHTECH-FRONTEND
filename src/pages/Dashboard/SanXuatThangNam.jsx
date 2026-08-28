import React from 'react';

const SanXuatThangNam = () => {
  console.log(">>> [SanXuatThangNam] Render trang Sản xuất tháng / năm");

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-58px)] flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center max-w-lg w-full">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">Xin chào!</h1>
        <p className="text-gray-600 font-medium">Trang: <span className="font-bold text-gray-800">SẢN XUẤT THÁNG /NĂM</span></p>
        <p className="text-xs text-gray-400 mt-4">(Trang đang được khởi tạo sẵn sàng cho phát triển tính năng)</p>
      </div>
    </div>
  );
};

export default SanXuatThangNam;
