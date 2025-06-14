import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SearchTicketsDto } from './dto/search-tickets.dto';
import { Ticket } from 'src/tickets/tickets.schema';

@Injectable()
export class TicketsService {
  constructor(@InjectModel(Ticket.name) private ticketModel: Model<Ticket>) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const createdTicket = new this.ticketModel(createTicketDto);
    return createdTicket.save();
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketModel.find().exec();
  }

  async findCompanyTickets(travelCompany: string): Promise<Ticket[]> {
    return this.ticketModel.find({ travelCompany }).exec();
  }

  async search(searchTicketsDto: SearchTicketsDto): Promise<Ticket[]> {
    const {
      from,
      to,
      minPrice,
      maxPrice,
      departureTime,
      arrivalTime,
      travelCompany,
    } = searchTicketsDto;

    // Base query
    let query: any = {};

    // Add search filters if provided
    if (from) query.from = { $regex: from, $options: 'i' };
    if (to) query.to = { $regex: to, $options: 'i' };

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Date range filtering
    if (departureTime && arrivalTime) {
      // For range search (between two dates)
      const startDate = new Date(departureTime);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(arrivalTime);
      endDate.setHours(23, 59, 59, 999);

      query.$and = [
        { departureTime: { $gte: startDate } },
        { arrivalTime: { $lte: endDate } },
      ];
    } else {
      // Individual date filters (maintain backward compatibility)
      if (departureTime) {
        const startOfDay = new Date(departureTime);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(departureTime);
        endOfDay.setHours(23, 59, 59, 999);

        query.departureTime = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }

      if (arrivalTime) {
        const startOfDay = new Date(arrivalTime);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(arrivalTime);
        endOfDay.setHours(23, 59, 59, 999);

        query.arrivalTime = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
    }

    // Travel company
    if (travelCompany) {
      query.travelCompany = { $regex: travelCompany, $options: 'i' };
    }

    return this.ticketModel.find(query).exec();
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findById(id).exec();

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async updateAvailableSeats(
    id: string,
    numberOfSeats: number,
  ): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (ticket.availableSeats < numberOfSeats) {
      throw new Error('Not enough available seats');
    }

    ticket.availableSeats -= numberOfSeats;
    return ticket.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.ticketModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Ticket not found');
    }
  }
}
