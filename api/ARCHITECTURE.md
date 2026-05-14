# Backend Architecture

Tài liệu này mô tả cách backend trong `api/` đang được tổ chức, tư duy đặt code vào đúng chỗ, và checklist khi phát triển thêm feature. Mục tiêu là giữ code dễ mở rộng mà không cần sửa lại nền kiến trúc sau này.

## Tổng Quan

Backend đang đi theo hướng **modular monolith + clean architecture thực dụng** trên NestJS.

- **Modular monolith**: vẫn là một app deploy chung, nhưng code được chia theo module nghiệp vụ như `auth`, `users`.
- **Clean architecture thực dụng**: business rule nằm ở domain/application; HTTP, Prisma, JWT, bcrypt, database transaction nằm ở ngoài và được inject qua port/interface.
- **Thực dụng** nghĩa là không cố tách sạch 100% khỏi NestJS. Application service vẫn dùng `@Injectable()` và `@Inject()` để DI gọn hơn trong Nest.

Luồng dependency mong muốn:

```text
presentation -> application -> domain
infrastructure -> application/domain contracts
module wiring -> nối các implementation vào token
```

Domain và application không nên biết HTTP/Express/Prisma cụ thể.

## Cây Thư Mục

```text
src/
  app.module.ts
  main.ts
  common/
  core/
  infrastructure/
  modules/
    auth/
      auth.module.ts
      domain/
      application/
      infrastructure/
      presentation/
    users/
      user.module.ts
      domain/
      application/
      infrastructure/
      presentation/
```

## Vai Trò Từng Khu Vực

### `modules/<feature>/domain`

Đây là nơi chứa rule nghiệp vụ thuần của feature.

Đặt ở đây:

- Entity nghiệp vụ: `auth/domain/entities/session.entity.ts`, `users/domain/entities/user.entity.ts`
- Value object thuộc riêng feature: `auth/domain/value-objects/jwt-payload.ts`
- Policy nghiệp vụ ổn định: `auth/domain/policies/password.policy.ts`, `users/domain/policies/user-profile-access.policy.ts`
- Repository contract nếu domain/application cần đọc ghi aggregate: `auth/domain/repositories/session.repository.interface.ts`

Không đặt ở đây:

- `@nestjs/*`
- Express `Request`, `Response`
- Prisma client, generated Prisma type
- Cookie, JWT library, bcrypt, database transaction cụ thể

### `modules/<feature>/application`

Đây là nơi điều phối use case.

Đặt ở đây:

- Service/use case: `login.service.ts`, `register.service.ts`, `get-user.service.ts`
- Port cho kỹ thuật bên ngoài: `token-service.port.ts`, `password-hasher.port.ts`, `auth-rate-limiter.port.ts`
- Policy mang tính application/runtime: `auth-rate-limit.policy.ts`
- Type input/output dùng giữa controller và use case: `auth-session-metadata.type.ts`
- Transaction boundary qua `UNIT_OF_WORK` khi một use case cần ghi nhiều repository cùng lúc

Application được phép gọi domain policy/entity và repository contract. Application không nên gọi thẳng Prisma, Express, cookie hoặc controller decorator.

Ví dụ hiện tại:

- `RegisterService` normalize profile, check duplicate, hash password, mở transaction, tạo `AuthAccount`, tạo `User`, tạo `Session`.
- `LoginService` check rate limit, validate credential, tạo token, tạo session.
- `GetUserService` gọi `UserProfileAccessPolicy` trước khi đọc profile.

### `modules/<feature>/presentation`

Đây là lớp giao tiếp HTTP.

Đặt ở đây:

- Controller: `auth.controller.ts`, `user.controller.ts`
- DTO request/response: `login.dto.ts`, `auth-response.dto.ts`, `user-response.dto.ts`
- HTTP decorator: `refresh-token.decorator.ts`
- Factory/service phục vụ HTTP: `auth-request-context.factory.ts`, `refresh-token-cookie.service.ts`

