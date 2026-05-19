import { Component } from "react";
import { LuCircleX } from "react-icons/lu";
import Button from "@/components/Button/Button";
import "./ErrorBoundary.css";

/**
 * Application-wide error boundary.
 * Catches JavaScript errors in child components and renders a fallback UI.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <LuCircleX size={48} className="error-boundary-icon" />
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
          <Button onClick={this.handleReset}>Try Again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
