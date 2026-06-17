import {
  Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ArtFilesService } from './art-files.service';
import { InitUploadDto, SendForApprovalDto } from './dto/art-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('projects/:projectId/art-files')
@UseGuards(JwtAuthGuard)
export class ArtFilesController {
  constructor(private readonly service: ArtFilesService) {}

  @Post()
  initUpload(
    @Param('projectId') projectId: string,
    @Body() dto: InitUploadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.initUpload(projectId, dto, user.studioId, user.sub);
  }

  @Post(':fileId/confirm')
  @HttpCode(HttpStatus.OK)
  confirmUpload(
    @Param('projectId') projectId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.confirmUpload(projectId, fileId, user.studioId);
  }

  @Get()
  findAll(@Param('projectId') projectId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(projectId, user.studioId);
  }

  @Get(':fileId/download')
  getDownloadUrl(
    @Param('projectId') projectId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.getDownloadUrl(projectId, fileId, user.studioId);
  }

  @Post(':fileId/send')
  @HttpCode(HttpStatus.OK)
  sendForApproval(
    @Param('projectId') projectId: string,
    @Param('fileId') fileId: string,
    @Body() dto: SendForApprovalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.sendForApproval(projectId, fileId, dto, user.studioId);
  }
}
