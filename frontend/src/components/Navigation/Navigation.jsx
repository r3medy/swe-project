import "@/components/Navigation/Navigation.css";
import Button from "@/components/Button/Button";
import Dropdown from "@/components/Dropdown/Dropdown";
import useSession from "@/hooks/useSession";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LuFlower,
  LuSunMedium,
  LuMoon,
  LuChevronDown,
  LuUser,
  LuLogOut,
  LuFileText,
} from "react-icons/lu";
import { Link, useNavigate } from "react-router";

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useSession();
  const navigate = useNavigate();

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
        {!user ? (
          <>
            <Button.Text>
              <Link to="/login">Login</Link>
            </Button.Text>
            <Button>
              <Link to="/register">Join</Link>
            </Button>
          </>
        ) : (
          <Dropdown
            trigger={
              <Button.Text>
                Settings
                <LuChevronDown style={{ marginLeft: "0.5rem" }} />
              </Button.Text>
            }
          >
            <Dropdown.Item>
              <LuUser size={16} />
              <Link to="/profile">Profile</Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <LuFileText size={16} />
              <Link to="/terms-and-conditions">Terms and Policies</Link>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                logout();
                navigate("/");
              }}
              destructive
            >
              <LuLogOut size={16} />
              <p>Logout</p>
            </Dropdown.Item>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default Navigation;
