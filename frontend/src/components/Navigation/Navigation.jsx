import "@/components/Navigation/Navigation.css";
import Button from "@/components/Button/Button";
import { LuFlower } from "react-icons/lu";

function Navigation() {
  return (
    <div className="navigation">
      <div className="navigation-links">
        <a href="#">About</a>
        <a href="#">The Wall</a>
      </div>
      <div className="navigation-logo">
        <LuFlower size={32} />
      </div>
      <div className="navigation-buttons">
        <Button.Text href="#">Login</Button.Text>
        <Button href="#">Join</Button>
      </div>
    </div>
  );
}

export default Navigation;
