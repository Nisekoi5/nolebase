# Pydantic BaseModel


## 简介
在 Pydantic 中定义模式的主要方法之一是通过模型。模型只是继承自 `pydantic.BaseModel` 并将字段定义为注解属性的类。

完整内容请访问 https://docs.pydantic.dev/latest/concepts/models

### BaseModel的使用

`BaseModel`作为`Pydantic`中最基础的类,使用起来也比较简单。和dataclass比较类似。只不过用法由装饰器变为了继承

``` python
from datetime import datetime
from typing import Tuple

from Pydantic import BaseModel


class User(BaseModel):
    id: int
    name: str = 'Jane Doe'
```
在此示例中，`User`是一个具有两个字段的模型：

`id`,这是一个整数并且是必需的  
`name`,它是一个字符串，不是必需的(因为它有一个默认值)。

如果传入了错误类型的值,则会抛出一个`ValidationError`异常  
不过在此之前他会进行一些[类型转换](#数据类型转换),如果你传入了字符串类型的`"123"`给做`id`的值。则它会被转换为int类型。因为这个转换是可能的。  
如果传入的类型为无法转换的值,如`"a"`，此时就会抛出异常,你可以使用try语法捕获它,然后记录一些错误信息。  

``` python
from pydantic import ValidationError

try:
    User(id="a")
except ValidationError as e:
    print(e.errors())

```

[查看详细官方文档](https://docs.pydantic.dev/latest/concepts/models/#basic-model-usage)

### 模型方法和属性

上面的示例只是模型能够实现的冰山一角。模型具有以下方法和属性：  

`model_computed_fields`: 此模型实例的计算字段的字典。  
`model_construct()`: 用于创建模型而不运行验证的类方法。参见创建不带验证的模型。  
`model_copy()`: 返回模型的副本（默认为浅复制）。参见序列化。  
`model_dump()`: 返回模型字段和值的字典。参见序列化。  
`model_dump_json()`: 返回 `model_dump()` 的 JSON 字符串表示形式。参见序列化。  
`model_extra`: 获取在验证期间设置的额外字段。  
`model_fields_set: `在初始化模型实例时设置的字段集。  
`model_json_schema()`: 返回表示模型为 `JSON Schema` 的可 `JSON` 化字典。参见 `JSON Schema。`  
`model_parametrized_name()`: 计算泛型类参数化的类名。  
`model_post_init()`: 在模型初始化后执行额外的初始化。  
`model_rebuild()`: 重建模型架构，还支持构建递归泛型模型。参见[重建模型架构](#重建模型架构)。  
`model_validate()`: 用于将任何对象加载到模型中的实用程序。参见[辅助函数](#辅助函数)。  
`model_validate_json()`: 用于验证给定的 `JSON` 数据与 `Pydantic` 模型是否匹配的实用程序。参见[辅助函数](#辅助函数)。  

::: tip 提示
请参阅 [BaseModel](https://docs.pydantic.dev/latest/api/base_model/#pydantic.BaseModel) 了解类定义，包括方法和属性的完整列表。
:::

[查看详细API](https://docs.pydantic.dev/latest/concepts/models/#model-methods-and-properties)


### 嵌套模型

可以使用模型本身作为注释中的类型来定义更复杂的分层数据结构。  

::: details 点击查看源码
``` python
from typing import List, Optional

from pydantic import BaseModel


class Foo(BaseModel):
    count: int
    size: Optional[float] = None


class Bar(BaseModel):
    apple: str = 'x'
    banana: str = 'y'


class Spam(BaseModel):
    foo: Foo
    bars: List[Bar]

# 传入的Dict会被解构后用于建立模型对象
m = Spam(foo={'count': 4}, bars=[{'apple': 'x1'}, {'apple': 'x2'}])
print(m)
"""
foo=Foo(count=4, size=None) bars=[Bar(apple='x1', banana='y'), Bar(apple='x2', banana='y')]
"""
print(m.model_dump())
"""
{
    'foo': {'count': 4, 'size': None},
    'bars': [{'apple': 'x1', 'banana': 'y'}, {'apple': 'x2', 'banana': 'y'}],
}
"""
```
:::



### 重建模型架构

可以使用`model_rebuild()`重建模型架构。这对于构建递归通用模型很有用。

``` python
from pydantic import BaseModel, PydanticUserError

class Foo(BaseModel):
    x: 'Bar'


try:
    # 由于此时Bar还没有被定义,所以Pydantic不知道它是什么，所以会抛出一个异常
    Foo.model_json_schema()
except PydanticUserError as e:
    print(e)

    """
    Foo 没有完全定义；你应该先定义 Bar，然后调用 Foo.model_rebuild()。
    欲获取更多信息，请访问 https://errors.pydantic.dev/2/u/class-not-fully-defined
    """

class Bar(BaseModel):
    pass

# 在定义了Bar之后重建模型,此时得以知道类型
Foo.model_rebuild()
print(Foo.model_json_schema())
"""
{
    '$defs': {'Bar': {'properties': {}, 'title': 'Bar', 'type': 'object'}},
    'properties': {'x': {'$ref': '#/$defs/Bar'}},
    'required': ['x'],
    'title': 'Foo',
    'type': 'object',
}
"""
```




### 任意类实例/ORM模式


原先被称为`ORM 模式`（或`from_orm`）。

`Pydantic`模型还可以通过读取与模型字段名对应的实例属性来从任意类实例创建。此功能的一个常见应用是与对象关系映射`ORM`的集成。

要实现这一点，设置 `config` 属性 `model_config['from_attributes'] = True`。有关更多信息，请参见模型配置和 [[Pydantic Config|ConfigDict]]。

此处的示例使用了 `SQLAlchemy`,但同样的方法也适用于任何 `ORM`

``` python
from typing import List

from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import declarative_base
from typing_extensions import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

Base = declarative_base()

# 创建一个ORM模型
class CompanyOrm(Base):
    __tablename__ = 'companies'

    id = Column(Integer, primary_key=True, nullable=False)
    public_key = Column(String(20), index=True, nullable=False, unique=True)
    name = Column(String(63), unique=True)
    domains = Column(ARRAY(String(255)))


class CompanyModel(BaseModel):
    # 在pydantic模型中设置一个model_config的类属性，启用from_attributes
    model_config = ConfigDict(from_attributes=True)

    id: int
    public_key: Annotated[str, StringConstraints(max_length=20)]
    name: Annotated[str, StringConstraints(max_length=63)]
    domains: List[Annotated[str, StringConstraints(max_length=255)]]

# 常规的方法实例化一个ORM模型
co_orm = CompanyOrm(
    id=123,
    public_key='foobar',
    name='Testing',
    domains=['example.com', 'foobar.com'],
)
print(co_orm)
#> <__main__.CompanyOrm object at 0x0123456789ab>
co_model = CompanyModel.model_validate(co_orm) # 验证对应ORM模型的类型并根据值创建实例
print(co_model)
"""
id=123 public_key='foobar' name='Testing' domains=['example.com', 'foobar.com']
"""

```



##### 保留名称

你可能想要将一个 `Column` 命名为 `SQLAlchemy` 的保留字段。在这种情况下，字段别名会很方便：

``` python
import typing

import sqlalchemy as sa
from sqlalchemy.orm import declarative_base

from pydantic import BaseModel, ConfigDict, Field


class MyModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    metadata: typing.Dict[str, str] = Field(alias='metadata_')


Base = declarative_base()


class SQLModel(Base):
    __tablename__ = 'my_table'
    id = sa.Column('id', sa.Integer, primary_key=True)
    # 'metadata' 是 SQLAlchemy 的保留名称
    # 直接定义会报错 sqlalchemy.exc.InvalidRequestError: Attribute name 'metadata' is reserved when using the Declarative API.
    metadata_ = sa.Column('metadata', sa.JSON)


sql_model = SQLModel(metadata_={'key': 'val'}, id=1)

pydantic_model = MyModel.model_validate(sql_model)

print(pydantic_model.model_dump())
#> {'metadata': {'key': 'val'}}
print(pydantic_model.model_dump(by_alias=True))
#> {'metadata_': {'key': 'val'}}


```

::: info 提示
上面的示例之所以有效，是因为对于字段填充来说，别名优先于字段名称。 否则访问 `SQLModel` 的`matedata`属性将导致 `ValidationError`
:::


##### 嵌套属性

当使用属性解析模型时，将根据情况从顶级属性和更深层次嵌套的属性创建模型实例。

下面是一个演示原理的例子：


``` python
from typing import List

from pydantic import BaseModel, ConfigDict


class PetCls:
    def __init__(self, *, name: str, species: str):
        self.name = name
        self.species = species


class PersonCls:
    def __init__(self, *, name: str, age: float = None, pets: List[PetCls]):
        self.name = name
        self.age = age
        self.pets = pets


class Pet(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    species: str


class Person(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    age: float = None
    pets: List[Pet]


bones = PetCls(name='Bones', species='dog')
orion = PetCls(name='Orion', species='cat')
anna = PersonCls(name='Anna', age=20, pets=[bones, orion])
anna_model = Person.model_validate(anna)
print(anna_model)
"""
name='Anna' age=20.0 pets=[Pet(name='Bones', species='dog'), Pet(name='Orion', species='cat')]
"""

```

### 错误处理


每当`Pydantic`在其验证的数据中发现错误时，它就会引发`ValidationError`异常。

`ValidationError`无论发现多少错误，都会引发一个类型的异常，并且该`ValidationError`异常将包含有关所有错误及其发生方式的信息。

有关标准错误和自定义错误的详细信息，请参阅`错误处理`

演示:

``` python

from typing import List

from pydantic import BaseModel, ValidationError


class Model(BaseModel):
    list_of_ints: List[int]
    a_float: float


data = dict(
    list_of_ints=['1', 2, 'bad'],
    a_float='not a float',
)

try:
    Model(**data)
except ValidationError as e:
    print(e)
    """
    2 validation errors for Model
    list_of_ints.2
      Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='bad', input_type=str]
    a_float
      Input should be a valid number, unable to parse string as a number [type=float_parsing, input_value='not a float', input_type=str]
    """

```

### 辅助函数

`Pydantic`在模型上提供了两个`classmethod`辅助函数来解析数据：

  - `model_validate()`：这与`__init__`模型的方法非常相似，只是它采用字典或对象而不是关键字参数。如果传递的对象无法验证，或者它不是相关模型的字典或实例，则会引发`ValidationError`异常
  - `model_validate_json()`：这需要一个str或bytes并将其解析为json，然后将结果传递给model_validate().


::: info 提示
如果您想验证 JSON 以外的格式的序列化数据，您应该自己将数据加载到 dict 中，然后将其传递给`model_validate`
:::

::: info 提示

在文档的[JSON](https://docs.pydantic.dev/latest/concepts/json/)部分了解有关 JSON 解析的更多信息。

:::

::: info 提示

如果您将模型的实例传递给 `model_validate`，您将需要考虑在模型的配置中设置 `revalidate_instances`。 如果您不设置此值，则将跳过模型实例的验证。 请参阅下面的示例：
:::

``` python
from pydantic import BaseModel


class Model(BaseModel):
    a: int
    # 如果不配置
    # model_config = ConfigDict(revalidate_instances='always') 

m = Model(a=0)
# 在 `model_config` 中设置 validate_assignment=True` 可以防止这种赋值错误类型的行为
m.a = 'not an int'

# 即使 m 无效也不会引发验证错误
m2 = Model.model_validate(m)

```


### 创建模型而不进行验证
`Pydantic` 还提供了该`model_construct()`方法，允许在没有验证的情况下创建模型。这至少在某些情况下很有用: 

- 当处理已知有效的复杂数据时（出于性能原因）

- 当一个或多个验证器函数是非幂等的时，或者

- 当一个或多个验证器函数产生您不希望触发的副作用时。

::: info 

在 `Pydantic V2` 中，`BaseModel.__init__` 和 `BaseModel.model_construct` 之间的性能差距已大大缩小。  
对于简单的模型，调用 `BaseModel.__init__` 甚至可能更快。如果出于性能考虑而使用 `model_construct()`，那么在假定 `model_construct()` 更快之前，您可能需要对您的用例进行剖析。

:::

::: warning 

`model_construct()` 不会进行任何验证，这意味着它可以创建无效的模型。您应该只对已经验证过的数据或您绝对信任的数据使用 `model_construct()`方法。

:::

::: details 展开示例

``` python
from pydantic import BaseModel


class User(BaseModel):
    id: int
    age: int
    name: str = 'John Doe'

original_user = User(id=123, age=32) 

user_data = original_user.model_dump()
print(user_data)
# 创建一个模型并输出为dict
#> {'id': 123, 'age': 32, 'name': 'John Doe'} 
fields_set = original_user.model_fields_set
print(fields_set)
#> {'age', 'id'}

# ...
# 将 user_data 和 fields_set 传递给 RPC 或保存到数据库等。# 
...

# 然后您可以创建一个新的 User 实例，而无需重新运行验证，此时这是不必要的：
new_user = User.model_construct(_fields_set=fields_set, **user_data)
print(repr(new_user))
#> User(id=123, age=32, name='John Doe')
print(new_user.model_fields_set)
#> {'age', 'id'}

# 未验证的构造可能很危险，只能将其与经过验证的数据一起使用！：
bad_user = User.model_construct(id='dog')
print(repr(bad_user))
#> User(id='dog', name='John Doe')

```

:::

`model_construct()` 方法的 `_fields_set` 关键字参数是可选的，但它允许你更精确地指定哪些字段是原始设置的，哪些字段是没有的。如果省略了它，`model_fields_set` 将只是提供的数据的键。

例如，在上面的示例中，如果没有提供 `_fields_set，则` `new_user.model_fields_set` 将是 `{'id', 'age', 'name'}`。

请注意，对于 `RootModel` 的子类，根值可以作为位置参数传递给 `model_construct()`，而不是使用关键字参数。

以下是关于 `model_construct()` 行为的一些额外说明：

- 当我们说不执行验证时，这包括将字典转换为模型实例。因此，如果你有一个具有 Model 类型的字段，则在传递给 `model_construct()` 之前，你需要自己将内部字典转换为模型。

- 特别是，`model_construct()`方法不支持从字典递归构造模型。

- 如果你没有为具有默认值的字段传递关键字参数，则仍将使用默认值。

- 对于 `model_config['extra'] == 'allow'` 的模型，与字段不对应的数据将正确存储在 `__pydantic_extra__` 字典中。

- 对于具有私有属性的模型，`__pydantic_private__` 字典将被初始化，就像在调用 `__init__` 时一样。

- 在使用 `model_construct()` 构造实例时，不会调用模型或任何父类的 `__init__` 方法，即使定义了自定义的 `__init__` 方法也是如此。


### 通用模型(泛型)

`Pydantic` 支持创建通用模型，以便更轻松地重用通用模型结构。

为了声明通用模型，您需要执行以下步骤：

- 声明一个或多个`typing.TypeVar`实例以用于参数化您的模型(泛型)。

- 声明一个继承自`pydantic.BaseModel`和`typing.Generic`的模型，您可以将`TypeVar`实例作为参数传递给`typing.Generic`。

- 使用`TypeVar`实例作为注释，您希望将它们替换为其他类型或 `pydantic` 模型。

下面是一个使用通用子`BaseModel`类创建易于重用的 `HTTP` 响应有效负载包装器的示例：

``` python 
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, ValidationError

# 声明一个泛型
DataT = TypeVar('DataT') 


class DataModel(BaseModel):
    numbers: List[int]
    people: List[str]


class Response(BaseModel, Generic[DataT]):
    data: Optional[DataT] = None

data = DataModel(numbers=[1, 2, 3], people=[])

print(Response[int](data=1))
#> data=1
print(Response[str](data='value'))
#> data='value'
print(Response[str](data='value').model_dump())
#> {'data': 'value'}
print(Response[DataModel](data=data).model_dump())
#> {'data': {'numbers': [1, 2, 3], 'people': []}}
try:
    # 定义了int类型则传入data的值也只能是int类型
    Response[int](data='value')
except ValidationError as e:
    print(e)
    """
    1 validation error for Response[int]
    data
      Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='value', input_type=str]
    """

```

如果您在泛型模型定义中设置了 `model_config` 或使用了 `@field_validator` 或其他 `Pydantic` 装饰器，它们将以与从 `BaseModel` 子类继承时相同的方式应用于参数化子类。您的泛型类上定义的任何方法也将被继承。

`Pydantic` 的泛型还与类型检查器完美集成，因此您将获得所有类型检查，就像为每个参数化声明了一个单独的类型一样。

::: info 
在内部，当泛型模型被参数化时，`Pydantic` 在运行时创建 `BaseModel` 的子类。这些类被缓存，因此使用泛型模型应该引入的额外开销很小。
:::
要继承通用模型并保持其通用性，子类也必须继承 `typing.Generic`

```python
from typing import Generic, TypeVar

from pydantic import BaseModel

TypeX = TypeVar('TypeX')


class BaseClass(BaseModel, Generic[TypeX]):
    X: TypeX


class ChildClass(BaseClass[TypeX], Generic[TypeX]):
    # 继承自泛型TypeX
    pass

# 标注泛型为int
print(ChildClass[int](X=1))
#> X=1
```
#### 泛型继承

您还可以创建 `BaseModel` 的泛型子类，部分或全部替换超类中的类型参数：


```python
from typing import Generic, TypeVar

from pydantic import BaseModel

TypeX = TypeVar('TypeX')
TypeY = TypeVar('TypeY')
TypeZ = TypeVar('TypeZ')


class BaseClass(BaseModel, Generic[TypeX, TypeY]):
    x: TypeX
    y: TypeY


class ChildClass(BaseClass[int, TypeY], Generic[TypeY, TypeZ]):
    z: TypeZ


# 声明TypeY为str, typeY在BaseClass上被标注为y的类型
print(ChildClass[str, int](x='1', y='y', z='3'))
#> x=1 y='y' z=3

```

#### 类名重写

如果具体子类的名称很重要，也可以覆盖默认名称生成：

重写`model_parametrized_name`方法以实现通用 `BaseModel` 的自定义命名方案。

```python
from typing import Any, Generic, Tuple, Type, TypeVar

from pydantic import BaseModel

DataT = TypeVar('DataT')


class Response(BaseModel, Generic[DataT]):
    data: DataT

    @classmethod
    def model_parametrized_name(cls, params: Tuple[Type[Any], ...]) -> str:
        return f'{params[0].__name__.title()}Response'


print(repr(Response[int](data=1)))
#> IntResponse(data=1)
print(repr(Response[str](data='a')))
#> StrResponse(data='a')
```

#### 多个模型使用同个泛型

在嵌套模型中使用相同的 `TypeVar` 可以在模型的不同点上执行类型关系：

```python
from typing import Generic, TypeVar

from pydantic import BaseModel, ValidationError

T = TypeVar('T')


class InnerT(BaseModel, Generic[T]):
    inner: T


class OuterT(BaseModel, Generic[T]):
    # 因为使用了相同的泛型T,所以nested模型的泛型类型必须和outer的相同
    outer: T
    nested: InnerT[T] 


nested = InnerT[int](inner=1)
print(OuterT[int](outer=1, nested=nested))
#> outer=1 nested=InnerT[int](inner=1)
try:
    nested = InnerT[str](inner='a')
    print(OuterT[int](outer='a', nested=nested))
except ValidationError as e:
    print(e)

```

#### 未标注类型的泛型

当使用绑定类型参数时和未指定类型参数时，`Pydantic` 对待泛型模型的方式类似于处理内置泛型类型，如`List`和`Dict`：

- 如果在实例化泛型模型之前未指定参数，则它们将被验证为 `TypeVar` 的`bound`
- 如果`TypeVar` 没有`bound`，则将它们视为`Any`。

此外，与`List`和一样`Dict`，使用 `a` 指定的任何参数`TypeVar`稍后都可以替换为具体类型：

```python
from typing import Generic, TypeVar

from pydantic import BaseModel, ValidationError

AT = TypeVar('AT')
BT = TypeVar('BT')


class Model(BaseModel, Generic[AT, BT]):
    a: AT
    b: BT

# 因为泛型AT和BT没有设置bound, 所以被视为Any,将使用传入值的类型来进行验证
print(Model(a='a', b='a'))
#> a='a' b='a'

IntT = TypeVar('IntT', bound=int)
# 为泛型指定了int和intT
typevar_model = Model[int, IntT] 
print(typevar_model(a=1, b=1))
#> a=1 b=1
try:
    # 传入不为int类型的值将会报错
    typevar_model(a='a', b='a')
except ValidationError as exc:
    print(exc)

concrete_model = typevar_model[int]
print(concrete_model(a=1, b=1))
#> a=1 b=1

```

::: warning
虽然可能不会引发错误，但我们强烈建议不要在 `isinstance` 检查中使用参数化的泛型。

例如，不应执行 `isinstance(my_model,MyGenericModel[int])`。但是，可以执行 `isinstance(my_model,MyGenericModel)`。(请注意，对于标准泛型，对参数化泛型进行子类检查会引发错误)。

如果需要对参数化泛型进行 `isinstance` 检查，可以通过子类化参数化泛型来实现。这看起来就像 `class MyIntModel(MyGenericModel[int])`: ... 和 `isinstance(my_model, MyIntModel)`。

:::


#### 泛型bound中的模型

如果在 `TypeVar`的`bound`中使用了一个 `Pydantic` 模型，而该泛型类型从未被参数化，那么 `Pydantic` 将使用该`bound`进行验证，但在序列化时会将该值视为 `Any`

```python
from typing import Generic, Optional, TypeVar

from pydantic import BaseModel


class ErrorDetails(BaseModel):
    foo: str


# 声明泛型, 并且bound类型为ErrorDetails
ErrorDataT = TypeVar("ErrorDataT", bound=ErrorDetails)


class Error(BaseModel, Generic[ErrorDataT]):
    message: str
    details: Optional[ErrorDataT]


class MyErrorDetails(ErrorDetails):
    bar: str


# 未注解泛型参数,所以使用bound=ErrorDetails进行验证
error = Error(
    message="We just had an error",
    details=MyErrorDetails(foo="var", bar="var2"),
)
assert error.model_dump() == {
    "message": "We just had an error",
    "details": {
        "foo": "var",
        "bar": "var2",
    },
}

# 使用具体泛型参数化进行实例
# 请注意dump出来值没有MyErrorDetails子类的`'bar': 'var2'`
error = Error[ErrorDetails](
    message='We just had an error',
    details=ErrorDetails(foo='var'),
)
assert error.model_dump() == {
    'message': 'We just had an error',
    'details': {
        'foo': 'var',
    },
}


```

这是上述行为的另一个示例，枚举有关绑定规范和泛型类型参数化的所有排列：


```python
from typing import Generic

from typing_extensions import TypeVar

from pydantic import BaseModel

TBound = TypeVar("TBound", bound=BaseModel)
TNoBound = TypeVar("TNoBound")


class IntValue(BaseModel):
    value: int


class ItemBound(BaseModel, Generic[TBound]):
    item: TBound


class ItemNoBound(BaseModel, Generic[TNoBound]):
    item: TNoBound


item_bound_inferred = ItemBound(item=IntValue(value=3))
item_bound_explicit = ItemBound[IntValue](item=IntValue(value=3))
item_no_bound_inferred = ItemNoBound(item=IntValue(value=3))
item_no_bound_explicit = ItemNoBound[IntValue](item=IntValue(value=3))

# 在上述任何实例上调用 print(x.model_dump()) 都会产生以下结果：
# > {'item': {'value': 3}}

```


如果您使用 default=...(在 Python >= 3.13 或通过 typing-extensions 可用)或者约束( `TypeVar('T', str, int) `请注意，您很少想使用这种形式的 `TypeVar`)

那么如果类型变量没有被参数化，则默认值或约束将用于验证和序列化。您可以使用 pydantic.SerializeAsAny 覆盖此行为：

```python
from typing import Generic, Optional

from typing_extensions import TypeVar

from pydantic import BaseModel, SerializeAsAny


class ErrorDetails(BaseModel):
    foo: str


ErrorDataT = TypeVar("ErrorDataT", default=ErrorDetails)


class Error(BaseModel, Generic[ErrorDataT]):
    message: str
    details: Optional[ErrorDataT]


class MyErrorDetails(ErrorDetails):
    bar: str


# 未指定类型，将使用默认的序列化器`default=ErrorDetails`进行序列化
error = Error(
    message="We just had an error",
    details=MyErrorDetails(foo="var", bar="var2"),
)
assert error.model_dump() == {
    "message": "We just had an error",
    "details": {
        "foo": "var",
    },
}


class SerializeAsAnyError(BaseModel, Generic[ErrorDataT]):
    message: str
    details: Optional[SerializeAsAny[ErrorDataT]] # 使用 pydantic.SerializeAsAny 覆盖此行为：


error = SerializeAsAnyError(
    message="We just had an error",
    details=MyErrorDetails(foo="var", bar="baz"),
)
assert error.model_dump() == {
    "message": "We just had an error",
    "details": {
        "foo": "var",
        "bar": "baz",
    },
}

```



请注意，如果您不参数化泛型，而验证泛型的边界可能会导致数据丢失，则可能会遇到一些麻烦。 请参阅下面的示例：

```python
from typing import Generic

from typing_extensions import TypeVar

from pydantic import BaseModel

TItem = TypeVar("TItem", bound="ItemBase")


class ItemBase(BaseModel):
    ...


class IntItem(ItemBase):
    value: int


class ItemHolder(BaseModel, Generic[TItem]):
    item: TItem


loaded_data = {"item": {"value": 1}}

# 这里丢失了部分属性
print(ItemHolder(**loaded_data).model_dump())
# > {'item': {}}

print(ItemHolder[IntItem](**loaded_data).model_dump())
# > {'item': {'value': 1}}


```



### 不变性(冻结对象)

模型可以通过配置为不可变`model_config['frozen'] = True`。设置此值后，尝试更改实例属性的值将引发错误。有关更多详细信息，请参阅`ConfigDict`

::: warning 
在 Python 中，不强制执行不变性。如果开发人员愿意的话，他们可以修改通常被认为是“不可变”的对象。

:::

```python
from pydantic import BaseModel, ConfigDict, ValidationError


class FooBarModel(BaseModel):
    model_config = ConfigDict(frozen=True)

    a: str
    b: dict


foobar = FooBarModel(a='hello', b={'apple': 'pear'})

try:
    foobar.a = 'different'
except ValidationError as e:
    print(e)
    """
    1 validation error for FooBarModel
    a
      Instance is frozen [type=frozen_instance, input_value='different', input_type=str]
    """

print(foobar.a)
#> hello
print(foobar.b)
#> {'apple': 'pear'}
foobar.b['apple'] = 'grape'
print(foobar.b)
#> {'apple': 'grape'}

```

试图更改 `a` 会导致错误，因此 `a` 保持不变。然而，字典`b`是可变的对象，`foobar`的不变性并不能阻止 `b` 被更改。

### 抽象基类 

Pydantic 模型可以与 Python 的[抽象基类](https://docs.python.org/3/library/abc.html) (ABC) 一起使用。

```python
import abc

from pydantic import BaseModel


class FooBarModel(BaseModel, abc.ABC):
    a: str
    b: int

    # 必须继承实现该接口
    @abc.abstractmethod
    def my_abstract_method(self):
        pass

```
### 字段顺序

字段顺序对模型有以下影响：

- 字段顺序在模型[架构](https://docs.pydantic.dev/latest/concepts/json_schema/)中得以保留
- 字段顺序在[验证错误](https://docs.pydantic.dev/latest/concepts/models/#error-handling)中得以保留
- 字段顺序通过 `model_dump()` 和 `model_dump_json()` 等方法得以保留

::: details 展开
```python
from pydantic import BaseModel, ValidationError


class Model(BaseModel):
    a: int
    b: int = 2
    c: int = 1
    d: int = 0
    e: float


print(Model.model_fields.keys())
#> dict_keys(['a', 'b', 'c', 'd', 'e'])
m = Model(e=2, a=1)
print(m.model_dump())
#> {'a': 1, 'b': 2, 'c': 1, 'd': 0, 'e': 2.0}
try:
    Model(a='x', b='x', c='x', d='x', e='x')
except ValidationError as err:
    error_locations = [e['loc'] for e in err.errors()]

print(error_locations)
#> [('a',), ('b',), ('c',), ('d',), ('e',)]

```
:::

### 必填字段

要将字段声明为必填字段，可以只使用注释来声明，也可以使用`省略号`作为值：

```python
from pydantic import BaseModel, Field


class Model(BaseModel):
    a: int
    b: int = ...
    c: int = Field(...)

```
其中Field指的是Field函数。

这里`a、b、c`都是必需的。 但是，这种 `b: int = ...` 的使用在 `mypy` 中无法正常工作，从 `v1.0` 开始，大多数情况下应避免使用。
:::info

在 `Pydantic V1 `中，即使没有明确指定默认值，使用 `Optional` 或 `Any` 进行注解的字段也会被赋予 `None` 的隐式默认值。这种行为在 `Pydantic V2` 中发生了变化，不再有任何类型注解会导致字段具有隐式默认值。

:::

### 不可散列默认值的字段

在 `python` 中，一个常见的 bug 源头是使用可变对象作为函数或方法参数的默认值，因为每次调用都会重复使用同一个实例。

在这种情况下，`dataclasses` 模块实际上会引发错误，提示你应该使用 `dataclasses.field`的 `default_factory` 参数。

`Pydantic` 还支持对不可散列的默认值使用` default_factory`，但这并非必需。如果默认值不可散列，`Pydantic` 将在创建模型的每个实例时，对默认值进行深拷贝：

```python
from typing import Dict, List

from pydantic import BaseModel


class Model(BaseModel):
    # 每次实例化时会拷贝一个新的默认值
    item_counts: List[Dict[str, int]] = [{}]


m1 = Model()
m1.item_counts[0]['a'] = 1
print(m1.item_counts)
#> [{'a': 1}]

m2 = Model()
print(m2.item_counts)
#> [{}]

```

### 动态默认值的字段

当声明具有默认值的字段时，您可能希望它是动态的（即每个模型实例都不同）。为此，您可能需要使用`default_factory`

```python
from datetime import datetime, timezone
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


def datetime_now() -> datetime:
    return datetime.now(timezone.utc)


class Model(BaseModel):
    # 设置default_factory为生成函数
    uid: UUID = Field(default_factory=uuid4)
    updated: datetime = Field(default_factory=datetime_now)


m1 = Model()
m2 = Model()
assert m1.uid != m2.uid
```


### 类变量

用`typing.ClassVar`注解的属性被 `Pydantic` 正确地视为类变量，并且不会成为模型实例上的字段：

```python
from typing import ClassVar

from pydantic import BaseModel


class Model(BaseModel):
    x: int = 2
    y: ClassVar[int] = 1


m = Model()
print(m)
# y作为类属性没有出现
#> x=2
print(Model.y)
#> 1

```

### 模型私有属性

[详细文档](https://docs.pydantic.dev/latest/api/fields/#pydantic.fields.PrivateAttr)

`Pydantic` 不会将名称中带有下划线的属性视为字段，也不会将其包含在模型模式中。相反，这些属性会被转换为 "私有属性"，在调用`__init__`、`model_validate`等方法时不会被验证或设置。

:::info
从 `Pydantic v2.1.0` 起，如果尝试使用带有私有属性的 `Field` 函数，您将收到 `NameError` 错误。因为私有属性不被视为字段，所以无法应用 `Field()` 函数。
:::

这是一个使用示例：

```python
from datetime import datetime
from random import randint

from pydantic import BaseModel, PrivateAttr


class TimeAwareModel(BaseModel):
    _processed_at: datetime = PrivateAttr(default_factory=datetime.now)
    _secret_value: str

    def __init__(self, **data):
        super().__init__(**data)
        # this could also be done with default_factory
        self._secret_value = randint(1, 5)


m = TimeAwareModel()
print(m._processed_at)
#> 2032-01-02 03:04:05.000006
print(m._secret_value)
#> 3

```

私有属性名称必须以下划线开头，以防止与模型字段冲突。但是，不支持 `dunder` 名称`如 __attr__`。



### 数据类型转换

`Pydantic` 可能会对输入数据进行强制转换以使其符合模型字段类型，在某些情况下这可能会导致信息丢失。例如：
```python
from pydantic import BaseModel


class Model(BaseModel):
    a: int
    b: float
    c: str


print(Model(a=3.000, b='2.72', c=b'binary data').model_dump())
#> {'a': 3, 'b': 2.72, 'c': 'binary data'}

```
这是 Pydantic 深思熟虑的决定，并且通常是最有用的方法。有关该主题的详细讨论请参见 [此处](https://github.com/pydantic/pydantic/issues/578)。

尽管如此，也支持[严格的类型检查](https://docs.pydantic.dev/latest/concepts/strict_mode/)。


### 模型签名

所有 `Pydantic` 模型都将根据其字段生成签名：

```python
import inspect

from pydantic import BaseModel, Field


class FooModel(BaseModel):
    id: int
    name: str = None
    description: str = 'Foo'
    apple: int = Field(alias='pear')


print(inspect.signature(FooModel))
#> (*, id: int, name: str = None, description: str = 'Foo', pear: int) -> None

```
准确的签名对于内省目的和像`FastAPI`或`hypothesis`之类的库很有用

生成的签名还将遵循自定义`__init__`函数：

```python
import inspect

from pydantic import BaseModel


class MyModel(BaseModel):
    id: int
    info: str = 'Foo'

    def __init__(self, id: int = 1, *, bar: str, **data) -> None:
        """My custom init!"""
        super().__init__(id=id, bar=bar, **data)


print(inspect.signature(MyModel))
#> (id: int = 1, *, bar: str, info: str = 'Foo') -> None

```
字段的别名或名称必须是有效的 `Python` 标识符，才能包含在签名中。`Pydantic` 在生成签名时，会优先考虑字段的别名而不是名称，但如果别名不是有效的 `Python` 标识符，则可能会使用字段名称。

如果字段的别名和名称都不是有效的标识符（这可能是通过 `create_model` 的异类使用造成的），则会添加一个 `**data 参数`。此外，如果 `model_config['extra'] == 'allow'`，`**data` 参数将始终出现在签名中。


### 额外字段
默认情况下，当您为无法识别的字段提供数据时，`Pydantic` 模型不会出错，它们只会被忽略：

```python
from pydantic import BaseModel


class Model(BaseModel):
    x: int


m = Model(x=1, y='a')
# y 没有出现,因为模型中不包含它
assert m.model_dump() == {'x': 1}

```

如果希望引发错误，可以通过 `model_config` 来实现：

- `forbid`, 额外的字段会引发错误
- `allow`, 保留所提供的任何额外数据，额外字段将存储在 `BaseModel.__pydantic_extra__` 中,并且`model_dump()`也会包含



```python
from pydantic import BaseModel, ConfigDict, ValidationError


class Model(BaseModel):
    x: int

    model_config = ConfigDict(extra='forbid')


try:
    Model(x=1, y='a')
except ValidationError as exc:
    print(exc)
    """
    """

```

```python
from pydantic import BaseModel, ConfigDict


class Model(BaseModel):
    x: int

    model_config = ConfigDict(extra='allow')


m = Model(x=1, y='a')
assert m.__pydantic_extra__ == {'y': 'a'}
print(m.model_dump())
# > {'x': 1, 'y': 'a'}

```

默认情况下，不会对这些额外项进行验证，但可以通过覆盖 `__pydantic_extra__` 的类型注解为值设置类型：

```python
from typing import Dict

from pydantic import BaseModel, ConfigDict, ValidationError


class Model(BaseModel):
    __pydantic_extra__: Dict[str, int]

    x: int

    model_config = ConfigDict(extra='allow')

try:
    # __pydantic_extra__ 被设置为Dict[str, int],所以额外字段只能为int类型
    Model(x=1, y='a')
except ValidationError as exc:
    print(exc)
    """
    1 validation error for Model
    y
      Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='a', input_type=str]
    """
# 此处发生数据类型转换
m = Model(x=1, y='2') 
assert m.x == 1
assert m.y == 2
assert m.model_dump() == {'x': 1, 'y': 2}
assert m.__pydantic_extra__ == {'y': 2}

```
