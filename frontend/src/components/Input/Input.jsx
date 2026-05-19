import "./Input.css";

const ErrorList = ({ errors }) => {
  if (!errors?.length) return null;
  return errors.map((err, idx) => (
    <p key={idx} className="error-text">
      {err}
    </p>
  ));
};

const Input = ({ label, name, type, placeholder, value, errors, children, ...props }) => {
  return (
    <div className="input">
      <label htmlFor={name}>{label}</label>
      <div className="input-wrapper">
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          {...props}
        />
        <ErrorList errors={errors} />
        {children}
      </div>
    </div>
  );
};

const TextArea = ({ label, name, placeholder, value, errors, children, ...props }) => {
  return (
    <div className="input">
      <label htmlFor={name}>{label}</label>
      <div className="input-wrapper">
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          {...props}
        />
        <ErrorList errors={errors} />
        {children}
      </div>
    </div>
  );
};

Input.TextArea = TextArea;

export default Input;
