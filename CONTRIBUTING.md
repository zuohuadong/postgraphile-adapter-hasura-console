# 贡献指南

感谢你对本项目的关注！

## 开发流程

### 1. Fork 并克隆仓库

```bash
git clone https://github.com/your-username/postgraphile-hasura-console.git
cd postgraphile-hasura-console
```

### 2. 安装依赖

```bash
npm install
```

### 3. 下载 Hasura Console

```bash
npm run sync
```

### 4. 开发

```bash
npm run dev
```

## CI/CD 工作流

### 自动构建 Hasura Console

项目包含两个 GitHub Actions 工作流：

#### 1. 手动/标签触发构建 (build-console.yml)

触发方式：
- 推送 tag（如 `v1.0.0`）
- 手动触发（GitHub Actions 页面）

手动触发步骤：
1. 进入 GitHub 仓库的 Actions 页面
2. 选择 "Build Hasura Console" 工作流
3. 点击 "Run workflow"
4. 可选：指定 Hasura 版本（如 `v2.36.0`，默认为 `master`）
5. 点击 "Run workflow" 确认

#### 2. 定时自动构建 (scheduled-build.yml)

- 每周一凌晨 2 点（UTC）自动检查 Hasura 新版本
- 如果有新版本且未构建，自动触发构建
- 也可以手动触发

### 发布新版本

#### 方式一：使用 Git Tag

```bash
# 创建并推送 tag
git tag v1.0.0
git push origin v1.0.0
```

这将自动触发 CI 构建并创建 Release。

#### 方式二：手动触发

1. 进入 GitHub Actions
2. 选择 "Build Hasura Console"
3. 手动运行工作流

### Release 产物

每次构建会生成以下文件：
- `hasura-console.tar.gz` - 压缩包（Linux/macOS 推荐）
- `hasura-console.zip` - 压缩包（Windows 推荐）
- `hasura-console.tar.gz.sha256` - SHA256 校验和
- `hasura-console.zip.sha256` - SHA256 校验和

## 配置 Release 仓库

在使用下载脚本前，需要修改以下文件中的仓库信息：

脚本已配置为使用仓库：`zuohuadong/postgraphile-adapter-hasura-console`

如需修改，可以编辑以下文件：

### 1. sync-hasura-console.sh

```bash
RELEASE_REPO="${RELEASE_REPO:-zuohuadong/postgraphile-adapter-hasura-console}"
```

### 2. download-console.sh

```bash
RELEASE_REPO="${RELEASE_REPO:-zuohuadong/postgraphile-adapter-hasura-console}"
```

## 测试

### 类型检查

```bash
npm run type-check
```

### 本地测试

```bash
# 构建 TypeScript
npm run build

# 运行构建后的代码
npm start
```

## 提交规范

建议使用语义化提交信息：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```
feat: 添加权限配置支持
fix: 修复 GraphQL 代理错误
docs: 更新安装说明
```

## 问题反馈

如果遇到问题，请：
1. 检查是否已有相关 Issue
2. 提供详细的错误信息和复现步骤
3. 说明你的环境（操作系统、Node.js 版本等）

## 许可证

本项目采用 MIT 许可证。
