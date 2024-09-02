export interface HTMLCanvasElementCustom extends HTMLCanvasElement {
    toBuffer: (mimetype?: string) => string;
}
