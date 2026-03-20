# MiMo TTS Chat

一个基于原生 `H5` 实现的静态网页应用，调用 MiMo TTS 接口实现文本语音合成。

可以选择预置音色，输入文本或上传 `.txt` 文件，发送后可获取 `WAV` 音频

支持在线预览播放、下载音频

## Site
[http://tts.ichochy.com](http://tts.ichochy.com)

## 系统截图
### Mobile:
![mobile](https://tts.ichochy.com/screenshot/mobile.png)

### PC:
![pc](https://tts.ichochy.com/screenshot/pc.png)

## 信息 
Blog：[http://ichochy.com](http://ichochy.com)   
Email: [me@ichochy.com](mailto:me@ichochy.com)   
GitHub：[https://github.com/ichochy/mimo-tts-chat](https://github.com/ichochy/mimo-tts-chat)   


## 功能特性

- 浏览器端直接调用 MiMo TTS Chat 接口
- 支持输入 API Key 并保存到本地浏览器
- 支持预置音色切换
- 支持文本对话并展示消息记录
- 支持返回音频自动播放
- 支持音频下载为 `.wav`
- 支持上传 `.txt` 文件并自动发送内容
- 支持深色 / 浅色主题切换
- 纯静态页面，无需打包构建

## 项目预览

- 主页面：`index.html`
- 打赏页面：`sponsor.html`

## 技术栈

- HTML5
- CSS3
- Vanilla JavaScript
- MiMo API

## 目录结构

```text
mimo-tts-chat/
├── index.html       # 主页面
├── main.js          # 交互逻辑与 API 请求
├── style.css        # 页面样式
├── sponsor.html     # 打赏页面
├── sponsor.jpg      # 打赏二维码图片
├── LICENSE
└── README.md
```

## 快速开始

这是一个静态项目，直接用浏览器打开也可以运行，但更推荐使用本地 HTTP 服务启动，避免部分浏览器环境下的资源或策略问题。

### 方式一：直接打开

直接双击 [index.html](./index.html) 即可。

### 方式二：使用 Python 启动本地服务

在项目目录执行：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## 使用说明

1. 打开页面后，在 `API Key` 输入框中填入你的 MiMo 平台密钥。
2. 选择一个预置音色。
3. 在输入框中输入要发送的文本，或上传 `.txt` 文件。
4. 点击“发送并合成语音”。
5. 页面会展示消息记录，并在返回音频后自动播放。
6. 点击消息中的“下载音频”可以将生成的语音保存为本地 `.wav` 文件。

API Key 获取地址：

- [MiMo API Keys](https://platform.xiaomimimo.com/#/console/api-keys)

## 接口说明

当前前端会向以下地址发起请求：

```text
POST https://api.xiaomimimo.com/v1/chat/completions
```

请求中默认使用：

- `model: mimo-v2-tts`
- `audio.format: wav`
- `audio.voice: 当前下拉框选中的音色`

## 本地存储

为了提升使用体验，以下信息会保存在浏览器 `localStorage` 中：

- 主题设置
- API Key
- 选中的音色

如果你在公共设备上使用，建议在使用后手动清理浏览器本地数据。

## 注意事项

- 这是一个前端直连接口的示例项目，API Key 会保存在浏览器本地，不适合直接作为生产环境的公开前端方案。
- 如果后续需要上线公网，建议增加后端代理层，避免在客户端暴露敏感密钥。
- 当前音频格式为 `wav`，体积相对较大，如有需要可以再扩展更多格式。
- 上传 `.txt` 文件后会自动读取并立即发送内容。

## 后续可扩展方向

- 增加多轮上下文对话能力
- 支持更多音色与参数配置
- 增加历史记录持久化
- 支持流式响应
- 增加后端代理与鉴权

## License

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源

## 打赏

80后码农×白血病(CMML)患者  
工作已停，药费没停  
如果项目对您有用，求打赏点生命值  

![sponsor.jpg](https://image.ichochy.com/sponsor.jpg)