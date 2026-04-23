# leafer-x-exportGif

Leafer 的 GIF 动画导出插件，支持将 Leafer 画布动画导出为高质量 GIF 文件，兼容 `@leafer-in/film` 内嵌 GIF 动画的导出。

## 特性

- 将 Leafer 画布动画逐帧捕获并导出为 GIF
- 全局调色板量化，颜色还原度高
- 透明通道预合成（flattenAlpha），消除黑边
- 支持高清截图 + 降采样，输出清晰
- 支持 `@leafer-in/film` GIF 动画帧同步导出
- 可配置帧率、时长、背景色、输出尺寸

## 演示资源

| 文件 | 说明 |
|------|------|
| [导出效果演示](./leafer-export%20(1).gif) | 插件导出的 GIF 效果展示 |
| [操作录屏](./录屏2026-04-23%2022.01.48.mov) | Demo 操作流程录屏 |
| [GIF 图标](./public/image/gif-icon.svg) | 带 "GIF" 字样的胶片角标图标 |

## 快速开始

```ts
import { Leafer, Rect } from 'leafer-ui'
import { exportGif } from 'leafer-x-exportGif'

const leafer = new Leafer({ view: window, fill: '#ffffff' })
const rect = new Rect({ x: 100, y: 100, width: 100, height: 100, fill: '#32cd32' })
leafer.add(rect)

// 导出 GIF
const blob = await exportGif(leafer, {
  duration: 2000,
  fps: 15,
  background: '#ffffff',
  outputWidth: 400,
  outputHeight: 400,
})
```

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `duration` | `number` | - | 动画时长（毫秒） |
| `fps` | `number` | `15` | 帧率 |
| `background` | `string` | `'#ffffff'` | 背景色 |
| `outputWidth` | `number` | 画布宽度 | 输出宽度 |
| `outputHeight` | `number` | 画布高度 | 输出高度 |

## 开发

```sh
npm run demo    # 启动 demo（vite --port 12226）
npm run build   # 构建
npm test        # 测试
```

## 收录要求

插件和应用需要满足生产环境可用，并提供在线体验 demo、更新日志、完整的教程/文章（需发表到微信公众号 / 掘金 / 知乎平台），让用户可以很快上手使用。

## 申请收录示例

通过提交 Issues 申请

### 标题

【插件】leafer-x-selector 选择工具

【应用】leafer-vue 基于 leafer 的 vue 组件

### 内容

**leafer-x-selector** 选择工具

插件简介(150 字以内) - [在线体验](./README.md)

[Github](./README.md) - [更新日志](./README.md) / [微信公众号](./README.md) / [掘金](./README.md) / [知乎](./README.md)

### Tip

将插件教程或文章发布到微信公众号 / 掘金 / 知乎， 我们的官方账号会在这三个平台上同步转载你的文章，将获得长期的流量曝光。

## 可持续性

我们希望你能够持续的优化更新插件，为用户提供良好的体验，如果你的插件解决了用户的问题，建议可以通过 [爱发电](https://afdian.net/) / Github 等平台开启赞助通道，收取一定的赞助来为用户提供高级功能和教程，我们后期也会考虑搭建一个开发者商店来简化这个流程。

## 收录列表

期待你的提交！
