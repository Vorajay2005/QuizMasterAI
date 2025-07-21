import { Component } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>

              <p className="text-gray-600 mb-8">
                We're sorry, but something unexpected happened. Don't worry,
                your progress is saved.
              </p>

              <div className="space-y-4">
                <button
                  onClick={this.handleRefresh}
                  className="w-full btn btn-primary flex items-center justify-center"
                >
                  <RefreshCw className="mr-2" size={18} />
                  Try Again
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full btn btn-outline flex items-center justify-center"
                >
                  <Home className="mr-2" size={18} />
                  Go to Home
                </button>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-700 font-mono overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong>{" "}
                      {this.state.error && this.state.error.toString()}
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
