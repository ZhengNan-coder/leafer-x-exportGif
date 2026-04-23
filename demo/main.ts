import '@leafer-in/export'
import '@leafer-in/animate'

import { Leafer, Rect, Ellipse, Star } from 'leafer-ui'
import { captureAnimationFramesAsRgba } from '../src/captureAnimationFrames'
import { rgbaFramesToGifBytes } from '../src/encodeGif'
import type { IAnimate, IKeyframe } from '@leafer-ui/interface'

const container = document.getElementById('leafer-container') as HTMLDivElement
const btnExport = document.getElementById('btn-export') as HTMLButtonElement
const btnDownload = document.getElementById('btn-download') as HTMLButtonElement
const statusEl = document.getElementById('status') as HTMLParagraphElement
const progressBar = document.getElementById('progress-bar') as HTMLDivElement
const gifPreview = document.getElementById('gif-preview') as HTMLImageElement
const emptyTip = document.getElementById('empty-tip') as HTMLDivElement
const fpsInput = document.getElementById('fps') as HTMLInputElement
const fpsVal = document.getElementById('fps-val') as HTMLSpanElement
const durInput = document.getElementById('dur') as HTMLInputElement
const durVal = document.getElementById('dur-val') as HTMLSpanElement
const sceneSelect = document.getElementById('scene') as HTMLSelectElement

fpsInput.addEventListener('input', () => { fpsVal.textContent = fpsInput.value })
durInput.addEventListener('input', () => { durVal.textContent = durInput.value })

const SIZE = container.clientWidth || 300

const leafer = new Leafer({
    view: container,
    width: SIZE,
    height: SIZE,
    fill: '#ffffff',
})

type Scene = {
    shape: ReturnType<typeof Rect.new> | ReturnType<typeof Ellipse.new> | ReturnType<typeof Star.new>
    keyframes: IKeyframe[]
}

function buildScene(name: string): Scene {
    leafer.clear()

    if (name === 'bounce') {
        const rect = new Rect({
            x: SIZE / 2,
            y: SIZE * 0.25,
            width: 80,
            height: 80,
            cornerRadius: 40,
            fill: '#32cd79',
            around: 'center',
        })
        leafer.add(rect)
        return {
            shape: rect,
            keyframes: [
                { style: { x: SIZE * 0.75, scaleX: 1.6, fill: '#ffcd00' }, duration: 0.5 },
                { style: { x: SIZE * 0.25, scaleX: 1, fill: '#ffcd00' }, duration: 0.2 },
                { style: { x: SIZE * 0.75, cornerRadius: 0, fill: '#ff5050' }, delay: 0.1, easing: 'bounce-out' },
                { x: SIZE * 0.25, rotation: -360, cornerRadius: 40 },
            ],
        }
    }

    if (name === 'spin') {
        const star = new Star({
            x: SIZE / 2,
            y: SIZE / 2,
            width: 100,
            height: 100,
            corners: 5,
            fill: '#6c6cff',
            around: 'center',
        })
        leafer.add(star)
        return {
            shape: star,
            keyframes: [
                { style: { rotation: 180, scale: 1.5, fill: '#ff70c0' }, duration: 0.8, easing: 'ease-in-out' },
                { style: { rotation: 360, scale: 0.6, fill: '#facc15' }, duration: 0.6, easing: 'ease-in' },
                { style: { rotation: 540, scale: 1, fill: '#6c6cff' }, duration: 0.8, easing: 'bounce-out' },
            ],
        }
    }

    const ellipse = new Ellipse({
        x: SIZE / 2,
        y: SIZE / 2,
        width: 80,
        height: 80,
        fill: '#38bdf8',
        around: 'center',
    })
    leafer.add(ellipse)
    return {
        shape: ellipse,
        keyframes: [
            { style: { x: SIZE * 0.2, y: SIZE * 0.3, scaleY: 1.4, fill: '#a78bfa' }, duration: 0.5, easing: 'sine-in-out' },
            { style: { x: SIZE * 0.8, y: SIZE * 0.7, scaleY: 0.7, fill: '#fb923c' }, duration: 0.5, easing: 'sine-in-out' },
            { style: { x: SIZE * 0.5, y: SIZE * 0.5, scaleY: 1, fill: '#38bdf8' }, duration: 0.5, easing: 'sine-in-out' },
        ],
    }
}

let currentScene = buildScene('bounce')
sceneSelect.addEventListener('change', () => {
    currentScene = buildScene(sceneSelect.value)
})

let gifBlob: Blob | null = null

function setStatus(msg: string, type: 'idle' | 'running' | 'done' | 'error' = 'idle') {
    statusEl.textContent = msg
    statusEl.className = 'status ' + (type !== 'idle' ? type : '')
}

function setProgress(pct: number) {
    progressBar.style.width = pct + '%'
}

btnExport.addEventListener('click', async () => {
    btnExport.disabled = true
    btnDownload.disabled = true
    gifBlob = null
    gifPreview.classList.remove('visible')
    emptyTip.style.display = 'flex'
    setProgress(0)
    setStatus('正在捕获帧...', 'running')

    const fps = parseInt(fpsInput.value, 10)
    const duration = parseFloat(durInput.value)

    const progressTimer = setInterval(() => {
        const cur = parseFloat(progressBar.style.width) || 0
        if (cur < 85) setProgress(cur + 2)
    }, 100)

    try {
        const shape = currentScene.shape
        const animate = shape.animate(
            currentScene.keyframes,
            { loop: false, autoplay: false } as never,
        ) as IAnimate

        const dpr = window.devicePixelRatio || 1
        const frames = await captureAnimationFramesAsRgba(
            leafer as never,
            animate,
            { fps, duration, screenshot: true, pixelRatio: dpr },
        )

        if (typeof animate.destroy === 'function') animate.destroy(true)

        const bytes = rgbaFramesToGifBytes(frames, 1000 / fps, {
            repeat: 0,
            background: '#ffffff',
            outputWidth: SIZE,
            outputHeight: SIZE,
        })

        clearInterval(progressTimer)
        setProgress(100)

        gifBlob = new Blob([bytes], { type: 'image/gif' })
        const url = URL.createObjectURL(gifBlob)
        gifPreview.src = url
        gifPreview.classList.add('visible')
        emptyTip.style.display = 'none'

        setStatus(`导出成功！${bytes.length} 字节`, 'done')
        btnDownload.disabled = false
    } catch (e) {
        clearInterval(progressTimer)
        setProgress(0)
        setStatus('导出失败: ' + String(e), 'error')
        console.error(e)
    } finally {
        btnExport.disabled = false
    }
})

btnDownload.addEventListener('click', () => {
    if (!gifBlob) return
    const url = URL.createObjectURL(gifBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leafer-export.gif'
    a.click()
    URL.revokeObjectURL(url)
})
