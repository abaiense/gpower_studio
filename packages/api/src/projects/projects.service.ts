import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectStatus, Prisma } from '@gpower/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, QueryProjectDto } from './dto/project.dto';

const projectInclude = {
  client: { select: { id: true, firstName: true, lastName: true, phone: true } },
  artist: { select: { id: true, firstName: true, lastName: true } },
  appointments: { select: { id: true, status: true, startAt: true, sessionNumber: true } },
  artFiles: { select: { id: true, version: true, status: true, filename: true, createdAt: true } },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, studioId: string) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        clientId: dto.clientId,
        artistId: dto.artistId,
        studioId,
        estimatedSessions: dto.estimatedSessions ?? 1,
      },
      include: projectInclude,
    });
  }

  async findAll(studioId: string, query: QueryProjectDto) {
    return this.prisma.project.findMany({
      where: {
        studioId,
        ...(query.artistId ? { artistId: query.artistId } : {}),
        ...(query.clientId ? { clientId: query.clientId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, studioId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, studioId },
      include: projectInclude,
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, studioId: string) {
    await this.findOne(id, studioId);
    return this.prisma.project.update({
      where: { id },
      data: dto,
      include: projectInclude,
    });
  }

  async close(id: string, studioId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, studioId },
      include: { appointments: true },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    const hasOpen = project.appointments.some(
      a => !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status),
    );
    if (hasOpen) throw new BadRequestException('All sessions must be completed before closing');
    return this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.COMPLETED },
      include: projectInclude,
    });
  }

  async linkAppointment(id: string, appointmentId: string, studioId: string) {
    await this.findOne(id, studioId);
    const appt = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, studioId },
    });
    if (!appt) throw new NotFoundException(`Appointment ${appointmentId} not found`);
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { projectId: id },
    });
  }
}
