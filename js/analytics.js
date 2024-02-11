import Analytics from 'analytics'
import segmentPlugin from '@analytics/segment'


const analytics = Analytics({
    app: 'bigmoji',
    version: 200,
    plugins: [
        segmentPlugin({
            writeKey: 'blSky9pOzH5qeOIjO9haVC1jaRWbvFgw'
        })
    ]
})

const userData = analytics.user();

export function logFileEvent(event, fileName){
    analytics.track(event, {
        file: fileName,
        id: userData.anonymousId,
    })
}

export function logPageLoad(){
    analytics.page({
        id: userData.anonymousId,
    });
}

