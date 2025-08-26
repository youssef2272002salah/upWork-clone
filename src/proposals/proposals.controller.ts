import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalStatus } from './entities/proposal.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard,PermissionsGuard)
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}


  @Post()
  @Permissions('create_proposal')
  create(@Body() dto: CreateProposalDto) {
    return this.proposalsService.create(dto);
  }

  @Get()
  @Permissions('view_proposal')
  findAll() {
    return this.proposalsService.findAll();
  }

  @Get(':id')
  @Permissions('view_proposal')
  findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('update_proposal')
  update(@Param('id') id: string, @Body() dto: UpdateProposalDto) {
    return this.proposalsService.update(+id, dto);
  }

  // TODO: make it only the user who created the proposal or the owner of the job can update the status
  @Patch(':id/status')
  @Permissions('update_proposal_status')
  updateStatus(@Param('id') id: string, @Body('status') status: ProposalStatus) {
    return this.proposalsService.updateStatus(+id, status);
  }

  // TODO: make it only the user who created the proposal or the owner of the job can delete the proposal
  @Delete(':id')
  @Permissions('delete_proposal')
  remove(@Param('id') id: string) {
    return this.proposalsService.remove(+id);
  }
}
