---
tags:
  - python单元测试
  - python/单元测试
  - unittest
---

# Python 单元测试入门的全面指南

::: tip
编写中
:::


## 前言
::: info

本页面参考了网上其他的教程，并且融合了自己的一些理解。便于自己后续查阅。  
官方文档: https://docs.python.org/zh-cn/3.13/library/unittest.html

:::


单元测试是用来对一个模块、一个函数或者一个类来进行正确性检验的测试工作。

如果单元测试通过，说明我们测试的这个函数能够正常工作。如果单元测试不通过，要么函数有bug，要么测试条件输入不正确，总之，需要修复使单元测试能够通过。

单元测试通过后有什么意义呢？如果我们对abs()函数代码做了修改，只需要再跑一遍单元测试，如果通过，说明我们的修改不会对abs()函数原有的行为造成影响，如果测试不通过，说明我们的修改与原有行为不一致，要么修改代码，要么修改测试。

这种以测试为驱动的开发模式最大的好处就是确保一个程序模块的行为符合我们设计的测试用例。在将来修改的时候，可以极大程度地保证该模块行为仍然是正确的。[^1]

例如，我们在编写一个函数时：

```python
def add(x, y):
    return x + y
```
我们可以编写一个测试用例来验证这个函数的正确性：

```python
def test_add():
    assert add(1, 2) == 3
    assert add(0, 0) == 0
    assert add(-1, 1) == 0
    assert add(1000, -2000) == -1000
```

通过运行这个测试，我们可以验证`add`函数是否正常工作[^2]




## 上手尝试

单元测试可以使用python的内置模块`unittest`,该模块提供了一系列创建和运行测试的工具。

测试用例是通过子类化 `unittest.TestCase` 来创建的。 这三个单独的测试是使用名称以 test 打头的方法来定义的。 这样的命名惯例可告知测试运行者哪些方法是表示测试的。[^3]


```python

import unittest

class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # 检查当分隔符不为字符串时 s.split 是否失败
        with self.assertRaises(TypeError):
            s.split(2)

if __name__ == '__main__':
    unittest.main()


```

每个测试的关键是：调用 `assertEqual()` 来检查预期的输出； 调用 `assertTrue()` 或 `assertFalse()` 来验证一个条件；调用 `assertRaises()` 来验证抛出了一个特定的异常。使用这些方法而不是 assert 语句是为了让测试运行者能聚合所有的测试结果并产生结果报告。

通过 `setUp()` 和 `tearDown()` 方法，可以设置测试开始前与完成后需要执行的指令。 在 组织你的测试代码 中，对此有更为详细的描述。

最后的代码块中，演示了运行测试的一个简单的方法。 `unittest.main()` 提供了一个测试脚本的命令行接口。当在命令行运行该测试脚本，上文的脚本生成如以下格式的输出:



``` shell

----------------------------------------------------------------------
Ran 3 tests in 0.000s

OK

```

::: tip
 多个测试运行的顺序由内置字符串排序方法对测试名进行排序的结果决定。
:::



### 运行测试脚本
在调用测试脚本时添加 `-v` 参数使 unittest.main() 显示更为详细的信息，生成如以下形式的输出:

不过通常使用命令行运行测试脚本。各大IDE也提供图形化的页面来运行测试。
``` shell
python -m unittest test_module1 test_module2
python -m unittest test_module.TestClass
python -m unittest test_module.TestClass.test_method
```
可以传入模块名、类或方法名或他们的任意组合。





## 定义

在unittest模块中，我们有以下几个重要的概念：[^2]

- 测试用例（Test Case）：一个测试用例就是一个完整的测试流程，包括测试前的准备环节、执行测试动作和测试后的清扫环节。在`unittest`模块中，一个测试用例就是一个unittest.TestCase的实例。
- 测试套件（Test Suite）：测试套件是一系列的测试用例或测试套件的集合。我们可以使用`unittest.TestSuite`类来创建测试套件。
- 测试运行器（Test Runner）：测试运行器是用来执行和控制测试的。我们可以使用`unittest.TextTestRunner`类来创建一个简单的文本测试运行器。


```python
import unittest

class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())



if __name__ == '__main__':
    suite = unittest.TestSuite()
    suite.addTest(TestStringMethods('test_upper'))
    suite.addTest(TestStringMethods('test_isupper'))
    unittest.TextTestRunner().run(suite)

```

