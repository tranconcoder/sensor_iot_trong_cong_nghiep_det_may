export interface HTMLCanvasElementCustom extends HTMLCanvasElement {
    toBuffer: (mimetype?: string) => string;
}

export interface FsTemp {
    writeFileSync: (buffer: Buffer) => string;
}
