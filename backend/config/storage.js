const fs = require('fs');
const path = require('path');

// JSON文件存储路径（用于本地开发和MongoDB不可用时）
const DATA_DIR = path.join(__dirname, '../../data');
const DIARIES_FILE = path.join(DATA_DIR, 'diaries.json');
const TREEHOLE_FILE = path.join(DATA_DIR, 'treehole.json');

// 确保数据目录存在
function ensureDataDir() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    } catch (error) {
        // 在serverless环境中可能没有写权限，忽略错误
        return false;
    }
    return true;
}

// 初始化JSON文件
function initFiles() {
    if (!ensureDataDir()) {
        return false;
    }
    try {
        if (!fs.existsSync(DIARIES_FILE)) {
            fs.writeFileSync(DIARIES_FILE, JSON.stringify([]));
        }
        if (!fs.existsSync(TREEHOLE_FILE)) {
            fs.writeFileSync(TREEHOLE_FILE, JSON.stringify([]));
        }
        return true;
    } catch (error) {
        // 在serverless环境中可能没有写权限
        return false;
    }
}

// 读取日记数据
function readDiaries() {
    try {
        if (!fs.existsSync(DIARIES_FILE)) {
            initFiles();
            return [];
        }
        const data = fs.readFileSync(DIARIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // 在serverless环境中可能无法读取，返回空数组
        return [];
    }
}

// 写入日记数据
function writeDiaries(diaries) {
    try {
        if (!initFiles()) {
            // 在serverless环境中无法写入文件
            throw new Error('无法写入文件（serverless环境）');
        }
        fs.writeFileSync(DIARIES_FILE, JSON.stringify(diaries, null, 2));
        return true;
    } catch (error) {
        // 在serverless环境中可能无法写入
        return false;
    }
}

// 读取树洞数据
function readTreehole() {
    try {
        if (!fs.existsSync(TREEHOLE_FILE)) {
            initFiles();
            return [];
        }
        const data = fs.readFileSync(TREEHOLE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // 在serverless环境中可能无法读取，返回空数组
        return [];
    }
}

// 写入树洞数据
function writeTreehole(logs) {
    try {
        if (!initFiles()) {
            // 在serverless环境中无法写入文件
            throw new Error('无法写入文件（serverless环境）');
        }
        fs.writeFileSync(TREEHOLE_FILE, JSON.stringify(logs, null, 2));
        return true;
    } catch (error) {
        // 在serverless环境中可能无法写入
        return false;
    }
}

module.exports = {
    readDiaries,
    writeDiaries,
    readTreehole,
    writeTreehole
};

