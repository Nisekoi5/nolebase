---
tags:
  - Celery
  - 开发/语言/Python
---

# Celery 入门使用教程

## 什么是 Celery

Celery 是一个基于 Python 的异步任务队列，它可以轻松地将耗时的任务分发到多个 worker 进程中，并将结果返回给调用者。  
官网: https://docs.celeryq.dev/en/stable/  
经常被用来大量的长时间任务的异步执行， 如上传下载大文件, 发送邮件, 处理图片等。

## 安装 Celery
使用PIP安装即可
```shell
pip install celery
```
此外需要消息队列`Broker`和存储后端`result_backend`，`Broker`用于存储任务信息，存储后端用于保存任务结果。  
这里以 `Redis` 同时作为消息队列`Broker`存储后端。  
如果是对稳定性要求比较高的业务更推荐使用 `RabbitMQ` 作为消息队列`Broker`。并将任务结果保存到数据库

## 最小示例
```python
from celery import Celery

app = Celery('tasks', broker='redis://localhost:6379/0', backend='redis://localhost:6379/0')

@app.task
def add(x, y):
    return x + y

result = add.delay(2, 3)
print(result.get())  # 5
```

这是最简单的示例，创建一个 `Celery` 实例，指定消息队列`Broker`和存储后端，定义一个任务 `add` ，
使用`app.task()`装饰器可以将任何可调用函数创建为一个 `Celery` 任务。
并使用 `delay` 方法将任务发送到消息队列。
调用 `get` 方法可以同步获取任务结果。这种使用情况比较少。因为这样就丧失了异步的意义。




## 主应用
`Celery` 库在使用前必须被实例化，这个实例被称为应用程序或者简称为`app`。
该应用程序是线程安全的，因此具有不同配置、组件和任务的多个 `Celery` 应用程序可以在同一个进程空间中共存。

### 配置

您可以设置几个选项来改变 `Celery` 的工作方式。这些选项可以直接在应用实例上设置，也可以使用专用的配置模块。  

