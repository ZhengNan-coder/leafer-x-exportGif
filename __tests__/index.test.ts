import { describe, expect, test } from 'vitest'

import { rgbaFramesToGifBytes } from '../src/encodeGif'

function getFirstFrameDelayCs(bytes: Uint8Array): number {
    for (let i = 0; i < bytes.length - 5; i++) {
        if (bytes[i] === 0x21 && bytes[i + 1] === 0xF9 && bytes[i + 2] === 0x04) {
            return bytes[i + 4] + (bytes[i + 5] << 8)
        }
    }
    throw new Error('Graphic Control Extension not found')
}

describe('leafer-x-exportgif', () => {
    test('rgbaFramesToGifBytes outputs GIF header', () => {
        const data = new Uint8ClampedArray([255, 0, 0, 255])
        const bytes = rgbaFramesToGifBytes([{ width: 1, height: 1, data }], 100)
        const sig = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5])
        expect(sig).toBe('GIF89a')
    })

    test('rgbaFramesToGifBytes keeps delay in milliseconds', () => {
        const data = new Uint8ClampedArray([255, 0, 0, 255])
        const bytes = rgbaFramesToGifBytes([{ width: 1, height: 1, data }], 100)
        expect(getFirstFrameDelayCs(bytes)).toBe(10)
    })

    test('rgbaFramesToGifBytes supports per-frame delays', () => {
        const data = new Uint8ClampedArray([255, 0, 0, 255])
        const bytes = rgbaFramesToGifBytes([{ width: 1, height: 1, data, delayMs: 250 }], 100)
        expect(getFirstFrameDelayCs(bytes)).toBe(25)
    })
})
