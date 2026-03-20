import { Component } from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">!</div>
            <h2>Something went wrong</h2>
            <p>
              The application encountered an unexpected error. This could be due
              to a corrupted file or a missing resource.
            </p>
            {this.state.error && (
              <pre className="error-boundary-details">
                {this.state.error.message}
              </pre>
            )}
            <button className="error-boundary-btn" onClick={() => this.handleReset()}>
              Go back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
