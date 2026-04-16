import { useEffect, useRef } from 'react';
import Cropper from 'cropperjs';
import { AppState } from '../App';
import s from './shared.module.css';
import c from './StepCrop.module.css';

interface Props {
    state: AppState;
    update: (patch: Partial<AppState>) => void;
}

export default function StepCrop({ state, update }: Props) {
    const imgRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<Cropper | null>(null);

    useEffect(() => {
        if (!imgRef.current || !state.imageUrl) return;

        imgRef.current.src = state.imageUrl;

        cropperRef.current = new Cropper(imgRef.current, {
            aspectRatio: 1,
            viewMode: 3,
        });

        return () => {
            cropperRef.current?.destroy();
            cropperRef.current = null;
        };
    }, [state.imageUrl]);

    function handleCrop() {
        const cropper = cropperRef.current;
        if (!cropper) return;

        const MAX_DIM = 1024;
        const cropData = cropper.getData();
        const nativeSize = Math.min(Math.max(cropData.width, cropData.height), MAX_DIM);

        cropper.getCroppedCanvas({ width: nativeSize, height: nativeSize }).toBlob((blob) => {
            if (!blob) {
                console.error('Failed to crop image.');
                return;
            }
            if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
            update({ imageUrl: URL.createObjectURL(blob), step: 'gridSize' });
        });
    }

    return (
        <div className={s.card}>
            <div className={c.imageWrapper}>
                <img ref={imgRef} alt="Crop preview" />
            </div>
            <div className={s.actions}>
                <button className={s.btnPrimary} onClick={handleCrop} type="button">
                    ✂️ Use cropped area
                </button>
            </div>
        </div>
    );
}
