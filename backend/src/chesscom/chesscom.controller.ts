import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
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

  /**
   * Admin — import auto d'un tournoi via URL Chess.com
   * Body : { url: string, createMissing?: boolean }
   */
  @Post('import-tournament')
  @UseGuards(JwtAuthGuard)
  async importTournament(
    @Body() body: { url?: string; createMissing?: boolean },
  ) {
    if (!body?.url?.trim()) {
      throw new BadRequestException(
        'Champ url requis (lien du tournoi Chess.com).',
      );
    }
    try {
      return await this.service.importTournament({
        url: body.url,
        createMissing: body.createMissing !== false,
      });
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      const msg = e instanceof Error ? e.message : 'Import impossible';
      throw new BadRequestException(msg);
    }
  }
}
