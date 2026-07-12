import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReturnAssetDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsOptional()
  returnNotes?: string;

  @IsString()
  @IsOptional()
  condition?: string;
}
