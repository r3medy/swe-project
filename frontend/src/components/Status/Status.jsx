import { LuLoaderCircle, LuCircleX } from "react-icons/lu";
import SmallText from "@/components/SmallText/SmallText";
import "./Status.css";

const Status = ({ text, subtext, children }) => {
  return (
    <div className="status-container">
      <LuLoaderCircle size={48} className="spin" />
      <h1>{text}</h1>
      <SmallText text={subtext} />
      {children}
    </div>
  );
};

const Error = ({ text, subtext, children }) => {
  return (
    <div className="status-container">
      <LuCircleX size={48} className="status-error-icon" />
      <h1>{text}</h1>
      <SmallText text={subtext} />
      {children}
    </div>
  );
};

Status.Error = Error;

export default Status;
