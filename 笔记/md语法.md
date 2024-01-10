---
tags:
  - markdown
  - md
  - 语法
---

# 📒 笔记

## 元数据

可以在文件头填写以上内容来增加标签等信息

```markdown
---
tags:
  - markdown
  - md
  - 语法
---
```



## 提示


```markdown
::: info 后果须知

请注意，如果你需要使用 HSBC HK 的电子账单或者账单作为英文地址的证明，请再三思考后再决定是否需要这样修改，因为修改之后想要删除或者变更为英文地址的时候就只能通过寄信说明或者线下前往 HSBC HK 并在柜台完成修改地址的操作了。

:::
```
可以使用 `danger`,`warning`,`info`来设置样式

::: info 后果须知

请注意，如果你需要使用 HSBC HK 的电子账单或者账单作为英文地址的证明，请再三思考后再决定是否需要这样修改，因为修改之后想要删除或者变更为英文地址的时候就只能通过寄信说明或者线下前往 HSBC HK 并在柜台完成修改地址的操作了。

:::


## 引用

```markdown
> 您准备好保安编码器或流动保安编码，然后按照以下步骤更改您的中文通讯地址：
>
> - 登录网上理财
> - 在主页顶部选单选择“理财”
> - 在“个人设置”下选择“更新个人资料”
> - 在左边菜单栏选择“更新中文通讯地址（只限于中国内地或台湾）”
```
示例

> 您准备好保安编码器或流动保安编码，然后按照以下步骤更改您的中文通讯地址：
>
> - 登录网上理财
> - 在主页顶部选单选择“理财”
> - 在“个人设置”下选择“更新个人资料”
> - 在左边菜单栏选择“更新中文通讯地址（只限于中国内地或台湾）”

## 双向链接

**双向链接** （也被称之为内部链接，英文 Bi-directional links 和 Internal links），和也许你也了解和听说过另一个有关的概念 [WikiLinks](https://en.wikipedia.org/wiki/Help:Link)，在文档工程中有着非常重要的地位，它通常用于快速的建立一个页面到另一个页面的连接（或者链接），在 [Wikipedia](https://wikipedia.org) 这样的 Wiki 框架中，以及现在所流行的 [Obsidian](https://obsidian.md/) 和 [Logseq](https://logseq.com/) 中都被广泛使用。

这个插件是 [Obsidian](https://obsidian.md) 的[内部链接](https://help.obsidian.md/Linking+notes+and+files/Internal+links)的全功能兼容实现版本，它遵循两条规则：

1. 一个页面的文件名称（不包含扩展名）可以作为一个链接的目标，例如：`[[双向链接示例页面]]` 将会被解析为一个指向全局唯一的 `双向链接示例页面.md` 文件的链接。
2. 一个链接的目标可以是一个绝对路径，例如：`[[某个文件夹/双向链接示例页面]]` 将会被解析为一个指向 `某个文件夹/双向链接示例页面.md` 的链接，通常出现在你有多个同名文件的时候。

详情查看 [Markdown It 插件](https://nolebase-integrations.ayaka.io/pages/zh-CN/integrations/markdown-it-bi-directional-links/#%E4%BB%8B%E7%BB%8D)

## 语言块

````markdown
```markdown
输入语言内容
``` 
````

示例
```shell
sudo lsof /var/lib/dpkg/lock-frontend
```


## vue组件

### AppContainer
```html
<AppContainer href="https://github.com/nolebase/nolebase">
  <template #image>
    <img src="/android-chrome-192x192.png" />
  </template>
  <template #name>
    Nólëbase
  </template>
  <template #by>
    以 Nólëbase 为名，读作 nole-base，取自意为「知识」的昆雅语 nólë 和意为「基础」的英文 base，即「知识库」
  </template>
</AppContainer>
```
使用示例
<AppContainer href="https://github.com/nolebase/nolebase">
  <template #image>
    <img src="/android-chrome-192x192.png" />
  </template>
  <template #name>
    Nólëbase
  </template>
  <template #by>
    以 Nólëbase 为名，读作 nole-base，取自意为「知识」的昆雅语 nólë 和意为「基础」的英文 base，即「知识库」
  </template>
</AppContainer>

## Markdown原生语法

### 超链接

```markdown
[mermaid-js/mermaid](https://github.com/mermaid-js/mermaid)
```
示例
[Mermaid](https://mermaid.js.org/)
### 图片

```markdown
![](./image.jpg)
```

### 列表

```markdown
| 文档状态 | 命令 | 简介 |
| --------- | ----| ----- |
| 正常 | [[cd 变更目录]] | 变更当前 **工作目录** 的位置 |
| 正常 | [[cp 复制]] | 把文件复制到别的地方 |
```
示例
| 文档状态 | 命令 | 简介 |
| --------- | ----| ----- |
| 正常 | [[cd 变更目录]] | 变更当前 **工作目录** 的位置 |
| 正常 | [[cp 复制]] | 把文件复制到别的地方 |

### 脚注

```markdown
这意味着开源协议允许商业使用和衍生作品[^1]
[^1]: https://www.oshwa.org/2014/05/21/cc-oshw/
[^2]: https://opensource.org/osd/
[^3]: https://opendefinition.org/od/2.1/en/
```
