'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { apiFetch } from '@/lib/api';
import { toast } from '@/lib/toast';
import type { Platform, TimeControl } from '@/lib/types';

export default function TournamentForm({ onCreated }: { onCreated?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function createTournament(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await apiFetch('/tournaments', {
        method: 'POST',
        body: JSON.stringify({
          name: fd.get('name') as string,
          platform: fd.get('platform') as Platform,
          timeControl: fd.get('timeControl') as TimeControl,
          date: fd.get('date') as string,
        }),
      });
      if (res.ok) {
        toast.success('Tournoi créé avec succès.');
        form.reset();
        onCreated?.();
      } else {
        const text = await res.text();
        toast.error(`Erreur ${res.status} : ${text || 'réponse inattendue.'}`);
      }
    } catch {
      toast.error('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={createTournament} className="space-y-4">
      <Input
        id="tf-name"
        name="name"
        label="Nom du tournoi"
        placeholder="Blitz du dimanche #12"
        required
        disabled={loading}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select id="tf-platform" name="platform" label="Plateforme" disabled={loading}>
          <option value="LICHESS">Lichess</option>
          <option value="CHESSCOM">Chess.com</option>
          <option value="OTHER">Autre</option>
        </Select>
        <Select
          id="tf-timeControl"
          name="timeControl"
          label="Cadence"
          disabled={loading}
        >
          <option value="BULLET">Bullet</option>
          <option value="BLITZ">Blitz</option>
          <option value="RAPID">Rapide</option>
          <option value="CLASSICAL">Classique</option>
        </Select>
      </div>
      <Input
        id="tf-date"
        name="date"
        type="date"
        label="Date du tournoi"
        required
        disabled={loading}
      />
      <Button type="submit" loading={loading}>
        {loading ? 'Création…' : '+ Créer le tournoi'}
      </Button>
    </form>
  );
}
