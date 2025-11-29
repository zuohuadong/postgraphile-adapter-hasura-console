#!/bin/bash

# Hasura Console 同步脚本
# 支持从 GitHub Release 下载预构建版本或从源码构建

set -e

REPO_URL="https://github.com/hasura/graphql-engine.git"
TEMP_DIR="temp_hasura_clone"
TARGET_DIR="hasura-console"
BRANCH="master"

# 从 GitHub Release 下载的仓库（需要修改为你的仓库）
RELEASE_REPO="${RELEASE_REPO:-your-username/postgraphile-hasura-console}"
RELEASE_VERSION="${RELEASE_VERSION:-latest}"

show_usage() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --from-release    从 GitHub Release 下载预构建版本（推荐）"
    echo "  --from-source     从 Hasura 源码构建（需要 Node.js）"
    echo "  --version VERSION 指定要下载的版本（默认: latest）"
    echo "  --help            显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 --from-release                    # 下载最新的预构建版本"
    echo "  $0 --from-release --version v1.0.0   # 下载指定版本"
    echo "  $0 --from-source                     # 从源码构建"
}

download_from_release() {
    echo "🚀 从 GitHub Release 下载预构建的 Hasura Console..."
    
    # 获取下载 URL
    if [ "$RELEASE_VERSION" = "latest" ]; then
        DOWNLOAD_URL="https://github.com/$RELEASE_REPO/releases/latest/download/hasura-console.tar.gz"
        echo "📦 下载最新版本..."
    else
        DOWNLOAD_URL="https://github.com/$RELEASE_REPO/releases/download/$RELEASE_VERSION/hasura-console.tar.gz"
        echo "📦 下载版本: $RELEASE_VERSION..."
    fi
    
    # 创建目标目录
    mkdir -p "$TARGET_DIR"
    
    # 下载并解压
    echo "⬇️  下载中..."
    if command -v wget &> /dev/null; then
        wget -q --show-progress "$DOWNLOAD_URL" -O hasura-console.tar.gz
    elif command -v curl &> /dev/null; then
        curl -L "$DOWNLOAD_URL" -o hasura-console.tar.gz --progress-bar
    else
        echo "❌ 错误: 需要 wget 或 curl 来下载文件"
        exit 1
    fi
    
    echo "📦 解压中..."
    tar -xzf hasura-console.tar.gz -C "$TARGET_DIR"
    
    # 清理
    rm hasura-console.tar.gz
    
    echo "✅ 下载完成！"
    echo "📍 Hasura Console 已安装到: $TARGET_DIR"
}

build_from_source() {
    echo "🚀 从源码构建 Hasura Console..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ 错误: 需要 Node.js 来构建 Hasura Console"
        echo "请先安装 Node.js: https://nodejs.org/"
        exit 1
    fi
    
    # 清理临时目录
    if [ -d "$TEMP_DIR" ]; then
        echo "清理旧的临时目录..."
        rm -rf "$TEMP_DIR"
    fi
    
    # 使用 sparse checkout 只克隆 frontend 目录
    echo "📦 克隆 Hasura GraphQL Engine 仓库 (仅 frontend 目录)..."
    git clone --depth 1 --filter=blob:none --sparse "$REPO_URL" "$TEMP_DIR"
    
    cd "$TEMP_DIR"
    git sparse-checkout set frontend
    cd ..
    
    # 创建目标目录
    echo "📁 准备目标目录..."
    mkdir -p "$TARGET_DIR"
    
    # 同步文件
    echo "📋 同步文件到 $TARGET_DIR..."
    if command -v rsync &> /dev/null; then
        rsync -av --delete "$TEMP_DIR/frontend/" "$TARGET_DIR/"
    else
        cp -r "$TEMP_DIR/frontend/"* "$TARGET_DIR/"
    fi
    
    # 清理临时目录
    echo "🧹 清理临时文件..."
    rm -rf "$TEMP_DIR"
    
    echo "✅ 同步完成！"
    echo "📍 Hasura Console 代码已同步到: $TARGET_DIR"
    echo ""
    echo "⚠️  注意: 你可能需要在 $TARGET_DIR 目录中运行 npm install 和 npm run build"
}

# 解析命令行参数
MODE="release"  # 默认使用 release 模式

while [[ $# -gt 0 ]]; do
    case $1 in
        --from-release)
            MODE="release"
            shift
            ;;
        --from-source)
            MODE="source"
            shift
            ;;
        --version)
            RELEASE_VERSION="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "未知选项: $1"
            show_usage
            exit 1
            ;;
    esac
done

# 执行相应的操作
if [ "$MODE" = "release" ]; then
    download_from_release
else
    build_from_source
fi
