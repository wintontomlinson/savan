import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';

/**
 * The shell is a full-bleed black surface with `overflow: hidden`, so an
 * uncaught render error would otherwise leave nothing but a black screen.
 * Show the error instead, plus a way out that clears local state.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Music Area crashed:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="scroll-y fixed inset-0 flex flex-col items-center justify-center gap-5 bg-black px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15">
          <TriangleAlert size={22} className="text-accent" />
        </div>
        <div>
          <h1 className="text-[19px] font-bold tracking-tight text-white">Something broke while rendering</h1>
          <p className="mt-1.5 text-[13px] text-white/45">
            This is a bug, not your connection. The details below help pin it down.
          </p>
        </div>

        <pre className="max-h-[220px] w-full max-w-[560px] overflow-auto rounded-xl border border-hair bg-surface-2 p-4 text-left text-[11.5px] leading-relaxed text-red-300">
          {error?.message || String(error)}
        </pre>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="press rounded-full bg-white px-5 py-2.5 text-[12.5px] font-bold text-black"
          >
            Reload
          </button>
          <button
            onClick={() => {
              try {
                localStorage.clear();
              } catch {}
              window.location.href = '/';
            }}
            className="press rounded-full bg-white/[0.08] px-4 py-2.5 text-[12.5px] font-semibold text-white/70 hover:bg-white/[0.14]"
          >
            Clear saved data and restart
          </button>
        </div>
      </div>
    );
  }
}
