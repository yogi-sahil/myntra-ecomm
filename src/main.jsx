import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f6] flex items-center justify-center p-4 text-[#282c3f]">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
            <div className="w-16 h-16 bg-[#ff3f6c]/10 text-[#ff3f6c] rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl">
              M
            </div>
            <h1 className="text-xl font-black mb-2 uppercase tracking-wide">Something Went Wrong</h1>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              We encountered a temporary rendering issue. Error details below:
            </p>
            {this.state.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-left text-xs font-mono mb-4 overflow-x-auto max-h-40 border border-red-200">
                <p className="font-bold">{this.state.error.toString()}</p>
                {this.state.error.stack && (
                  <pre className="text-[10px] mt-2 whitespace-pre-wrap text-red-500">{this.state.error.stack}</pre>
                )}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full bg-[#ff3f6c] hover:bg-[#e11b4c] text-white font-bold py-3 rounded-lg text-sm shadow-md transition-all"
            >
              REFRESH STORE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