Controller chỉ nên:

- Nhận request, DTO, param, cookie
- Tạo context HTTP cần thiết
- Gọi application service
- Map response/cookie/status code

Controller không nên chứa business rule như check password policy, tạo token, ghi database.

### `modules/<feature>/infrastructure`

Đây là nơi hiện thực kỹ thuật cụ thể cho các port/contract.

Đặt ở đây:

- Prisma repository: `prisma-auth-account.repository.ts`, `prisma-session.repository.ts`, `prisma-user.repository.ts`
- Mapper Prisma <-> domain: `infrastructure/persistence/mappers/*`
- Adapter service: `jwt.service.ts`, `bcrypt-password-hasher.service.ts`, `sha256-token-hasher.service.ts`
- Passport strategy: `jwt.strategy.ts`
- Persistence module để bind repository token: `auth-persistence.module.ts`, `user-persistence.module.ts`
- Security/service module để bind JWT/hash token: `auth-security.module.ts`
- Infrastructure module để gom adapter của feature: `auth-infrastructure.module.ts`

Infrastructure được phép biết Prisma, bcrypt, JWT library, ConfigService, Passport. Nó implement interface/port đã được application/domain định nghĩa.

## `core`, `common`, `infrastructure`

Ba thư mục này khác nhau:

- `core/`: code dùng chung nhưng vẫn mang ý nghĩa domain/app rộng, ví dụ exception, logger, request context, security guard/decorator, value object chung như `EmailAddress`.
- `common/`: hằng số hoặc helper rất nhỏ, hiện có DI token trong `common/constants/provider-token.constant.ts`.
- `infrastructure/`: adapter kỹ thuật cấp app, ví dụ config, Prisma service, transaction context, unit of work, Prisma error mapper.

Rule thực tế:

- Nếu code là nghiệp vụ riêng của `auth`, để trong `modules/auth`.
- Nếu code là nghiệp vụ riêng của `users`, để trong `modules/users`.
- Nếu code là kỹ thuật dùng toàn app như database/config, để trong `src/infrastructure`.
- Nếu code là primitive dùng chung nhiều module như exception/value object/security, cân nhắc `src/core`.

## Module NestJS

Mỗi feature có một module chính:

- `auth/auth.module.ts`
- `users/user.module.ts`

Feature module chịu trách nhiệm nối controller, use case và các module con. Các adapter hạ tầng nên được gom trong infrastructure submodule để feature module không phải bind thủ công quá nhiều provider.

Persistence module nằm trong `infrastructure/persistence` vì nó là phần wiring cho database adapter của feature. Nó giống file `index.ts` tổng hợp ở frontend, nhưng trong NestJS nó còn có trách nhiệm DI:

- import `DatabaseModule`
- provide token bằng Prisma implementation
- export token cho feature module dùng

Ví dụ:

```text
AuthModule
  imports AuthInfrastructureModule
  imports UserModule

AuthInfrastructureModule
  imports AuthPersistenceModule
  imports AuthSecurityModule
  provides JwtStrategy

AuthPersistenceModule
  imports DatabaseModule
  provides AUTH_ACCOUNT_REPOSITORY -> PrismaAuthAccountRepository
  provides SESSION_REPOSITORY -> PrismaSessionRepository
  provides AUTH_RATE_LIMITER -> PrismaAuthRateLimiterRepository

AuthSecurityModule
  imports JwtModule
  provides TOKEN_SERVICE -> JwtService
  provides TOKEN_HASHER -> Sha256TokenHasher
  provides PASSWORD_HASHER -> BcryptPasswordHasher
```

## DI Token Và Port

Các DI token nằm ở:

```text
src/common/constants/provider-token.constant.ts
```

Khi thêm một dependency dạng interface, làm theo mẫu:

1. Tạo port/interface ở application hoặc domain.
2. Thêm token vào `provider-token.constant.ts`.
3. Tạo implementation ở infrastructure.
4. Bind token trong module phù hợp.
5. Inject bằng token trong application service.

