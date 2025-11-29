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

const GITHUB_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${COMPONENTS_REPO}/${GITHUB_BRANCH}/${COMPONENTS_SOURCE_PATH}`;
const TARGET_DIR_NAME = 'kt-ui';
const TARGET_DIR = path.join(process.cwd(), 'src', 'components', TARGET_DIR_NAME);

program
    .name('kt')
    .description('CLI for adding KtBase components from GitHub source.')
    .version('1.0.0');

program
    .command('add <componentName>')
    .description('Download and add a component (e.g., KtButton) to your project.')
    .action(async (componentName) => {
        // 强制首字母大写，确保文件名正确（KtButton vs ktbutton）
        const PascalCaseName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        const fileName = `${PascalCaseName}.vue`;
        const downloadUrl = `${GITHUB_BASE_URL}/${fileName}`;

        console.log(`\n🚀 正在尝试从 ${downloadUrl} 下载组件...`);

        try {
            // 1. 下载文件内容
            const response = await axios.get(downloadUrl, { responseType: 'text' });
            const componentCode = response.data;

            // 2. 检查并创建目标目录
            if (!fs.existsSync(TARGET_DIR)) {
                fs.mkdirSync(TARGET_DIR, { recursive: true });
                console.log(`[Info] 创建目录: ${path.relative(process.cwd(), TARGET_DIR)}`);
            }

            // 3. 写入文件
            const targetFilePath = path.join(TARGET_DIR, fileName);
            fs.writeFileSync(targetFilePath, componentCode);

            console.log(`\n✅ 成功添加组件：${PascalCaseName}`);
            console.log(`   文件位置: ${path.relative(process.cwd(), targetFilePath)}`);
            console.log(`\n💡 下一步：请确保您的 'tailwind.config.js' 扫描了 './src/components/${TARGET_DIR_NAME}/**' 路径。`);

        } catch (error) {
            console.error(`\n❌ 无法下载组件 ${PascalCaseName}。`);

            if (error.response && error.response.status === 404) {
                console.error(`   错误：在 GitHub 仓库中找不到该文件。请检查组件名或 GitHub 路径是否正确。`);
            } else {
                console.error(`   网络或权限错误：`, error.message);
            }
            process.exit(1);
        }
    });

program.parse(process.argv);