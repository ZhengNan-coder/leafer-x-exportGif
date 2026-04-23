import { captureAnimationFramesAsRgba } from './captureAnimationFrames'
import { rgbaFramesToGifBytes } from './encodeGif'
import { exportElementAnimationGif, exportGifFromAnimate } from './exportGif'

export { captureAnimationFramesAsRgba, rgbaFramesToGifBytes, exportElementAnimationGif, exportGifFromAnimate }

export type { AnimateInput, CaptureAnimationFramesOptions, ExportGifOptions, RgbaFrame } from './types'
