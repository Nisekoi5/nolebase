---
tags:
  - Flask
  - 开发/语言/Python
---

使用`Python`的`Flask`框架的时候如果启动了debug模式开发, 会检测目录下文件变化重新加载  
不知道为什么有时候会监听到安装的`package`的目录发生了更新, 然后莫名其妙的重载  
此时正在F5断点检查,这时突然重启一下搞得非常烦  

使用以下命令行参数来忽略不希望监听的文件目录[^1]

```shell
python main.py --exclude_patterns file1:dirA/file2:dirB/
```

::: tip 提示

重载程序还可以使用 `--exclude-patterns` 选项忽略使用 [fnmatch](https://docs.python.org/3/library/fnmatch.html#module-fnmatch) 模式的文件。多个模式之间用 : 分隔，Windows 系统则用 ; 分隔。   
The reloader can also ignore files using fnmatch patterns with the --exclude-patterns option. Multiple patterns are separated with :, or ; on Windows.  

:::


[^1]: https://flask.palletsprojects.com/en/3.0.x/cli/#watch-and-ignore-files-with-the-reloader