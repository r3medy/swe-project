import "./Select.css";
import COUNTRIES_BY_LETTER from "./countries";

const Select = ({
  label,
  name,
  options,
  value,
  errors,
  children,
  ...props
}) => {
  return (
    <div className="select">
      {label ? <label htmlFor={name}>{label}</label> : null}
      <div className="select-wrapper">
        <select
          name={name}
          value={value}
          className={errors?.length ? "error-border" : ""}
          {...props}
        >
          {children
            ? children
            : options?.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
        </select>
        {errors?.length > 0
          ? errors.map((err, idx) => (
              <p key={idx} className="error-text">
                {err}
              </p>
            ))
          : null}
      </div>
    </div>
  );
};

/**
 * SelectCountries - Data-driven country selector variant.
 * Country data is extracted to a separate module so the static data
 * isn't re-created in the JSX tree on every render (rendering-hoist-jsx).
 * Uses ternary instead of && for conditional rendering (rendering-conditional-render).
 */
const SelectCountries = (props) => {
  return (
    <Select {...props}>
      <option value="">Select country</option>
      {Object.entries(COUNTRIES_BY_LETTER).map(([letter, countries]) => (
        <optgroup key={letter} label={letter}>
          {countries.map(({ code, name }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
};

Select.Countries = SelectCountries;

export default Select;
