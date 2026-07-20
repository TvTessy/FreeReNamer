# AI API 多源支持指南

## 概述

FreeReNamer 现已支持接入多种 AI API，不仅限于 OpenAI，包括 Deepseek、Groq、Claude 等 OpenAI 兼容 API，以及本地 Ollama 服务。

## 支持的 API 类型

### 1. **Ollama**（本地 LLM）
本地运行的开源大语言模型，无需互联网和 API 密钥。

- **基础 URL**: `http://localhost:11434`
- **模型示例**: `llama3.2`, `mistral`, `neural-chat`
- **API Key**: 不需要
- **优点**: 完全离线，隐私保护，无成本
- **缺点**: 需要本地运行，模型能力受限

### 2. **OpenAI**
官方 OpenAI API，支持 GPT 系列模型。

- **基础 URL**: `https://api.openai.com/v1`
- **模型示例**: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`
- **API Key**: 必需，从 [OpenAI 官网](https://platform.openai.com/api-keys) 获取
- **优点**: 模型功能最强，稳定可靠
- **缺点**: 付费，需要国际信用卡

### 3. **Deepseek**
国内 AI 公司提供的 API 服务，支持深度思考模型。

- **基础 URL**: `https://api.deepseek.com/v1`
- **模型示例**: `deepseek-chat`, `deepseek-reasoner`
- **API Key**: 必需，从 [Deepseek 官网](https://platform.deepseek.com) 获取
- **优点**: 响应快，性价比高，支持中文
- **缺点**: 国内用户较多，需要在线

### 4. **Groq**
高性能推理 API，以速度著称。

- **基础 URL**: `https://api.groq.com/openai/v1`
- **模型示例**: `mixtral-8x7b-32768`, `llama2-70b-4096`
- **API Key**: 必需，从 [Groq 官网](https://groq.com/) 获取
- **优点**: 推理速度快（100+ tokens/s），免费额度大
- **缺点**: 免费额度有限制

### 5. **Claude**
Anthropic 提供的 Claude 模型 API。

- **基础 URL**: `https://api.anthropic.com/v1`
- **模型示例**: `claude-3-5-sonnet-20241022`, `claude-3-opus`
- **API Key**: 必需，从 [Claude API 官网](https://console.anthropic.com/) 获取
- **优点**: 逻辑推理能力强，context 窗口大
- **缺点**: 相对较贵，调用方式略有不同

### 6. **OpenAI 兼容 API**（通用）
用于接入其他 OpenAI API 兼容的服务，如 LocalAI、vLLM、OpenRouter 等。

- **基础 URL**: 自定义（如 `http://localhost:8000/v1`）
- **模型**: 自定义
- **API Key**: 可选
- **优点**: 灵活，支持无数据中心服务
- **缺点**: 需要手动配置端点

## 使用步骤

### 第一步：新增 API 配置

1. 进入应用的 **设置** 页面
2. 点击 **新增 API 配置** 按钮
3. 选择所需的 **API 类型**

### 第二步：填写配置信息

根据所选 API 类型，填写以下信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| **配置名称** | 给此配置起个名字（便于识别） | "我的 GPT-4" |
| **API 类型** | 选择使用的 API 提供商 | OpenAI |
| **服务器地址** | API 端点的基础 URL | `https://api.openai.com/v1` |
| **模型名称** | 具体使用的模型 | `gpt-4o-mini` |
| **API Key** | 认证密钥（Ollama 除外） | `sk-...` |

### 第三步：在 AI 规则中使用

1. 创建或编辑 **AI 规则**
2. 在规则配置中选择刚才添加的 API 配置
3. 输入提示词（prompt），描述期望的重命名逻辑
4. 点击 **生成脚本** 按钮
5. AI 会调用对应的 API 生成重命名脚本

## 获取 API Key

### OpenAI
1. 访问 https://platform.openai.com/api-keys
2. 登录或注册账户
3. 点击 **Create new secret key**
4. 复制生成的密钥

### Deepseek
1. 访问 https://platform.deepseek.com
2. 注册账户（支持邮箱或 GitHub）
3. 进入 **API Keys** 页面
4. 创建新密钥并复制

### Groq
1. 访问 https://groq.com/
2. 登录或注册
3. 进入 API 控制面板
4. 生成 API Key

### Claude
1. 访问 https://console.anthropic.com/
2. 登录或注册
3. 点击 **Create API Key**
4. 复制密钥

## 常见问题

### Q: 为什么推荐使用 OpenAI 兼容接口？
**A:** OpenAI 兼容接口最灵活，可支持：
- OpenAI 官方 API 及兼容服务
- Deepseek、Groq 等大多数商业 API
- LocalAI、vLLM 等本地开源项目
- OpenRouter 等 API 聚合服务

### Q: Ollama 和其他 API 有什么区别？
**A:** 
- **Ollama**: 本地运行，完全离线，无 API Key，但模型较小
- **其他 API**: 云端运行，功能更强大，但需要 API Key 和网络连接

### Q: 如何在多个 API 配置间切换？
**A:** 在 AI 规则中，直接选择不同的 API 配置即可。每个规则都可以使用不同的 API。

### Q: API 调用失败怎么办？
**A:** 
1. 检查 API Key 是否正确（不要暴露给他人）
2. 检查网络连接和代理设置
3. 确认服务器地址和模型名称拼写正确
4. 查看 API 提供商的服务状态页面
5. 确保账户有足够的余额或配额

### Q: 支持代理访问吗？
**A:** 目前不支持直接配置代理。如果需要代理，可以：
- 在 Ollama 兼容模式下访问本地代理服务
- 通过 OpenAI 兼容接口指向代理后的端点
- 配置系统全局代理

## 测试配置

添加配置后，建议先测试连接：

1. 创建一个 AI 规则
2. 选择新配置
3. 输入简单的提示词，如 "将文件名改为小写"
4. 尝试生成脚本
5. 如果成功，说明配置正确

## 安全建议

⚠️ **重要提示**：
- 不要在公开地方分享 API Key
- 定期轮换 API Key
- 为不同的应用使用不同的 API Key
- 监控 API 使用量，避免意外费用
- 如果泄露 API Key，立即在提供商面板禁用

## 配置导出/导入

当前版本配置存储在本地：
- **Web 版**: IndexedDB 浏览器存储
- **Tauri 桌面版**: 本地文件存储

建议定期备份配置文件。

## 反馈与支持

如有问题或建议，请：
1. 查看项目 Issue 列表
2. 提交新的 Issue 描述问题
3. 提供具体的错误信息和日志