可用配置如下: https://docs.celeryq.dev/en/stable/reference/celery.app.utils.html#celery.app.utils.Settings
::: info 提示
转到[配置参考](https://docs.celeryq.dev/en/stable/userguide/configuration.html#configuration)以获取所有可用设置及其默认值的完整列表。
:::

[app.confconfig_from_object()](https://docs.celeryq.dev/en/stable/reference/celery.html#celery.Celery.config_from_object)从配置对象加载配置。
这可以是一个配置模块，或者任何具有配置属性的对象。  
请注意，任何先前设置的配置在`config_from_object()`调用时都将被重置。如果您想设置其他配置，请在此之后进行。   

1. 使用模块名称
``` python 
celery.config_from_object('myapp.celeryconfig')
```

2. 使用模块对象  
``` python 
from myapp import celeryconfig
celery.config_from_object(celeryconfig)
```
3. 使用配置类/对象

``` python 
from celery import Celery

app = Celery()

class Config:
    enable_utc = True
    timezone = 'Europe/London'

app.config_from_object(Config)
```

[app.config_from_envvar()](https://docs.celeryq.dev/en/stable/reference/celery.html#celery.Celery.config_from_envvar) 从环境变量中获取配置模块名称

```python
import os
from celery import Celery

#: Set default configuration module name
os.environ.setdefault('CELERY_CONFIG_MODULE', 'celeryconfig')

app = Celery()
app.config_from_envvar('CELERY_CONFIG_MODULE')
```

## 定义任务
任务是一个可由任何可调用函数创建的类。它扮演双重角色，既定义了任务被调用（发送消息）时发生的情况，也定义了工作器接收到该消息时发生的情况。  
每个任务类都有一个唯一的名称，并且该名称在消息中被引用，以便工作者可以找到要执行的正确函数。  
任务消息只有在被 Worker 消费后才会从队列中移除。Worker 可以提前保留多条消息，即使该 Worker 因断电或其他原因被终止，消息也会被重新投递给其他 Worker。  


::: warning 确保任务不会无限期地阻塞

无限期的阻塞任务可能会阻止 Worker 实例执行任何其他工作。  
因此，请确保您的任务不会无限期地阻塞。或者添加超时设置  
`time_limit`便于确保所有任务都能及时返回，但这会强制杀死进程，因此只有在尚未使用手动超时的情况下才会使用它们。
:::

还可以为任务设置许多选项，这些选项可以指定为装饰器的参数：

```python
@app.task(name='tasks.add', bind=True, max_retries=3, default_retry_delay=30)
def add(self, x, y):
    return x + y
```
常用的选项有：
- `name`：任务的名称，默认值为模块名加函数名。
- `bind`：是否将任务实例绑定到函数上，这样就可以使用函数的第一个参数 `self` 来访问实例属性。
- `max_retries`：最大重试次数，默认值为 3。
- `default_retry_delay`：默认重试延迟，默认值为 3 分钟。  
- `rate_limit`: 任务执行频率限制，设置为None表示不限制。
- `time_limit`: 单独为此任务设置的硬性时间限制，以秒为单位。未设置时，将使用celery设置的值
- `ignore_result`: 不存储任务状态。这意味着您无法使用`AsyncResult`来检查任务是否已准备就绪，也无法获取其返回值。如果您不关心任务的结果，请务必设置该 ignore_result选项，因为存储结果会浪费时间和资源。

更多选项请参考[官方文档](https://docs.celeryq.dev/en/stable/userguide/tasks.html#task-options)

### 绑定任务

`绑定任务`是指将任务实例绑定到函数上，这样就可以使用函数的第一个参数 `self` 来访问实例属性。 
绑定任务用于重试任务(使用app.Task.retry())，访问有关当前任务请求的信息等功能

```python
@app.task(bind=True)
def tweet(self, auth, message):
    twitter = Twitter(oauth=auth)
    try:
        twitter.post_status_update(message)
    except twitter.FailWhale as exc:
        # 五分钟后重试
        raise self.retry(countdown=60 * 5, exc=exc)
```

### 任务请求

`app.Task.request` 包含与当前正在执行的任务相关的信息和状态。这也可以从`self.request`中得到  
[请求对象](https://docs.celeryq.dev/en/stable/userguide/tasks.html#task-request)包含的属性请查看官方文档


### 日志记录
Celery 使用 Python 的标准日志记录模块 `logging` 来记录任务的执行情况。  
你也可以使用`print()`,默认情况下，Celery 会将任何写入标准out/-err的内容重定向到日志系统。  

芹菜使用标准的Python日志库，文档可以在这里找到。你也可以使用print()，因为任何写入标准out/-err的内容都会被重定向到日志系统  
您可以禁用此功能，请参阅 [worker_redirect_stdouts](https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-worker_redirect_stdouts)

### 自动重试已知异常

`在 4.0 版本中可用`
有时，您只想在出现特定异常时重试任务。  
你可以使用 `app.task()` 装饰器中的 `autoretry_for` 参数告诉 Celery 自动重试任务

如果要为内部 `retry() ` 调用指定自定义参数，请将 `retry_kwargs` 参数传递给 app.task() 装饰器

```python
@app.task(autoretry_for=(FailWhaleError,),
          retry_kwargs={'max_retries': 5})
def refresh_timeline(user):
    return twitter.refresh_timeline(user)
```

上面的配置相当于

```python
@app.task
def refresh_timeline(user):
    try:
        twitter.refresh_timeline(user)
    except FailWhaleError as exc:
        raise refresh_timeline.retry(exc=exc, max_retries=5)
```

### 使用 Pydantic 进行参数验证

`Pydantic` 是一个第三方库，它可以用来进行参数验证。  
只需要在`app.task()`装饰器中添加设置`pydantic=True`参数

::: warning 不支持联合类型，泛型参数
:::

```python
from pydantic import BaseModel

class ArgModel(BaseModel):
    value: int

class ReturnModel(BaseModel):
    value: str

@app.task(pydantic=True)
def x(arg: ArgModel) -> ReturnModel:
    # args/kwargs type hinted as Pydantic model will be converted
    assert isinstance(arg, ArgModel)

    # The returned model will be converted to a dict automatically
    return ReturnModel(value=f"example: {arg.value}")
```
然后可以使用与模型匹配的字典调用该任务，您将收到dump后返回的模型使用 `BaseModel.model_dump()` 进行序列化：

```python
result = x.delay({'value': 1})
result.get(timeout=1)
# {'value': 'example: 1'}
```


<!-- ### 任务类
所有任务都继承自`app.Task`该类。`run()`方法成为任务执行主体。 -->

### 任务钩子

Celery 提供了许多钩子，可以用来在任务执行的不同阶段进行自定义操作。  
这些钩子可以用来记录任务执行情况，发送通知，执行数据清理等。  
这些钩子可以被定义为任务类的属性，也可以被定义为任务类的装饰器。
详情查看: https://docs.celeryq.dev/en/stable/userguide/tasks.html#handlers
 


## 执行任务

API 定义了一组标准的执行选项，以及三种方法：

- apply_async(args[, kwargs[, …]])

  - 发送任务消息。

- delay(*args, **kwargs)

  - 发送任务消息的快捷方式，但不支持设置执行选项。

- 调用(\_\_call\_\_)

  - 应用支持调用 API 的对象（例如）意味着该任务将不会由工作者执行，而是在当前进程中执行（不会发送消息）。add(2, 2)


::: tip 使用备忘录
- T.delay(arg, kwarg=value)

    - `apply_async` 的快捷方式 (.delay(*args, **kwargs) 调用 .apply_async(args, kwargs)).

- T.apply_async((arg,), {'kwarg': value})

- T.apply_async(countdown=10)

    - 10秒后执行

- T.apply_async(eta=now + timedelta(seconds=10))

    - 从现在起10秒内执行，使用eta指定执行时间。

- T.apply_async(countdown=60, expires=120)

    - 从现在起一分钟内执行，但两分钟后失效。

- T.apply_async(expires=now + timedelta(days=2))

    - 2天后过期，使用datetime设置。
:::


::: warning
后端使用资源来存储和传输结果。为了确保资源得到释放，您必须 在调用任务后返回的每个实例上最终调用`get()`,`forget()`和`AsyncResult()`
:::

### 例子

该使用[delay()](https://docs.celeryq.dev/en/stable/reference/celery.app.task.html#celery.app.task.Task.delay)方法很方便，因为它看起来像调用常规函数
```python
task.delay(arg1, arg2, kwarg1='x', kwarg2='y')
```
相反[apply_async()](https://docs.celeryq.dev/en/stable/reference/celery.app.task.html#celery.app.task.Task.apply_async)，你必须这样写：

```python
task.apply_async((arg1, arg2), {'kwarg1': 'x', 'kwarg2': 'y'})
```

此外还有一种链式调用的方法,这将在下文提到

### 链接任务

`Celery` 支持使用link将多个任务连接在一起，以便一个任务紧接着另一个任务执行。回调任务将使用父任务的结果作为部分参数进行调用：  
仅当任务成功退出时才会应用回调，并且将使用父任务的返回值作为参数。  
```python
add.apply_async((2, 2), link=add.s(16))
```

这里，第一个任务的结果4将被发送到一个新任务，该任务将前一个结果加 16，形成表达式 (2 + 2) + 16 = 20



::: tip 
这里使用的调用add.s称为签名[signature](https://docs.celeryq.dev/en/stable/reference/celery.html#celery.signature)

使用 [chain](https://docs.celeryq.dev/en/stable/reference/celery.html#celery.chain) 一种更简单的将任务链接在一起的方法
:::



你也可以在任务抛出异常 `errback` 时触发回调。工作进程实际上并不会以任务的方式调用 `errback`，而是直接调用 `errback` 函数，以便将原始的请求、异常和 traceback 对象传递给它。

这是一个`errback`的示例：

```python
@app.task
def error_handler(request, exc, traceback):
    print('Task {0} raised exception: {1!r}\n{2!r}'.format(
          request.id, exc, traceback))
```

`link`和`link_error`选项都可以传递列表：

```python
add.apply_async((2, 2), link=[add.s(16), other_task.s()])
```

### signature(签名)

刚刚学习了如何使用调用指南中的`delay`方法调用任务，这通常就是您所需要的，但有时您可能希望将任务调用的签名传递给另一个进程或作为参数传递给另一个函数。

`signature()`以某种方式包装单个任务调用的参数、关键字参数和执行选项，以便可以将其传递给函数，甚至可以序列化并通过网络发送。

- 您可以使用添加任务的名称为其创建签名，如下所示：
  ```python
  from celery import signature
  signature('tasks.add', args=(2, 2), countdown=10)
  # tasks.add(2, 2)
  ```
  该任务的签名为2（两个参数）：（2,2），并将倒计时执行选项设置为10
- 或者您可以使用任务的`signature`方法创建：
  ```python
  add.signature((2, 2), countdown=10)
  # tasks.add(2, 2)
  ```
- 还有一个快捷方式：
  ```python
  add.s(2, 2)
  ```
  使用`s()`不能定义任务选项，但链接`set()`调用可以解决这个问题  
  `add.s(2, 2).set(countdown=1)`
- 支持关键字参数：
    ```python
  add.s(2, 2, countdown=10)
  # tasks.add(2, 2, debug=True)
  ```
- 可以从签名示例来检查任务的选项：
  ```python
  s = add.signature((2, 2), {'debug': True}, countdown=10)
  s.args
  # (2, 2)
  s.kwargs
  # {'debug': True}
  s.options
  # {'countdown': 10}
   ```

- 调用签名delay， apply_async和__call__
  调用签名的__call__将在当前进程中执行任务：
  ```python
  add(2, 2)
  #　4
  add.s(2, 2)()
  # 4
  ```
  使用`delay()`或`apply_async()`可以通过worker执行任务
  ```python
  add.apply_async((2, 2), countdown=1)
  add.signature((2, 2), countdown=1).apply_async()
  ```


#### 不可变签名

签名可以是部分的，因此可以将参数添加到现有参数中，但您可能并不总是希望这样做，例如，如果您不想要链中上一个任务的结果。  
在这种情况下，您可以将签名标记为不可变，以便参数不能被更改：  
```python
add.signature((2, 2), immutable=True)
# si()是创建不可变签名的快捷方式，这是创建签名的首选方法：
add.si(2, 2)
```
当签名不可变时，只能设置执行选项，因此不可能使用partials args/kwargs调用签名。

此外您还可以克隆签名详见[clone()](https://docs.celeryq.dev/en/stable/reference/celery.html#celery.Signature.clone)


```python
s = add.s(2)
proj.tasks.add(2)

s.clone(args=(4,), kwargs={'debug': True})
proj.tasks.add(4, 2, debug=True)
```


### partials(柯里化)
为 apply_async/delay 指定的args 、kwargs。会创建 partials

- 添加的任何参数都将添加到签名中的参数前面：
  ```python
  partial = add.s(2)          # incomplete signature
  partial.delay(4)            # 4 + 2
  partial.apply_async((4,))   # 相同 4 + 2
  ```
- 添加的任何关键字参数都将与签名中的 kwargs 合并，新的关键字参数优先：
  ```python
  s = add.s(2, 2)
  s.delay(debug=True)                    # -> add(2, 2, debug=True)
  s.apply_async(kwargs={'debug': True})  # 相同
  ```
- 任何添加的选项都将与签名中的选项合并，新选项优先：
  ```python
  s = add.signature((2, 2), countdown=10)
  s.apply_async(countdown=1)  # countdown 现在被覆盖为1
  ```






### Primitives(原语)

Primitives是一个签名，它接收一个应并行执行的任务列表。  
Primitives本身也是签名对象，因此它们可以以任意数量的方式组合以组成复杂的工作流程

chain就是一种Primitives，它将任务列表链接在一起，以便一个接一个地调用

更多的概述请查看官方文档: https://docs.celeryq.dev/en/stable/userguide/canvas.html#the-primitives

### chain(链式调用)

这是一个简单的链，第一个任务执行并将其返回值传递给链中的下一个任务，依此类推。


```python
from celery import chain

# 2 + 2 + 4 + 8
res = chain(add.s(2, 2), add.s(4), add.s(8))()
res.get()
# 16
```
也可以使用|(管道)运算符来创建链：
```python
(add.s(2, 2) |  add.s(4) | add.s(8))()
res.get()
# 16
```
它还设置parent属性，以便您可以按照链的方式获取中间结果：
```python
res.parent.get()
# 8

res.parent.parent.get()
# 4
```

::: tip 
使用不可变签名可以不接受链中上一个任务的结果。
:::


### 序列化
客户端和工作者之间传输的数据需要序列化，因此 `Celery` 中的每条消息都有一个`content_type`标头，描述用于对其进行编码的序列化方法

默认序列化器是JSON  ，但您可以使用设置[task_serializer](https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-task_serializer)、针对每个单独的任务甚至每条消息更改它。


### 指定路由
`Celery` 可以将任务路由到不同的队列。以便于不同的worker执行

简单的路由选择(名称 <-> 名称)可通过执行任务时使用`queue`选项实现
```python
add.apply_async(queue='priority.high')
```
然后，您可以为该`priority.high`分配worker。使用workers -Q参数设置队列
```shell
celery -A proj worker -l INFO -Q celery,priority.high
```
::: tip 
不建议在代码中硬编码队列名称，最佳做法是使用配置路由器[task_routes](https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-task_routes)。

要了解有关路由的更多信息，请参阅路由任务。
:::




## 配置路由

### 自动路由

`celery`默认使用[task_create_missing_queues](https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-task_create_missing_queues)开启自动路由   
启用此设置后，将自动创建一个尚未定义的命名队列 [task_queues](https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-task_queues)。这使得执行简单的路由任务变得容易。





但假设您有两台服务器x和y用于处理常规任务，还有一台服务器z用于处理 `feed` 相关任务。您可以使用以下配置  
来根据任务名称来配置路由队列：
```python
task_routes = {'feed.tasks.import_feed': {'queue': 'feeds'}}
```
启用此路由后，导入 feed 任务将被路由到 `feeds`队列，而所有其他任务将被路由到默认队列(由于历史原因名为`celery`) 

或者，您可以使用全局模式匹配，甚至正则表达式来匹配`feed.tasks`命名空间中的所有任务：
```python
app.conf.task_routes = {'feed.tasks.*': {'queue': 'feeds'}}
```

如果匹配模式的顺序很重要，则应该以项目格式指定路由：

```python
task_routes = ([
    ('feed.tasks.*', {'queue': 'feeds'}),
    ('web.tasks.*', {'queue': 'web'}),
    (re.compile(r'(video|image)\.tasks\..*'), {'queue': 'media'}),
],)
```

::: info
该[task_queues](https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-task_queues)设置可以是字典，也可以是路由器对象列表，因此在这种情况下，我们需要将设置指定为包含列表的元组。
:::

配置路由器后，您可以启动服务器z来仅处理 `feeds` 队列的任务，如下所示：

```shell
celery -A proj worker -Q feeds
```

您可以根据需要指定任意数量的队列，因此您也可以让该服务器处理默认队列：

```shell
celery -A proj worker -Q feeds,celery
```

#### 更改默认队列名称
您可以使用以下配置更改默认队列的名称：
```python
app.conf.task_default_queue = 'default'
```



## worker(工人)
`worker` 是 `Celery` 的主要组件，负责执行任务。


### 启动worker
您可以通过执行以下命令在前台启动工作器：
```shell
celery -A proj worker -l INFO
```

可以在同一台机器上启动多个 `Worker`，但一定要使用 [--hostname](https://docs.celeryq.dev/en/stable/reference/cli.html#cmdoption-celery-worker-n) 参数指定节点名称，为每个`Worker` 命名：



### 停止worker
应当使用 TERM 信号来优雅地关闭。


当关闭启动后，worker 会在真正退出前先完成所有当前正在执行的任务。如果这些任务很重要，你应该等它们执行完毕后再做其它激烈操作(比如发送 KILL 信号)。

如果工作者在经过相当长的时间后仍未关闭，例如陷入无限循环或类似情况，则可以使用KILL信号强制终止工作者：但请注意，当前正在执行的任务将会丢失（除非任务设置了[acks_late](https://docs.celeryq.dev/en/stable/reference/celery.app.task.html#celery.app.task.Task.acks_late)选项）。
另外，由于进程无法覆盖该KILL信号，工作进程将无法收获其子进程；请务必手动操作。以下命令通常可以解决问题：

```shell
pkill -9 -f 'celery worker'
```


### 自动重连

在某些情况下5.3版本的新功能
除非[broker_connection_retry_on_startup](https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-broker_connection_retry_on_startup)设置为 `False，否则` `Celery` 将在第一次连接丢失后自动重试重新连接到代理。

[broker_connection_retry](https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-broker_connection_retry) 用来控制是否自动重试重新连接到代理以进行后续重新连接。