declare module '@zxing/browser' {
    export class BrowserQRCodeReader {
        decodeFromVideoDevice(
            deviceId: string | null,
            videoElement: HTMLVideoElement,
            callback: (result: any, error: any) => void
        ): Promise<void>;
        reset(): void;
    }
}