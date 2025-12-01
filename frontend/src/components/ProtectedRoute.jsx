import { Navigate } from "react-router";
import useSession from "@/hooks/useSession";

const ProtectedRoute = ({ children }) => {
  const { user } = useSession();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
