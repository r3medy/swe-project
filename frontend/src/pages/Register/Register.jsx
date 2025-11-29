import { LuFlower, LuEye, LuEyeClosed } from "react-icons/lu";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import { registerSchema } from "@/models/register.zod";
import "@/pages/Register/Register.css";
import Button from "@/components/Button/Button";
import SmallText from "@/components/SmallText/SmallText";

// TODO: Remove navigate() and replace with backend requests

function Register() {
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

  const navigate = useNavigate();

  const fetchCheckUser = async () => {
    const response = await fetch("http://localhost:8000/auth/checkUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (response.status === 200) throw new Error(data.message);
    return data;
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const { success, error } = registerSchema.safeParse(credentials);
    if (!success) setFormErrors({ ...error.flatten().fieldErrors, success });
    else {
      setFormErrors({ ...formErrors, success });
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
    }
  };

  return (
    <div className="register-container">
      <Toaster />
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
          <Button type="submit" disabled={isLoading}>
            Register
          </Button>
        </form>
      </div>
      <div className="register-footer">
        <div className="divider" />
        <SmallText text="By creating an account, you agree to our ">
          <Link to="/terms-and-conditions">Terms of Service</Link>
        </SmallText>
      </div>
    </div>
  );
}

export default Register;
