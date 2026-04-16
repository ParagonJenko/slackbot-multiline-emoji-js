import { useRef } from 'react';
import { AppState } from '../App';
import s from './shared.module.css';
import u from './StepUpload.module.css';

interface Props {
    state: AppState;
    update: (patch: Partial<AppState>) => void;
}

export default function StepUpload({ state, update }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Only image files are supported. Please select a different file.');
            return;
        }

        const isGif = file.type === 'image/gif';
        if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
        const imageUrl = URL.createObjectURL(file);

        update({ file, imageUrl, isGif, isSquare: null });

        if (!isGif) {
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                update({ isSquare: img.naturalWidth === img.naturalHeight });
            };
        }
    }

    function handleNext() {
        if (!state.file) {
            alert('No file selected.');
            return;
        }
        if (state.isGif) {
            update({ step: 'gridSize' });
        } else if (state.isSquare === null) {
            alert('Please wait for the image to load.');
        } else if (state.isSquare) {
            update({ step: 'gridSize' });
        } else {
            update({ step: 'crop' });
        }
    }

    return (
        <div className={s.card}>
            <div className={s.field}>
                <label className={s.label}>📁 Upload an image or GIF</label>
                <div className={u.fileArea}>
                    <input
                        className={u.fileInput}
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <span className={u.filePrompt}>🖼️ Choose a file…</span>
                    <span className={u.fileName}>
                        {state.file ? `✅ ${state.file.name}` : 'PNG, JPG, GIF supported'}
                    </span>
                </div>
            </div>
            <div className={s.actions}>
                <button className={s.btnPrimary} onClick={handleNext} type="button">
                    Next →
                </button>
            </div>
        </div>
    );
}
