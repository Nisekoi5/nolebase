---
tags:
  - aria2
---

# debian系统安装和配置aria2


##  安装Aria2
Debian系统可以可以直接通过软件源安装

```shell
apt update
apt install aria2
```

## 配置Aria2

首先创建一个目录放置Aria2的配置文件  
并创建一个可写的session文件,因为这个文件无法自动生成,所以需要手动创建这个文件  

```shell
mkdir /etc/aria2
touch /etc/aria2/aria2.session
chmod 777 /etc/aria2/aria2.session
```

然后创建并编辑配置文件`/etc/aria2/aria2.conf`

配置文件的中文注释使用了owenyk[^1]和zhuxiaoxi[^2]的文章

```ini
# '#'开头为注释内容, 选项都有相应的注释说明, 可以根据需要修改

################ 文件保存相关 ################
# 文件的保存路径(可使用绝对路径或相对路径), 默认: 当前启动位置
dir=/data/download/aria2
# 启用磁盘缓存, 0为禁用缓存, 需1.16以上版本, 默认:16M
disk-cache=1024M
# 文件预分配方式, 能有效降低磁盘碎片, 默认:prealloc
# 预分配所需时间: none < falloc ? trunc < prealloc
# falloc和trunc则需要文件系统和内核支持
# NTFS建议使用falloc, EXT3/4建议trunc, MAC 下需要注释此项
#file-allocation=none
# 断点续传
continue=true

################ 下载连接相关 ################
# 最大同时下载任务数, 运行时可修改, 默认:5
#max-concurrent-downloads=5
# 同一服务器连接数, 添加时可指定, 默认:1
max-connection-per-server=5
# 最小文件分片大小, 添加时可指定, 取值范围1M -1024M, 默认:20M
# 假定size=10M, 文件为20MiB 则使用两个来源下载; 文件为15MiB 则使用一个来源下载
min-split-size=10M
# 单个任务最大线程数, 添加时可指定, 默认:5
#split=5
# 整体下载速度限制, 运行时可修改, 默认:0
#max-overall-download-limit=0
# 单个任务下载速度限制, 默认:0
#max-download-limit=0
# 整体上传速度限制, 运行时可修改, 默认:0
#max-overall-upload-limit=0
# 单个任务上传速度限制, 默认:0
#max-upload-limit=0
# 禁用IPv6, 默认:false
#disable-ipv6=true
# 连接超时时间, 默认:60
#timeout=60
# 最大重试次数, 设置为0表示不限制重试次数, 默认:5
#max-tries=5
# 设置重试等待的秒数, 默认:0
#retry-wait=0

################ 下载配置相关 ################
# HTTP下载时使用的标头
# header=

################ 进度保存相关 ################
# 从会话文件中读取下载任务
input-file=/etc/aria2/aria2.session
# 在Aria2退出时保存`错误/未完成`的下载任务到会话文件
save-session=/etc/aria2/aria2.session
# 定时保存会话降低数据丢失风险。, 0为退出时才保存, 需1.16.1以上版本, 默认:0 
save-session-interval=60
# 不管任务是否下载完成，都会将进度信息保存到文件中
force-save=true

############## RPC相关设置 ##############
# 启用RPC, 默认:false
enable-rpc=true
# 允许所有来源, 默认:false
rpc-allow-origin-all=true
# 允许非外部访问, 默认:false
rpc-listen-all=true
# 事件轮询方式, 取值:[epoll, kqueue, port, poll, select], 不同系统默认值不同
#event-poll=select
# RPC监听端口, 端口被占用时可以修改, 默认:6800
rpc-listen-port=6800
# 设置的RPC授权令牌, v1.18.4新增功能, 取代 --rpc-user 和 --rpc-passwd 选项
rpc-secret=XXXXXX
# 设置的RPC访问用户名, 此选项新版已废弃, 建议改用 --rpc-secret 选项
#rpc-user=<USER>
# 设置的RPC访问密码, 此选项新版已废弃, 建议改用 --rpc-secret 选项
#rpc-passwd=<PASSWD>
# 是否启用 RPC 服务的 SSL/TLS 加密,
# 启用加密后 RPC 服务需要使用 https 或者 wss 协议连接
#rpc-secure=true
# 在 RPC 服务中启用 SSL/TLS 加密时的证书文件,
# 使用 PEM 格式时，您必须通过 --rpc-private-key 指定私钥
#rpc-certificate=/path/to/certificate.pem
# 在 RPC 服务中启用 SSL/TLS 加密时的私钥文件
#rpc-private-key=/path/to/certificate.key

################ BT/PT下载相关 ################

# 当下载的是一个种子(以.torrent结尾)时, 自动开始BT任务, 默认:true
#follow-torrent=true
# BT监听端口, 当端口被屏蔽时使用, 默认:6881-6999
#listen-port=51413
# 单个种子最大连接数, 默认:55
#bt-max-peers=55
# 打开DHT功能, PT需要禁用, 默认:true
#enable-dht=false
# 打开IPv6 DHT功能, PT需要禁用
#enable-dht6=false
# DHT网络监听端口, 默认:6881-6999
#dht-listen-port=6881-6999
# 本地节点查找, PT需要禁用, 默认:false
#bt-enable-lpd=false
# 种子交换, PT需要禁用, 默认:true
#enable-peer-exchange=false
# 每个种子限速, 对少种的PT很有用, 默认:50K
#bt-request-peer-speed-limit=50K
# 客户端伪装, PT需要
#peer-id-prefix=-TR2770-
#user-agent=Transmission/2.77
# 当种子的分享率达到这个数时, 自动停止做种, 0为一直做种, 默认:1.0
#seed-ratio=0
# 强制保存会话, 即使任务已经完成, 默认:false
# 较新的版本开启后会在任务完成后依然保留.aria2文件
#force-save=false
# BT校验相关, 默认:true
#bt-hash-check-seed=true
# 继续之前的BT任务时, 无需再次校验, 默认:false
#bt-seed-unverified=true
# 保存磁力链接元数据为种子文件(.torrent文件), 默认:false
#bt-save-metadata=true

# 事件回调 ，可以结合脚本，实现很多自定义功能
# Aria2 会在特定的时候，调用指定的脚本程序，然后将相关的参数传递进去
# on-download-complete=/Users/apple/脚本放置的目录/on-download-complete.py
# 对于BitTorrent在下载完成并且播种结束后调用指定的命令
# on-bt-download-complete=/Users/apple/脚本放置的目录/on-bt-download-complete.py
# 设置下载因错误导致中止后执行的命令
#on-download-error=/Users/apple/脚本放置的目录/on-download-error.py
# 设置下载暂停后要执行的命令。
#on-download-pause=/Users/apple/脚本放置的目录/on-download-pause.py
# 设置下载开始后要执行的命令。
#on-download-start=/Users/apple/脚本放置的目录/on-download-start.py
# 设置下载停止后要执行的命令。
#on-download-stop=/Users/apple/脚本放置的目录/on-download-stop.py

```

## 运行aria2

运行以下命令可以直接在前台启动aria2
```shell
aria2c --conf-path=/etc/aria2/aria2.conf
```
如果需要在后台运行aria2, 可以使用`screen`命令或者添加`-D`参数启动后台进程

## 创建启动服务

为了方便管理Aria2, 可以创建启动服务, 并设置开机启动
在`/etc/systemd/system`目录下创建`aria2.service`文件

```ini
[Unit]
Description=Aria2
After=network.target

[Service]
Type=forking
User=root
ExecStart=/usr/bin/aria2c -D --conf-path=/etc/aria2/aria2.conf
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

然后运行以下命令使服务生效

```shell
systemctl daemon-reload
systemctl enable aria2
```

最后启动`Aria2`服务就完成了。可以连接RPC来下载文件

```shell
systemctl start aria2
```

[^1]:https://owenyk.github.io/2021/08/25/Aria2%E5%9C%A8Debian11%E4%B8%8B%E7%9A%84%E9%85%8D%E7%BD%AE/#comment-waline
[^2]:https://www.cnblogs.com/zhuxiaoxi/p/7714457.html