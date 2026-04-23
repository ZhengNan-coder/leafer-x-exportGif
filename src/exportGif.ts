import type { IAnimate, IKeyframe, IKeyframesAnimation, IStyleAnimation, ITransition, IUI } from '@leafer-ui/interface'

import { captureAnimationFramesAsRgba } from './captureAnimationFrames'
import { rgbaFramesToGifBytes } from './encodeGif'

import type { AnimateInput, ExportGifOptions } from './types'

function mergeTransition(a?: ITransition, b?: ITransition): ITransition | undefined {
    if (a && b) return Object.assign({}, a as object, b as object) as ITransition
    return a || b
}

function normalizeAnimationInput(
    animation: AnimateInput,
    transition?: ITransition,
): { keyframes: IKeyframe[]; transition: ITransition | undefined } {
    if (Array.isArray(animation)) {
        return { keyframes: animation, transition }
    }
    if ('keyframes' in animation && animation.keyframes) {
        const { keyframes, ...rest } = animation as IKeyframesAnimation
        return { keyframes, transition: mergeTransition(rest as ITransition, transition) }
    }
    if ('style' in animation) {
        const { style, ...rest } = animation as IStyleAnimation
        return { keyframes: [style], transition: mergeTransition(rest as ITransition, transition) }
    }
    throw new Error('exportElementAnimationGif: unsupported animation argument')
}

/**
 * 对元素创建临时动画（不自动播放）、按帧导出 `canvas` 像素，再编码为 GIF。
 * 使用前请 `import '@leafer-in/export'`、`import '@leafer-in/animate'`。
 */
async function exportElementAnimationGif(
    target: IUI,
    animation: AnimateInput,
    transition?: ITransition,
    options: ExportGifOptions = {},
): Promise<Uint8Array> {
    const { keyframes, transition: tr } = normalizeAnimationInput(animation, transition)
    const base = (tr ? Object.assign({}, tr as object) : {}) as ITransition
    const animate = target.animate(
        keyframes,
        Object.assign({}, base, { loop: false, autoplay: false }) as ITransition,
    )
    try {
        const fps = options.fps ?? 10
        const frames = await captureAnimationFramesAsRgba(target, animate as IAnimate, options)
        const delayMs = 1000 / fps
        return rgbaFramesToGifBytes(frames, delayMs, { repeat: options.repeat, background: options.background, outputWidth: options.outputWidth, outputHeight: options.outputHeight })
    } finally {
        if (typeof animate.destroy === 'function') animate.destroy(true)
    }
}

/**
 * 对已有 `IAnimate` 实例按时间采样并编码 GIF（不会销毁传入的 `animate`）。
 */
async function exportGifFromAnimate(
    target: IUI,
    animate: IAnimate,
    options: ExportGifOptions = {},
): Promise<Uint8Array> {
    const fps = options.fps ?? 10
    const frames = await captureAnimationFramesAsRgba(target, animate, options)
    const delayMs = 1000 / fps
    return rgbaFramesToGifBytes(frames, delayMs, { repeat: options.repeat, background: options.background, outputWidth: options.outputWidth, outputHeight: options.outputHeight })
}

export { exportElementAnimationGif, exportGifFromAnimate }