Ví dụ:

```ts
@Inject(TOKEN_SERVICE)
private readonly tokenService: TokenService
```

Không inject trực tiếp class hạ tầng vào application service nếu class đó đại diện cho kỹ thuật cụ thể như Prisma/JWT/bcrypt.

## Database Và Transaction

Database stack hiện tại:

- `DatabaseModule` provide `PrismaService`, `PrismaTransactionContext`, `UNIT_OF_WORK`.
- `PrismaUnitOfWork` dùng `prisma.$transaction(...)`.
- `PrismaTransactionContext` dùng `AsyncLocalStorage` để repository tự lấy transaction client hiện tại.

Cách dùng đúng:

```ts
return this.uow.execute(async () => {
  await this.authAccountRepository.register(...);
  await this.userRepository.create(...);
  await this.sessionRepository.create(...);
});
```

Repository không nhận `tx` qua parameter. Repository tự gọi `txContext.getClient() ?? prisma`. Nhờ vậy application service không bị dính Prisma transaction type.

Dùng `UNIT_OF_WORK` khi một use case cần nhiều thao tác ghi phải thành công/thất bại cùng nhau. Không cần dùng transaction cho một câu read đơn giản hoặc một thao tác ghi đơn lẻ nếu không có invariant liên quan.

## Import Alias

Source dùng alias:

```ts
import { LoginService } from '@/modules/auth/application/services/login.service.js';
```

Không dùng import dài kiểu `../../../../`.

Vì project chạy ESM (`"type": "module"`, `module: "nodenext"`), import nội bộ cần giữ hậu tố `.js` trong TypeScript source. Build runtime hoạt động nhờ:

- `paths` trong `tsconfig.json`: `@/* -> ./src/*`
- `npm run build`: `nest build && tsc-alias -p tsconfig.build.json`
- `npm run dev`: `scripts/dev-watch.mjs` chạy `nest build --watch`, sau đó chạy `tsc-alias`, rồi restart `node dist/src/main.js`

Nếu thêm alias mới, phải đảm bảo cả TypeScript, Jest và build runtime đều hiểu alias đó. Hiện tại chỉ nên dùng `@/...` để tránh phát sinh lỗi runtime.

## Thêm Feature Mới

Ví dụ thêm module `posts`.

Tạo cấu trúc:

```text
src/modules/posts/
  posts.module.ts
  domain/
    entities/
    policies/
    repositories/
  application/
    services/
    ports/
    types/
  infrastructure/
    posts-infrastructure.module.ts
    persistence/
      mappers/
      posts-persistence.module.ts
      prisma-post.repository.ts
    services/
  presentation/
    controllers/
    dto/
```

Checklist:

1. Xác định use case chính: create post, get feed, delete post.
2. Viết entity/policy domain nếu có rule nghiệp vụ.
3. Viết repository interface hoặc port mà use case cần.
4. Viết application service điều phối use case.
5. Viết Prisma repository + mapper ở infrastructure.
6. Bind token trong `posts-persistence.module.ts`.
7. Nếu có adapter service như storage/search/cache, bind trong infrastructure submodule riêng.
8. Gom các submodule hạ tầng trong `posts-infrastructure.module.ts`.
9. Import infrastructure module trong `posts.module.ts`.
10. Viết controller + DTO ở presentation.
11. Import `PostsModule` vào `AppModule`.
12. Thêm unit test cho domain/application trước; thêm e2e test nếu endpoint có flow quan trọng.

## Thêm Repository Mới

Checklist:

1. Contract đặt ở `domain/repositories` nếu nó là persistence của aggregate/domain object.
2. Contract đặt ở `application/ports` nếu nó là service kỹ thuật hoặc external system.
3. Implementation Prisma đặt ở `infrastructure/persistence`.
4. Mapper Prisma <-> domain đặt ở `infrastructure/persistence/mappers`.
5. Token thêm vào `common/constants/provider-token.constant.ts`.
6. Bind token trong persistence module của feature.
7. Application service chỉ inject token + interface, không inject Prisma implementation.

