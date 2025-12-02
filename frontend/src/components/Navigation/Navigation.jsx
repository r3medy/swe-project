import "@/components/Navigation/Navigation.css";
import Button from "@/components/Button/Button";
import Dropdown from "@/components/Dropdown/Dropdown";
import Drawer from "@/components/Drawer/Drawer";
import Input from "@/components/Input/Input";
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
  LuKey,
  LuAlarmClockCheck,
} from "react-icons/lu";
import { Link, useNavigate } from "react-router";
import { useState } from "react";

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useSession();
  const [changePasswordDrawer, setChangePasswordDrawer] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChangePassword = (e) => {
    e.preventDefault();
    setChangePasswordDrawer(false);
  };

  return (
    <>
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
              <hr />
              {user?.role === "Admin" && (
                <Dropdown.Item>
                  <LuAlarmClockCheck size={16} />
                  <p>Pending Posts</p>
                </Dropdown.Item>
              )}
              <Dropdown.Item onClick={() => setChangePasswordDrawer(true)}>
                <LuKey size={16} />
                <p>Change Password</p>
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
      <Drawer
        isOpen={changePasswordDrawer}
        onClose={() => setChangePasswordDrawer(false)}
        title="Change Password"
      >
        <form
          onSubmit={handleChangePassword}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <Input
            label="Current Password"
            type="password"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, currentPassword: e.target.value })
            }
          />
          <Input
            label="New Password"
            type="password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, confirmPassword: e.target.value })
            }
          />
          <Button type="submit">Change Password</Button>
        </form>
      </Drawer>
    </>
  );
};

export default Navigation;
