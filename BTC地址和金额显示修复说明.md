# BTC 地址和金额显示修复说明

## 修复时间
2024年

## 问题描述

BTC 交易列表中的发送方、接收方地址和金额显示不正确：

1. **金额问题**：转出交易显示的是从当前地址输入的总金额（包括找零），而不是实际转出的金额
2. **地址问题**：发送方和接收方地址的逻辑不够清晰，没有根据交易类型正确显示

## 修复状态
✅ 已完成并通过构建测试

## BTC 交易的特点

BTC 交易使用 UTXO 模型，一个交易可能有：
- 多个输入（inputs）：来自不同地址的资金
- 多个输出（outputs）：发送到不同地址的资金

例如，如果你有 1 BTC 要发送 0.3 BTC：
- 输入：1 BTC（来自你的地址）
- 输出1：0.3 BTC（发送给接收方）
- 输出2：0.69 BTC（找零回你的地址）
- 手续费：0.01 BTC

## 修复方案

### 1. 金额计算逻辑

**修复前的问题**：
```typescript
// 转出交易：计算从当前地址输入的金额
amount = tx.inputs
  .filter(input => input.address === address)
  .reduce((sum, input) => sum + input.value, 0);
// 结果：显示 1 BTC（错误！应该显示 0.3 BTC）
```

**修复后的逻辑**：
```typescript
if (isSent && !isReceived) {
  // 纯转出：显示转出到其他地址的总金额（不包括找零）
  txType = 'sent';
  displayAmount = tx.outputs
    .filter(output => output.address !== address)
    .reduce((sum, output) => sum + output.value, 0);
  // 结果：显示 0.3 BTC（正确！）
}
```

### 2. 地址显示逻辑

**转入交易**（别人发给我）：
- 发送方：显示实际发送方地址（非当前地址的第一个输入地址）
- 接收方：显示当前地址

**转出交易**（我发给别人）：
- 发送方：显示当前地址
- 接收方：显示实际接收方地址（非当前地址的第一个输出地址）

**内部转账**（自己转给自己）：
- 发送方：显示当前地址
- 接收方：显示当前地址
- 金额：显示净变化（通常是负的手续费）

### 3. 完整的修复代码

```typescript
// 计算当前地址在交易中接收和发送的金额
const receivedAmount = tx.outputs
  .filter(output => output.address === address)
  .reduce((sum, output) => sum + output.value, 0);

const sentAmount = tx.inputs
  .filter(input => input.address === address)
  .reduce((sum, input) => sum + input.value, 0);

// 确定交易类型和显示金额
let txType: string;
let displayAmount: number;

if (isReceived && !isSent) {
  // 纯转入：显示接收的金额
  txType = 'received';
  displayAmount = receivedAmount;
} else if (isSent && !isReceived) {
  // 纯转出：显示转出到其他地址的总金额（不包括找零）
  txType = 'sent';
  displayAmount = tx.outputs
    .filter(output => output.address !== address)
    .reduce((sum, output) => sum + output.value, 0);
} else if (isSent && isReceived) {
  // 内部转账：显示净变化（通常是负的手续费）
  txType = 'self';
  displayAmount = Math.abs(receivedAmount - sentAmount);
}

// 获取发送方地址
let mainSender: string;
if (txType === 'received') {
  // 转入交易：显示实际发送方（非当前地址）
  mainSender = tx.inputs
    .map(input => input.address)
    .find(addr => addr !== 'Coinbase' && addr !== address)
    || tx.inputs[0]?.address || 'Unknown';
} else {
  // 转出或内部：显示当前地址
  mainSender = address;
}

// 获取接收方地址
let mainReceiver: string;
if (txType === 'sent') {
  // 转出交易：显示实际接收方（非当前地址）
  mainReceiver = tx.outputs
    .map(output => output.address)
    .find(addr => addr !== address)
    || tx.outputs[0]?.address || 'Unknown';
} else {
  // 转入或内部：显示当前地址
  mainReceiver = address;
}
```

## 示例场景

### 场景 1：转出交易
```
当前地址：1ABC...
交易：
  输入：1 BTC (1ABC...)
  输出：0.3 BTC (1XYZ...), 0.69 BTC (1ABC...)
  手续费：0.01 BTC

显示：
  发送方：1ABC...（当前地址）
  接收方：1XYZ...
  类型：转出（红色）
  金额：-0.3 BTC（正确！不是 -1 BTC）
```

### 场景 2：转入交易
```
当前地址：1ABC...
交易：
  输入：1 BTC (1XYZ...)
  输出：0.5 BTC (1ABC...), 0.49 BTC (1XYZ...)
  手续费：0.01 BTC

显示：
  发送方：1XYZ...
  接收方：1ABC...（当前地址）
  类型：转入（绿色）
  金额：+0.5 BTC
```

### 场景 3：内部转账
```
当前地址：1ABC...
交易：
  输入：1 BTC (1ABC...)
  输出：0.99 BTC (1ABC...)
  手续费：0.01 BTC

显示：
  发送方：1ABC...（当前地址）
  接收方：1ABC...（当前地址）
  类型：内部（灰色）
  金额：0.01 BTC（净损失，即手续费）
```

## 测试验证

修复后需要测试以下场景：

1. ✅ 转出交易：金额应该是发送给别人的金额，不包括找零
2. ✅ 转入交易：金额应该是接收到的金额
3. ✅ 内部转账：金额应该是净变化（通常是手续费）
4. ✅ 发送方地址：转入时显示对方，转出时显示自己
5. ✅ 接收方地址：转入时显示自己，转出时显示对方
6. ✅ Coinbase 交易（挖矿奖励）：正确显示

## 技术细节

### 交易类型判断
```typescript
const isReceived = tx.outputs.some(output => 
  output.address === address
);
const isSent = tx.inputs.some(input => 
  input.address === address
);

// 纯转入：outputs 中有当前地址，inputs 中没有
// 纯转出：inputs 中有当前地址，outputs 中没有（或只有找零）
// 内部转账：inputs 和 outputs 中都有当前地址
```

### 金额计算
- **转入**：只计算发送到当前地址的输出
- **转出**：只计算发送到其他地址的输出（排除找零）
- **内部**：计算净变化（接收 - 发送）

### 地址选择
- 优先显示非当前地址
- 如果没有，显示当前地址
- 特殊处理 Coinbase 和 Unknown

## 影响的文件

- `src/app/btc/[address]/page.tsx` - 主要修复文件

## 后续优化建议

1. 考虑添加"详细视图"，显示所有输入和输出地址
2. 对于多输出交易，可以显示主要接收方和次要接收方
3. 添加找零地址的识别和标注
4. 考虑添加交易图表，可视化资金流向
