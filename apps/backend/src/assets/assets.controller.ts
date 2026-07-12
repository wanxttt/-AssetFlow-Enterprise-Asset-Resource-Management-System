import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AllocateAssetDto } from './dto/allocate-asset.dto';
import { TransferAssetDto } from './dto/transfer-asset.dto';
import { ReturnAssetDto } from './dto/return-asset.dto';

@Controller('assets')
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
  async create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Post('allocate')
  async allocate(@Body() dto: AllocateAssetDto) {
    return this.assetsService.allocateAsset(dto);
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferAssetDto) {
    return this.assetsService.transferAsset(dto);
  }

  @Post('return')
  async returnAsset(@Body() dto: ReturnAssetDto) {
    return this.assetsService.returnAsset(dto);
  }
}
