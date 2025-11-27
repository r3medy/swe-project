import { LuFlower, LuEye, LuEyeClosed } from "react-icons/lu";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { registerSchema } from "@/models/register.zod";
import "@/pages/Register/Register.css";
import Button from "@/components/Button/Button";
import SmallText from "@/components/SmallText/SmallText";

// TODO: Remove navigate() and replace with backend requests

function Register() {
  const [isHidden, setIsHidden] = useState(true);
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

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const { success, error } = registerSchema.safeParse(credentials);
    if (!success) setFormErrors({ ...error.flatten().fieldErrors, success });
    else {
      setFormErrors({ ...formErrors, success });
      navigate("/");
    }
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <LuFlower size={40} />
        <p>Welcome abroad!</p>
        <SmallText text="Already an existing member?">
          <Link to="/login">Login</Link>
        </SmallText>
      </div>
      <div className="register-form">
        <form onSubmit={handleRegister}>
          <div className="input">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="patrickjane"
                required
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                style={{
                  borderColor:
                    formErrors?.username?.length > 0 ? "#ef4444" : "",
                }}
              />
              {formErrors?.username?.length > 0 &&
                formErrors.username.map((err, idx) => {
                  return (
                    <p key={idx} className="error-text">
                      {err}
                    </p>
                  );
                })}
            </div>
          </div>
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
                placeholder="Type your password"
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
          <div className="input">
            <label htmlFor="confirm-password">Confirm Password</label>
            <div className="input-wrapper">
              <input
                type={isHidden ? "password" : "text"}
                placeholder="Retype your password"
                required
                value={credentials.confirmPassword}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    confirmPassword: e.target.value,
                  })
                }
                style={{
                  borderColor:
                    formErrors?.confirmPassword?.length > 0 ? "#ef4444" : "",
                }}
              />
              {formErrors?.confirmPassword?.length > 0 &&
                formErrors.confirmPassword.map((err, idx) => {
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
          <Button type="submit">Register</Button>
        </form>
      </div>
      <div className="register-footer">
        <div className="divider" />
        <SmallText text="By creating an account, you agree to our ">
          <Link to="#">Terms of Service</Link>
        </SmallText>
      </div>
    </div>
  );
}

export default Register;
