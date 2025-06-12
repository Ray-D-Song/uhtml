# Sparse Attributes Support in uHTML
这个项目 fork 自 [@webreflection](https://github.com/webreflection) 的 [uhtml](https://github.com/webreflection/uhtml) 项目，添加了稀疏属性（Sparse Attributes）的支持。
感谢 [@webreflection](https://github.com/webreflection) 创建了 uhtml 这个项目。

## 概述
稀疏属性（Sparse Attributes）是一种允许在单个HTML属性中使用多个模板插值的功能。这个功能已经从 lighterhtml 移植到 uHTML 中，使得 uHTML 现在同时支持响应式渲染和稀疏属性。

## 什么是稀疏属性？

稀疏属性允许你在一个属性值中使用多个插值，例如：

```javascript
import { render, html } from 'uhtml';

const prefix = 'btn';
const variant = 'primary';
const size = 'lg';

render(document.body, html`
  <button class="${prefix}-${variant}-${size}">
    Click me
  </button>
`);

// 结果: <button class="btn-primary-lg">Click me</button>
```

## 基本用法

### 简单的稀疏属性

```javascript
const protocol = 'https';
const domain = 'example.com';
const path = 'api/v1';

render(container, html`
  <a href="${protocol}://${domain}/${path}/users">API Link</a>
`);
```

### CSS类名组合

```javascript
const baseClass = 'button';
const variant = 'primary';
const state = 'active';

render(container, html`
  <button class="${baseClass} ${baseClass}--${variant} ${baseClass}--${state}">
    Dynamic Button
  </button>
`);
```

### 样式属性

```javascript
const color = 'blue';
const size = '16px';

render(container, html`
  <div style="color: ${color}; font-size: ${size}; border: 1px solid ${color};">
    Styled content
  </div>
`);
```

## 与响应式系统的集成

稀疏属性完全兼容 uHTML 的响应式系统：

```javascript
import { attach } from 'uhtml/reactive';
import { signal } from '@webreflection/signal';

const render = attach(signal.effect);

const prefix = signal('btn');
const variant = signal('primary');

render(container, () => html`
  <button class="${prefix.value}-${variant.value}">
    ${prefix.value}-${variant.value} Button
  </button>
`);

// 更新信号会自动更新属性
prefix.value = 'button';
variant.value = 'secondary';
```

## 性能特点

- **高效更新**: 只有当插值值改变时才更新属性
- **缓存优化**: 模板解析结果被缓存以提高性能
- **最小DOM操作**: 仅更新变化的属性，不重建整个元素

## 实现细节

### 解析过程

1. **模板解析**: 在模板解析阶段，检测包含多个插值的属性
2. **标记稀疏**: 将这些属性标记为稀疏属性，记录消费的插值数量
3. **创建处理器**: 创建专门的稀疏属性处理器来合并多个值

### 值处理

```javascript
// 对于模板: class="${a}-${b}-${c}"
// 稀疏处理器会:
// 1. 收集值: [a, b, c]
// 2. 合并: a + '-' + b + '-' + c
// 3. 设置属性: element.setAttribute('class', mergedValue)
```

### 类型定义

```typescript
interface SparseDetail {
  sparse: boolean;           // 是否是稀疏属性
  sparseCount: number;       // 消费的插值数量
  // ... 其他属性
}
```

## 与 lighterhtml 的兼容性

这个实现与 lighterhtml 的稀疏属性功能兼容，支持：

- 多个插值的属性值
- 动态更新
- 空值和null值处理
- 各种属性类型（class, style, data-*, href等）

## 使用注意事项

1. **插值顺序**: 插值值按照模板中出现的顺序处理
2. **空值处理**: null 和 undefined 值会被转换为空字符串
3. **性能**: 稀疏属性比单一插值属性略慢，但仍然很高效
4. **兼容性**: 与所有 uHTML 功能（keyed渲染、响应式等）兼容

## 测试

运行测试文件来验证功能：

```bash
# 基础测试
open test-sparse.html

# 响应式测试  
open test-sparse-reactive.html
```

## 示例用例

### 动态URL构建

```javascript
const apiBase = signal('https://api.example.com');
const version = signal('v1');
const endpoint = signal('users');

render(container, () => html`
  <a href="${apiBase.value}/${version.value}/${endpoint.value}">
    API: ${apiBase.value}/${version.value}/${endpoint.value}
  </a>
`);
```

### CSS类名系统

```javascript
const namespace = 'ui';
const component = 'button';
const modifiers = ['large', 'primary'];

render(container, html`
  <button class="${namespace}-${component} ${modifiers.map(m => `${namespace}-${component}--${m}`).join(' ')}">
    Styled Button
  </button>
`);
```

### 数据属性

```javascript
const userId = '123';
const userRole = 'admin';
const timestamp = Date.now();

render(container, html`
  <div data-user="${userId}-${userRole}" data-created="${timestamp}">
    User info
  </div>
`);
```
