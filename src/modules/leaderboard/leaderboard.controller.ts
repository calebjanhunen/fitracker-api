import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TotalXpLeaderboardUserDto } from './dtos';
import { LeaderboardService } from './leaderboard.service';
import { TotalXpLeaderboardUser } from './models';

@Controller('/api/leaderboard')
@UseGuards(JwtAuthGuard)
@ApiTags('Leaderboard')
@ApiBearerAuth('access-token')
export class LeaderboardController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Get('totalXp')
  @ApiResponse({
    status: HttpStatus.OK,
    type: TotalXpLeaderboardUserDto,
    isArray: true,
  })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR })
  public async getTotalXpLeaderboard(): Promise<TotalXpLeaderboardUserDto[]> {
    const response = await this.leaderboardService.getTotalXpLeaderboard();
    return this.mapper.mapArray(
      response,
      TotalXpLeaderboardUser,
      TotalXpLeaderboardUserDto,
    );
  }
}
