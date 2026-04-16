import { useEffect, useRef, useState } from 'react';
import { AppState } from '../App';
import { createSmallerImages } from '../lib/imageProcessing';
import { splitGif } from '../lib/gifProcessing';
import { createZipFile, generateZipURL } from '../lib/fileIO';
import { generateSlackbotCommand } from '../lib/utils';
import { logFileEvent } from '../lib/analytics';
import s from './shared.module.css';
import p from './StepPreviewDownload.module.css';

interface Props {
    state: AppState;
    update: (patch: Partial<AppState>) => void;
    reset: () => void;
}

interface TileDims { w: number; h: number; }

export default function StepPreviewDownload({ state, reset }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zipUrl, setZipUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [tileDims, setTileDims] = useState<TileDims | null>(null);

    const fileNameWithoutExt = state.file
        ? state.file.name.split('.').slice(0, -1).join('.')
        : 'bigmoji';
    const outputName = state.prefix.trim() || fileNameWithoutExt;

    // Draw preview canvas with visible grid lines
    useEffect(() => {
        if (!state.imageUrl || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        img.src = state.imageUrl;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const tileW = Math.floor(img.width / state.gridSize);
            const tileH = Math.floor(img.height / state.gridSize);
            setTileDims({ w: tileW, h: tileH });

            const lw = Math.max(1.5, img.width / 400);

            // Draw each line twice: dark shadow first, then bright white on top.
            // This makes the lines visible against both dark and light images.
            function drawLines(strokeStyle: string, lineWidth: number, dash: number[]) {
                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = lineWidth;
                ctx.setLineDash(dash);
                for (let i = 1; i < state.gridSize; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * tileW, 0);
                    ctx.lineTo(i * tileW, img.height);
                    ctx.moveTo(0, i * tileH);
                    ctx.lineTo(img.width, i * tileH);
                    ctx.stroke();
                }
            }

            drawLines('rgba(0,0,0,0.45)', lw + 2, []);        // dark halo
            drawLines('rgba(255,255,255,0.95)', lw, [8, 5]);   // bright dashes on top
            ctx.setLineDash([]);
        };
    }, [state.imageUrl, state.gridSize]);

    useEffect(() => {
        void processDownload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => { if (zipUrl) URL.revokeObjectURL(zipUrl); };
    }, [zipUrl]);

    async function processDownload() {
        setProcessing(true);
        setProgress(0);
        try {
            const textCommand = generateSlackbotCommand(state.gridSize, outputName);
            let url: string;
            if (state.isGif && state.file) {
                const tiles = await splitGif(state.file, state.gridSize, setProgress);
                const zip = createZipFile(outputName, tiles, textCommand, state.gridSize, 'gif');
                url = await generateZipURL(zip);
            } else if (state.imageUrl) {
                const images = await createSmallerImages(state.imageUrl, state.gridSize);
                const zip = createZipFile(outputName, images, textCommand, state.gridSize, 'png');
                url = await generateZipURL(zip);
            } else {
                throw new Error('No image source available.');
            }
            setZipUrl(url);
            logFileEvent('Download processed', state.file?.name);
        } catch (err) {
            console.error('Processing failed:', err);
            alert('Something went wrong while processing. Please try again.');
        } finally {
            setProcessing(false);
            setProgress(100);
        }
    }

    function handleDownload() {
        if (!zipUrl) return;
        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = `${outputName}.zip`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        logFileEvent('File downloaded', state.file?.name);
    }

    const slackCommand = generateSlackbotCommand(state.gridSize, outputName);
    const copyCommand = generateSlackbotCommand(state.gridSize, outputName, true);

    return (
        <div className={s.card} style={{ maxWidth: '720px' }}>
            <div className={p.layout}>
                {/* Preview */}
                <div>
                    <p className={p.previewLabel}>👀 Preview</p>
                    <div className={p.canvasWrapper}>
                        <canvas ref={canvasRef} className={p.canvas} />
                    </div>
                    {tileDims && (
                        <p className={s.help}>
                            {state.gridSize}×{state.gridSize} &mdash; {state.gridSize * state.gridSize} tiles,
                            each {tileDims.w}×{tileDims.h}px{state.isGif && ' · animated GIF'}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className={p.sideActions}>
                    {processing ? (
                        <>
                            <button className={s.btnPrimary} disabled type="button">
                                <span className={p.spinner} />
                                {state.isGif ? 'Processing…' : 'Preparing…'}
                            </button>
                            {state.isGif && (
                                <>
                                    <div className={p.progressBar}>
                                        <div
                                            className={p.progressFill}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className={p.processingLabel}>{progress}% complete</p>
                                </>
                            )}
                        </>
                    ) : (
                        <button
                            className={s.btnPrimary}
                            onClick={handleDownload}
                            disabled={!zipUrl}
                            type="button"
                        >
                            📦 Download ZIP
                        </button>
                    )}
                    <button className={s.btnWarning} onClick={reset} type="button">
                        🔄 Start again
                    </button>
                </div>
            </div>

            {/* Slack commands */}
            <div className={p.commandsGrid}>
                <div>
                    <p className={p.commandLabel}>
                        🤖 Add to Slackbot
                        <a
                            className={p.commandLink}
                            href="https://slack.com/intl/en-gb/help/articles/206870177-Add-customised-emoji-and-aliases-to-your-workspace"
                            target="_blank"
                            rel="noreferrer"
                        >
                            How?
                        </a>
                    </p>
                    <textarea className={s.textarea} readOnly value={slackCommand} />
                </div>
                <div>
                    <p className={p.commandLabel}>📋 Paste manually</p>
                    <textarea className={s.textarea} readOnly value={copyCommand} />
                </div>
            </div>
        </div>
    );
}
