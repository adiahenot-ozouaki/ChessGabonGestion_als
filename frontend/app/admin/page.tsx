'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  Users,
  Trophy,
  Upload,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { apiFetch, getToken } from '@/lib/api';
import type { Member, MemberDetail } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import TournamentForm from './TournamentForm';
import TournamentList from './TournamentList';
import ImportCsvForm from './ImportCsvForm';

type Tab = 'members' | 'tournaments' | 'import';
type SortColumn = keyof Pick<
  Member,
  'id' | 'pseudo' | 'firstName' | 'lastName' | 'lichess' | 'chesscom'
>;
type SortDirection = 'asc' | 'desc';
type NotifType = 'success' | 'error' | '';

interface MemberFormData {
  firstName: string;
  lastName: string;
  pseudo: string;
  lichess: string;
  chesscom: string;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'members', label: 'Membres', icon: <Users className="h-4 w-4" /> },
  {
    id: 'tournaments',
    label: 'Tournois',
    icon: <Trophy className="h-4 w-4" />,
  },
  { id: 'import', label: 'Import CSV', icon: <Upload className="h-4 w-4" /> },
];

function MemberFormFields({ defaults }: { defaults?: Member }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          id="firstName"
          name="firstName"
          label="Prénom"
          placeholder="Jean"
          defaultValue={defaults?.firstName}
          required
        />
        <Input
          id="lastName"
          name="lastName"
          label="Nom"
          placeholder="Ndong"
          defaultValue={defaults?.lastName}
          required
        />
      </div>
      <Input
        id="pseudo"
        name="pseudo"
        label="Pseudo"
        placeholder="KingNdong"
        defaultValue={defaults?.pseudo}
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          id="lichess"
          name="lichess"
          label="Lichess"
          placeholder="pseudo-lichess"
          defaultValue={defaults?.lichess}
        />
        <Input
          id="chesscom"
          name="chesscom"
          label="Chess.com"
          placeholder="pseudo-chesscom"
          defaultValue={defaults?.chesscom}
        />
      </div>
    </>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [ready, setReady] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(
    null
  );
  const [notif, setNotif] = useState<{ message: string; type: NotifType }>({
    message: '',
    type: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('pseudo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [addLoading, setAddLoading] = useState(false);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  function notify(message: string, type: NotifType) {
    setNotif({ message, type });
    setTimeout(() => setNotif({ message: '', type: '' }), 4000);
  }

  async function authFetch(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const res = await apiFetch(path, options);
    if (res.status === 401) logout();
    return res;
  }

  const loadMembers = useCallback(async () => {
    try {
      const res = await authFetch('/members');
      if (!res.ok) return;
      const data: unknown = await res.json();
      setMembers(Array.isArray(data) ? (data as Member[]) : []);
    } catch {
      /* network */
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadMemberResults(id: number) {
    try {
      const res = await authFetch(`/members/${id}/results`);
      if (res.ok) {
        const data = (await res.json()) as MemberDetail;
        setSelectedMember(data);
      }
    } catch {
      /* network */
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    setReady(true);
    void loadMembers();
  }, [loadMembers, router]);

  function readFormData(form: HTMLFormElement): MemberFormData {
    const fd = new FormData(form);
    return {
      firstName: fd.get('firstName') as string,
      lastName: fd.get('lastName') as string,
      pseudo: fd.get('pseudo') as string,
      lichess: fd.get('lichess') as string,
      chesscom: fd.get('chesscom') as string,
    };
  }

  async function addMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await authFetch('/members', {
        method: 'POST',
        body: JSON.stringify(readFormData(e.currentTarget)),
      });
      if (res.ok) {
        notify('Membre ajouté avec succès', 'success');
        e.currentTarget.reset();
        void loadMembers();
      } else {
        notify("Erreur lors de l'ajout", 'error');
      }
    } catch {
      notify('Impossible de contacter le serveur', 'error');
    } finally {
      setAddLoading(false);
    }
  }

  async function updateMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const res = await authFetch(`/members/${editingMember.id}`, {
        method: 'PATCH',
        body: JSON.stringify(readFormData(e.currentTarget)),
      });
      if (res.ok) {
        notify('Membre modifié avec succès', 'success');
        setEditingMember(null);
        void loadMembers();
      } else {
        notify('Erreur lors de la modification', 'error');
      }
    } catch {
      notify('Impossible de contacter le serveur', 'error');
    }
  }

  async function deleteMember(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer ce membre ?')) return;
    try {
      const res = await authFetch(`/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Membre supprimé', 'success');
        if (selectedMember?.id === id) setSelectedMember(null);
        void loadMembers();
      } else {
        notify('Erreur lors de la suppression', 'error');
      }
    } catch {
      notify('Impossible de contacter le serveur', 'error');
    }
  }

  function sortBy(column: SortColumn) {
    setSortColumn(column);
    setSortDirection(
      sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    );
  }

  const filteredMembers = members
    .filter(({ pseudo, firstName, lastName, lichess, chesscom }) => {
      const s = searchTerm.toLowerCase();
      return [pseudo, firstName, lastName, lichess, chesscom].some((v) =>
        v?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      const va = String(a[sortColumn] ?? '').toLowerCase();
      const vb = String(b[sortColumn] ?? '').toLowerCase();
      return va < vb
        ? sortDirection === 'asc'
          ? -1
          : 1
        : va > vb
          ? sortDirection === 'asc'
            ? 1
            : -1
          : 0;
    });

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-muted">
        <Spinner />
        Vérification de la connexion…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
              Administration
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden text-sm text-muted hover:text-brand sm:inline"
            >
              ← Classement
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition',
                tab === t.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted hover:text-gray-900'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification */}
      {notif.message && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <Alert type={notif.type === 'success' ? 'success' : 'error'} message={notif.message} />
        </div>
      )}

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* ── Membres ── */}
        {tab === 'members' && (
          <div className="space-y-6">
            <Card title="Ajouter un membre">
              <form onSubmit={addMember} className="space-y-4">
                <MemberFormFields />
                <Button type="submit" loading={addLoading}>
                  {addLoading ? 'Ajout…' : '+ Ajouter le membre'}
                </Button>
              </form>
            </Card>

            {editingMember && (
              <Card
                title={`Modifier — ${editingMember.pseudo}`}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingMember(null)}
                  >
                    Annuler
                  </Button>
                }
              >
                <form onSubmit={updateMember} className="space-y-4">
                  <MemberFormFields defaults={editingMember} />
                  <Button type="submit">Enregistrer</Button>
                </form>
              </Card>
            )}

            <Card title="Liste des membres">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    placeholder="Rechercher un joueur…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    aria-label="Rechercher un membre"
                  />
                </div>
                <Badge variant="gray">
                  {filteredMembers.length} membre
                  {filteredMembers.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      {(
                        [
                          ['id', 'ID'],
                          ['pseudo', 'Pseudo'],
                          ['firstName', 'Nom'],
                          ['lichess', 'Lichess'],
                          ['chesscom', 'Chess.com'],
                        ] as [SortColumn, string][]
                      ).map(([col, label]) => (
                        <th
                          key={col}
                          className="cursor-pointer select-none px-3 py-2 font-medium"
                          onClick={() => sortBy(col)}
                          aria-sort={
                            sortColumn === col
                              ? sortDirection === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : 'none'
                          }
                        >
                          {label}
                          <span className="ml-1 text-xs opacity-50">
                            {sortColumn === col
                              ? sortDirection === 'asc'
                                ? '↑'
                                : '↓'
                              : '↕'}
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-muted">
                          Aucun membre trouvé.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((m) => (
                        <tr
                          key={m.id}
                          className={cn(
                            'hover:bg-gray-50',
                            selectedMember?.id === m.id && 'bg-brand/5'
                          )}
                        >
                          <td className="px-3 py-2 text-xs text-muted">{m.id}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Avatar member={m} size="sm" />
                              <span className="font-medium text-brand">{m.pseudo}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {m.firstName} {m.lastName}
                          </td>
                          <td className="px-3 py-2 text-muted">{m.lichess || '—'}</td>
                          <td className="px-3 py-2 text-muted">{m.chesscom || '—'}</td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void loadMemberResults(m.id)}
                              >
                                Fiche
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMember(m);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                Modifier
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => void deleteMember(m.id)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {selectedMember && (
              <Card
                title={`Fiche joueur — ${selectedMember.pseudo}`}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMember(null)}
                  >
                    Fermer
                  </Button>
                }
              >
                <div className="mb-4 flex flex-wrap gap-3">
                  <Badge variant="brand">
                    {selectedMember.totalPoints} pts championnat
                  </Badge>
                  <Badge variant="gray">
                    {selectedMember.tournamentsPlayed} tournoi
                    {selectedMember.tournamentsPlayed !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {selectedMember.results?.length ? (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600">
                          <th className="px-3 py-2 font-medium">Tournoi</th>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 text-right font-medium">
                            Rang
                          </th>
                          <th className="px-3 py-2 text-right font-medium">
                            Points
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedMember.results.map((r) => (
                          <tr key={r.id}>
                            <td className="px-3 py-2 font-medium">
                              {r.tournament.name}
                            </td>
                            <td className="px-3 py-2 text-muted">
                              {formatDate(r.tournament.date)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {r.rank ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold">
                              {r.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState message="Aucun résultat pour ce membre." />
                )}
              </Card>
            )}
          </div>
        )}

        {/* ── Tournois ── */}
        {tab === 'tournaments' && (
          <div className="space-y-6">
            <Card title="Créer un tournoi">
              <TournamentForm />
            </Card>
            <Card title="Liste des tournois">
              <TournamentList />
            </Card>
          </div>
        )}

        {/* ── Import ── */}
        {tab === 'import' && (
          <Card title="Importer un classement CSV">
            <ImportCsvForm />
          </Card>
        )}
      </main>
    </div>
  );
}