在上面这个案例中,我们创建了一个测试用例`TestStringMethods`,然后创建了一个测试套件`suite`  
并添加了两个测试用例`test_upper`和`test_isupper`到测试套件中。最后，我们使用`unittest.TextTestRunner()`来运行测试套件。

## 钩子函数

有时，我们需要在测试用例执行前后执行一些额外的操作，比如清理测试环境、创建测试数据等。这时，我们可以使用 `setUp()` 和 `tearDown()` 方法。
此外还有`setUpClass`和`tearDownClass`,这两个方法在整个测试类运行前后运行一次。

### setUp 和 tearDown

`setUp()` 方法在每个测试用例执行前被调用。  
`tearDown()` 方法在每个测试用例执行后被调用。

如果在 `setUp` 中引发了异常, 则该测试用例将不会被运行并且 `tearDown` 也不会被运行。    
跳过的测试用例的 `setUp` 或 `tearDown` 将不会被运行。 如果引发的异常是 `SkipTest` 异常则测试用例将被报告为已跳过而非发生错误。

适用场景：方法级别的准备/清理，例如为每个测试创建一个http连接客户端、创建临时文件等。





### setUpClass 和 tearDownClass

`setUpClass()` 方法在整个测试类运行前被调用。  
`tearDownClass()` 方法在整个测试类运行后被调用。

如果在 `setUpClass` 中引发了异常, 则该类中的测试将不会被运行并且 `tearDownClass` 也不会被运行。  
跳过的类中的 `setUpClass` 或 `tearDownClass` 将不会被运行。 如果引发的异常是 `SkipTest` 异常则类将被报告为已跳过而非发生错误。

适用场景：类级别的资源准备/销毁，比如为一整组测试建立数据库连接池、加载大型测试数据集等。

::: tip
必须使用 `classmethod()` 装饰器实现为类方法
:::


### setUpModule 和 tearDownModule
`setUpModule `在该模块中所有测试开始前只调用一次。  
`tearDownModule` 在该模块中所有测试结束后只调用一次。



如果在 `setUpModule` 中引发了异常则模块中的任何测试都将不会被运行并且 `tearDownModule` 也不会被运行
如果引发的异常是 `SkipTest` 异常则模块将被报告为已跳过而非发生错误。

适用场景：模块级别的资源准备/销毁，例如启动一个共享的数据库服务、在磁盘上创建临时目录等。

::: tip
应当被实现为函数,直接在模块顶层，不能放到类里面。
:::

## 跳过测试
有时，我们只想运行部分测试，跳过其他的测试。这时，我们可以使用 `unittest.skip()` 或 `unittest.skipIf()` 装饰器。

```python
class MyTestCase(unittest.TestCase):

    @unittest.skip("demonstrating skipping")
    def test_nothing(self):
        self.fail("shouldn't happen")

    @unittest.skipIf(mylib.__version__ < (1, 3),
                     "not supported in this library version")
    def test_format(self):
        # 测试其是否仅适用于特定的库版本。
        pass

    @unittest.skipUnless(sys.platform.startswith("win"), "requires Windows")
    def test_windows_support(self):
        # Windows 专属的测试代码
        pass

    def test_maybe_skipped(self):
        if not external_resource_available():
            self.skipTest("external resource not available")
        # 依赖于外部资源的测试代码
        pass

```


在 `setUp()` 内部使用 `TestCase.skipTest()`，或是直接引发`SkipTest`异常以跳过一个测试


