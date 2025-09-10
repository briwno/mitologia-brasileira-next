"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

// Admin Page

const TABS = [
	{ key: 'cards', label: 'Cartas' },
	{ key: 'players', label: 'Players' },
	{ key: 'contos', label: 'Contos' },
];

function SectionContainer({ children }) {
	return (
		<div className="mt-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm overflow-hidden text-gray-800 dark:text-gray-800">
			{children}
		</div>
	);
}

function LoadingInline() {
	return <span className="text-sm text-gray-500 animate-pulse">Carregando...</span>;
}

function ErrorInline({ error }) {
	if (!error) return null;
	return <div className="mt-2 text-sm text-red-600">Erro: {error}</div>;
}

async function jsonFetch(url, { method = 'GET', body } = {}) {
	const opts = { method, headers: { 'Content-Type': 'application/json' } };
	if (body) opts.body = JSON.stringify(body);
	const res = await fetch(url, opts);
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || data.message || `Falha (${res.status})`);
	return data;
}

/* ------------------------- CARDS SECTION (READ-ONLY) ---------------------- */
function CardsSection() {
	const [cards, setCards] = useState([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

		const load = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const qs = new URLSearchParams();
			if (search) qs.set('search', search);
			qs.set('limit', '200');
			const data = await jsonFetch(`/api/cards?${qs.toString()}`);
			setCards(data.cards || []);
		} catch (e) {
			setError(e.message);
		} finally { setLoading(false); }
		}, [search]);

		useEffect(() => { load(); }, [load]);

	const rarityColor = (r) => ({
		comum: 'bg-gray-100 text-gray-800 border border-gray-300',
		rara: 'bg-blue-100 text-blue-800 border border-blue-300',
		epica: 'bg-purple-100 text-purple-800 border border-purple-300',
		lendaria: 'bg-amber-100 text-amber-800 border border-amber-300'
	}[r?.toLowerCase()] || 'bg-neutral-100 text-neutral-800 border border-neutral-300');

	return (
		<SectionContainer>
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap gap-2 items-center">
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar por nome ou lore..."
						className="border rounded px-2 py-1 text-sm flex-1 min-w-[200px]"
					/>
					<button
						onClick={load}
						disabled={loading}
						className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
					>Filtrar</button>
					{loading && <LoadingInline />}
				</div>
				<p className="text-xs text-gray-600">CRUD completo para cartas ainda não implementado no backend. Atualmente somente listagem.</p>
				<ErrorInline error={error} />
				<div className="overflow-auto max-h-[480px] border rounded border-gray-200">
					<table className="w-full text-xs text-gray-800">
						<thead className="bg-gray-800 text-gray-50 sticky top-0">
							<tr className="text-left">
								<th className="p-2">Nome</th>
								<th className="p-2">Região</th>
								<th className="p-2">Categoria</th>
								<th className="p-2">Ataque</th>
								<th className="p-2">Defesa</th>
								<th className="p-2">Custo</th>
								<th className="p-2">Raridade</th>
								<th className="p-2">Elemento</th>
							</tr>
						</thead>
						<tbody>
							{cards.map(c => (
								<tr key={c.id} className="odd:bg-white even:bg-gray-100 hover:bg-indigo-50 transition-colors text-gray-800">
									<td className="p-2 font-medium flex items-center gap-2">
															{c.image && (
																<Image
																	src={c.image}
																	alt={c.name}
																	width={32}
																	height={32}
																	className="w-8 h-8 object-cover rounded"
																/>
															)}
										{c.name}
									</td>
									<td className="p-2">{c.region}</td>
									<td className="p-2">{c.category}</td>
									<td className="p-2">{c.attack}</td>
									<td className="p-2">{c.defense}</td>
									<td className="p-2">{c.cost}</td>
									<td className="p-2"><span className={`px-2 py-0.5 rounded-sm text-[11px] font-medium inline-block leading-tight ${rarityColor(c.rarity)}`}>{c.rarity}</span></td>
									<td className="p-2">{c.element}</td>
								</tr>
							))}
							{!loading && cards.length === 0 && (
								<tr><td className="p-4 text-center text-gray-500" colSpan={8}>Nenhuma carta encontrada</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</SectionContainer>
	);
}

/* --------------------------- PLAYERS SECTION ------------------------------ */
function PlayersSection() {
	const [players, setPlayers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [editing, setEditing] = useState(null); // uid being edited
	const [form, setForm] = useState({ uid: '', name: '', avatarUrl: '' });
	const [updating, setUpdating] = useState(false);

		const load = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const data = await jsonFetch('/api/players');
			setPlayers(data.players || []);
		} catch (e) { setError(e.message); } finally { setLoading(false); }
		}, []);
		useEffect(() => { load(); }, [load]);

	const resetForm = () => { setForm({ uid: '', name: '', avatarUrl: '' }); setEditing(null); };

	const handleSubmit = async (e) => {
		e.preventDefault();
		setUpdating(true); setError(null);
		try {
			if (editing) {
				await jsonFetch('/api/players', { method: 'PUT', body: { uid: editing, data: { name: form.name, avatarUrl: form.avatarUrl } } });
			} else {
				await jsonFetch('/api/players', { method: 'POST', body: { uid: form.uid, name: form.name, avatarUrl: form.avatarUrl } });
			}
			resetForm();
			await load();
		} catch (e) { setError(e.message); } finally { setUpdating(false); }
	};

	const startEdit = (p) => {
		setEditing(p.uid);
		setForm({ uid: p.uid, name: p.name, avatarUrl: p.avatarUrl || '' });
	};

	return (
		<SectionContainer>
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<h3 className="font-semibold">Players</h3>
					<button onClick={load} disabled={loading} className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Recarregar</button>
					{loading && <LoadingInline />}
				</div>
				<form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-4 bg-gray-50 p-3 rounded border text-sm">
					{!editing && (
						<div className="flex flex-col">
							<label className="text-xs text-gray-500">UID</label>
							<input required value={form.uid} onChange={(e) => setForm(f => ({ ...f, uid: e.target.value }))} className="border rounded px-2 py-1" />
						</div>
					)}
					<div className="flex flex-col">
						<label className="text-xs text-gray-500">Nome</label>
						<input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="border rounded px-2 py-1" />
					</div>
					<div className="flex flex-col">
						<label className="text-xs text-gray-500">Avatar URL</label>
						<input value={form.avatarUrl} onChange={(e) => setForm(f => ({ ...f, avatarUrl: e.target.value }))} className="border rounded px-2 py-1" />
					</div>
					<div className="flex items-end gap-2">
						<button disabled={updating} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-500 disabled:opacity-50">
							{editing ? 'Salvar' : 'Criar'}
						</button>
						{editing && <button type="button" onClick={resetForm} className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>}
					</div>
					<div className="sm:col-span-4"><ErrorInline error={error} /></div>
				</form>
				<div className="overflow-auto max-h-[420px] border rounded border-gray-200">
					<table className="w-full text-xs text-gray-800">
						<thead className="bg-gray-800 text-gray-50 sticky top-0">
							<tr className="text-left">
								<th className="p-2">UID</th>
								<th className="p-2">Nome</th>
								<th className="p-2">Avatar</th>
								<th className="p-2">MMR</th>
								<th className="p-2">Banido?</th>
								<th className="p-2">Ações</th>
							</tr>
						</thead>
						<tbody>
							{players.map(p => (
								<tr key={p.uid} className="odd:bg-white even:bg-gray-100 hover:bg-indigo-50 transition-colors text-gray-800">
									<td className="p-2 font-mono text-[11px]">{p.uid}</td>
									<td className="p-2">{p.name}</td>
														<td className="p-2">{p.avatarUrl ? (
															<Image src={p.avatarUrl} alt="avatar" width={32} height={32} className="w-8 h-8 object-cover rounded" />
														) : <span className="text-gray-400">—</span>}</td>
									<td className="p-2">{p.mmr ?? '—'}</td>
									<td className="p-2">{p.banned ? 'Sim' : 'Não'}</td>
									<td className="p-2">
										<button onClick={() => startEdit(p)} className="text-indigo-600 hover:underline text-xs">Editar</button>
									</td>
								</tr>
							))}
							{!loading && players.length === 0 && (
								<tr><td colSpan={6} className="p-4 text-center text-gray-500">Nenhum player</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</SectionContainer>
	);
}

/* ---------------------------- CONTOS SECTION ------------------------------ */
function ContosSection() {
	const [stories, setStories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [form, setForm] = useState({ slug: '', titulo: '', resumo: '', corpo: '' });
	const [creating, setCreating] = useState(false);
	const [search, setSearch] = useState('');

		const load = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const qs = new URLSearchParams();
			if (search) qs.set('search', search);
			qs.set('active', 'true');
			const data = await jsonFetch(`/api/contos?${qs.toString()}`);
			setStories(data.stories || []);
		} catch (e) { setError(e.message); } finally { setLoading(false); }
		}, [search]);
		useEffect(() => { load(); }, [load]);

	const submit = async (e) => {
		e.preventDefault();
		setCreating(true); setError(null);
		try {
			await jsonFetch('/api/contos', { method: 'POST', body: { ...form, corpo: form.corpo } });
			setForm({ slug: '', titulo: '', resumo: '', corpo: '' });
			await load();
		} catch (e) { setError(e.message); } finally { setCreating(false); }
	};

	return (
		<SectionContainer>
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap gap-2 items-center">
					<h3 className="font-semibold">Contos</h3>
					<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="border rounded px-2 py-1 text-sm" />
					<button onClick={load} disabled={loading} className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Filtrar</button>
					{loading && <LoadingInline />}
				</div>
				<form onSubmit={submit} className="grid gap-2 sm:grid-cols-4 bg-orange-50 p-3 rounded border text-sm">
					<div className="flex flex-col">
						<label className="text-xs text-gray-500">Slug</label>
						<input required value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="border rounded px-2 py-1" />
					</div>
						<div className="flex flex-col sm:col-span-2">
							<label className="text-xs text-gray-500">Título</label>
							<input required value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} className="border rounded px-2 py-1" />
						</div>
						<div className="flex flex-col">
							<label className="text-xs text-gray-500">Resumo</label>
							<input value={form.resumo} onChange={(e) => setForm(f => ({ ...f, resumo: e.target.value }))} className="border rounded px-2 py-1" />
						</div>
						<div className="flex flex-col sm:col-span-4">
							<label className="text-xs text-gray-500">Corpo</label>
							<textarea required rows={5} value={form.corpo} onChange={(e) => setForm(f => ({ ...f, corpo: e.target.value }))} className="border rounded px-2 py-1 font-mono text-xs" />
						</div>
						<div className="flex items-center gap-2 sm:col-span-4">
							<button disabled={creating} className="px-3 py-1 rounded bg-amber-600 text-white text-sm hover:bg-amber-500 disabled:opacity-50">Criar conto</button>
							<p className="text-[11px] text-gray-500">(Update/Delete pendente de endpoints)</p>
						</div>
						<div className="sm:col-span-4"><ErrorInline error={error} /></div>
				</form>
				<div className="overflow-auto max-h-[420px] border rounded border-gray-200">
					<table className="w-full text-xs text-gray-800">
						<thead className="bg-gray-800 text-gray-50 sticky top-0">
							<tr className="text-left">
								<th className="p-2">Slug</th>
								<th className="p-2">Título</th>
								<th className="p-2">Resumo</th>
								<th className="p-2">Publicado</th>
							</tr>
						</thead>
						<tbody>
							{stories.map(s => (
								<tr key={s.id} className="odd:bg-white even:bg-gray-100 hover:bg-indigo-50 transition-colors text-gray-800">
									<td className="p-2 font-mono text-[11px]">{s.slug}</td>
									<td className="p-2">{s.title}</td>
									<td className="p-2 max-w-[260px] truncate" title={s.summary}>{s.summary}</td>
									<td className="p-2">{s.publishedAt ? new Date(s.publishedAt).toLocaleDateString() : '—'}</td>
								</tr>
							))}
							{!loading && stories.length === 0 && (
								<tr><td className="p-4 text-center text-gray-500" colSpan={4}>Nenhum conto</td></tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</SectionContainer>
	);
}

