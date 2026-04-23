import { GIFEncoder, quantize, applyPalette } from 'gifenc'

import type { RgbaFrame } from './types'

function flattenAlpha(rgba: Uint8ClampedArray, bgR: number, bgG: number, bgB: number): Uint8ClampedArray {
    const out = new Uint8ClampedArray(rgba.length)
    for (let i = 0; i < rgba.length; i += 4) {
        const a = rgba[i + 3] / 255
        out[i]     = Math.round(rgba[i]     * a + bgR * (1 - a))
        out[i + 1] = Math.round(rgba[i + 1] * a + bgG * (1 - a))
        out[i + 2] = Math.round(rgba[i + 2] * a + bgB * (1 - a))
        out[i + 3] = 255
    }
    return out
}

function resizeRgba(data: Uint8ClampedArray, sw: number, sh: number, tw: number, th: number): Uint8ClampedArray {
    if (sw === tw && sh === th) return data
    const out = new Uint8ClampedArray(tw * th * 4)
    const xRatio = sw / tw
    const yRatio = sh / th
    for (let y = 0; y < th; y++) {
        for (let x = 0; x < tw; x++) {
            const srcX = x * xRatio
            const srcY = y * yRatio
            const x0 = Math.floor(srcX)
            const y0 = Math.floor(srcY)
            const x1 = Math.min(sw - 1, x0 + 1)
            const y1 = Math.min(sh - 1, y0 + 1)
            const fx = srcX - x0
            const fy = srcY - y0
            const i00 = (y0 * sw + x0) * 4
            const i10 = (y0 * sw + x1) * 4
            const i01 = (y1 * sw + x0) * 4
            const i11 = (y1 * sw + x1) * 4
            const dst = (y * tw + x) * 4
            for (let c = 0; c < 4; c++) {
                out[dst + c] = Math.round(
                    data[i00 + c] * (1 - fx) * (1 - fy) +
                    data[i10 + c] * fx       * (1 - fy) +
                    data[i01 + c] * (1 - fx) * fy +
                    data[i11 + c] * fx       * fy,
                )
            }
        }
    }
    return out
}

function samplePixels(rgba: Uint8ClampedArray, maxSamples: number): Uint8ClampedArray {
    const totalPixels = rgba.length / 4
    if (totalPixels <= maxSamples) return rgba
    const out = new Uint8ClampedArray(maxSamples * 4)
    for (let i = 0; i < maxSamples; i++) {
        const srcIdx = Math.floor((i / maxSamples) * totalPixels) * 4
        out[i * 4]     = rgba[srcIdx]
        out[i * 4 + 1] = rgba[srcIdx + 1]
        out[i * 4 + 2] = rgba[srcIdx + 2]
        out[i * 4 + 3] = rgba[srcIdx + 3]
    }
    return out
}

function parseHexColor(hex: string): [number, number, number] {
    const h = hex.replace('#', '')
    const full = h.length === 3
        ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
        : h.padEnd(6, '0')
    return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
    ]
}

function rgbaFramesToGifBytes(
    frames: RgbaFrame[],
    frameDelayMs: number,
    options?: { repeat?: number; background?: string; outputWidth?: number; outputHeight?: number },
): Uint8Array {
    if (!frames.length) {
        throw new Error('rgbaFramesToGifBytes: frames is empty')
    }
    const { repeat = 0, background = '#ffffff', outputWidth, outputHeight } = options || {}
    const [bgR, bgG, bgB] = parseHexColor(background)

    const srcW = frames[0].width
    const srcH = frames[0].height
    const outW = outputWidth  ?? srcW
    const outH = outputHeight ?? srcH

    const gif = GIFEncoder()

    const allProcessed = frames.map((f) => {
        const flat = flattenAlpha(f.data, bgR, bgG, bgB)
        return resizeRgba(flat, f.width, f.height, outW, outH)
    })

    const samplesPerFrame = Math.max(512, Math.ceil(8192 / allProcessed.length))
    const sampledChunks = allProcessed.map((f) => samplePixels(f, samplesPerFrame))
    const merged = new Uint8ClampedArray(sampledChunks.reduce((s, c) => s + c.length, 0))
    let offset = 0
    for (const c of sampledChunks) { merged.set(c, offset); offset += c.length }
    const palette = quantize(merged, 256)

    for (let i = 0; i < allProcessed.length; i++) {
        const index = applyPalette(allProcessed[i], palette)
        const delayMs = Math.max(10, Math.round(frames[i].delayMs ?? frameDelayMs))
        gif.writeFrame(index, outW, outH, {
            palette: i === 0 ? palette : undefined,
            // gifenc 接收的是毫秒；库内部会再换算成 GIF 的 1/100 秒单位
            delay: delayMs,
            repeat: i === 0 ? repeat : undefined,
        })
    }
    gif.finish()
    return gif.bytes()
}

export { rgbaFramesToGifBytes }
