declare module 'gifenc' {
    export type GifPalette = number[][]

    export function quantize(
        rgba: Uint8Array | Uint8ClampedArray,
        maxColors: number,
        options?: Record<string, unknown>,
    ): GifPalette

    export function applyPalette(
        rgba: Uint8Array | Uint8ClampedArray,
        palette: GifPalette,
        format?: string,
    ): Uint8Array

    export function GIFEncoder(options?: { initialCapacity?: number; auto?: boolean }): {
        writeFrame(
            index: Uint8Array,
            width: number,
            height: number,
            opts?: {
                palette?: GifPalette
                delay?: number
                repeat?: number
                transparent?: boolean
                transparentIndex?: number
            },
        ): void
        finish(): void
        bytes(): Uint8Array
    }
}
