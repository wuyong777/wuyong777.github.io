# jwt是什么，怎么使用

> JSON Web Token（JWT）是一种开放标准（RFC 7519），用于在网络应用环境间安全地传输信息。它是一种紧凑的、自包含的、经过数字签名的令牌（token），常用于用户身份验证和授权。
>
> JWT的主要组成部分有三个：
>
> 1. **头部（Header）**： 包含关于JWT元数据的JSON对象，例如算法类型（通常是HS256、RS256等）。
>
>    Json
>
>    ```json
>    {
>      "alg": "HS256",
>      "typ": "JWT"
>    }
>    ```
>
> 2. **载荷（Payload）**： 包含实际要传递的信息，可以包含用户ID、角色、过期时间等信息。这部分信息是经过Base64URL编码的JSON对象。
>
>    Json
>
>    ```json
>    {
>      "sub": "1234567890",
>      "name": "John Doe",
>      "iat": 1516239022,
>      "exp": 1516242022
>    }
>    ```
>
> 3. **签名（Signature）**： 这部分通过把编码后的头部和载荷使用`.`连接起来，再用指定的密钥（secret）和指定的签名算法（如HMAC SHA-256或RSA）进行运算得到，确保信息没有被篡改。
>
>    Code
>
>    ```code
>    HMACSHA256(
>      base64UrlEncode(header) + "." +
>      base64UrlEncode(payload),
>      secret)
>    ```
>
> 使用JWT的过程通常如下：
>
> - **生成JWT**： 服务端在验证用户凭据后，使用预先设定好的密钥创建JWT，包含必要的用户信息和过期时间等，并对其进行签名。
> - **传输JWT**： 创建好的JWT作为一个令牌返回给客户端，客户端通常将其保存在Cookie、HTTP Authorization Header（Bearer模式）或其他地方。
> - **验证JWT**： 客户端在后续请求中携带JWT，服务端接收到JWT后，通过解码并使用相同的密钥和算法重新计算签名，验证JWT的有效性，包括是否过期和签名是否匹配。
> - **使用JWT进行授权**： 如果JWT验证通过，服务端可以从载荷（payload）中提取出相关信息，据此做出授权决策，比如允许或拒绝客户端访问特定资源。
>
> JWT的一大优势在于它的无状态性，服务端不需要持久化session信息，只需验证JWT就能确定用户身份和授权状态，这有助于提高系统的扩展性和安全性。然而，需要注意的是，由于JWT是完全自包含的，一旦签发，除非使用黑名单机制，否则无法撤销。因此，对于敏感操作，可能需要结合Refresh Token和其他安全措施使用。

# Spring Security + JWT实现身份验证和授权功能

> Spring Security 是一个为Java应用程序提供的强大且高度可定制的安全框架，它可以轻松实现身份验证和授权功能。当与JWT结合时，Spring Security 可以用来处理基于JWT的用户认证流程，具体步骤如下：
>
> 1. **生成JWT**
>    - 当用户登录时，应用会验证用户的凭证（用户名/密码或者其他形式的身份验证）。如果验证成功，应用会创建一个JWT，其中包含用户ID、过期时间以及其他必要信息，并使用一个密钥对其签名。
>    - 这个过程通常由一个自定义的`TokenProvider`或者`AuthenticationProvider`来完成，利用Spring Security中的`JwtAccessTokenConverter`（Spring Security OAuth2）或`JwtEncoder`（Spring Security 5.x的新版OAuth2整合）类生成JWT。
> 2. **响应JWT**
>    - 应用将生成的JWT作为响应的一部分发送给客户端，客户端通常将其存储在本地（如LocalStorage或Cookie的HttpOnly模式下），以便在后续请求中使用。
> 3. **配置Spring Security过滤器链**
>    - 在Spring Security的配置中，添加一个JWT解析和验证的过滤器，例如`JwtFilter`，这个过滤器会在每个受保护的HTTP请求到达时检查Authorization头中的Bearer Token（JWT）。
>    - 使用`BearerTokenResolver`（如`BearerTokenAuthenticationToken`）从请求头中解析JWT，并通过`JwtDecoder`或相应的解码器进行验证。
> 4. **权限控制与授权**
>    - 验证通过的JWT将转换成Spring Security识别的`Authentication`对象，其中包含了用户的角色和权限信息。
>    - 然后通过配置`WebSecurityConfigurerAdapter`或`SecurityFilterChain`，可以基于这些权限信息对不同的请求路径实施访问控制策略（如`.hasRole()`或`.hasAuthority()`）。
>
> 下面是一个简单的Spring Security配合JWT的基本配置示例（简化版）：
>
> Java
>
> ```java
> @Configuration
> @EnableWebSecurity
> public class SecurityConfig extends WebSecurityConfigurerAdapter {
> 
>     @Autowired
>     private JwtTokenProvider jwtTokenProvider;
> 
>     @Override
>     protected void configure(HttpSecurity http) throws Exception {
>         http
>             .csrf().disable()
>             .authorizeRequests()
>                 .antMatchers("/login").permitAll() // 允许登录接口无需验证
>                 .anyRequest().authenticated() // 其他所有请求都需要验证
>             .and()
>             .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
>     }
> 
>     // JwtAuthenticationFilter 类负责从请求头中提取并验证JWT
> }
> 
> @Service
> public class JwtTokenProvider {
> 
>     private final SecretKey secretKey; // 密钥
> 
>     public JwtTokenProvider(...) {
>         // 初始化密钥
>     }
> 
>     public String generateToken(Authentication authentication) {
>         // 根据authentication信息生成JWT
>     }
> 
>     public Authentication getAuthentication(String token) {
>         // 解析并验证JWT，然后转换为Spring Security的Authentication对象
>     }
> }
> ```
>
> 请注意，以上代码仅为示意，实际使用时需依据具体的库版本和项目需求进行调整。在Spring Security最新版本以及Spring Security OAuth2 Boot整合包中，JWT的支持更为完善且易用。

