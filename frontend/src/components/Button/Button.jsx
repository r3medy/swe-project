import "@/components/Button/Button.css";

const Button = ({ children, ...props }) => {
  return (
    <button className="button-base button-regular" {...props}>
      {children}
    </button>
  );
};

const Destructive = ({ children, ...props }) => {
  return (
    <button className="button-base button-destructive" {...props}>
      {children}
    </button>
  );
};

const Text = ({ children, ...props }) => {
  return (
    <button className="button-base button-text" {...props}>
      {children}
    </button>
  );
};

const Icon = ({ children, ...props }) => {
  return (
    <button className="button-base button-icon-only" {...props}>
      {children}
    </button>
  );
};

Button.Destructive = Destructive;
Button.Text = Text;
Button.Icon = Icon;

export default Button;
