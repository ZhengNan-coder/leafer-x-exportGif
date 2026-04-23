import { useLicense } from '@pxgrow/license'
import { Leafer, Rect, Ellipse, Star } from 'leafer-ui'

import '@leafer-in/export'
import '@leafer-in/animate'
import '@leafer-in/film'

import { Film } from '@leafer-in/film'
import { captureAnimationFramesAsRgba } from '../src/captureAnimationFrames'
import { rgbaFramesToGifBytes } from '../src/encodeGif'
import type { IAnimate, IKeyframe } from '@leafer-ui/interface'
import type { IFilmDecoder } from '@leafer-ui/interface'

void useLicense('ygcqTvf9tw*OtYVqtwN0yw,epRnijH40l.chrYr5oMeVtw*YTMxKrCZ0rCt6GCZ0rXLbTCt6ygtxtw*2B50tYdRTMVKoXaRlYnh2CcE1CZ02XVKE.t6MgcbEHpRfuc1yMatCV9NGVQZoWcpuBjeEYxjoRG8t0Z0EXLzCv9gTzxgWwEGWj9myMadrHWfjVkGfuVz2LfDjK,0l.crWb*erLtKCjaMGKWg2BNZ4VEwA.cE1CZ04zV32YLbEvcVtwN02br5jHVcnwBgCjLv4zcLjWkZrbekrvVxAjLeyLf0WLcqnbTgoinkuHnl4vnBCiEiWqVmEMnhTVGiuzWCfBbREi*YWzBZTjfYMCdqpiNioHEgWVrj2YcVojBgEW9krVWquufGuLVp23VLWBVtnirNGuWlTzperRfGy0dwWukWGX9XrHnYuBn*piNbrucwnbdbu39ioznlWXe6CMLDoqW54ifcjWEKyu9uE3LuuMxFCW9R4ManAjGhfqx6C3VDoi9ruqeGjw9nnW*RrKqDCqrAjK9pWbfv4REefRW5WVG8GHnZjBxSr.QxrMjz2WVdGin0CFTZrFVBGz*rWRVKjK9rTYGhjH9fyX5bnKrr2i98junjCbNgoLnKTgaIfvpgEuL7CjriGHjZWMernq*bGbeGG3kcrHf6ozeLW3*8uB,RyqrRojEvEVfVuqxHrLE6ywVvfuJ8uwnfIub01pPP')

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
const FILM_URL = '/image/test.gif'

fpsInput.addEventListener('input', () => { fpsVal.textContent = fpsInput.value })
durInput.addEventListener('input', () => { durVal.textContent = durInput.value })

const SIZE = container.clientWidth || 300

const leafer = new Leafer({
    view: container,
    width: SIZE,
    height: SIZE,
    fill: '#ffffff',
})

type SceneShape = Rect | Ellipse | Star | InstanceType<typeof Film>

type Scene = {
    shape: SceneShape
    keyframes: IKeyframe[]
    isFilm?: boolean
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

    if (name === 'wave') {
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

    // film 场景
    const film = new Film({
        // 使用同源静态资源，避免远程 GIF 在解码/画布渲染时被 CORS 拦住
        url: FILM_URL,
        x: SIZE / 2,
        y: SIZE / 2,
        width: SIZE * 0.7,
        height: SIZE * 0.7,
        around: 'center',
    })
    leafer.add(film)
    // Film 资源解码完成后主动定位到首帧并开始播放，否则画布里可能一直看不到内容
    void waitFilmDecoded(film)
        .then(() => {
            film.seekFrame(0)
            film.play()
        })
        .catch((error) => {
            console.error('Film load failed:', error)
        })
    return {
        shape: film,
        keyframes: [],
        isFilm: true,
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

async function waitFilmDecoded(film: InstanceType<typeof Film>): Promise<IFilmDecoder> {
    return new Promise((resolve, reject) => {
        const check = () => {
            const decoder = film.decoder as IFilmDecoder | undefined
            if (decoder && decoder.total > 0 && decoder.frames.length >= decoder.total) {
                resolve(decoder)
                return
            }
            setTimeout(check, 50)
        }
        setTimeout(() => reject(new Error('Film decode timeout')), 10000)
        check()
    })
}

function getFilmFrameDelayMs(duration?: number): number {
    if (!Number.isFinite(duration) || (duration as number) <= 0) return 100
    // film decoder 返回的 duration 单位是秒（厘秒 / 100），转换为毫秒
    return Math.max(10, Math.round((duration as number) * 1000))
}

function getFilmRepeat(loop?: number): number {
    if (!Number.isFinite(loop) || loop <= 0) return 0
    return Math.round(loop)
}

async function waitNextRender(): Promise<void> {
    return new Promise((resolve) => {
        leafer.once('render.end', () => resolve())
    })
}

async function exportFilmGif(film: InstanceType<typeof Film>): Promise<Uint8Array> {
    setStatus('等待 GIF 解码...', 'running')
    const decoder = await waitFilmDecoded(film)
    const { total, frames, loop } = decoder

    setStatus(`捕获 ${total} 帧...`, 'running')

    film.pause()

    const dpr = window.devicePixelRatio || 1
    const rgbaFrames = []

    for (let i = 0; i < total; i++) {
        film.seekFrame(i)
        await waitNextRender()

        const result = await (leafer as never as { export: (t: string, o: object) => Promise<{ data: unknown }> })
            .export('canvas', { screenshot: true, pixelRatio: dpr })
        const canvas = result.data as { context: CanvasRenderingContext2D; pixelWidth: number; pixelHeight: number; destroy: () => void }
        const { context, pixelWidth, pixelHeight } = canvas
        const imageData = context.getImageData(0, 0, pixelWidth, pixelHeight)
        const copy = new Uint8ClampedArray(imageData.data.length)
        copy.set(imageData.data)
        rgbaFrames.push({
            width: pixelWidth,
            height: pixelHeight,
            data: copy,
            delayMs: getFilmFrameDelayMs(frames[i]?.duration),
        })
        if (canvas.destroy) canvas.destroy()

        setProgress(Math.round((i + 1) / total * 85))
    }

    film.play()

    return rgbaFramesToGifBytes(rgbaFrames, 100, {
        repeat: getFilmRepeat(loop),
        background: '#ffffff',
        outputWidth: SIZE,
        outputHeight: SIZE,
    })
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
        let bytes: Uint8Array

        if (currentScene.isFilm) {
            clearInterval(progressTimer)
            bytes = await exportFilmGif(currentScene.shape as InstanceType<typeof Film>)
        } else {
            const shape = currentScene.shape
            const animate = (shape as Rect | Ellipse | Star).animate(
                currentScene.keyframes,
                { loop: false, autoplay: false } as never,
            ) as IAnimate

            const dpr = Math.max(window.devicePixelRatio || 1, 2)
            const frames = await captureAnimationFramesAsRgba(
                leafer as never,
                animate,
                { fps, duration, screenshot: true, pixelRatio: dpr },
            )

            if (typeof animate.destroy === 'function') animate.destroy(true)

            bytes = rgbaFramesToGifBytes(frames, 1000 / fps, {
                repeat: 0,
                background: '#ffffff',
            })
        }

        clearInterval(progressTimer)
        setProgress(100)

        gifBlob = new Blob([new Uint8Array(bytes)], { type: 'image/gif' })
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
