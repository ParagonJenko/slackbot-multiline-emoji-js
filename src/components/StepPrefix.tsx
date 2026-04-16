import { AppState } from '../App';
import s from './shared.module.css';

interface Props {
    state: AppState;
    update: (patch: Partial<AppState>) => void;
}

export default function StepPrefix({ state, update }: Props) {
    return (
        <div className={s.card}>
            <div className={s.field}>
                <label className={s.label} htmlFor="prefix">
                    🏷️ Prefix for the image files
                </label>
                <input
                    className={s.input}
                    type="text"
                    id="prefix"
                    placeholder="e.g. myemoji"
                    value={state.prefix}
                    onChange={(e) => update({ prefix: e.target.value })}
                />
                <p className={s.help}>
                    Used to name the tiles: <em>prefix-col-row.png</em>
                </p>
            </div>
            <div className={s.actions}>
                <button
                    className={s.btnPrimary}
                    onClick={() => update({ step: 'preview' })}
                    type="button"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
