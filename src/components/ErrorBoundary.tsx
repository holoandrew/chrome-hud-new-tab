import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

// Isola i guasti di un singolo widget: un throw non sbianca l'intera dashboard.
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`Widget error${this.props.label ? ` (${this.props.label})` : ''}:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel w-full p-4 flex flex-col items-center justify-center gap-2 text-center">
          <p className="tech-text text-[10px] text-red-400">WIDGET_ERROR</p>
          <p className="text-[10px] text-cyan-700 font-mono">
            {this.props.label || 'Componente'} non disponibile.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1 mt-1 tech-text text-[10px] bg-cyan-900/40 border border-cyan-500/40 rounded text-cyan-200 hover:bg-cyan-800/50 transition"
          >
            RIPROVA
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
