import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const UA =
  process.env.CHESSCOM_USER_AGENT ??
  'ChessGabonGestion/1.0 (contact: contact@chessgabon.ga)';

export interface ChessComClubProfile {
  id: string;
  name: string;
  clubId: number;
  url: string;
  icon?: string;
  location?: string;
  country?: string;
  membersCount: number;
  averageDailyRating?: number;
  descriptionHtml?: string;
  descriptionText?: string;
  joinUrl?: string;
  visibility?: string;
  createdAt?: string;
  lastActivityAt?: string;
  admins: string[];
}

export interface SyncMembersResult {
  clubUrlId: string;
  clubId: number;
  fetched: number;
  linked: number;
  updated: number;
  created: number;
  unmatched: string[];
  sampleUnmatched: string[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&agrave;/g, 'à')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function usernameFromAdminUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1] || url;
}

@Injectable()
export class ChessComService {
  private readonly logger = new Logger(ChessComService.name);

  constructor(private prisma: PrismaService) {}

  getClubUrlId(): string {
    return process.env.CHESSCOM_CLUB_URL_ID ?? 'chess-gabon-1';
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const url = `https://api.chess.com/pub${path}`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': UA,
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`Chess.com HTTP ${res.status} for ${path}`);
      }
      return (await res.json()) as T;
    } catch (e) {
      this.logger.error(`Chess.com fetch failed: ${path}`, e as Error);
      throw new ServiceUnavailableException(
        'Impossible de contacter l’API Chess.com. Réessayez plus tard.',
      );
    }
  }

  async getClubProfile(): Promise<ChessComClubProfile> {
    const urlId = this.getClubUrlId();
    const raw = await this.fetchJson<{
      '@id': string;
      name: string;
      club_id: number;
      url: string;
      icon?: string;
      location?: string;
      country?: string;
      members_count: number;
      average_daily_rating?: number;
      description?: string;
      join_request?: string;
      visibility?: string;
      created?: number;
      last_activity?: number;
      admin?: string[];
    }>(`/club/${urlId}`);

    return {
      id: raw['@id'],
      name: raw.name,
      clubId: raw.club_id,
      url: raw.url,
      icon: raw.icon,
      location: raw.location,
      country: raw.country,
      membersCount: raw.members_count,
      averageDailyRating: raw.average_daily_rating,
      descriptionHtml: raw.description,
      descriptionText: raw.description ? stripHtml(raw.description) : undefined,
      joinUrl: raw.join_request,
      visibility: raw.visibility,
      createdAt: raw.created
        ? new Date(raw.created * 1000).toISOString()
        : undefined,
      lastActivityAt: raw.last_activity
        ? new Date(raw.last_activity * 1000).toISOString()
        : undefined,
      admins: (raw.admin ?? []).map(usernameFromAdminUrl),
    };
  }

  async fetchClubUsernames(): Promise<{ clubId: number; usernames: string[] }> {
    const urlId = this.getClubUrlId();
    const profile = await this.fetchJson<{ club_id: number }>(`/club/${urlId}`);
    const members = await this.fetchJson<{
      weekly?: { username: string; joined: number }[];
      monthly?: { username: string; joined: number }[];
      all_time?: { username: string; joined: number }[];
    }>(`/club/${urlId}/members`);

    const set = new Set<string>();
    for (const list of [
      members.weekly ?? [],
      members.monthly ?? [],
      members.all_time ?? [],
    ]) {
      for (const m of list) {
        if (m.username) set.add(m.username.toLowerCase());
      }
    }

    return { clubId: profile.club_id, usernames: [...set].sort() };
  }

  async syncMembers(
    options: { createMissing?: boolean } = {},
  ): Promise<SyncMembersResult> {
    const createMissing = options.createMissing === true;
    const urlId = this.getClubUrlId();
    const { clubId, usernames } = await this.fetchClubUsernames();

    const local = await this.prisma.member.findMany({
      select: { id: true, pseudo: true, chesscom: true },
    });

    const byChesscom = new Map<string, (typeof local)[0]>();
    const byPseudo = new Map<string, (typeof local)[0]>();
    for (const m of local) {
      if (m.chesscom) byChesscom.set(m.chesscom.toLowerCase(), m);
      byPseudo.set(m.pseudo.toLowerCase(), m);
    }

    let linked = 0;
    let updated = 0;
    let created = 0;
    const unmatched: string[] = [];

    for (const username of usernames) {
      const key = username.toLowerCase();
      const existing = byChesscom.get(key) ?? byPseudo.get(key);

      if (existing) {
        linked += 1;
        if (!existing.chesscom || existing.chesscom.toLowerCase() !== key) {
          await this.prisma.member.update({
            where: { id: existing.id },
            data: { chesscom: username },
          });
          updated += 1;
          existing.chesscom = username;
          byChesscom.set(key, existing);
        }
        continue;
      }

      if (createMissing) {
        try {
          const createdMember = await this.prisma.member.create({
            data: {
              firstName: username,
              lastName: '(Chess.com)',
              pseudo: username,
              chesscom: username,
            },
          });
          created += 1;
          linked += 1;
          byChesscom.set(key, createdMember);
          byPseudo.set(key, createdMember);
        } catch {
          unmatched.push(username);
        }
      } else {
        unmatched.push(username);
      }
    }

    return {
      clubUrlId: urlId,
      clubId,
      fetched: usernames.length,
      linked,
      updated,
      created,
      unmatched,
      sampleUnmatched: unmatched.slice(0, 30),
    };
  }
}
