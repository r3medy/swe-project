import "@/pages/Pending/Pending.css";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useSession } from "@/contexts/SessionContext";
import { Navigation } from "@/components";

function Pending() {
  const { user } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "Admin") navigate("/");
  }, [user, navigate]);

  return (
    <>
      <Navigation />
      <div>
        <h1>Post Pending</h1>
      </div>
    </>
  );
}

export default Pending;
