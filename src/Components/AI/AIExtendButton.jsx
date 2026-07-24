import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateFormWithAI } from '../../Services/aiService';
import './AIExtendButton.css';

/**
 * Nút AI dùng chung cho Onboarding, Job Post, Service và Edit Profile.
 *
 * Component không tự biết cấu trúc form. Màn hình cha truyền draftFields,
 * type và callback; nhờ vậy cùng một nút có thể tái sử dụng cho nhiều schema.
 */
const AIExtendButton = ({
  draftFields = [], // Các chuỗi draft hiện có của form cha.
  onExtendStart,
  onExtendSuccess,
  onExtendFailure,
  type,
  btnText = 'Generate Scope with AI',
  onErrorToast, // Callback hiển thị lỗi theo hệ thống Toast của màn hình cha.
  context = '',
}) => {
  // Cooldown hạn chế spam request; loading phản ánh request hiện tại.
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  // Giữ id interval để cleanup khi component unmount hoặc cooldown kết thúc.
  const timerRef = useRef(null);

  // AI chỉ có ích khi người dùng cung cấp ít nhất một mẩu nội dung làm đầu vào.
  const isAnyFieldFilled = draftFields.some(
    (field) => typeof field === 'string' && field.trim().length > 0
  );

  // Mỗi giây giảm cooldown; cleanup ngăn interval chạy sau khi component bị gỡ.
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  /**
   * Điều phối trọn vòng đời request AI:
   * ghép draft -> báo form cha bắt đầu -> gọi service -> trả data/error
   * cho form cha -> bật cooldown -> luôn kết thúc loading.
   */
  const handleGenerate = async () => {
    // Guard bổ sung cho trường hợp click bằng script khi UI chưa có draft.
    if (!isAnyFieldFilled) return;

    // Bỏ field rỗng và ngăn cách từng phần để prompt backend dễ đọc.
    const textToSend = draftFields
      .filter((f) => typeof f === 'string' && f.trim().length > 0)
      .join('\n\n');

    try {
      setLoading(true);
      if (onExtendStart) onExtendStart();

      const data = await generateFormWithAI(textToSend, type, context);

      // Form cha quyết định field nào được cập nhật từ object phản hồi.
      if (onExtendSuccess) onExtendSuccess(data);
      setCooldown(15); // Chặn gọi lại trong 15 giây sau một request thành công.
    } catch (err) {
      // Form cha dùng callback này để tắt skeleton overlay.
      if (onExtendFailure) onExtendFailure();

      // Safety error cần giữ nguyên hướng dẫn để người dùng sửa nội dung.
      let errorMsg = 'AI Core busy';
      if (err.message && err.message.includes('Safety filter matched')) {
        errorMsg = err.message; // E2: Content filter match
      }

      // Ưu tiên Toast; alert là fallback cho màn hình chưa tích hợp Toast.
      if (onErrorToast) {
        onErrorToast(errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      // Luôn mở khóa trạng thái request dù success hay error.
      setLoading(false);
    }
  };

  return (
    <div className="ai-extend-button-container">
      <button
        type="button"
        className={`ai-generate-btn ${cooldown > 0 ? 'cooldown' : ''} ${
          !isAnyFieldFilled ? 'disabled-no-input' : ''
        }`}
        onClick={handleGenerate}
        disabled={cooldown > 0 || loading}
      >
        {/* Nội dung nút thay đổi theo ba trạng thái loại trừ nhau. */}
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={14} />
            <span>Generating...</span>
          </>
        ) : cooldown > 0 ? (
          <>
            <span>Cooldown ({cooldown}s)</span>
          </>
        ) : (
          <>
            <Sparkles className="sparkles-icon" size={14} />
            <span>{btnText}</span>
          </>
        )}

        {/* Giải thích vì sao chưa thể dùng AI khi form hoàn toàn trống. */}
        {!isAnyFieldFilled && (
          <span className="ai-tooltip">
            Please fill out at least one box so the AI knows what you need.
          </span>
        )}
      </button>
    </div>
  );
};

export default AIExtendButton;
