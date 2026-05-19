import { LuFlower, LuEye, LuEyeClosed } from "react-icons/lu";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";

import { useSession } from "@/contexts/SessionContext";
import { API_BASE_URL } from "@/config";
import "@/pages/Register/Register.css";
import { registerSchema } from "@/models/register.zod";

import { Button, SmallText, Input } from "@/components";

const Register = () => {
  const { user } = useSession();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const [isHidden, setIsHidden] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    success: false,
    username: [],
    email: [],
    password: [],
    confirmPassword: [],
  });

  const fetchCheckUser = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/auth/checkUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (response.status === 200) throw new Error(data.message);
    return data;
  }, [credentials]);

  const handleRegister = useCallback(
    (e) => {
      e.preventDefault();
      const { success, error } = registerSchema.safeParse(credentials);
      if (!success) {
        setFormErrors({ ...error.flatten().fieldErrors, success });
        return;
      }

      setFormErrors((prev) => ({ ...prev, success }));
      toast.promise(fetchCheckUser(), {
        loading: () => {
          setIsLoading(true);
          return "Checking user...";
        },
        success: () => {
          setIsLoading(false);
          navigate("/onboarding", { state: credentials });
          return "You will be redirected to the next step";
        },
        error: (err) => {
          setIsLoading(false);
          return err.message;
        },
      });
    },
    [credentials, fetchCheckUser, navigate],
  );

  // Functional setState for stable callbacks (rerender-functional-setstate)
  const handleUsernameChange = useCallback(
    (e) =>
      setCredentials((prev) => ({
        ...prev,
        username: e.target.value.toLowerCase(),
      })),
    [],
  );

  const handleEmailChange = useCallback(
    (e) =>
      setCredentials((prev) => ({
        ...prev,
        email: e.target.value.toLowerCase(),
      })),
    [],
  );

  const handlePasswordChange = useCallback(
    (e) => setCredentials((prev) => ({ ...prev, password: e.target.value })),
    [],
  );

  const handleConfirmPasswordChange = useCallback(
    (e) =>
      setCredentials((prev) => ({ ...prev, confirmPassword: e.target.value })),
    [],
  );

  const togglePasswordVisibility = useCallback(
    () => setIsHidden((prev) => !prev),
    [],
  );

  return (
    <div className="register-container">
      <div className="register-header">
        <Link to="/">
          <Button.Icon>
            <LuFlower size={40} />
          </Button.Icon>
        </Link>
        <p>Welcome abroad!</p>
        <SmallText text="Already an existing member?">
          <Link to="/login">Login</Link>
        </SmallText>
      </div>
      <div className="register-form">
        <form onSubmit={handleRegister}>
          <Input
            type="text"
            label="Username"
            name="username"
            placeholder="patrickjane"
            value={credentials.username}
            onChange={handleUsernameChange}
            style={{
              borderColor: formErrors?.username?.length > 0 ? "#ef4444" : "",
            }}
            errors={formErrors?.username}
          />

          <Input
            type="email"
            label="Email"
            name="email"
            placeholder="patrickjane@domain.com"
            value={credentials.email}
            onChange={handleEmailChange}
            style={{
              borderColor: formErrors?.email?.length > 0 ? "#ef4444" : "",
            }}
            errors={formErrors?.email}
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

          <Input
            type={isHidden ? "password" : "text"}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Retype your password"
            required
            value={credentials.confirmPassword}
            onChange={handleConfirmPasswordChange}
            style={{
              borderColor:
                formErrors?.confirmPassword?.length > 0 ? "#ef4444" : "",
            }}
            errors={formErrors?.confirmPassword}
          >
            <Button.Icon type="button" onClick={togglePasswordVisibility}>
              {isHidden ? <LuEye /> : <LuEyeClosed />}
            </Button.Icon>
          </Input>

          <Button type="submit" disabled={isLoading}>
            Register
          </Button>
        </form>
      </div>
      <div className="register-footer">
        <hr />
        <SmallText text="By creating an account, you agree to our ">
          <Link to="/terms-and-policies">Terms of Service</Link>
        </SmallText>
      </div>
    </div>
  );
};

export default Register;
