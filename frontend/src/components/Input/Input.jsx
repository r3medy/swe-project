import "./Input.css";

function Input({
  label,
  name,
  type,
  placeholder,
  value,
  errors,
  children,
  ...props
}) {
  return (
    <div className="input">
      <label htmlFor={name}>{label}</label>
      <div className="input-wrapper">
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          {...props}
        />
        {errors?.length > 0 &&
          errors.map((err, idx) => {
            return (
              <p key={idx} className="error-text">
                {err}
              </p>
            );
          })}
        {children}
      </div>
    </div>
  );
}

function TextArea({
  label,
  name,
  placeholder,
  value,
  errors,
  children,
  ...props
}) {
  return (
    <div className="input">
      <label htmlFor={name}>{label}</label>
      <div className="input-wrapper">
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          {...props}
        />
        {errors?.length > 0 &&
          errors.map((err, idx) => {
            return (
              <p key={idx} className="error-text">
                {err}
              </p>
            );
          })}
        {children}
      </div>
    </div>
  );
}

Input.TextArea = TextArea;

export default Input;
