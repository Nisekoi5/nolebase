---
tags:
  - systemd
  - systemctl
---

# systemd 服务的参数和配置

## 前言

`systemctl` 是 `systemd` 系统和服务管理器的主要命令行工具，它通过配置文件来定义和管理系统服务。

每次启动一些没有自带`systemd`后台服务都是用`screen`跑个前台程序一直运行

每次系统重启都得去手动启动进程。很麻烦。特来从头学习并记录下`systemd`的用法。

## 配置文件位置

配置文件位置
`systemd` 服务配置文件主要存放在以下目录中：

`/etc/systemd/system/ `- 系统管理员创建的本地配置文件，优先级最高, 一般自己编写的都直接放这里。

`/run/systemd/system/` - 运行时配置文件(临时)

`/usr/lib/systemd/system/`或者`/lib/systemd/system/` - 软件包安装的服务文件unit，优先级最低

修改包自带 unit 的正确方法是把覆盖放在 `/etc/systemd/system/` 或使用 `systemctl edit`(会在 `/etc/systemd/system/<name>.service.d/` 创建 `drop-in`)。

## 配置文件结构

`systemd` 服务配置文件采用 `INI` 风格的格式，主要包含几个段

## Unit段
描述元信息与依赖关系。
```ini
[Unit]
Description=服务描述信息
Documentation=相关文档的URL或man页面
Requires=强制依赖的服务(若被依赖 unit 未能启动，本 unit 会失败)
Wants=弱依赖（类似 Requires，失败不影响启动）
After=要求在指定服务之后启动
Before=要求在指定服务之前启动
Conflicts=与指定服务冲突
```
一般个人服务配置一个 `Description` 就行了, 依赖网卡上线的可以多设置个 `After=network.target`

## Service段

定义服务的具体行为：

```ini
[Service]
Type=服务类型
ExecStart=启动命令
ExecStop=停止命令
ExecReload=重载命令
Restart=重启策略
RestartSec=重启间隔
User=运行用户
Group=运行用户组
WorkingDirectory=工作目录
Environment=环境变量
PIDFile=PID文件路径
```

### Type

- `Type`: 启动类型
  - `simple(默认)`: 启动 `ExecStart` 后立即认为服务已启动（主进程就是 `ExecStart` 的进程）。
  - `forking`:  传统守护进程，`ExecStart` 启动的进程会 fork 子进程，父进程退出：systemd 认为服务已启动（需配合 PIDFile=）
  - `notify`: 进程通过 `sd_notify` 通知 `systemd` 已准备好。
  - `oneshot`: 运行一个或多个短命命令,当 `ExecStart` `命令执行完成后退出，systemd` 就认为该服务启动成功。
  - `idle`: 延迟启动，直到系统空闲。

例如`Nginx`就是默认以`deamon`模式运行，所以可以配置为`forking`类型



### Restart
- `Restart`: 重启策略
  - `no（默认）`：不自动重启
  - `on-success`：只在正常退出时重启
  - `on-failure`：只在异常退出时重启
  - `on-abnormal`：在异常终止或超时时重启
  - `on-abort`：在收到未捕获信号终止时重启
  - `on-watchdog`：在看门狗超时时重启
  - `always`：总是重启

### WorkingDirectory

程序的工作目录,填写绝对路径

### ExecStart 启动命令

主启动命令（通常只写一个）。必须给出可执行文件的绝对路径或能被 `PATH` 解析（最好写绝对路径）  
```ini
ExecStart=/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
```

### ExecReload 重载命令

重载命令,如
```ini
ExecReload=/usr/local/nginx/sbin/nginx -s reload
```

### ExecStop 停止命令
用于控制如何结束进程
nginx为例
```ini
ExecStop=/bin/kill -s QUIT $MAINPID
```

### RestartSec 

重启前等待的秒数

### PIDFile

对于 `Type`为`forking`的服务，指示父进程写入 `PID` 的文件路径。

### Environment 

内联环境变量
```ini
Environment=NODE_ENV=production
Environment=PORT=8080
```

### EnvironmentFile 

从文件加载环境变量

```ini
EnvironmentFile=/etc/default/my-app    # 文件内变量格式：PORT=3000
```

