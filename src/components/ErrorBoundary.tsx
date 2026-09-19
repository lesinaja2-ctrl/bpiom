import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error captured by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50/50">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-red-200 shadow-xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-slate-900">
                {this.props.fallbackTitle || 'Terjadi Kendala Memuat Komponen'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Aplikasi mendeteksi galat saat memproses tampilan ini. Kami telah mengamankan sistem agar layar tidak menjadi blank putih.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-red-50/80 rounded-xl border border-red-200 text-left text-xs font-mono text-red-800 break-words max-h-32 overflow-y-auto">
                <strong>Pesan Galat:</strong> {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 bg-sky-900 hover:bg-sky-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