export default function AdminPage() {
	const [tab, setTab] = useState('cards');
	const [auth, setAuth] = useState({ user: '', pass: '' });
	const [authed, setAuthed] = useState(false);
	const [authError, setAuthError] = useState(null);
	const [authLoading, setAuthLoading] = useState(false);

	const submitAuth = async (e) => {
		e.preventDefault();
		setAuthLoading(true); setAuthError(null);
		try {
			const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: auth.user, password: auth.pass }) });
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.error || 'falha');
			setAuthed(true);
			setAuth({ user: '', pass: '' });
		} catch (e2) {
			setAuthError('Credenciais inválidas');
		} finally { setAuthLoading(false); }
	};

	if (!authed) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-white to-slate-200">
				<form onSubmit={submitAuth} className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-md p-6 flex flex-col gap-4">
					<h1 className="text-xl font-semibold text-gray-900">Acesso Administrativo</h1>
					<div className="flex flex-col gap-1">
						<label className="text-xs uppercase tracking-wide text-gray-500">Usuário</label>
						<input autoFocus value={auth.user} onChange={(e) => setAuth(a => ({ ...a, user: e.target.value }))} className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="admin" />
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs uppercase tracking-wide text-gray-500">Senha</label>
						<input type="password" value={auth.pass} onChange={(e) => setAuth(a => ({ ...a, pass: e.target.value }))} className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="••••••" />
					</div>
					{authError && <div className="text-xs text-red-600">{authError}</div>}
					<button disabled={authLoading} className="mt-2 bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 text-white rounded-md px-4 py-2 text-sm font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{authLoading ? 'Verificando...' : 'Entrar'}</button>
					<p className="text-[10px] text-gray-400 text-center">Requer credenciais a cada acesso (sessão não persiste).</p>
				</form>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-6 max-w-7xl mx-auto text-gray-800 dark:text-gray-800">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h1 className="text-2xl font-bold text-purple-900">Painel Administrativo</h1>
					<p className="text-sm text-gray-600">Gerencie dados principais do jogo.</p>
				</div>
				<button onClick={() => { setAuthed(false); }} className="text-xs px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">Sair</button>
			</div>
			<div className="flex gap-2 flex-wrap">
				{TABS.map(t => (
					<button
						key={t.key}
						onClick={() => setTab(t.key)}
						className={`px-3 py-1.5 rounded-md text-sm font-medium border transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${tab === t.key ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-white'} `}
					>{t.label}</button>
				))}
			</div>
			<div className="mt-4 space-y-6">
				{tab === 'cards' && <CardsSection />}
				{tab === 'players' && <PlayersSection />}
				{tab === 'contos' && <ContosSection />}
			</div>
		</div>
	);
}

