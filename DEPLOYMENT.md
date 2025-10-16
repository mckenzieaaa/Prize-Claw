# 🚀 GitHub Pages 部署指南

## 步骤 1: 启用 GitHub Pages

1. 打开你的 GitHub 仓库页面：
   - 仓库已经改名为：`https://github.com/mckenzieaaa/Prize-Claw`
   
2. 点击仓库顶部的 **Settings**（设置）

3. 在左侧菜单找到 **Pages**

4. 在 "Build and deployment" 部分：
   - **Source**: 选择 "Deploy from a branch"
   - **Branch**: 选择 `main`
   - **Folder**: 选择 `/docs`
   - 点击 **Save** 按钮

5. 等待几分钟，页面会显示：
   ```
   Your site is live at https://mckenzieaaa.github.io/Prize-Claw/
   ```

## 步骤 2: 访问你的游戏

部署完成后，在浏览器打开：

**https://mckenzieaaa.github.io/Prize-Claw/**

## 🎮 游戏链接

- **在线游戏**: https://mckenzieaaa.github.io/Prize-Claw/
- **GitHub 仓库**: https://github.com/mckenzieaaa/Prize-Claw

## 📱 分享给朋友

游戏支持：
- 🖥️ 桌面浏览器（Chrome, Firefox, Safari, Edge）
- 📱 手机浏览器（支持触控操作）
- 🎮 各种屏幕尺寸（自适应）

直接分享链接即可：
```
https://mckenzieaaa.github.io/Prize-Claw/
```

## 🔧 本地测试

如果想在本地测试网页版：

```bash
cd docs
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`

## ✅ 检查清单

- [x] 代码已推送到 GitHub
- [ ] 在 GitHub Settings > Pages 中启用 Pages
- [ ] 选择 main 分支和 /docs 文件夹
- [ ] 等待部署完成（通常 1-5 分钟）
- [ ] 访问游戏链接测试

## 🎨 后续优化建议

1. **添加音效**
   - 抓取音效
   - 成功/失败音效
   - 背景音乐

2. **改进视觉效果**
   - 使用真实的娃娃图片（PNG）
   - 添加粒子效果
   - 更丰富的动画

3. **增加游戏性**
   - 计时模式
   - 关卡系统
   - 特殊奖品
   - 排行榜

4. **优化体验**
   - 添加开始界面
   - 游戏说明
   - 暂停功能
   - 音量控制

需要帮助实现任何功能吗？
