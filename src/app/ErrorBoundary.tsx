import { Component, type ReactNode } from 'react';
import { CharacterHost } from '@/components/CharacterHost';
import { strings } from '@/strings';

type State = { hasError: boolean };

/** Global safety net: a friendly mascot screen instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
        <CharacterHost expression="thinking" size={220} />
        <p className="font-ui text-4xl font-bold">{strings.errorTitle}</p>
        <button
          type="button"
          className="min-h-big rounded-blob border-[5px] border-outline bg-accent px-10 font-ui text-3xl font-bold text-[#2b1d16]"
          onClick={() => {
            this.setState({ hasError: false });
            window.location.assign('/');
          }}
        >
          {strings.errorAction}
        </button>
      </div>
    );
  }
}
