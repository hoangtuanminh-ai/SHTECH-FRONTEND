// src/mock/mockSupportData.js
export const mockTickets = [
  {
    ticketId: 1,
    subject: "Không đăng nhập được tài khoản",
    userName: "Nguyễn Văn A",
    status: "OPEN",
    createdAt: "2025-08-20T08:00:00Z",
  },
  {
    ticketId: 2,
    subject: "Không nhận được email xác nhận",
    userName: "Trần Thị B",
    status: "IN_PROGRESS",
    createdAt: "2025-08-22T10:30:00Z",
  },
];

export const mockDetails = {
  1: {
    ticketId: 1,
    subject: "Không đăng nhập được tài khoản",
    userName: "Nguyễn Văn A",
    description: "Em không đăng nhập được, báo sai mật khẩu.",
    status: "OPEN",
    messages: [
      {
        messageId: 1,
        userName: "Nguyễn Văn A",
        message: "Em không đăng nhập được, báo sai mật khẩu.",
        createdAt: "2025-08-20T08:05:00Z",
        isStaffReply: false,
      },
    ],
  },
  2: {
    ticketId: 2,
    subject: "Không nhận được email xác nhận",
    userName: "Trần Thị B",
    description: "Em không thấy email xác nhận sau khi đăng ký.",
    status: "IN_PROGRESS",
    messages: [
      {
        messageId: 2,
        userName: "Trần Thị B",
        message: "Em không thấy email xác nhận sau khi đăng ký.",
        createdAt: "2025-08-22T10:40:00Z",
        isStaffReply: false,
      },
      {
        messageId: 3,
        userName: "Admin",
        message: "Bạn vui lòng kiểm tra hộp thư rác nhé!",
        createdAt: "2025-08-22T11:00:00Z",
        isStaffReply: true,
      },
    ],
  },
};
