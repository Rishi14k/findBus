import Select from "react-select";

const MultiSelectField = ({
  label,
  name,
  value = [],
  options = [],
  onChange,
  required,
}) => {
  const handleChange = (selectedOptions) => {
    onChange({
      target: {
        name,
        value: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
      },
    });
  };

  return (
    <div className="form-group">
      <label>
        {label} {required && <span style={{color: "red"}}>*</span>}
      </label>

      <Select
        isMulti
        options={options}
        value={options.filter((o) => value.includes(o.value))}
        onChange={handleChange}
        closeMenuOnSelect={false}
      />
    </div>
  );
};

export default MultiSelectField;
