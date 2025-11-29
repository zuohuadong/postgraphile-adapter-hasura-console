/**
 * Hasura Console for PostGraphile v5
 * 主服务器文件
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { PostGraphileAdapter } from './postgraphile-adapter';

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化适配器
const adapter = new PostGraphileAdapter({
  postgraphileUrl: process.env.POSTGRAPHILE_URL || 'http://localhost:5000',
  configPath: process.env.CONFIG_PATH || './postgraphile-config.yml'
});

// 设置 API 路由
adapter.setupRoutes(app);

// 检查 Hasura Console 是否存在
const consoleDir = path.join(__dirname, '..', 'hasura-console');
const consoleExists = fs.existsSync(consoleDir);

if (consoleExists) {
  // 静态文件服务 - Hasura Console
  app.use(express.static(consoleDir));

  // SPA 路由处理
  app.get('*', (req, res) => {
    const indexPath = path.join(consoleDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send(`
        <html>
          <head><title>Hasura Console 未安装</title></head>
          <body style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
            <h1>⚠️ Hasura Console 未安装</h1>
            <p>请先运行同步脚本来下载 Hasura Console：</p>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">npm run sync</pre>
            <p>或者手动运行：</p>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">bash sync-hasura-console.sh</pre>
            <hr style="margin: 30px 0;">
            <p><strong>API 端点仍然可用：</strong></p>
            <ul>
              <li>健康检查: <a href="/healthz">/healthz</a></li>
              <li>GraphQL: POST /v1/graphql</li>
              <li>元数据: POST /v1/metadata</li>
              <li>查询: POST /v2/query</li>
            </ul>
          </body>
        </html>
      `);
    }
  });
} else {
  // Console 目录不存在时的提示页面
  app.get('*', (req, res) => {
    // 跳过 API 路由
    if (req.path.startsWith('/v1/') || req.path.startsWith('/v2/') || req.path === '/healthz') {
      return;
    }
    
    res.status(404).send(`
      <html>
        <head><title>Hasura Console 未安装</title></head>
        <body style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
          <h1>⚠️ Hasura Console 未安装</h1>
          <p>请先运行同步脚本来下载 Hasura Console：</p>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">npm run sync</pre>
          <p>或者手动运行：</p>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">bash sync-hasura-console.sh</pre>
          <hr style="margin: 30px 0;">
          <p><strong>API 端点仍然可用：</strong></p>
          <ul>
            <li>健康检查: <a href="/healthz">/healthz</a></li>
            <li>GraphQL: POST /v1/graphql</li>
            <li>元数据: POST /v1/metadata</li>
            <li>查询: POST /v2/query</li>
          </ul>
        </body>
      </html>
    `);
  });
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Hasura Console for PostGraphile v5 运行在: http://localhost:${PORT}`);
  console.log(`📊 PostGraphile GraphQL 端点: ${adapter.getPostGraphileUrl()}`);
  console.log(`⚙️  配置文件: ${adapter.getConfigPath()}`);
  
  if (!consoleExists) {
    console.log('');
    console.log('⚠️  Hasura Console 未安装');
    console.log('   请运行: npm run sync');
  }
});
