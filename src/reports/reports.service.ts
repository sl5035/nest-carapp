import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportsRepository: Repository<Report>,
  ) {}

  create(createReportDto: CreateReportDto, user: User): Promise<Report> {
    const report = this.reportsRepository.create(createReportDto);
    report.user = user;

    return this.reportsRepository.save(report);
  }

  async changeApproval(id: number, approved: boolean): Promise<Report> {
    const report = await this.reportsRepository.findOneBy({ id });
    if (!report) {
      throw new NotFoundException('report not found');
    }

    report.approved = approved;

    return this.reportsRepository.save(report);
  }

  createEstimate(getEstimateDto: GetEstimateDto) {
    return this.reportsRepository
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make: getEstimateDto.make })
      .andWhere('model = :model', { model: getEstimateDto.model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng: getEstimateDto.lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat: getEstimateDto.lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year: getEstimateDto.year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage: getEstimateDto.mileage })
      .limit(3)
      .getRawOne();
  }
}
