import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChessComService } from './chesscom.service';

@Controller('chesscom')
export class ChessComController {
  constructor(private service: ChessComService) {}

  /** Public — profil club pour /a-propos */
  @Get('club')
  getClub() {
    return this.service.getClubProfile();
  }

  /**
   * Admin — synchronise les membres depuis Chess.com
   * Body optionnel : { createMissing?: boolean }
   */
  @Post('sync-members')
  @UseGuards(JwtAuthGuard)
  syncMembers(@Body() body: { createMissing?: boolean }) {
    return this.service.syncMembers({
      createMissing: body?.createMissing === true,
    });
  }
}
