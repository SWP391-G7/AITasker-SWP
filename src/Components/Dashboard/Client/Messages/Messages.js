/**
 * Frontend module: Components/Dashboard/Client/Messages/Messages.js
 *
 * Vai trò: Component Messages: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
export const messages = [
  {
    id: 1,
    sender: "expert",
    text: "Hi Andy, I finished exporting the validation dataset for the legal analysis model.",
    time: "10:24 AM",
  },
  {
    id: 2,
    sender: "client",
    text: "Great. Can you also confirm if the anonymized samples were included?",
    time: "10:26 AM",
  },
  {
    id: 3,
    sender: "expert",
    text: "Yes, all sensitive identifiers were removed. I also attached a short summary of the preprocessing steps.",
    time: "10:28 AM",
  },
  {
    id: 4,
    sender: "client",
    text: "Perfect. I will review the files today and send feedback.",
    time: "10:30 AM",
  },
];