## Thêm Endpoint Mới

Checklist:

1. DTO request/response đặt ở `presentation/dto`.
2. Controller chỉ nhận request và gọi use case.
3. Nếu cần lấy IP, user-agent, cookie, request id, đặt logic đó trong presentation factory/service.
4. Use case đặt ở `application/services`.
5. Business rule đặt ở domain policy/entity nếu rule ổn định và không phụ thuộc request/runtime.
6. Trả lỗi bằng domain/application exception hiện có để `GlobalExceptionFilter` xử lý thống nhất.

## Test

Hướng test hiện tại là đúng:

- Entity/value object/policy: unit test thuần, không cần Nest testing module.
- Application service: mock repository/port, test rule và orchestration.
- Controller/e2e: test route, status code, cookie, auth guard, validation.
- Infrastructure repository: chỉ cần test khi query/mapping phức tạp hoặc có bug thực tế.

Các lệnh nên chạy trước khi commit:

```bash
npm run lint
npm test -- --runInBand
npm run build
npm run test:e2e
```

## Những Điều Nên Tránh

- Không import Prisma vào `domain` hoặc `application`.
- Không import Express `Request/Response` vào `domain` hoặc `application`.
- Không để controller chứa business logic.
- Không để application service biết cookie/header/status code.
- Không sửa tay file trong `src/generated/prisma`.
- Không import trực tiếp Prisma repository class vào application service.
- Không tạo thêm alias mới nếu chưa cập nhật build/Jest/runtime.
- Không để module nghiệp vụ import chéo tùy tiện. Nếu cần dùng capability của module khác, ưu tiên public module export hoặc port rõ ràng.

## Đánh Đổi Đang Chấp Nhận

Backend hiện tại đã ổn để phát triển tiếp, nhưng có vài điểm được giữ theo hướng thực dụng:

- Application service dùng Nest decorator. Đây không phải clean architecture thuần tuyệt đối, nhưng hợp lý với NestJS và giảm boilerplate.
- `RegisterService` của `auth` dùng `UserRepository` từ `users` để tạo account và profile trong cùng transaction. Với monolith hiện tại, đây là coupling chấp nhận được. Khi domain lớn hơn, có thể tách bằng public application port hoặc domain event.
- `AuthInfrastructureModule` export lại `AuthPersistenceModule` và `AuthSecurityModule` để `AuthModule` nhận đủ repository/token/UoW provider mà không bind adapter thủ công. Cần giữ kỷ luật: feature service vẫn inject port hoặc `UNIT_OF_WORK`, không inject `PrismaService`.
- Rate limiter hiện dùng Prisma repository riêng. Khi production traffic cao hơn, nên xem lại atomicity/concurrency và có thể chuyển sang Redis hoặc cơ chế database lock/upsert atomic hơn.

## Cách Tự Quyết Định Đặt Code Ở Đâu

Tự hỏi theo thứ tự:

1. Code này là rule nghiệp vụ thuần, không cần biết request/database/framework? Đặt ở `domain`.
2. Code này điều phối một hành động của user/system? Đặt ở `application/services`.
3. Code này là interface để application gọi kỹ thuật bên ngoài? Đặt ở `application/ports`.
4. Code này nói chuyện với HTTP/cookie/header/DTO? Đặt ở `presentation`.
5. Code này nói chuyện với Prisma/JWT/bcrypt/Passport/external service? Đặt ở `infrastructure`.
6. Code này dùng chung nhiều module và không thuộc feature cụ thể? Cân nhắc `core` hoặc `infrastructure` tùy nó là rule chung hay adapter kỹ thuật.

Nếu còn phân vân, ưu tiên giữ business rule ở trong cùng module feature trước. Chỉ kéo lên `core` khi đã có ít nhất hai module thật sự dùng chung.
