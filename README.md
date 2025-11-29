# Hasura Console for PostGraphile v5

将 Hasura Console 适配到 PostGraphile v5，提供熟悉的 UI 界面来管理 PostGraphile GraphQL API。

使用 TypeScript 构建，提供完整的类型安全。

## 功能特性

- ✅ 从 Hasura GraphQL Engine 同步最新的 Console 代码
- ✅ 兼容层适配 PostGraphile v5 API
- ✅ YAML 配置文件支持
- ✅ GraphQL 查询代理
- ✅ Schema 管理和可视化
- ✅ 权限配置
- ✅ TypeScript 类型安全

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 下载 Hasura Console

**方式一：从 GitHub Release 下载预构建版本（推荐）**

```bash
npm run sync
```

这将从 GitHub Release 下载预构建的 Hasura Console，速度快且无需构建。

**方式二：从源码构建**

```bash
npm run sync:source
```

这将从 Hasura GraphQL Engine 仓库克隆源码并构建（需要较长时间）。

### 3. 配置

编辑 `postgraphile-config.yml` 文件，配置你的数据库连接和 schema：

```yaml
database:
  connection: postgresql://user:password@localhost:5432/mydb
  schemas:
    - public
```

或者使用环境变量：

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
export POSTGRAPHILE_URL="http://localhost:5000"
```

### 4. 构建项目

```bash
npm run build
```

### 5. 启动服务

```bash
npm start
```

开发模式（自动重启，无需构建）：

```bash
npm run dev
```

### 6. 访问 Console

打开浏览器访问：`http://localhost:8080`

## 配置说明

### 环境变量

- `DATABASE_URL`: PostgreSQL 数据库连接字符串
- `POSTGRAPHILE_URL`: PostGraphile GraphQL 服务地址（默认: http://localhost:5000）
- `PORT`: Console 服务端口（默认: 8080）
- `CONFIG_PATH`: YAML 配置文件路径（默认: ./postgraphile-config.yml）

### YAML 配置文件

`postgraphile-config.yml` 支持以下配置：

```yaml
database:
  connection: ${DATABASE_URL}
  schemas:
    - public
    - custom_schema

server:
  port: 5000
  host: localhost

graphql:
  endpoint: /graphql
  graphiql: true

tables:
  - table:
      schema: public
      name: users
    select_permissions:
      - role: user
        permission:
          columns: ['id', 'name', 'email']
          filter: {}

relationships:
  - name: user_posts
    type: array
    from_table:
      schema: public
      name: users
    to_table:
      schema: public
      name: posts
    mapping:
      id: user_id

permissions:
  default_role: anonymous
  roles:
    - anonymous
    - user
    - admin
```

## 架构说明

### 文件结构

```
.
├── src/
│   ├── server.ts                   # 主服务器
│   ├── postgraphile-adapter.ts     # PostGraphile 适配器
│   └── types/
│       └── index.ts                # TypeScript 类型定义
├── sync-hasura-console.sh          # Hasura Console 同步脚本
├── postgraphile-config.yml         # YAML 配置文件
├── tsconfig.json                   # TypeScript 配置
├── package.json                    # 项目依赖
├── dist/                           # 编译输出（构建后生成）
├── hasura-console/                 # Hasura Console 前端代码（同步后生成）
└── README.md                       # 说明文档
```

### 适配器工作原理

`src/postgraphile-adapter.ts` 提供了以下功能：

1. **API 转换**: 将 Hasura API 调用转换为 PostGraphile 兼容格式
2. **元数据管理**: 处理 schema 和表的元数据
3. **权限映射**: 将 Hasura 权限模型映射到 PostGraphile
4. **GraphQL 代理**: 转发 GraphQL 查询到 PostGraphile 服务

### API 端点

- `GET /healthz` - 健康检查
- `POST /v1/metadata` - 元数据操作
- `POST /v1/graphql` - GraphQL 查询
- `POST /v2/query` - SQL 查询和表管理

## CI/CD 自动构建

项目配置了 GitHub Actions 自动构建 Hasura Console 并发布到 Release。

### 触发构建

**方式一：推送 Tag**

```bash
git tag v1.0.0
git push origin v1.0.0
```

**方式二：手动触发**

1. 进入 GitHub Actions 页面
2. 选择 "Build Hasura Console" 工作流
3. 点击 "Run workflow"
4. 可选：指定 Hasura 版本（如 `v2.36.0`）

**方式三：定时自动构建**

每周一自动检查 Hasura 新版本并构建（无需手动操作）。

### 使用预构建版本

直接运行：

```bash
npm run sync  # 从 Release 下载
```

## 开发

### TypeScript 开发

项目使用 TypeScript 编写，提供完整的类型安全：

```bash
# 类型检查
npm run type-check

# 开发模式（自动重启）
npm run dev

# 构建生产版本
npm run build
```

### 更新 Hasura Console

```bash
# 从 Release 下载（推荐）
npm run sync

# 从源码构建
npm run sync:source
```

### 自定义适配器

编辑 `src/postgraphile-adapter.ts` 来添加自定义的 API 转换逻辑。所有类型定义在 `src/types/index.ts` 中。

## 注意事项

- Hasura Console 的某些功能可能在 PostGraphile 中不完全兼容
- 建议先在开发环境测试所有功能
- 权限系统的实现方式与 Hasura 有所不同，需要根据实际情况调整

## 许可证

MIT
