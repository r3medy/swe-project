import { LuFlower, LuEye, LuEyeClosed } from "react-icons/lu";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";

import useSession from "@/hooks/useSession";
import "@/pages/Register/Register.css";
import { registerSchema } from "@/models/register.zod";

import { Button, SmallText, Input } from "@/components";

const Register = () => {
  const { user } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

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
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
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
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
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
            onChange={(e) =>
              setCredentials({
                ...credentials,
                password: e.target.value,
              })
            }
            style={{
              borderColor: formErrors?.password?.length > 0 ? "#ef4444" : "",
            }}
            errors={formErrors?.password}
          >
            <Button.Icon type="button" onClick={() => setIsHidden(!isHidden)}>
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
            errors={formErrors?.confirmPassword}
          >
            <Button.Icon type="button" onClick={() => setIsHidden(!isHidden)}>
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
          <Link to="/terms-and-conditions">Terms of Service</Link>
        </SmallText>
      </div>
    </div>
  );
};

export default Register;
