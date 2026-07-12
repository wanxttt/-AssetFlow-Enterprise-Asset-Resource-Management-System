import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TransferAssetDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsOptional()
  toUserId?: string;

  @IsString()
  @IsOptional()
  toDepartmentId?: string;

  @IsString()
  @IsOptional()
  transferReason?: string;
}
