import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from 'src/tickets/tickets.schema';
import { User } from 'src/users/schema/user.schema';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';
import * as moment from 'moment';
import { Booking, BookingDocument } from 'src/bookings/bookings.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<BookingDocument>,
    @InjectModel(Ticket.name)
    private ticketModel: Model<Ticket>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async getBookingStats(
    startDate?: Date,
    endDate?: Date,
    travelCompanyId?: string,
  ) {
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (travelCompanyId) {
      // We need to find tickets for this travel company first
      const tickets = await this.ticketModel
        .find({ travelCompany: travelCompanyId })
        .exec();
      const ticketIds = tickets.map((ticket) => ticket._id);
      query.ticketId = { $in: ticketIds };
    }

    // Exclude cancelled bookings
    query.isCancelled = { $ne: true };

    const bookings = await this.bookingModel
      .find(query)
      .populate('ticketId')
      .populate('userId')
      .exec();

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + booking.ticketId.price * booking.numberOfSeats;
    }, 0);

    // Calculate bookings by day
    const bookingsByDay = {};
    bookings.forEach((booking) => {
      const day = moment(booking.bookingDate).format('YYYY-MM-DD');
      if (!bookingsByDay[day]) {
        bookingsByDay[day] = {
          count: 0,
          revenue: 0,
        };
      }
      bookingsByDay[day].count += 1;
      bookingsByDay[day].revenue +=
        booking.ticketId.price * booking.numberOfSeats;
    });

    // Calculate popular routes
    const routeStats = {};
    bookings.forEach((booking) => {
      const route = `${booking.ticketId.from} to ${booking.ticketId.to}`;
      if (!routeStats[route]) {
        routeStats[route] = {
          count: 0,
          revenue: 0,
        };
      }
      routeStats[route].count += 1;
      routeStats[route].revenue +=
        booking.ticketId.price * booking.numberOfSeats;
    });

    // Sort routes by popularity
    const popularRoutes = Object.entries(routeStats)
      .map(([route, stats]: [string, any]) => ({
        route,
        bookings: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.bookings - a.bookings);

    return {
      totalBookings: bookings.length,
      totalRevenue,
      bookingsByDay,
      popularRoutes: popularRoutes.slice(0, 10), // Top 10 routes
    };
  }

  async getTicketStats(travelCompanyId?: string) {
    const query: any = {};

    if (travelCompanyId) {
      query.travelCompany = travelCompanyId;
    }

    const tickets = await this.ticketModel
      .find(query)
      .populate('travelCompany')
      .exec();

    // Calculate tickets by status
    const availableTickets = tickets.filter((t) => t.availableSeats > 0).length;
    const soldOutTickets = tickets.filter((t) => t.availableSeats === 0).length;

    // Calculate average price
    const averagePrice =
      tickets.length > 0
        ? tickets.reduce((sum, ticket) => sum + ticket.price, 0) /
          tickets.length
        : 0;

    // Calculate tickets by company
    const ticketsByCompany = {};
    tickets.forEach((ticket) => {
      const companyName = ticket.travelCompany;
      if (!ticketsByCompany[companyName]) {
        ticketsByCompany[companyName] = {
          count: 0,
          averagePrice: 0,
          totalRevenue: 0,
        };
      }
      ticketsByCompany[companyName].count += 1;
      ticketsByCompany[companyName].totalRevenue += ticket.price;
    });

    // Calculate average price by company
    Object.keys(ticketsByCompany).forEach((company) => {
      ticketsByCompany[company].averagePrice =
        ticketsByCompany[company].totalRevenue /
        ticketsByCompany[company].count;
    });

    return {
      totalTickets: tickets.length,
      availableTickets,
      soldOutTickets,
      averagePrice,
      ticketsByCompany,
    };
  }

  async getUserStats() {
    try {
      // Get user role counts using aggregation
      const userStats = await this.userModel
        .aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 },
            },
          },
        ])
        .exec();

      // Calculate role counts
      const travelers =
        userStats.find((stat) => stat._id.includes('traveler'))?.count || 0;
      const admins =
        userStats.find((stat) => stat._id.includes('admin'))?.count || 0;
      const companies =
        userStats.find((stat) => stat._id.includes('company'))?.count || 0;
      const totalUsers = travelers + admins + companies;

      // Get new users count in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newUsersCount = await this.userModel.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      // Calculate average bookings using aggregation
      const bookingStats = await this.bookingModel
        .aggregate([
          {
            $match: { isCancelled: { $ne: true } },
          },
          {
            $group: {
              _id: '$userId',
              bookingCount: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              averageBookings: { $avg: '$bookingCount' },
              totalUsers: { $sum: 1 },
            },
          },
        ])
        .exec();

      const averageBookingsPerUser = bookingStats[0]?.averageBookings || 0;

      return {
        totalUsers,
        travelers,
        admins,
        companies,
        newUsersLast30Days: newUsersCount,
        averageBookingsPerUser: Number(averageBookingsPerUser.toFixed(2)),
      };
    } catch (error) {
      throw new Error(`Failed to get user statistics: ${error.message}`);
    }
  }

  async exportBookings(
    startDate?: Date,
    endDate?: Date,
    travelCompanyId?: string,
  ): Promise<string> {
    const query: any = {};

    if (startDate && endDate) {
      query.bookingDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (travelCompanyId) {
      const tickets = await this.ticketModel
        .find({ travelCompany: travelCompanyId })
        .exec();
      const ticketIds = tickets.map((ticket) => ticket._id);
      query.ticketId = { $in: ticketIds };
    }

    const bookings = await this.bookingModel
      .find(query)
      .populate('ticketId')
      .populate('userId')
      .populate({
        path: 'ticketId',
        populate: {
          path: 'travelCompany',
        },
      })
      .exec();

    const csvData = bookings.map((booking) => ({
      bookingId: booking._id,
      bookingDate: moment(booking.bookingDate).format('YYYY-MM-DD HH:mm:ss'),
      customerName: `${booking.userId.name}`,
      customerEmail: booking.userId.email,
      from: booking.ticketId.from,
      to: booking.ticketId.to,
      departureTime: moment(booking.ticketId.departureTime).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      arrivalTime: moment(booking.ticketId.arrivalTime).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      seats: booking.numberOfSeats,
      price: booking.ticketId.price,
      totalAmount: booking.numberOfSeats * booking.ticketId.price,
      travelCompany: booking.ticketId.travelCompany,
      status: booking.isCancelled ? 'Cancelled' : 'Confirmed',
    }));

    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const filename = `bookings_export_${timestamp}.csv`;
    const filePath = path.join(process.cwd(), 'exports', filename);

    // Ensure the directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'), { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(filePath);

      csv
        .write(csvData, { headers: true })
        .pipe(writableStream)
        .on('finish', () => resolve(filePath))
        .on('error', (err) => reject(err));
    });
  }

  async exportTickets(travelCompanyId?: string): Promise<string> {
    const query: any = {};

    if (travelCompanyId) {
      query.travelCompany = travelCompanyId;
    }

    const tickets = await this.ticketModel
      .find(query)
      .populate('travelCompany')
      .exec();

    const csvData = tickets.map((ticket) => ({
      ticketId: ticket._id,
      from: ticket.from,
      to: ticket.to,
      departureTime: moment(ticket.departureTime).format('YYYY-MM-DD HH:mm:ss'),
      arrivalTime: moment(ticket.arrivalTime).format('YYYY-MM-DD HH:mm:ss'),
      price: ticket.price,
      availableSeats: ticket.availableSeats,
      travelCompany: ticket.travelCompany,
      status: ticket.availableSeats > 0 ? 'Available' : 'Sold Out',
    }));

    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const filename = `tickets_export_${timestamp}.csv`;
    const filePath = path.join(process.cwd(), 'exports', filename);

    // Ensure the directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'), { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(filePath);

      csv
        .write(csvData, { headers: true })
        .pipe(writableStream)
        .on('finish', () => resolve(filePath))
        .on('error', (err) => reject(err));
    });
  }

  async exportUserStats(): Promise<string> {
    const users = await this.userModel.find().exec();

    // Get booking counts for each user
    const userBookings = await this.bookingModel
      .aggregate([
        {
          $match: { isCancelled: { $ne: true } },
        },
        {
          $group: {
            _id: '$userId',
            bookingCount: { $sum: 1 },
          },
        },
      ])
      .exec();

    const bookingsByUser = new Map(
      userBookings.map((item) => [item._id.toString(), item.bookingCount]),
    );

    const csvData = users.map((user) => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalBookings: bookingsByUser.get(user.id.toString()) || 0,
    }));

    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const filename = `users_export_${timestamp}.csv`;
    const filePath = path.join(process.cwd(), 'exports', filename);

    // Ensure the directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'), { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(filePath);

      csv
        .write(csvData, { headers: true })
        .pipe(writableStream)
        .on('finish', () => resolve(filePath))
        .on('error', (err) => reject(err));
    });
  }
}
