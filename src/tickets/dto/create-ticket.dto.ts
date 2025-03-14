import { IsNotEmpty, IsString, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  departureTime: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  arrivalTime: Date;

  @IsNotEmpty()
  @Type(() => Number)
  @Min(0)
  price: number;

  @IsNotEmpty()
  @Type(() => Number)
  @Min(0)
  availableSeats: number;

  @IsNotEmpty()
  @IsString()
  travelCompany: string;
}
