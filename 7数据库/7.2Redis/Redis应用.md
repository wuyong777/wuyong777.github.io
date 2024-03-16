# Redis应用

在Spring Boot中使用Redis作为缓存后端并通过注解方式实现缓存功能，首先需确保已配置好Redis并添加对应起步依赖。以下是一个简化的示例，演示如何在Spring Boot中利用Redis缓存注解 (`@Cacheable`, `@CachePut`, `@CacheEvict`)：

首先，在`pom.xml`中引入Spring Boot Data Redis的起步依赖：

Xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

接着，在`application.properties`或`application.yml`中配置Redis连接：

Properties

```properties
spring.redis.host=localhost
spring.redis.port=6379
```

创建一个自定义Redis缓存配置类：

Java

```java
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.CacheResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

@Configuration
public class RedisCacheConfig extends CachingConfigurerSupport {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        // 添加序列化器等配置...
        return template;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                // 设置缓存过期策略等配置...
                .entryTtl(Duration.ofMinutes(30)); // 设置默认缓存有效期30分钟

        return RedisCacheManager.builder(factory)
                .cacheDefaults(config)
                .build();
    }
}
```

在服务接口中使用缓存注解：

Java

```java
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    // 假设有方法从数据库获取用户信息
    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        // 这里实际上会调用DAO或者其他方法从数据库获取用户信息
        // 实际业务代码省略...
        // 这里仅模拟从数据库获取用户，并假设User是从数据库查询得到的对象
        User user = new User(id, "username", "email");
        return user;
    }

    // 其他如@CachePut 和 @CacheEvict 的用法类似，此处不再详述
}
```

在这个示例中：

- `@Cacheable("users")` 表明缓存区域名为“users”。
- `key="#id"` 表示缓存键值由方法参数id决定。

当调用`getUserById`方法时，系统会首先在Redis中查找键为`方法参数id`的缓存项，如果存在则直接返回缓存的数据，否则执行方法体并将返回结果保存到缓存中。此外，可根据实际情况调整其他缓存策略和高级配置。
