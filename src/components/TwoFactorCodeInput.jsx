import React, { useRef } from 'react';

export default function TwoFactorCodeInput({ value, onChange }) {
  const inputRefs = useRef([]);

  const handlePaste = (e, idx) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const codeArr = [...value];
    for (let i = 0; i < paste.length && idx + i < 6; i++) {
      codeArr[idx + i] = paste[i];
    }
    onChange(codeArr);
    const nextIndex = Math.min(idx + paste.length, 5);
    inputRefs.current[nextIndex].focus();
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const codeArr = [...value];
    codeArr[idx] = val;
    onChange(codeArr);
    if (val && idx < 5) {
      inputRefs.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputRefs.current[idx - 1].focus();
    }
  };

  return (
    <div className="twofa-input">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={value[i] || ''}
          onChange={(ev) => handleChange(ev, i)}
          onKeyDown={(ev) => handleKeyDown(ev, i)}
          onPaste={(ev) => handlePaste(ev, i)}
          ref={(el) => (inputRefs.current[i] = el)}
        />
      ))}
    </div>
  );
}
