---
tags:
  - 开发/Git
  - Github
  - Verified
---

## 生成GPG密钥

运行 `gpg --full-generate-key`

根据提示选择 `RSA and RSA` 长度 4096, 接着输入一些个人信息和你的github的email

生成完毕后运行

`gpg --list-secret-keys --keyid-format=long`

就能看到刚刚生成的私钥了

## 查看公钥

运行以下命令查看生成的公钥

`gpg --list-keys --keyid-format=long`

记录下ID(sec或pub后的16进制字符串)

使用命令`gpg --armor --export ID`

导出PGP PUBLIC KEY BLOCK

将输出内容注册到Github上


## 设置Git使用key签名

为了让 Git 能使用你的 GPG key 签名，你必须先配置 Git 。

`git config --global user.signingkey ID`

设置完成后在使用commit的时候增加-s flag即可对该提交进行签名

也可以使用以下命令设置自动签名

`git config --global commit.gpgsign true`