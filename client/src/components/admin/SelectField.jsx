import React from 'react'

const SelectField = ({ label,
  name,
  value,
  onChange,
  options,
  required = false,}) => {
    console.log(
      "Select value:",
      value,
      "Options:",
      options.map((o) => o.value),
    );

  return (
    <div>
      <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
    </div>
  )
}

export default SelectField