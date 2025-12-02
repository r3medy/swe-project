import "@/components/Navigation/Navigation.css";
import { Button, Dropdown, Drawer, Input } from "@/components";
import { useTheme } from "@/contexts/ThemeContext";
import useSession from "@/hooks/useSession";
import { changePasswordSchema } from "@/models/changepassword.zod";
import { toast } from "react-hot-toast";

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
import { useState, useCallback } from "react";

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useSession();
  const [changePasswordDrawer, setChangePasswordDrawer] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = (e) => {
    e.preventDefault();
    const { success, error } = changePasswordSchema.safeParse(passwords);
    if (!success) {
      setPasswordErrors(error.flatten().fieldErrors);
      return;
    }

    setIsPasswordLoading(true);
    fetch("http://localhost:8000/auth/changePassword", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwords),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          toast.success("Password changed successfully");
          setIsPasswordLoading(false);
          setChangePasswordDrawer(false);
          setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setPasswordErrors({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          toast.error(data.message || data.error);
          setIsPasswordLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("An error occurred");
      });
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
        onClose={() => {
          setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setPasswordErrors({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setChangePasswordDrawer(false);
        }}
        title="Change Password"
      >
        <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input
            label="Current Password"
            type="password"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            errors={passwordErrors.currentPassword}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
            }
            errors={passwordErrors.newPassword}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            errors={passwordErrors.confirmPassword}
          />
          <Button
            type="button"
            onClick={handleChangePassword}
            disabled={isPasswordLoading}
          >
            Change Password
          </Button>
        </form>
      </Drawer>
    </>
  );
};

export default Navigation;
