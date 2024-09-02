export interface HTMLCanvasElementCustom extends HTMLCanvasElement {
    toBuffer: (mimetype?: string) => Buffer;
}

export interface FsTemp {
    writeFileSync: (buffer: Buffer) => string;
}