设置在单元停止时，杀死进程的方法。
- `control-group`: 表示杀死该单元的 `cgroup` 内的所有进程(对于 `service` 单元，在杀死前还要先执行 `ExecStop` 动作)。
- `process`: 表示仅杀死主进程
- `mixed`: 表示首先向主进程发送 `SIGTERM` 信号(见下文)，然后向该单元的 cgroup 内的所有其他进程发送 `SIGKILL` 信号(见下文)。
- `none` 表示仅执行 `ExecStop` 动作，而不杀死任何进程。`none` 会导致：即使单元已经停止，但是该单元的 `cgroup` 依然一直存在，直到其中的进程全部死亡。
### 安全选项


- `NoNewPrivileges`: 禁止获取新权限
- `PrivateTmp`: 使用私有/tmp
- `ProtectSystem`:  保护系统目录
- `User`: 以指定用户运行
- `Group`: 以指定用户组运行


### 资源限制
- `LimitNOFILE`: 文件描述符限制
- `LimitNPROC`: 进程数限制
- `LimitMEMLOCK`:  内存锁定限制


## Install
定义服务的安装信息, 如怎样做到开机启动。
- `WantedBy`: target名称（如multi-user.target）
- `RequiredBy`: 必须依赖此服务的target
- `Also`: 同时启用的其他服务
- `Alias`: 服务别名

### WantedBy

指定了当服务被启用(使用)时，该服务应该被链接到哪个目标（target）。

`systemctl enable` 会为每个列出的单元创建一个符号链接 `/etc/systemd/system/<listed-unit>.wants/<this-unit>`

例如这个 `sshd.service` 的配置文件

```ini
[Install]
WantedBy=multi-user.target
```
当执行 `systemctl enable sshd.service` 后  
会在 `/etc/systemd/system/multi-user.target.wants` 目录下创建一个符号链接

最常见的用法是 `WantedBy=multi-user.target`，表示“系统进入 `multi-user.target` 时应启动此服务”


查看系统默认启动的`target`

```shell
> systemctl get-default
graphical.target # 或者是multi-user.target, 和系统版本有关

```

而因为`graphical.target`的配置,`multi-user.target`作为依赖也会启动
```ini
[Unit]
Description=Graphical Interface
Documentation=man:systemd.special(7)
Requires=multi-user.target
Wants=display-manager.service
Conflicts=rescue.service rescue.target
After=multi-user.target rescue.service rescue.target display-manager.service # [!code focus]
AllowIsolate=yes
```
### RequiredBy

与 `WantedBy` 类似，但建立的是强依赖 `Require`

### Alias
为单元定义一个或多个额外名字（别名）。
`enable` 一个服务时会在 `/etc/systemd/system/` 下为每个别名创建指向本单元的符号链接(例如 `Alias=foo.service` 会创建 `/etc/systemd/system/foo.service` → `/lib/.../this-unit.service`)


### Target的配置文件

`Target` 也有自己的配置文件。
上面的 `graphical.target` 配置文件的路径,就可以通过命令查看
```shell
>  systemctl show graphical.target
Id=graphical.target
Names=graphical.target runlevel5.target default.target
Requires=multi-user.target
Wants=display-manager.service systemd-update-utmp-runlevel.service
Conflicts=rescue.service shutdown.target rescue.target
Before=shutdown.target systemd-update-utmp-runlevel.service
After=display-manager.service multi-user.target rescue.service rescue.target
Documentation="man:systemd.special(7)"
Description=Graphical Interface
LoadState=loaded
ActiveState=active
FreezerState=running
SubState=active
FragmentPath=/lib/systemd/system/graphical.target # [!code warning]
UnitFileState=static
UnitFilePreset=enabled
```

## 完整示例

```ini
# /etc/systemd/system/my-node-app.service
[Unit]
Description=My Node.js App
After=network.target

[Service]
Type=simple
User=www
Group=www
WorkingDirectory=/srv/my-node-app
EnvironmentFile=/etc/default/my-node-app    # 文件格式：PORT=3000
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /srv/my-node-app/dist/index.js
Restart=on-failure
RestartSec=5
TimeoutStopSec=20
KillMode=mixed
# 安全与隔离（示例）
PrivateTmp=yes
ProtectSystem=full
NoNewPrivileges=yes
# 资源限制
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```