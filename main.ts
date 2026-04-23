import '@leafer-in/export'
import '@leafer-in/animate'

import { Leafer, Rect } from 'leafer-ui'

import { exportElementAnimationGif } from './src/exportGif'

const leafer = new Leafer({ view: window })

const rect = new Rect({
    x: 50,
    y: 100,
    width: 100,
    height: 100,
    cornerRadius: 50,
    fill: '#32cd79',
    around: 'center',
})

leafer.add(rect)

const keyframes = [
    { style: { x: 150, scaleX: 2, fill: '#ffcd00' }, duration: 0.5 },
    { style: { x: 50, scaleX: 1, fill: '#ffcd00' }, duration: 0.2 },
    { style: { x: 250, cornerRadius: 0, fill: '#ffcd00' }, delay: 0.1, easing: 'bounce-out' },
    { x: 50, rotation: -360, cornerRadius: 50 },
]

async function run(): Promise<void> {
    const bytes = await exportElementAnimationGif(rect, keyframes, { duration: 3 }, { fps: 12 })
    const blob = new Blob([new Uint8Array(bytes)], { type: 'image/gif' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leafer-export.gif'
    a.click()
    URL.revokeObjectURL(url)
}

void run().catch((e) => console.error(e))
