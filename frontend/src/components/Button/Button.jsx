import "@/components/Button/Button.css";

function Button({ children, ...props }) {
  return (
    <button className="button-regular" {...props}>
      {children}
    </button>
  );
}

function Destructive({ children, ...props }) {
  return (
    <button className="button-destructive" {...props}>
      {children}
    </button>
  );
}

function Text({ children, ...props }) {
  return (
    <button className="button-text" {...props}>
      {children}
    </button>
  );
}

Button.Destructive = Destructive;
Button.Text = Text;

export default Button;
