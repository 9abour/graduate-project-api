import { IsOptional, IsNumber, IsString, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTicketsDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  departureTime?: Date;

  @IsOptional()
  @IsString()
  travelCompany?: string;
}
