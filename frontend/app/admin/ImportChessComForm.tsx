'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiFetch } from '@/lib/api';
import { toast } from '@/lib/toast';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ImportChessComForm() {
  const [url, setUrl] = useState('');
  const [createMissing, setCreateMissing] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [summary, setSummary] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Collez l’URL du tournoi Chess.com.');
      return;
    }
    setStatus('loading');
    setSummary(null);
    try {
      const res = await apiFetch('/chesscom/import-tournament', {
        method: 'POST',
        body: JSON.stringify({
          url: url.trim(),
          createMissing,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        name?: string;
        imported?: number;
        total?: number;
        createdMembers?: number;
        unmatched?: string[];
        timeControl?: string;
        date?: string;
      };
      if (!res.ok) {
        toast.error(data.message || 'Échec de l’import Chess.com');
        setStatus('error');
        return;
      }
      const msg = `« ${data.name} » — ${data.imported}/${data.total} résultats · ${data.createdMembers ?? 0} membres créés · ${data.timeControl} · ${data.date}`;
      setSummary(msg);
      toast.success(msg);
      setStatus('success');
      setUrl('');
    } catch {
      toast.error('Impossible de contacter le serveur');
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        Collez l’URL d’un tournoi live Chess.com terminé. Le classement est
        recalculé à partir des parties (API publique), puis enregistré comme
        tournoi <strong>Chess.com</strong> avec points de championnat.
      </p>
      <Input
        id="cc-url"
        name="url"
        label="URL du tournoi"
        placeholder="https://www.chess.com/tournament/live/samedi-blitz--31136531"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
        required
      />
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={createMissing}
          onChange={(e) => setCreateMissing(e.target.checked)}
          className="rounded border-border"
          disabled={isLoading}
        />
        Créer les membres absents (recommandé)
      </label>
      <Button type="submit" loading={isLoading}>
        {isLoading ? 'Import en cours…' : 'Importer depuis Chess.com'}
      </Button>
      {summary ? (
        <p className="rounded-lg border border-brand/30 bg-brand-light px-3 py-2 text-sm text-brand-dark">
          {summary}
        </p>
      ) : null}
      <p className="text-xs text-muted">
        Exemples : tournois du club sur{' '}
        <a
          href="https://www.chess.com/clubs/pastevents/chess-gabon-1"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:underline"
        >
          Past Events
        </a>
        .
      </p>
    </form>
  );
}
