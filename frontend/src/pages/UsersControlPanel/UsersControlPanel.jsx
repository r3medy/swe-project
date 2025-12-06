import "@/pages/UsersControlPanel/UsersControlPanel.css";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useSession } from "@/contexts/SessionContext";
import { Navigation } from "@/components";

function UsersControlPanel() {
  const { user } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "Admin") navigate("/");
  }, [user, navigate]);

  return (
    <>
      <Navigation />
      <div>
        <h1>Users Control Panel</h1>
      </div>
    </>
  );
}

export default UsersControlPanel;
