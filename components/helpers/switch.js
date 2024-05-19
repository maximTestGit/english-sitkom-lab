import React from 'react';

const Switch = ({ id, label, onChange, initValue }) => {
  const handleOnChange = (event) => {
    onChange(event.target.checked);
    console.log(`LingFlix: Switch ${id} toggled.`);
  };

  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        id={id}
        role="switch"
        onChange={handleOnChange}
        checked={initValue}
      />
      <label className="form-check-label fs-6" htmlFor={id}>{label}</label>
    </div>
  );
}
export default Switch;