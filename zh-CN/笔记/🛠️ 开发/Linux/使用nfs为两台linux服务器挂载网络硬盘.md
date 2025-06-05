---
tags:
  - nfs
---

# 使用NFS来共享存储空间

NFS全称`Network File System(网络文件系统)`,常用于两台VPS内网保存数据或者备份，比如一台高性能VPS，一台存储型VPS。

可以使用nfs把存储型VPS的存储空间挂载到高性能VPS上,同时实现高性能和大容量。是一种性价比很高的解决方案。

并且如果是通过内网挂载,则基本不会损失什么性能。不过如果使用公网挂载随机读写性能会很差。

参考了hostloc的帖子[^1]

## 安装软件
服务端安装
```shell
apt-get install nfs-kernel-server
```
客户端安装
```shell
apt-get install nfs-common
```

## 为服务端创建目录并且设置导出规则

可选,也可以直接挂载`home`目录
```shell
mkdir /home/share
```
然后编辑`/etc/exports`设置导出规则

其中`1.1.1.1`是客户端的IP地址,只有这个IP可以挂载目录

```vim
/home/share 1.1.1.1(rw,nohide,insecure,no_subtree_check,no_root_squash,sync)
```
后方括号内的flag
| flag | 简介 |
| --------- | ----- | 
| rw | 允许客户端读写共享目录 |
| ro |  客户端仅可读（默认值）|
| nohide  | 若父目录和子目录分别导出，客户端需分别挂载。使用 nohide 后，客户端挂载父目录时可直接访问已导出的子目录 |
| sync  | 写入操作需同步到磁盘后才响应客户端，确保数据一致性，但性能较低 |
| async  | 写入操作先缓存再异步写入，性能更高，但可能丢失未提交的数据 |
| no_subtree_check  | 禁用子目录检查,禁用此检查可提升性能，但可能引入安全风险 |
| no_root_squash   | 远程root用户保持root权限，存在安全风险（仅限受信环境使用） |
| root_squash  | 将远程root用户映射为匿名用户(通常是 nobody)，提升安全性  |

设置完之后需要重启服务端

```shell
systemctl restart nfs-kernel-server
```

## 挂载目录
其中`1.1.1.0`是服务端IP, `/data` 是设置的导出目录 `/mnt/data` 是挂载目录

```shell
 mount -t nfs4 -o proto=tcp,port=2049 1.1.1.0:/home/share /path/to/mount
```

## 开机自动挂载

编辑`/etc/fstab`并写入以下规则

```vim
1.1.1.0:/home/share /path/to/mount nfs4 _netdev,auto 0 0
```

[^1]: https://hostloc.com/forum.php?mod=redirect&goto=findpost&ptid=584775&pid=7112639
