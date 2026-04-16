import { AppState } from '../App';
import s from './shared.module.css';

interface Props {
    state: AppState;
    update: (patch: Partial<AppState>) => void;
}

const GRID_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function StepGridSize({ state, update }: Props) {
    return (
        <div className={s.card}>
            <div className={s.field}>
                <label className={s.label} htmlFor="grid">
                    📐 What is the grid size?
                </label>
                <div className={s.selectWrapper}>
                    <select
                        className={s.select}
                        id="grid"
                        value={state.gridSize}
                        onChange={(e) => update({ gridSize: parseInt(e.target.value, 10) })}
                    >
                        {GRID_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                                {n}×{n}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className={s.actions}>
                <button
                    className={s.btnPrimary}
                    onClick={() => update({ step: 'prefix' })}
                    type="button"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
