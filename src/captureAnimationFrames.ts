import type { IAnimate } from '@leafer-ui/interface'
import type { ILeaferCanvas } from '@leafer/interface'

import type { CaptureAnimationFramesOptions, RgbaFrame } from './types'

function copyRgba(source: Uint8ClampedArray): Uint8ClampedArray {
    const copy = new Uint8ClampedArray(source.length)
    copy.set(source)
    return copy
}

/**
 * 将当前动画按时间轴采样为多帧 RGBA（需已引入 `@leafer-in/export` 与 `@leafer-in/animate`，且 `target.export` 可用）。
 */
async function captureAnimationFramesAsRgba(
    target: { export: (name: string, options?: object) => Promise<{ data?: unknown; error?: unknown }> },
    animate: IAnimate,
    options: CaptureAnimationFramesOptions = {},
): Promise<RgbaFrame[]> {
    const fps = options.fps ?? 10
    const duration = options.duration ?? animate.duration
    const seekIncludeDelay = options.seekIncludeDelay ?? true
    const totalFrames = Math.max(1, Math.ceil(Math.max(0, duration) * fps))
    const exportOpts: Record<string, unknown> = {}
    if (options.pixelRatio !== undefined) exportOpts.pixelRatio = options.pixelRatio
    if (options.fill !== undefined) exportOpts.fill = options.fill
    if (options.screenshot !== undefined) exportOpts.screenshot = options.screenshot

    const frames: RgbaFrame[] = []

    for (let i = 0; i < totalFrames; i++) {
        const t = Math.min(duration, i / fps)
        animate.seek(t, seekIncludeDelay)
        const { data, error } = await target.export('canvas', exportOpts)
        if (error) throw error instanceof Error ? error : new Error(String(error))
        const canvas = data as ILeaferCanvas
        const { context, pixelWidth, pixelHeight } = canvas
        const imageData = context.getImageData(0, 0, pixelWidth, pixelHeight)
        frames.push({
            width: pixelWidth,
            height: pixelHeight,
            data: copyRgba(imageData.data),
        })
        if (typeof canvas.destroy === 'function') canvas.destroy()
    }

    return frames
}

export { captureAnimationFramesAsRgba }
