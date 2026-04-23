import { describe, expect, test } from 'vitest'

import { rgbaFramesToGifBytes } from '../src/encodeGif'

describe('leafer-x-exportgif', () => {
    test('rgbaFramesToGifBytes outputs GIF header', () => {
        const data = new Uint8ClampedArray([255, 0, 0, 255])
        const bytes = rgbaFramesToGifBytes([{ width: 1, height: 1, data }], 100)
        const sig = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5])
        expect(sig).toBe('GIF89a')
    })
})
