# UI 优化说明

## 已完成优化

### 波场 (TRX) 查询页面 ✅

已参考 dizhicha.com 进行了全面优化：

#### 1. 整体布局
- 使用卡片式设计，圆角边框
- 渐变色背景突出重要信息
- 响应式网格布局
- 更好的间距和留白

#### 2. 地址卡片
- 添加复制按钮
- 更清晰的字体层级
- 深色模式支持

#### 3. 资产概览（4个卡片）
- 总资产价值（渐变蓝色背景）
- TRX 余额
- 带宽
- 能量

#### 4. 代币列表优化
- 表格式展示
- 代币图标（彩色圆形）
- 悬停效果
- USDT 特殊标识（绿色）
- 显示合约地址缩略
- 价值计算（USDT显示美元价值）

#### 5. 交易记录优化
- 卡片式布局
- 状态标签（成功/失败）
- 交易类型标签
- 发送方/接收方分栏显示
- 时间格式化
- 悬停效果

## 待优化页面

### 以太坊 (ETH) 查询页面

建议优化内容：
1. 采用相同的卡片式布局
2. 资产概览卡片
   - 总资产价值
   - ETH 余额
   - Gas 费用统计
   - 交易数量
3. ERC-20 代币表格
   - 代币图标
   - 价格显示
   - 价值计算
4. 交易记录优化
   - 交易类型（转账/合约调用）
   - Gas 费用显示
   - 状态标识

### 比特币 (BTC) 查询页面

建议优化内容：
1. 资产概览卡片
   - 总资产价值
   - BTC 余额
   - 总接收
   - 总发送
2. UTXO 信息展示
3. 交易记录优化
   - 输入/输出地址
   - 确认数显示
   - 手续费显示

## 设计规范

### 颜色方案

#### 主色调
- 蓝色：`#3B82F6` (blue-500)
- 渐变：`from-blue-500 to-blue-600`

#### 状态颜色
- 成功：`bg-green-100 text-green-800`
- 失败：`bg-red-100 text-red-800`
- 待处理：`bg-yellow-100 text-yellow-800`
- 信息：`bg-blue-100 text-blue-800`

#### 背景色
- 页面背景：`bg-gray-50 dark:bg-gray-900`
- 卡片背景：`bg-white dark:bg-gray-800`
- 边框：`border-gray-200 dark:border-gray-700`

### 圆角规范
- 小圆角：`rounded-lg` (8px)
- 中圆角：`rounded-xl` (12px)
- 圆形：`rounded-full`

### 阴影规范
- 卡片阴影：`shadow-sm`
- 悬停阴影：`hover:shadow-md`

### 间距规范
- 卡片内边距：`p-6`
- 卡片间距：`gap-4` 或 `gap-6`
- 元素间距：`space-y-3` 或 `space-y-4`

### 字体规范
- 标题：`text-2xl md:text-3xl font-bold`
- 副标题：`text-xl font-bold`
- 正文：`text-sm` 或 `text-base`
- 小字：`text-xs`
- 代码/地址：`font-mono`

### 响应式设计
- 移动端：单列布局
- 平板：`md:grid-cols-2`
- 桌面：`md:grid-cols-4`

## 组件复用

### 可复用组件建议

#### 1. AddressCard 组件
```tsx
<AddressCard 
  address={address}
  onCopy={() => {}}
/>
```

#### 2. StatCard 组件
```tsx
<StatCard
  label="TRX 余额"
  value="1000.00"
  subValue="≈ $100.00"
  variant="gradient" // gradient | default
/>
```

#### 3. TokenTable 组件
```tsx
<TokenTable
  tokens={tokens}
  showValue={true}
/>
```

#### 4. TransactionCard 组件
```tsx
<TransactionCard
  transaction={tx}
  chainType="trx" // eth | btc | trx
/>
```

## 交互优化

### 1. 复制功能
- 点击复制地址
- 显示复制成功提示
- 使用 toast 通知

### 2. 悬停效果
- 卡片悬停：`hover:bg-gray-50`
- 按钮悬停：`hover:bg-gray-200`
- 过渡动画：`transition-colors`

### 3. 加载状态
- 骨架屏
- 加载动画
- 进度条

### 4. 错误处理
- 友好的错误提示
- 重试按钮
- 返回首页链接

## 性能优化

### 1. 图片优化
- 使用 Next.js Image 组件
- 懒加载
- WebP 格式

### 2. 代码分割
- 动态导入大组件
- 路由级别分割

### 3. 数据缓存
- SWR 或 React Query
- 本地存储
- Redis 缓存

## 可访问性

### 1. 语义化 HTML
- 使用正确的标签
- ARIA 标签
- 键盘导航

### 2. 对比度
- 文字对比度 > 4.5:1
- 深色模式支持

### 3. 响应式
- 移动端友好
- 触摸目标 > 44px

## 下一步计划

1. ✅ 优化波场查询页面
2. ⏳ 优化以太坊查询页面
3. ⏳ 优化比特币查询页面
4. ⏳ 创建可复用组件
5. ⏳ 添加加载状态
6. ⏳ 添加错误边界
7. ⏳ 性能优化
8. ⏳ 可访问性测试

## 参考资源

- 参考网站：https://dizhicha.com/
- Tailwind CSS：https://tailwindcss.com/
- Next.js：https://nextjs.org/
- 设计灵感：Dribbble, Behance

---

波场查询页面已经完成优化，现在看起来更专业、更美观了！
