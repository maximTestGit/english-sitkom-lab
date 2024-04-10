import React from 'react';

const Switch = ({ id, label, onChange }) => {
    const handleOnChange = (event) => {
        onChange(event.target.checked);
        console.log(`Switch ${id} toggled.`);
    };

    return (
  <div className="form-check form-switch">
    <input 
      className="form-check-input" 
      type="checkbox" 
      id={id}
      role="switch" 
      onChange={handleOnChange}
    />
    <label className="form-check-label" htmlFor={id}>{label}</label>
  </div>
);
}
export default Switch;