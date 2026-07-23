import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateFormWithAI } from '../../Services/aiService';
import './AIExtendButton.css';

const AIExtendButton = ({
  draftFields = [], // array of strings representing current draft fields
  onExtendStart,
  onExtendSuccess,
  onExtendFailure,
  type,
  btnText = 'Generate Scope with AI',
  onErrorToast, // callback to display error toast
  context = '',
}) => {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // Check if at least one field is filled (trimmed length > 0)
  const isAnyFieldFilled = draftFields.some(
    (field) => typeof field === 'string' && field.trim().length > 0
  );

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

  const handleGenerate = async () => {
    if (!isAnyFieldFilled) return;

    // Join all non-empty fields to send as context
    const textToSend = draftFields
      .filter((f) => typeof f === 'string' && f.trim().length > 0)
      .join('\n\n');

    try {
      setLoading(true);
      if (onExtendStart) onExtendStart();

      const data = await generateFormWithAI(textToSend, type, context);

      if (onExtendSuccess) onExtendSuccess(data);
      setCooldown(15); // 15 seconds cooldown
    } catch (err) {
      if (onExtendFailure) onExtendFailure();

      let errorMsg = 'AI Core busy';
      if (err.message && err.message.includes('Safety filter matched')) {
        errorMsg = err.message; // E2: Content filter match
      }

      if (onErrorToast) {
        onErrorToast(errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = cooldown > 0 || loading || !isAnyFieldFilled;

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

        {/* Tooltip to show when disabled because no fields are filled */}
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
