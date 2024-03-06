# 配置模型和ConfigDict

## 简介

`Pydantic` 模型的配置。

完整内容请访问 https://docs.pydantic.dev/latest/api/config/#pydantic.config.ConfigDict


## ConfigDict

Bases: `TypedDict`

用于配置 `Pydantic` 行为的 `TypedDict`

### title 

生成的 `JSON` 模式的标题，默认为模型的名称

### str_to_lower 

是否将 `str` 类型的所有字符转换为小写。 默认为 `False`

### str_to_upper 

是否将 `str` 类型的所有字符转换为大写。 默认为 `False`


### str_strip_whitespace

是否去除 `str` 类型的前导和尾随空格。


### str_min_length

`str `类型的最小长度。 默认为`None`

### str_max_length
`str `类型的最大长度。 默认为`None`

### extra  

在模型初始化期间是否忽略、允许或禁止额外属性。 默认为`ignore`。

您可以配置 pydantic 如何处理模型中未定义的属性：

- `allow` - 允许任何额外的属性。
- `forbid`  - 禁止任何额外的属性。
- `ignore`  - 忽略任何额外的属性。

### frozen

模型是否是假不可变的，即是否允许 `__setattr__` 并为模型生成一个 `__hash__()` 方法。如果模型的所有属性都是散列的，那么模型实例就可能是散列的。默认为假。


### populate_by_name

是否可以用模型属性给出的名称和别名来填充别名字段。默认为 `False`

### validate_assignment 
更改模型时是否验证数据。默认为 `False`。

`Pydantic` 的默认行为是在创建模型时验证数据。

如果用户在创建模型后更改了数据，则不会重新验证模型。

如果想在数据更改时重新验证模型，可以使用 `validate_assignment=True`

### arbitrary_types_allowed

字段类型是否允许任意类型。默认为`False`


### strict

(V2新增)如果为 `True`，将对模型上的所有字段进行严格验证。

默认情况下，`Pydantic` 会尽可能将值强制转换为正确的类型。

在某些情况下，您可能希望禁用这种行为，而不是在值的类型与字段的类型注释不匹配时引发错误。

要为模型上的所有字段配置严格模式，可以在模型上设置 `strict=True`。

```python
from pydantic import BaseModel, ConfigDict

class Model(BaseModel):
    model_config = ConfigDict(strict=True)

    name: str
    age: int

```

详情请参阅 [严格模式](https://docs.pydantic.dev/latest/concepts/strict_mode/)。

有关 `Pydantic` 如何在严格模式和宽松模式下转换数据的更多详情，请参阅[转换表](https://docs.pydantic.dev/latest/concepts/conversion_table/)。