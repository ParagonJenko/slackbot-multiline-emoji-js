import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import s from './PrivacyPolicy.module.css';

interface Props {
    onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: Props) {
    const [content, setContent] = useState<string | null>(null);

    useEffect(() => {
        fetch('/privacy-policy.md')
            .then((r) => r.text())
            .then(setContent)
            .catch(() => setContent('Failed to load privacy policy.'));
    }, []);

    return (
        <div className={s.wrapper}>
            <div className={s.card}>
                <button className={s.back} onClick={onBack} type="button">
                    ← Back
                </button>
                {content === null ? (
                    <p className={s.loading}>Loading…</p>
                ) : (
                    <div className={s.prose}>
                        <Markdown>{content}</Markdown>
                    </div>
                )}
            </div>
        </div>
    );
}
