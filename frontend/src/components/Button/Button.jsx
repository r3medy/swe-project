import "@/components/Button/Button.css";

const Button = ({ children, ...props }) => {
  return (
    <button className="button-regular" {...props}>
      {children}
    </button>
  );
};

const Destructive = ({ children, ...props }) => {
  return (
    <button className="button-destructive" {...props}>
      {children}
    </button>
  );
};

const Text = ({ children, ...props }) => {
  return (
    <button className="button-text" {...props}>
      {children}
    </button>
  );
};

const Icon = ({ children, ...props }) => {
  return (
    <button className="button-icon-only" {...props}>
      {children}
    </button>
  );
};

Button.Destructive = Destructive;
Button.Text = Text;
Button.Icon = Icon;

export default Button;
