/**
 * 类型定义
 */

export interface DatabaseConfig {
  connection?: string;
  schemas: string[];
  options?: {
    dynamicJson?: boolean;
    ignoreRBAC?: boolean;
    ignoreIndexes?: boolean;
  };
}

export interface ServerConfig {
  port: number;
  host: string;
}

export interface GraphQLConfig {
  endpoint: string;
  graphiql: boolean;
  options?: {
    watchPg?: boolean;
    enhanceGraphiql?: boolean;
    enableQueryBatching?: boolean;
    legacyRelations?: string;
  };
}

export interface TableReference {
  schema: string;
  name: string;
}

export interface Permission {
  role: string;
  permission: {
    columns: string[] | string;
    filter: Record<string, any>;
  };
}

export interface TableConfig {
  table: TableReference;
  select_permissions?: Permission[];
  insert_permissions?: Permission[];
  update_permissions?: Permission[];
  delete_permissions?: Permission[];
}

export interface Relationship {
  name: string;
  type: 'object' | 'array';
  from_table: TableReference;
  to_table: TableReference;
  mapping: Record<string, string>;
}

export interface PermissionsConfig {
  default_role: string;
  roles: string[];
}

export interface FeaturesConfig {
  allowIntrospection: boolean;
  enableSubscriptions: boolean;
  enableMutations: boolean;
}

export interface YAMLConfig {
  database: DatabaseConfig;
  server: ServerConfig;
  graphql: GraphQLConfig;
  tables?: TableConfig[];
  relationships?: Relationship[];
  permissions?: PermissionsConfig;
  features?: FeaturesConfig;
}

export interface AdapterConfig {
  postgraphileUrl?: string;
  configPath?: string;
}

export interface HasuraMetadata {
  version: number;
  sources: Array<{
    name: string;
    kind: string;
    tables: TableConfig[];
    configuration: {
      connection_info: {
        database_url?: string;
      };
    };
  }>;
}

export interface MetadataRequest {
  type: string;
  args?: any;
}

export interface QueryRequest {
  type: string;
  args?: any;
}

export interface SQLResult {
  result_type: string;
  result: any[][];
}
