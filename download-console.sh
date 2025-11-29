#!/bin/bash

# 快速下载脚本 - 从 GitHub Release 下载预构建的 Hasura Console

set -e

# 配置（请修改为你的仓库信息）
RELEASE_REPO="${RELEASE_REPO:-your-username/postgraphile-hasura-console}"
RELEASE_VERSION="${1:-latest}"
TARGET_DIR="hasura-console"

echo "🚀 下载预构建的 Hasura Console..."
echo "📦 仓库: $RELEASE_REPO"
echo "🏷️  版本: $RELEASE_VERSION"

# 获取下载 URL
if [ "$RELEASE_VERSION" = "latest" ]; then
    DOWNLOAD_URL="https://github.com/$RELEASE_REPO/releases/latest/download/hasura-console.tar.gz"
    CHECKSUM_URL="https://github.com/$RELEASE_REPO/releases/latest/download/hasura-console.tar.gz.sha256"
else
    DOWNLOAD_URL="https://github.com/$RELEASE_REPO/releases/download/$RELEASE_VERSION/hasura-console.tar.gz"
    CHECKSUM_URL="https://github.com/$RELEASE_REPO/releases/download/$RELEASE_VERSION/hasura-console.tar.gz.sha256"
fi

# 创建目标目录
mkdir -p "$TARGET_DIR"

# 下载文件
echo "⬇️  下载中..."
if command -v wget &> /dev/null; then
    wget -q --show-progress "$DOWNLOAD_URL" -O hasura-console.tar.gz
    wget -q "$CHECKSUM_URL" -O hasura-console.tar.gz.sha256 2>/dev/null || true
elif command -v curl &> /dev/null; then
    curl -L "$DOWNLOAD_URL" -o hasura-console.tar.gz --progress-bar
    curl -L "$CHECKSUM_URL" -o hasura-console.tar.gz.sha256 2>/dev/null || true
else
    echo "❌ 错误: 需要 wget 或 curl 来下载文件"
    exit 1
fi

# 验证校验和（如果存在）
if [ -f "hasura-console.tar.gz.sha256" ]; then
    echo "🔐 验证文件完整性..."
    if command -v sha256sum &> /dev/null; then
        sha256sum -c hasura-console.tar.gz.sha256
    elif command -v shasum &> /dev/null; then
        shasum -a 256 -c hasura-console.tar.gz.sha256
    else
        echo "⚠️  跳过校验和验证（未找到 sha256sum 或 shasum）"
    fi
fi

# 解压
echo "📦 解压中..."
tar -xzf hasura-console.tar.gz -C "$TARGET_DIR"

# 清理
rm hasura-console.tar.gz
rm -f hasura-console.tar.gz.sha256

echo "✅ 下载完成！"
echo "📍 Hasura Console 已安装到: $TARGET_DIR"
echo ""
echo "现在可以运行:"
echo "  npm run dev    # 开发模式"
echo "  npm start      # 生产模式"
