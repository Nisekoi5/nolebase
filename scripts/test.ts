import { createRecentUpdatesLoader } from '@nolebase/vitepress-plugin-index/vitepress'
// import { cwd } from 'node:process';
// import { glob } from 'tinyglobby';
// import { join, basename, relative, sep } from 'node:path';

// const patt = join('zh-CN/笔记', "**/*.md")
// console.log(patt)
// const file = await glob('zh-CN/笔记/**/*.md'
// )
// console.log(file)
const data = createRecentUpdatesLoader({ dir: 'zh-CN/笔记', })

const a = await data.load()