# AccessToken 和 RefreshToken

#### 什么是AccessToken 和 RefreshToken？

> AccessToken 和 RefreshToken 是 OAuth 2.0 授权框架中的两个关键概念，用于实现安全的用户授权和访问受保护资源。
>
> 1. **AccessToken**：
>    - AccessToken 是一种短期的、安全的凭证，代表了用户对特定资源服务器的访问权限。当第三方应用（客户端）获得用户的 AccessToken 后，就可以在有效期内使用它访问用户的特定资源（如 API），而无需每次都要求用户提供账户信息。
>    - AccessToken 的有效期一般较短，通常只有几分钟到几小时不等，以保证即使AccessToken泄露，造成的危害也有限。
> 2. **RefreshToken**：
>    - RefreshToken 是一种较长生命周期的安全令牌，用于获取新的AccessToken。当AccessToken过期后，客户端可以使用RefreshToken向授权服务器申请获取一个新的AccessToken，而无需用户重新进行登录授权操作。
>    - RefreshToken 的有效期通常较长，甚至可以是永久的，但一旦泄露或误用，可能会导致严重的安全问题，因此通常需要安全存储，并且在某些情况下，例如用户更改密码或者用户明确登出时，刷新令牌可能被撤销。
>
> 总结来说，AccessToken 主要用于实际访问资源，RefreshToken 则主要用于更新 AccessToken，两者结合使用，在确保系统安全性的同时，也为用户提供了较好的使用体验。

#### 访问时必须两个token都验证通过才可以吗？

> 在采用双令牌（AccessToken + RefreshToken）机制的系统中，访问受保护资源并不总是要求同时验证两个令牌。通常的流程如下：
>
> - 当客户端发起一次API请求时，只需要在请求头中附带AccessToken。
> - 服务器接收到请求后，仅验证AccessToken的有效性，包括是否过期、签名是否正确等。
> - 如果AccessToken有效，则允许访问资源，响应请求。
> - 若AccessToken已过期，此时客户端不能用过期的AccessToken来请求资源，而是应当使用RefreshToken向认证服务器请求新的AccessToken。
> - 客户端使用RefreshToken发起刷新请求，服务器验证RefreshToken的有效性。
> - 验证通过后，服务器颁发新的AccessToken（可能还包括新的RefreshToken），客户端使用新的AccessToken进行后续的资源访问。
>
> 因此，正常访问过程中只需验证AccessToken即可；只有在AccessToken失效需刷新时，才需要验证RefreshToken。这样的设计既保证了每次访问的安全性（因为AccessToken经常更新），又避免了用户频繁重新登录，提升了用户体验。

#### 他们是不同的secretkey吧？

> 是的，AccessToken 和 RefreshToken 应该是由不同的Secret Key生成的，尽管它们都是由授权服务器根据一定的安全策略生成的密钥，但二者在用途和生命周期上有着明显的区别，因此为了增强安全性，通常会使用不同的密钥对它们进行加密或签名。
>
> 在OAuth 2.0中，AccessToken和RefreshToken的具体生成方式取决于具体的应用场景和实现方式，可以是JWT（Json Web Token）格式并使用密钥进行签名，也可以是随机生成的一串字符串，然后存储在服务器端与用户的授权信息关联。
>
> 无论是哪种实现方式，对于每个令牌，其安全性和有效性都应该独立管理。这样即使RefreshToken被盗用，攻击者也不能直接使用它来获取资源，因为他们还需要通过AccessToken来进行实际的资源访问；同样，AccessToken即使被盗用，由于其有效期较短，且无法用来获取新的AccessToken，也能在一定程度上限制损失。

# 黑名单怎么处理AccessToken 和 RefreshToken

> 处理AccessToken和RefreshToken的黑名单主要是在用户登出、账号异常或安全原因需要立即禁用某个用户的所有访问权限时实施。以下是如何在黑名单中处理AccessToken和RefreshToken的基本步骤：
>
> 1. **存储令牌标识**：
>    - 当发放AccessToken和RefreshToken时，可以为每个令牌生成唯一的标识符（如JWT的jti字段或者其他序列号）。
>    - 将这些令牌标识符存储到一个快速查询的数据结构中，如Redis的Set或Hash，作为黑名单。
> 2. **AccessToken失效处理**：
>    - 当决定禁用某个用户的访问权限时，立即将该用户的AccessToken标识符添加到黑名单中。
>    - 在每次验证AccessToken时，先检查该令牌的标识符是否存在于黑名单中。如果存在，无论AccessToken是否还在有效期内，都应视为无效并拒绝请求。
> 3. **RefreshToken失效处理**：
>    - 对于RefreshToken，处理方式类似，也要将其标识符添加到黑名单中。
>    - 当客户端尝试使用RefreshToken换取新的AccessToken时，首先验证RefreshToken是否在黑名单内。如果是，则不允许刷新，返回错误信息，提示用户重新登录。
> 4. **实时更新黑名单**：
>    - 由于黑名单需要实时生效，所以存储黑名单的数据存储服务（如Redis）应具有高并发和低延迟特性，确保所有服务器节点都能及时同步黑名单数据。
> 5. **清理机制**：
>    - 可能需要定期清理过期或不再使用的令牌标识符，避免黑名单无限增长。
> 6. **跨设备同步**：
>    - 如果用户在多个设备上登录，确保黑名单同步机制能够使所有设备上的令牌失效。
>
> 通过这样的黑名单机制，即便AccessToken或RefreshToken已经发出，仍可以在必要时即时禁止其继续使用，从而增强了系统的安全性。