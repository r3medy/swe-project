import "@/pages/Login/Login.css";
import { LuFlower, LuEye, LuEyeClosed } from "react-icons/lu";
import Button from "@/components/Button/Button";
import SmallText from "@/components/SmallText/SmallText";
import { useState } from "react";
import { Link } from "react-router";
import { loginSchema } from "@/models/login.zod";
import { useNavigate } from "react-router";

function Login() {
  const [isHidden, setIsHidden] = useState(true);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    success: false,
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const { success, error } = loginSchema.safeParse(credentials);
    if (!success) setFormErrors({ ...error.flatten().fieldErrors, success });
    else {
      setFormErrors({ ...formErrors, success });
      navigate("/");
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <LuFlower size={40} />
        <p>Welcome back!</p>
      </div>
      <div className="login-form">
        <form onSubmit={handleLogin}>
          <div className="input">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="patrickjane@domain.com"
                required
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                style={{
                  borderColor: formErrors?.email?.length > 0 ? "#ef4444" : "",
                }}
              />
              {formErrors?.email?.length > 0 &&
                formErrors.email.map((err, idx) => {
                  return (
                    <p key={idx} className="error-text">
                      {err}
                    </p>
                  );
                })}
            </div>
          </div>
          <div className="input">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type={isHidden ? "password" : "text"}
                placeholder="Make it secure!"
                required
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                style={{
                  borderColor:
                    formErrors?.password?.length > 0 ? "#ef4444" : "",
                }}
              />
              {formErrors?.password?.length > 0 &&
                formErrors.password.map((err, idx) => {
                  return (
                    <p key={idx} className="error-text">
                      {err}
                    </p>
                  );
                })}
              <Button.Icon type="button" onClick={() => setIsHidden(!isHidden)}>
                {isHidden ? <LuEye /> : <LuEyeClosed />}
              </Button.Icon>
            </div>
          </div>
          <Button type="submit">Login</Button>
        </form>
      </div>
      <div className="login-footer">
        <div className="divider" />
        <SmallText text="Don't have an account?">
          <Link to="/register">Sign up!</Link>
        </SmallText>
      </div>
    </div>
  );
}

export default Login;
