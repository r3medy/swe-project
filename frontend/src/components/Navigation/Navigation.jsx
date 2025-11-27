import "@/components/Navigation/Navigation.css";
import Button from "@/components/Button/Button";
import { LuFlower, LuSunMedium, LuMoon } from "react-icons/lu";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "react-router";

function Navigation() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="navigation">
      <div className="navigation-links">
        <Link to="/about">About</Link>
        <Link to="#">The Wall</Link>
      </div>
      <div className="navigation-logo">
        <Link to="/">
          <Button.Icon style={{ cursor: "pointer", padding: 0 }}>
            <LuFlower size={32} />
          </Button.Icon>
        </Link>
      </div>
      <div className="navigation-buttons">
        <Button.Icon onClick={toggleTheme}>
          {theme === "light" ? (
            <LuSunMedium size={20} className="theme-icon" />
          ) : (
            <LuMoon size={20} className="theme-icon" />
          )}
        </Button.Icon>
        <Button.Text>
          <Link to="/login">Login</Link>
        </Button.Text>
        <Button>
          <Link to="/register">Join</Link>
        </Button>
      </div>
    </div>
  );
}

export default Navigation;
