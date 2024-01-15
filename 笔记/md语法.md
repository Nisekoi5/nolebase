---
tags:
  - markdown
  - md
  - 语法
---

# 📒 Markdown语法记录

因为不经常用，时长忘记语法，做个记录贴~

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



## 提示(自定义容器)

```markdown
::: info 后果须知

请注意，如果你需要使用 HSBC HK 的电子账单或者账单作为英文地址的证明
请再三思考后再决定是否需要这样修改，因为修改之后想要删除或者变更为英文地址的时候就只能通过寄信说明或者线下前往 HSBC HK 并在柜台完成修改地址的操作了。

:::
```
效果示例

::: warning 后果须知

请注意，如果你需要使用 HSBC HK 的电子账单或者账单作为英文地址的证明，请再三思考后再决定是否需要这样修改，因为修改之后想要删除或者变更为英文地址的时候就只能通过寄信说明或者线下前往 HSBC HK 并在柜台完成修改地址的操作了。

:::

可以使用 `info`，`tip`，`danger`，`warning`，`details`来设置样式
可以通过在容器的 "type" 之后附加文本来设置自定义标题。

::: details 点击查看

点击查看内部信息

:::


## 块引用

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
> -  在左边菜单栏选择“更新中文通讯地址（只限于中国内地或台湾）”


## 内置Markdown扩展

详情查看 [VitePress官方介绍](https://vitepress.dev/zh/guide/markdown)

包含，代码块中的语法高亮，在代码块中实现行高亮，代码块中聚焦，代码块中的颜色差异，高亮“错误”和“警告”，行号，代码组，包含 markdown 文件，数学方程，图片懒加载，高级配置及其他扩展的使用方法



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

### Gallery 展示画廊

```html
<Gallery title="SPY x FAMILY 間諜家家酒" creator="遠藤達哉" href="https://ani.gamer.com.tw/animeVideo.php?sn=28798" linkText="前往观看">
  <template #image>
    <img src="./🪄 ACG//🎞️动画/assets/2022-間諜家家酒.jpg" />
  </template>
   <template #describe>
每一個人都擁有不想讓任何人看見得自己的一面―― 位在世界各國於檯面下進行激烈情報戰的時代。東國與西國已經維持了數十年的冷戰狀態。所屬西國情報局對東課 WISE 厲害的間諜〈黃昏〉，為了前往找尋被譽為是會威脅到東西國和平的危險人物，東國的國家統一黨總裁 唐納文・戴斯蒙德 所正在籌備的戰爭計畫，被賦予了一項極秘任務。其名稱為 Operation〈梟〉。內容講述「在一週內組建家庭，並潛入戴斯蒙德兒子所就讀的學校吧」。但是，他所遇到的「女兒」是會讀心的超能力者、「妻子」則是暗殺者！為了互相的利益而成為家庭，決定在隱藏真實身分的情況下共同生活的 3 人。世界的和平就託付即將發生一系列事件的暫定的家庭…？
   </template>
</Gallery>
```

::: tip

所有的`插槽`和`prop`都有对应的同名属性，比如`image`插槽, 可以直接传递`image`到组件  
但是所有的属性都写到一行会导致很难修改和阅读，所以使用插槽扩展到多行

```html
<Gallery image="./🪄 ACG//🎞️动画/assets/2022-間諜家家酒.jpg" >
```

:::

<Gallery title="SPY x FAMILY 間諜家家酒" creator="遠藤達哉" href="https://ani.gamer.com.tw/animeVideo.php?sn=28798" linkText="前往观看" >
  <template #image>
    <img src="./🪄 ACG//🎞️动画/assets/2022-間諜家家酒.jpg" />
  </template>
   <template #describe>
每一個人都擁有不想讓任何人看見得自己的一面―― 位在世界各國於檯面下進行激烈情報戰的時代。東國與西國已經維持了數十年的冷戰狀態。所屬西國情報局對東課 WISE 厲害的間諜〈黃昏〉，為了前往找尋被譽為是會威脅到東西國和平的危險人物，東國的國家統一黨總裁 唐納文・戴斯蒙德 所正在籌備的戰爭計畫，被賦予了一項極秘任務。其名稱為 Operation〈梟〉。內容講述「在一週內組建家庭，並潛入戴斯蒙德兒子所就讀的學校吧」。但是，他所遇到的「女兒」是會讀心的超能力者、「妻子」則是暗殺者！為了互相的利益而成為家庭，決定在隱藏真實身分的情況下共同生活的 3 人。世界的和平就託付即將發生一系列事件的暫定的家庭…？
   </template>
</Gallery>

## Markdown原生语法

这里只只列出一些常用的

### 字体外观

```markdown
*斜体文本*
**粗体文本**
***粗斜体文本***
~~删除线文本~~
```
*斜体文本*  
**粗体文本**  
***粗斜体文本***  
~~删除线文本~~
### 超链接

```markdown
[mermaid-js/mermaid](https://github.com/mermaid-js/mermaid)
```
示例
[mermaid-js/mermaid](https://github.com/mermaid-js/mermaid)

### 图片

```markdown
![](./image.jpg)
```

### 表格

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
### 水平线
```markdown
---
```
---

通常用于分割一些段落


### 列表

Markdown 支持有序列表和无序列表, 并且可以进行互相嵌套


#### 有序列表
有序列表使用数字并加上 . 号来表示，如：

```markdown
1. 项目1
2. 项目2
```

1. 项目1
2. 项目2

#### 无序列表

无序列表使用星号(*)、加号(+)或是减号(-)作为列表标记，这些标记后面要添加一个空格，然后再填写内容：

```markdown
- 项目1
- 项目2
  - 子项目1
  - 子项目2
```

- 项目1
- 项目2
  - 子项目1
  - 子项目2


#### 嵌套列表

列表嵌套只需在子列表中的选项前面添加两个或四个空格即可：

```markdown
1. 第一项：
    - 第一项嵌套的第一个元素
    - 第一项嵌套的第二个元素
2. 第二项：
    - 第二项嵌套的第一个元素
    - 第二项嵌套的第二个元素
```
1. 第一项：
    - 第一项嵌套的第一个元素
    - 第一项嵌套的第二个元素
2. 第二项：
    - 第二项嵌套的第一个元素
    - 第二项嵌套的第二个元素