[跳过测试与预计的失败](https://docs.python.org/zh-cn/3.13/library/unittest.html#skipping-tests-and-expected-failures)

::: tip
被跳过的测试的 `setUp()` 和 `tearDown()` 不会被运行。  
被跳过的类的 `setUpClass()` 和 `tearDownClass()` 不会被运行。  
被跳过的模块的 `setUpModule()` 和 `tearDownModule()` 不会被运行。
:::


## mock(模拟对象)

在编写单元测试时，我们有时需要模拟一些外部的、不可控的因素，如时间、数据库、网络请求等。  
`unittest.mock`模块提供了一种创建模拟对象的方法，我们可以用它来模拟外部的、从而避免依赖服务的干扰，专注测试所需的模块。


### Mock类

`Mock`类是使用十分简单，直接创建`Mock`对象，简单情况下只需要通过`return_value` 指定返回值，代码如下所示：

```python
from unittest.mock import Mock
m = Mock(return_value=3)
assert m() == 3
```
这个对象会在执行之后始终返回`3`，在测试中如果有模块需要返回特定值，就可以使用`Mock`类进行替换
对该对象的调用将被记录在 `call_args` 和 `call_args_list` 等属性中。

此外`Mock`类还支持设置很多其他参数，其中最常用和重要的就是`side_effect`。  
每当调用 `Mock` 时都会调用这个函数(如果有)
- 如果 `side_effect` 是一个函数，则调用`mock`将返回该函数的结果  
- 如果 `side_effect` 是一个函数，则调用`mock`引发该异常  
- 如果 `side_effect` 是一个可迭代对象，则异步函数将返回该可迭代对象的下一个值，但是，如果结果序列被耗尽，则会立即引发 `StopAsyncIteration`

如果该函数返回 `DEFAULT` 则该 `mock` 将返回其正常值 (来自 `return_value` 设置)。

```python
m = Mock(side_effect=[3, 4, 5])
assert m() == 3
assert m() == 4
assert m() == 5
```


#### Mock方法与属性

以下仅举例常用的部分属性,详情查看[官方文档](https://docs.python.org/zh-cn/3.13/library/unittest.mock.html#the-mock-class)

`assert_called()` 断言`mock`至少被调用一次  

`assert_called_once()` 断言 `mock` 已被调用恰好一次。

`return_value` 设置`mock`的返回值  

`side_effect` 可以设置为特定的方法，迭代器或者一个异常。设置为`None`可以取消`side_effect`的影响  

`call_args` 最后调用的参数  

`__class__` 指定`mock`的类型，支持`isinstance()`判断  

### MagicMock类

`MagicMock`类是`Mock`类的子类，,包含了大多数内置的双下划线方法（例如 `__getitem__`, `__iter__`, `__enter__`/`__exit__`, `__call__`, `__str__` 等）  
而 Mock 默认只对 `__call__` 做了支持，其它都需要你手动设置。

```python
from unittest.mock import MagicMock
m = MagicMock()
m.method.return_value = 3
assert m.method() == 3
```

### patch

使用 `patch()` 作为装饰器/上下文管理器，可以更方便地测试一个模块下的类或对象。你指定的对象会在测试过程中替换成`mock`，测试结束后恢复。  
当你已经有了一个对象或类引用，希望直接替换它的某个属性／方法时，用 `patch.object` 更简洁和便于调试
```python
from unittest.mock import patch

@patch('module.ClassName.method')
def test_method(mock_method):
    # 模拟对象被替换为Mock对象
    mock_method.return_value = 3
    # 调用被测试的方法
    result = module.ClassName().method()
    assert result == 3
    assert mock_method is module.ClassName.method # module.ClassName.method被替换成了mock_method
```

使用上下文管理器

```python
with patch('module.ClassName.method', return_value=3) as mock_method:
    assert module.ClassName.method() == 3
```

#### patch.object

`patch.object()` 直接对给定对象的某个属性进行替换，而不是通过字符串去定位。

```python
from unittest.mock import patch, MagicMock

class MyClass:
    def method(self):
        ...

def test_obj_method():
    obj = MyClass()
    with patch.object(obj, 'method', return_value=99) as mock_m:
        assert obj.method() == 99

```

也可以用在装饰器上
```python
@patch.object(MyClass, 'method', return_value=99)
def test_cls_method(mock_m):
    assert MyClass().method() == 99
```
#### patch.dict()


`patch.dict()` 用于在一定范围内设置字典中的值，并在测试结束时将字典恢复为其原始状态：
```python
foo = {'key': 'value'}
original = foo.copy()
with patch.dict(foo, {'newkey': 'newvalue'}, clear=True):
    assert foo == {'newkey': 'newvalue'}

assert foo == original
```

## 实战演练

[^1]:https://liaoxuefeng.com/books/python/error-debug-test/unit-test/index.html
[^2]:https://www.cnblogs.com/xfuture/p/17562444.html
[^3]:https://docs.python.org/zh-cn/3.13/library/unittest.html