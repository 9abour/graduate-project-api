import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TicketsService } from '../tickets/tickets.service';
import { Booking } from 'src/bookings/bookings.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private ticketsService: TicketsService,
    private usersService: UsersService,
  ) {}

  async create(
    accessToken: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    const { id: userId } =
      await this.usersService.findByAccessToken(accessToken);

    try {
      await this.ticketsService.updateAvailableSeats(
        createBookingDto.ticketId,
        createBookingDto.numberOfSeats,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const createdBooking = new this.bookingModel({
      userId,
      ...createBookingDto,
      bookingDate: new Date(),
    });

    return createdBooking.save();
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().populate('ticketId').exec();
  }

  async findUserBookings(accessToken: string): Promise<Booking[]> {
    const { id } = await this.usersService.findByAccessToken(accessToken);

    return this.bookingModel.find({ userId: id }).populate('ticketId').exec();
  }

  async findCompanyBookings(travelCompany: string): Promise<Booking[]> {
    return this.bookingModel
      .find()
      .populate({
        path: 'ticketId',
        match: { travelCompany },
      })
      .exec()
      .then((bookings) => {
        return bookings.filter((booking) => booking.ticketId !== null);
      });
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingModel
      .findById(id)
      .populate('ticketId')
      .exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }
}
