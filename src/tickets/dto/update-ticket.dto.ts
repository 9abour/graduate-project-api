import { IsOptional, IsNumber, IsString, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  departureTime?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  arrivalTime?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  availableSeats?: number;

  @IsOptional()
  @IsString()
  travelCompany?: string;
}
