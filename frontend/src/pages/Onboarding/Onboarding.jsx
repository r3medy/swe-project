import "@/pages/Onboarding/Onboarding.css";
import { useLocation } from "react-router";

function Onboarding() {
  const location = useLocation();
  const { email, password, username } = location.state;

  return (
    <div>
      <h1>Onboarding</h1>
    </div>
  );
}

export default Onboarding;
