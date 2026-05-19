import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { LuFlower, LuEye, LuEyeClosed } from "react-icons/lu";
import toast from "react-hot-toast";

import "@/pages/Login/Login.css";
import "@/components/Input/Input.css";
import { Button, SmallText, Input } from "@/components";

import { loginSchema } from "@/models/login.zod";
import { useNavigate } from "react-router";
import { useSession } from "@/contexts/SessionContext";

const Login = () => {
  const { user, login } = useSession();
  const navigate = useNavigate();

  const [isHidden, setIsHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    usernameoremail: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    success: false,
    usernameoremail: "",
    password: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      const { success, error } = loginSchema.safeParse(credentials);
      if (!success) {
        setFormErrors({ ...error.flatten().fieldErrors, success });
        return;
      }

      setFormErrors((prev) => ({ ...prev, success }));
      toast.promise(login(credentials), {
        loading: () => {
          setIsLoading(true);
          return "Logging in...";
        },
        success: () => {
          setIsLoading(false);
          navigate("/");
          return "Login successful, You will be redirected to home";
        },
        error: (err) => {
          setIsLoading(false);
          return err.message;
        },
      });
    },
    [credentials, login, navigate],
  );

  // Functional setState for stable callbacks (rerender-functional-setstate)
  const handleUsernameChange = useCallback(
    (e) =>
      setCredentials((prev) => ({ ...prev, usernameoremail: e.target.value })),
    [],
  );

  const handlePasswordChange = useCallback(
    (e) => setCredentials((prev) => ({ ...prev, password: e.target.value })),
    [],
  );

  const togglePasswordVisibility = useCallback(
    () => setIsHidden((prev) => !prev),
    [],
  );

  return (
    <div className="login-container">
      <div className="login-header">
        <Link to="/">
          <Button.Icon>
            <LuFlower size={40} />
          </Button.Icon>
        </Link>
        <p>Welcome back!</p>
        <SmallText text="Don't have an account?">
          <Link to="/register">Sign up</Link>
        </SmallText>
      </div>
      <div className="login-form">
        <form onSubmit={handleLogin}>
          <Input
            type="text"
            name="usernameoremail"
            label="Username or Email"
            placeholder="patrickjane or patrickjane@domain.com"
            required
            value={credentials.usernameoremail}
            onChange={handleUsernameChange}
            style={{
              borderColor:
                formErrors?.usernameoremail?.length > 0 ? "#ef4444" : "",
            }}
            errors={formErrors?.usernameoremail}
          />

          <Input
            type={isHidden ? "password" : "text"}
            name="password"
            label="Password"
            placeholder="Type your password"
            required
            value={credentials.password}
            onChange={handlePasswordChange}
            style={{
              borderColor: formErrors?.password?.length > 0 ? "#ef4444" : "",
            }}
            errors={formErrors?.password}
          >
            <Button.Icon type="button" onClick={togglePasswordVisibility}>
              {isHidden ? <LuEye /> : <LuEyeClosed />}
            </Button.Icon>
          </Input>
          <Button type="submit" disabled={isLoading}>
            Login
          </Button>
        </form>
      </div>
      <div className="login-footer">
        <hr />
        <SmallText text="By using our platform, you agree to our ">
          <Link to="/terms-and-policies">Terms of Service</Link>
        </SmallText>
      </div>
    </div>
  );
};

export default Login;
