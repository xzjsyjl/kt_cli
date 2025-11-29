#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { program } = require('commander');

// =========================================================
// 🚨🚨 请根据您的 GitHub 信息进行替换 🚨🚨
// =========================================================
const GITHUB_USER = 'xzjsyjl';
const COMPONENTS_REPO = 'kt_base';
const GITHUB_BRANCH = 'master';
const COMPONENTS_SOURCE_PATH = 'src/components'; // 组件在源码仓库中的路径

const TARGET_DIR_NAME = 'kt-ui';
const TARGET_COMPONENTS_DIR = path.join(process.cwd(), 'src', 'components', TARGET_DIR_NAME);
const TARGET_HOOK_DIR = path.join(process.cwd(), 'src', 'hook');
const TARGET_STYLE_DIR = path.join(process.cwd(), 'src');

program
    .name('kt')
    .description('CLI for adding KtBase components, hooks, and styles from GitHub source.')
    .version('1.0.0');

/**
 * 核心下载函数
 * @param {string} sourceRelativePath - 文件在 GitHub 仓库中的相对路径 (e.g., 'src/components/KtButton.vue')
 * @param {string} targetDir - 本地目标目录 (e.g., '/path/to/project/src/components/kt-ui')
 * @param {string} fileName - 目标文件名 (e.g., 'KtButton.vue')
 */
async function downloadFile(sourceRelativePath, targetDir, fileName) {
    const downloadUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${COMPONENTS_REPO}/${GITHUB_BRANCH}/${sourceRelativePath}`;

    console.log(`\n🚀 正在尝试从 ${downloadUrl} 下载 ${fileName}...`);

    try {
        // 1. 下载文件内容
        const response = await axios.get(downloadUrl, { responseType: 'text' });
        const fileContent = response.data;

        // 2. 检查并创建目标目录
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
            console.log(`[Info] 创建目录: ${path.relative(process.cwd(), targetDir)}`);
        }

        // 3. 写入文件
        const targetFilePath = path.join(targetDir, fileName);
        fs.writeFileSync(targetFilePath, fileContent);

        console.log(`\n✅ 成功添加文件：${fileName}`);
        console.log(`   文件位置: ${path.relative(process.cwd(), targetFilePath)}`);
        return true;
    } catch (error) {
        console.error(`\n❌ 无法下载文件 ${fileName}。`);

        if (error.response && error.response.status === 404) {
            console.error(`   错误：在 GitHub 仓库中找不到该文件。请检查文件名或 GitHub 路径是否正确。`);
        } else {
            console.error(`   网络或权限错误：`, error.message);
        }
        return false;
    }
}


// --- 1. 添加组件命令 (原功能) ---
program
    .command('add <componentName>')
    .description('Download and add a component (e.g., KtButton) to your project.')
    .action(async (componentName) => {
        // 强制首字母大写，确保文件名正确
        const PascalCaseName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        const fileName = `${PascalCaseName}.vue`;
        const sourceRelativePath = `${COMPONENTS_SOURCE_PATH}/${fileName}`;

        await downloadFile(sourceRelativePath, TARGET_COMPONENTS_DIR, fileName);

        // 额外提示
        console.log(`\n💡 下一步：请确保您的 'tailwind.config.js' 扫描了 './src/components/${TARGET_DIR_NAME}/**' 路径。`);
    });

// --- 2. 添加 Hook 命令 (修改为支持单个指定 hook) ---
program
    .command('add-hook <hookName>')
    .description('Download a specific hook file (e.g., useTheme) to src/hook.')
    .action(async (hookName) => {
        // 强制首字母小写或根据实际文件名约定调整，这里假设 Hook 文件名是 hookName.js
        const hookFileName = hookName.endsWith('.js') ? hookName : `${hookName}.js`;
        const sourceRelativePath = `src/hook/${hookFileName}`; // 仓库中的路径

        await downloadFile(sourceRelativePath, TARGET_HOOK_DIR, hookFileName);
    });

// --- 3. 添加 Style 命令 (不变) ---
program
    .command('add-style')
    .description('Download index.css to src/index.css.')
    .action(async () => {
        // 假设 index.css 文件在 GitHub 仓库中位于 src/index.css
        const fileName = 'index.css';
        const sourceRelativePath = `src/${fileName}`; // 仓库中的路径

        await downloadFile(sourceRelativePath, TARGET_STYLE_DIR, fileName);
    });

program.parse(process.argv);