# 面试通 Next 🎯

> 你的 AI 面试官与面试教练，陪你把“会做”练成“会讲”。

🌐 主站：<https://mianshitong.chat>

面试通 Next 是面向前端与编程面试场景的新一代 AI 面试辅导产品。它不只是回答问题，而是围绕真实求职过程，帮助你梳理经历、组织表达、模拟追问，并在连续对话中逐步理解你的目标和状态。

## 为什么做它？✨

很多候选人不是不会技术，而是：

- 项目做过，但讲不清楚亮点
- 八股背过，但面试追问容易断片
- 简历写了很多，但不知道如何转化成面试表达
- 想练模拟面试，却缺少稳定、低成本、可反复练习的面试官

面试通 Next 想解决的正是这些问题：让你在真正面试前，先和 AI 面试官练到更从容。

## 核心能力 🚀

- 🤖 **AI 面试问答**：围绕前端基础、框架、工程化、性能优化、项目经验等方向进行针对性答疑。
- 🎤 **模拟面试陪练**：通过多轮对话模拟真实面试节奏，训练回答结构、追问应对和表达稳定性。
- 🧭 **职业状态理解**：在对话中识别你的目标、阶段和上下文，让后续回复更贴近当前求职场景。
- 📝 **表达与简历辅助**：帮助你把经历提炼成更适合面试表达的故事线和项目亮点。
- ⚙️ **可运营后台**：支持用户、会话、额度等基础管理能力，方便后续产品运营和问题排查。

## 适合谁使用？👥

- 正在准备前端校招、社招或晋升面试的开发者
- 希望提升项目表达、技术问答和追问应对能力的候选人
- 想低成本反复练习模拟面试的学习者
- 想把“我知道”训练成“我能讲清楚”的工程师

## 当前进展 🛠️

项目已经具备一套可线上运行的基础闭环：

- ✅ Web 主站聊天体验
- ✅ Admin 后台登录与管理
- ✅ PostgreSQL 数据持久化
- ✅ DeepSeek 生产模型调用
- ✅ Docker + GitHub Actions 自动部署
- ✅ 本地 Ollama 调试能力

## 技术栈 🧩

- **前端应用**：Next.js App Router、React、TypeScript
- **样式与 UI**：Tailwind CSS、Ant Design、共享 UI 组件与设计 token
- **数据层**：PostgreSQL、Prisma
- **AI 能力**：DeepSeek、Ollama、LangChain OpenAI-compatible client
- **工程化**：pnpm workspace、ESLint、Prettier、Stylelint、CSpell、Husky
- **部署**：Docker、Docker Compose、edge-proxy（Caddy）、GitHub Actions、阿里云容器镜像服务

## 技术文档 📚

如果你想了解项目结构、本地开发、环境变量、部署流程、管理员初始化和回滚方式，请阅读：

- `docs/database-access-layer.md`
- `docs/project.md`
- `docs/deployment-runbook.md`
- `docs/admin-operations.md`
- `docs/llm-configuration.md`

当前生产环境中，本项目只负责自身应用、数据库和后台服务容器；公网域名入口统一由独立 `edge-proxy` 接管，再通过共享 Docker `edge` 网络转发到 `mianshitong-web` 和 `mianshitong-admin`。

## 项目愿景 🌱

面试通 Next 的目标不是做一个“万能聊天机器人”，而是做一个更懂编程面试场景的 AI 面试辅导工具：

> 帮助候选人更清晰地表达能力，更稳定地面对追问，更有信心地走进面试。
