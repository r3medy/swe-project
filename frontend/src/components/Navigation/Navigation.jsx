import "@/components/Navigation/Navigation.css";
import Button from "@/components/Button/Button";
import { LuFlower, LuSunMedium, LuMoon } from "react-icons/lu";
import { useTheme } from "@/contexts/ThemeContext";

function Navigation() {
  const { theme, toggleTheme } = useTheme();

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
        <Button.Icon onClick={toggleTheme}>
          {theme === "light" ? (
            <LuSunMedium size={20} className="theme-icon" />
          ) : (
            <LuMoon size={20} className="theme-icon" />
          )}
        </Button.Icon>
        <Button.Text href="#">Login</Button.Text>
        <Button href="#">Join</Button>
      </div>
    </div>
  );
}

export default Navigation;
