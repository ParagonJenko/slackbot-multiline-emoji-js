import Analytics from 'analytics';
import segmentPlugin from '@analytics/segment';

// The analytics library automatically attaches anonymousId to every event —
// there is no need to read or pass it manually.
const analytics = Analytics({
    app: 'bigmoji',
    version: '2.0.0',
    plugins: [
        segmentPlugin({
            writeKey: 'blSky9pOzH5qeOIjO9haVC1jaRWbvFgw',
        }) as Record<string, unknown>,
    ],
});

export function logFileEvent(event: string, fileName: string | undefined): void {
    analytics.track(event, { file: fileName });
}

export function logPageLoad(): void {
    analytics.page();
}
