declare module '@analytics/segment' {
    interface SegmentPluginOptions {
        writeKey: string;
    }
    function segmentPlugin(options: SegmentPluginOptions): unknown;
    export default segmentPlugin;
}
