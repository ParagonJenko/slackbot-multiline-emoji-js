import { useEffect, useState } from 'react';
import StepUpload from './components/StepUpload';
import StepCrop from './components/StepCrop';
import StepGridSize from './components/StepGridSize';
import StepPrefix from './components/StepPrefix';
import StepPreviewDownload from './components/StepPreviewDownload';
import PrivacyPolicy from './components/PrivacyPolicy';
import s from './App.module.css';

export type Step = 'upload' | 'crop' | 'gridSize' | 'prefix' | 'preview';

export interface AppState {
    step: Step;
    file: File | null;
    imageUrl: string | null;
    isGif: boolean;
    isSquare: boolean | null;
    gridSize: number;
    prefix: string;
}

const INITIAL_STATE: AppState = {
    step: 'upload',
    file: null,
    imageUrl: null,
    isGif: false,
    isSquare: null,
    gridSize: 2,
    prefix: '',
};

export default function App() {
    const [state, setState] = useState<AppState>(INITIAL_STATE);
    const [showPrivacy, setShowPrivacy] = useState(false);

    function update(patch: Partial<AppState>) {
        setState((prev) => ({ ...prev, ...patch }));
    }

    useEffect(() => {
        return () => {
            if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
        };
    }, [state.imageUrl]);

    function reset() {
        if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
        setState(INITIAL_STATE);
    }

    if (showPrivacy) {
        return (
            <div className={s.wrapper}>
                <main className={s.main}>
                    <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
                </main>
                <footer className={s.footer}>
                    <h4>
                        🛠️ Built by{' '}
                        <a href="https://alexjenkinson.com">Alex Jenkinson</a>
                    </h4>
                </footer>
            </div>
        );
    }

    return (
        <div className={s.wrapper}>
            <div className={s.header}>
                <div className={s.headerCard}>
                    <h1 className={s.title}>🍱 BigMoji Generator</h1>
                    <p className={s.subtitle}>
                        Split images into square tiles for Slack bigmojis. 🎉
                    </p>
                </div>
            </div>

            <main className={s.main}>
                {state.step === 'upload' && <StepUpload state={state} update={update} />}
                {state.step === 'crop' && <StepCrop state={state} update={update} />}
                {state.step === 'gridSize' && <StepGridSize state={state} update={update} />}
                {state.step === 'prefix' && <StepPrefix state={state} update={update} />}
                {state.step === 'preview' && (
                    <StepPreviewDownload state={state} update={update} reset={reset} />
                )}
            </main>

            <footer className={s.footer}>
                <h4>
                    🛠️ Built by{' '}
                    <a href="https://alexjenkinson.com">Alex Jenkinson</a>
                </h4>
                <h5>
                    Open source!{' '}
                    <a href="https://github.com/ParagonJenko/slackbot-multiline-emoji-js">
                        View the repository 📂
                    </a>
                </h5>
                <p className={s.footerNote}>
                    <em>🤖 Huge thanks to ChatGPT for guiding this project.</em>
                </p>
                <button className={s.footerLink} onClick={() => setShowPrivacy(true)} type="button">
                    Privacy Policy
                </button>
            </footer>
        </div>
    );
}
