# Lambda表达式

- **语法格式**：`() -> {}`
- **函数式接口**
- **方法引用**

# Stream流

- **创建流**
  - **单列集合**
  - **数组**
  - **双列集合**
- **中间操作**
  - `filter`
  - `map`,`flatMap`
  - `distinct`
  - `sorted`
  - `limit`,`skip`
- **终止操作**
  - `forEach`
  - `count`,`min`,`max`
  - `collect`
  - `anyMatch`,`allMatch`,`noneMatch`
  - `findAny`,`finFirst`
  - `reduce`

# Optional类

- `Optional.ofNullable(T t)`：若 t 不为 null，创建 Optional 实例，否则空实例
- `isPresent()`：判断是否包含某值

# 新时间日期API

- `LocalDate`

- `LocalTime`
- `LocalDateTime`