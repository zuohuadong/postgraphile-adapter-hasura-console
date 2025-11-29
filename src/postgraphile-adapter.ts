/**
 * PostGraphile v5 适配器
 * 将 Hasura Console 的 API 调用转换为 PostGraphile v5 兼容的格式
 */

import { Express, Request, Response } from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import {
  AdapterConfig,
  YAMLConfig,
  HasuraMetadata,
  TableConfig,
  MetadataRequest,
  QueryRequest,
  SQLResult
} from './types';

export class PostGraphileAdapter {
  private config: AdapterConfig;
  private postgraphileUrl: string;
  private configPath: string;
  private yamlConfig: YAMLConfig;

  constructor(config: AdapterConfig) {
    this.config = config;
    this.postgraphileUrl = config.postgraphileUrl || 'http://localhost:5000';
    this.configPath = config.configPath || './postgraphile-config.yml';
    this.yamlConfig = this.getDefaultConfig();
    this.loadConfig();
  }

  // 加载 YAML 配置
  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContents = fs.readFileSync(this.configPath, 'utf8');
        const loaded = yaml.load(fileContents) as YAMLConfig;
        this.yamlConfig = loaded;
        console.log('✅ 配置文件加载成功:', this.configPath);
      } else {
        console.warn('⚠️  配置文件不存在，使用默认配置');
      }
    } catch (e) {
      console.error('❌ 配置文件加载失败:', e);
    }
  }

  // 默认配置
  private getDefaultConfig(): YAMLConfig {
    return {
      database: {
        schemas: ['public'],
        connection: process.env.DATABASE_URL
      },
      server: {
        port: 5000,
        host: 'localhost'
      },
      graphql: {
        endpoint: '/graphql',
        graphiql: true
      }
    };
  }

  // 转换 Hasura metadata 格式到 PostGraphile
  private transformMetadata(hasuraMetadata: any): any {
    const pgMetadata = {
      schemas: [],
      tables: [],
      relationships: []
    };

    // 转换表结构
    if (hasuraMetadata.tables) {
      hasuraMetadata.tables.forEach((table: TableConfig) => {
        pgMetadata.tables.push({
          schema: table.table.schema,
          name: table.table.name,
          permissions: this.transformPermissions(table)
        });
      });
    }

    return pgMetadata;
  }

  // 转换权限配置
  private transformPermissions(table: TableConfig): Record<string, any> {
    const permissions: Record<string, any> = {};
    
    if (table.select_permissions) {
      permissions.select = table.select_permissions;
    }
    if (table.insert_permissions) {
      permissions.insert = table.insert_permissions;
    }
    if (table.update_permissions) {
      permissions.update = table.update_permissions;
    }
    if (table.delete_permissions) {
      permissions.delete = table.delete_permissions;
    }

    return permissions;
  }

  // API 路由适配
  public setupRoutes(app: Express): void {
    // 健康检查
    app.get('/healthz', (req: Request, res: Response) => {
      res.json({ status: 'ok' });
    });

    // 获取元数据
    app.post('/v1/metadata', async (req: Request<{}, {}, MetadataRequest>, res: Response) => {
      try {
        const { type, args } = req.body;
        
        switch (type) {
          case 'export_metadata':
            res.json(this.exportMetadata());
            break;
          case 'reload_metadata':
            this.loadConfig();
            res.json({ message: 'success' });
            break;
          default:
            res.status(400).json({ error: 'Unknown metadata operation' });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    });

    // GraphQL 查询代理
    app.post('/v1/graphql', async (req: Request, res: Response) => {
      try {
        const response = await fetch(`${this.postgraphileUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...req.headers as Record<string, string>
          },
          body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        res.json(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    });

    // Schema introspection
    app.post('/v2/query', async (req: Request<{}, {}, QueryRequest>, res: Response) => {
      try {
        const { type, args } = req.body;
        
        switch (type) {
          case 'run_sql':
            res.json(await this.runSQL(args));
            break;
          case 'track_table':
            res.json({ message: 'Table tracked' });
            break;
          case 'untrack_table':
            res.json({ message: 'Table untracked' });
            break;
          default:
            res.status(400).json({ error: 'Unknown query operation' });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    });
  }

  // 导出元数据
  private exportMetadata(): HasuraMetadata {
    return {
      version: 3,
      sources: [{
        name: 'default',
        kind: 'postgres',
        tables: this.yamlConfig.tables || [],
        configuration: {
          connection_info: {
            database_url: this.yamlConfig.database?.connection
          }
        }
      }]
    };
  }

  // 执行 SQL
  private async runSQL(args: any): Promise<SQLResult> {
    // 这里需要实际的数据库连接来执行 SQL
    // 简化版本，返回模拟数据
    return {
      result_type: 'TuplesOk',
      result: [['column1'], ['value1']]
    };
  }

  public getPostGraphileUrl(): string {
    return this.postgraphileUrl;
  }

  public getConfigPath(): string {
    return this.configPath;
  }
}
