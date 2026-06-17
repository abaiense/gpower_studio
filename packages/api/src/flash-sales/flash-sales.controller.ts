import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FlashSalesService } from './flash-sales.service';
import { CreateFlashSlotDto, QueryFlashSlotDto } from './dto/flash-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';

@Controller('flash-slots')
@UseGuards(JwtAuthGuard)
export class FlashSalesController {
  constructor(private readonly service: FlashSalesService) {}

  @Post()
  create(
    @Body() dto: CreateFlashSlotDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(dto, user.studioId);
  }

  @Get()
  findAll(
    @Query() query: QueryFlashSlotDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.findAll(user.studioId, query);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.findOne(id, user.studioId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.cancel(id, user.studioId);
  }
}
