import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUserService } from '@/modules/users/application/services/get-user.service.js';
import { UserResponseDto } from '@/modules/users/presentation/dto/user-response.dto.js';
import { JwtAuthGuard } from '@/core/security/guards/jwt-auth.guard.js';
import { CurrentUser } from '@/core/security/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '@/core/security/types/authenticated-user.type.js';
import { GetUserProfileService } from '@/modules/users/application/services/get-user-profile.service.js';
import { CreateUserProfileService } from '@/modules/users/application/services/create-user-profile.service.js';
import { UpdateUserProfileService } from '@/modules/users/application/services/update-user-profile.service.js';
import { DeleteUserProfileService } from '@/modules/users/application/services/delete-user-profile.service.js';
import { UploadUserProfileImageService } from '@/modules/users/application/services/upload-user-profile-image.service.js';
import { ListUserDiscoveryService } from '@/modules/users/application/services/list-user-discovery.service.js';
import { ListUserDiscoveryQueryDto } from '@/modules/users/presentation/dto/list-user-discovery-query.dto.js';
import { UserProfileInputDto } from '@/modules/users/presentation/dto/user-profile-input.dto.js';
import { UserProfileResponseDto } from '@/modules/users/presentation/dto/user-profile-response.dto.js';
import { UserSummaryResponseDto } from '@/modules/users/presentation/dto/user-summary-response.dto.js';
import { UserProfileInputMapper } from '@/modules/users/presentation/mappers/user-profile-input.mapper.js';
import {
  type UploadedProfileImageFile,
  UserProfileImageFileMapper,
} from '@/modules/users/presentation/mappers/user-profile-image-file.mapper.js';
import { UserProfileImage } from '@/modules/users/domain/entities/user-profile-image.entity.js';

@Controller('users')
export class UserController {
  constructor(
    private readonly getUserService: GetUserService,
    private readonly getUserProfileService: GetUserProfileService,
    private readonly createUserProfileService: CreateUserProfileService,
    private readonly updateUserProfileService: UpdateUserProfileService,
    private readonly deleteUserProfileService: DeleteUserProfileService,
    private readonly uploadUserProfileImageService: UploadUserProfileImageService,
    private readonly listUserDiscoveryService: ListUserDiscoveryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('discover')
  async discoverUsers(
    @Query() query: ListUserDiscoveryQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserSummaryResponseDto[]> {
    const users = await this.listUserDiscoveryService.execute({
      viewerId: currentUser.userId,
      query: query.query,
      limit: query.limit,
    });

    return users.map((user) => UserSummaryResponseDto.fromDomain(user));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const user = await this.getUserService.execute(id, currentUser);
    return UserResponseDto.fromDomain(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/profile')
  async getProfile(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.getUserProfileService.execute(id, currentUser);

    return UserProfileResponseDto.fromDomain(profile);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/profile')
  async createMyProfile(
    @Body() dto: UserProfileInputDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.createUserProfileService.execute(
      currentUser.userId,
      UserProfileInputMapper.toApplication(dto),
    );

    return UserProfileResponseDto.fromDomain(profile);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async updateMyProfile(
    @Body() dto: UserProfileInputDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.updateUserProfileService.execute(
      currentUser.userId,
      UserProfileInputMapper.toApplication(dto),
    );

    return UserProfileResponseDto.fromDomain(profile);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/profile')
  @HttpCode(204)
  async deleteMyProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.deleteUserProfileService.execute(currentUser.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: UserProfileImage.getMaxBytes('avatar') },
    }),
  )
  async uploadMyAvatar(
    @UploadedFile() file: UploadedProfileImageFile | undefined,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.uploadUserProfileImageService.execute({
      userId: currentUser.userId,
      kind: 'avatar',
      file: UserProfileImageFileMapper.toApplicationFile(file),
    });

    return UserProfileResponseDto.fromDomain(profile);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: UserProfileImage.getMaxBytes('cover') },
    }),
  )
  async uploadMyCover(
    @UploadedFile() file: UploadedProfileImageFile | undefined,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.uploadUserProfileImageService.execute({
      userId: currentUser.userId,
      kind: 'cover',
      file: UserProfileImageFileMapper.toApplicationFile(file),
    });

    return UserProfileResponseDto.fromDomain(profile);
  }
}
