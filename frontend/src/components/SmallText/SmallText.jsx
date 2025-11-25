import "@/components/SmallText/SmallText.css";

function SmallText({ text, children, ...props }) {
  return (
    <span className="small-text" {...props}>
      {text} {children}
    </span>
  );
}

export default SmallText;
