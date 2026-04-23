import type { IBoundsData } from '@leafer/interface'
import type { IAnimation, IKeyframe } from '@leafer-ui/interface'

/** 单帧 RGBA（来自 Canvas getImageData） */
export interface RgbaFrame {
    width: number
    height: number
    data: Uint8ClampedArray
}

/** 导出每一帧时的选项（透传给 Leafer `export`） */
export interface CaptureAnimationFramesOptions {
    /** 采样帧率，默认 10 */
    fps?: number
    /** 覆盖动画总时长（秒），默认取 `animate.duration` */
    duration?: number
    /** 与 Leafer `IExportOptions` 一致 */
    pixelRatio?: number
    fill?: string
    screenshot?: boolean | IBoundsData
    /** 传给 `animate.seek` 的第二个参数 */
    seekIncludeDelay?: boolean
}

export interface ExportGifOptions extends CaptureAnimationFramesOptions {
    /** GIF 循环：`0` 无限、`-1` 播一次、正整数为重复次数，默认 `0` */
    repeat?: number
    /** 合成透明像素时使用的背景色（十六进制），默认 `#ffffff` */
    background?: string
    /** GIF 输出宽度（px），不传则等于截图物理宽度 */
    outputWidth?: number
    /** GIF 输出高度（px），不传则等于截图物理高度 */
    outputHeight?: number
}

export type AnimateInput = IKeyframe[] | IAnimation
