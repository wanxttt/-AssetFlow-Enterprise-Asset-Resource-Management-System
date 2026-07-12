import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AllocateAssetDto } from './dto/allocate-asset.dto';
import { TransferAssetDto } from './dto/transfer-asset.dto';
import { ReturnAssetDto } from './dto/return-asset.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('assets')
@UseGuards(RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Post('allocate')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async allocate(@Body() dto: AllocateAssetDto) {
    return this.assetsService.allocateAsset(dto);
  }

  @Post('transfer')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async transfer(@Body() dto: TransferAssetDto) {
    return this.assetsService.transferAsset(dto);
  }

  @Post('return')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async returnAsset(@Body() dto: ReturnAssetDto) {
    return this.assetsService.returnAsset(dto);
  }
}
