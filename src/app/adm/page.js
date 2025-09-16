"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

// Admin Page

const TABS = [
	{ key: 'cards', label: 'Cartas' },
	{ key: 'item-cards', label: 'Item Cards' },
	{ key: 'players', label: 'Players' },
	{ key: 'contos', label: 'Contos' },
	{ key: 'card-inventory', label: 'Inventário de Cartas' },
];
// ------------------- CARD INVENTORY SECTION (ADMIN) -------------------
function CardInventorySection() {
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [cards, setCards] = useState([]);
	const [owned, setOwned] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [saving, setSaving] = useState(false);

	// Carregar usuários
	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				setError(null);
				const res = await fetch('/api/players');
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || 'Falha ao carregar usuários');
				setUsers(data.players || []);
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// Carregar cartas e inventário do usuário selecionado
	useEffect(() => {
		if (!selectedUser) return;
		(async () => {
			try {
				setLoading(true);
				setError(null);
				// Carregar todas as cartas
				const resCards = await fetch('/api/cards?limit=500');
				const dataCards = await resCards.json();
				if (!resCards.ok) throw new Error(dataCards.error || 'Falha ao carregar cartas');
				setCards(dataCards.cards || []);
				// Carregar inventário do usuário
				const resInv = await fetch(`/api/collection?uid=${encodeURIComponent(selectedUser.uid)}`);
				const dataInv = await resInv.json();
				if (!resInv.ok) throw new Error(dataInv.error || 'Falha ao carregar inventário');
				setOwned(Array.isArray(dataInv.cards) ? dataInv.cards : []);
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		})();
	}, [selectedUser]);

	const handleToggle = (cardId) => {
		setOwned((prev) =>
			prev.includes(cardId)
				? prev.filter((id) => id !== cardId)
				: [...prev, cardId]
		);
	};

	const handleSave = async () => {
		if (!selectedUser) return;
		setSaving(true);
		setError(null);
		try {
			const res = await fetch('/api/collection', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ uid: selectedUser.uid, cards: owned })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Falha ao salvar inventário');
		} catch (e) {
			setError(e.message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<SectionContainer>
			<div className="flex flex-col gap-4">
				<h3 className="font-semibold text-indigo-900">Inventário de Cartas do Usuário</h3>
				{error && <ErrorInline error={error} />}
				<div className="mb-2">
					<label className="text-sm font-medium">Selecione o usuário:</label>
					<select
						value={selectedUser?.uid || ''}
						onChange={e => {
							const uid = e.target.value;
							setSelectedUser(users.find(u => u.uid === uid) || null);
						}}
						className="border rounded px-2 py-1 text-sm min-w-[200px]"
					>
						<option value="">—</option>
						{users.map(u => (
							<option key={u.uid} value={u.uid}>{u.name || u.uid}</option>
						))}
					</select>
				</div>
				{selectedUser && (
					<>
						<div className="mb-2 text-sm text-gray-700">Marque as cartas que o usuário possui e clique em Salvar.</div>
						{loading ? (
							<LoadingInline />
						) : (
							<div className="overflow-auto max-h-[420px] border rounded border-gray-200 bg-gray-50 p-2">
								<table className="w-full text-xs">
									<thead className="bg-gray-200">
										<tr>
											<th className="p-2">Possui</th>
											<th className="p-2">Nome</th>
											<th className="p-2">Região</th>
											<th className="p-2">Categoria</th>
											<th className="p-2">Raridade</th>
										</tr>
									</thead>
									<tbody>
										{cards.map(card => (
											<tr key={card.id} className="odd:bg-white even:bg-gray-100">
												<td className="p-2 text-center">
													<input
														type="checkbox"
														checked={owned.includes(card.id)}
														onChange={() => handleToggle(card.id)}
													/>
												</td>
												<td className="p-2">{card.name}</td>
												<td className="p-2">{card.region}</td>
												<td className="p-2">{card.category}</td>
												<td className="p-2">{card.rarity}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
						<div className="mt-3 flex gap-2">
							<button
								onClick={handleSave}
								disabled={saving}
								className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
							>{saving ? 'Salvando...' : 'Salvar'}</button>
						</div>
					</>
				)}
			</div>
		</SectionContainer>
	);
}

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
	const [formOpen, setFormOpen] = useState(false);
	const emptyForm = { id: '', name: '', region: 'AMAZONIA', category: 'GUARDIANS', attack: 0, defense: 0, cost: 0, rarity: 'EPIC', element: 'EARTH', life: 1, lore: '', cardType: 'CREATURE', unlockCondition: '', isStarter: false, portrait: '', full: '', tags: '' };
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [saving, setSaving] = useState(false);
	const [advanced, setAdvanced] = useState(false);
	// Abilities fixed editor: skill1..skill5 + passive
	const emptySkill = { name: '', description: '', cost: '', kind: '', base: '', ppMax: '', stun: '', chance: '', heal: '' };
	const [skills, setSkills] = useState([emptySkill, emptySkill, emptySkill, emptySkill, emptySkill]);
	const [passive, setPassive] = useState({ name: '', description: '' });

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

	const rarityLabel = (r) => ({
		EPIC: 'Épico', LEGENDARY: 'Lendário', MYTHIC: 'Mítico', COMMON: 'Comum', RARE: 'Raro',
		comum: 'Comum', rara: 'Raro', epica: 'Épico', lendaria: 'Lendário', mythic: 'Mítico'
	}[r] || r);
	const rarityColor = (rRaw) => {
		const r = (rRaw || '').toString();
		const key = r.toUpperCase();
		return ({
			EPIC: 'bg-purple-100 text-purple-800 border border-purple-300',
			LEGENDARY: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
			MYTHIC: 'bg-pink-100 text-pink-800 border border-pink-300',
			COMMON: 'bg-gray-100 text-gray-800 border border-gray-300',
			RARE: 'bg-blue-100 text-blue-800 border border-blue-300'
		}[key]) || 'bg-neutral-100 text-neutral-800 border border-neutral-300';
	};

	const rarityOptions = ['EPIC','LEGENDARY','MYTHIC'];
	const regionOptions = ['AMAZONIA','NORTHEAST','SOUTHEAST','SOUTH','MIDWEST','NATIONAL'];
	const categoryOptions = ['GUARDIANS','SPIRITS','HAUNTS','PROTECTORS','MYSTICAL'];
	const elementOptions = ['EARTH','WATER','FIRE','AIR','SPIRIT'];
	const cardTypeOptions = ['CREATURE','SPELL','ARTIFACT'];

	const startCreate = () => { setEditingId(null); setForm(emptyForm); setSkills([emptySkill, emptySkill, emptySkill, emptySkill, emptySkill]); setPassive({ name: '', description: '' }); setFormOpen(true); };
	const startEdit = (c) => { setEditingId(c.id); setForm({
		id: c.id,
		name: c.name || '',
		region: c.region || '',
		category: c.category || '',
		attack: c.attack ?? 0,
		defense: c.defense ?? 0,
		cost: c.cost ?? 0,
		rarity: (c.rarity || 'EPIC'),
		element: c.element || '',
		life: c.life ?? c.health ?? 1,
		lore: c.history || c.lore || '',
		cardType: c.cardType || c.card_type || '',
		unlockCondition: c.unlockCondition || c.unlock_condition || '',
		isStarter: !!(c.isStarter || c.is_starter),
		portrait: c.images?.retrato || '',
		full: c.images?.completa || '',
		tags: (c.tags || []).join(',')
	});
	// Preencher habilidades estruturadas
	if (c.abilities && typeof c.abilities === 'object') {
		const s = [1,2,3,4,5].map(i => {
			const v = c.abilities[`skill${i}`] || {};
			return {
				name: v.name || '',
				description: v.description || '',
				cost: v.cost ?? '',
				kind: v.kind || '',
				base: v.base ?? '',
				ppMax: v.ppMax ?? '',
				stun: v.stun ?? '',
				chance: v.chance ?? '',
				heal: v.heal ?? ''
			};
		});
		setSkills(s);
		const p = c.abilities.passive || {};
		setPassive({ name: p.name || '', description: p.description || '' });
	} else {
		setSkills([emptySkill, emptySkill, emptySkill, emptySkill, emptySkill]);
		setPassive({ name: '', description: '' });
	}
	setFormOpen(true); };
	const remove = async (id) => { if (!confirm('Deletar carta?')) return; try { await jsonFetch(`/api/cards?id=${id}`, { method: 'DELETE' }); await load(); } catch (e) { setError(e.message); } };
	const submit = async (e) => { e.preventDefault(); setSaving(true); setError(null); try {
		// Build abilities object skill1..skill5 + passive
		let abilitiesObj = undefined;
		const hasAnySkill = skills.some(s => (s.name || s.description || s.cost || s.kind || s.base || s.ppMax || s.stun || s.chance || s.heal));
		if (hasAnySkill || passive.name || passive.description) {
			abilitiesObj = {};
			skills.forEach((s, idx) => {
				const obj = {};
				if (s.name) obj.name = s.name;
				if (s.description) obj.description = s.description;
				if (s.kind) obj.kind = s.kind;
				if (s.cost !== '' && s.cost !== undefined) obj.cost = Number(s.cost) || 0;
				if (s.base !== '' && s.base !== undefined) obj.base = Number(s.base) || 0;
				if (s.ppMax !== '' && s.ppMax !== undefined) obj.ppMax = Number(s.ppMax) || 0;
				if (s.stun !== '' && s.stun !== undefined) obj.stun = Number(s.stun) || 0;
				if (s.chance !== '' && s.chance !== undefined) obj.chance = Number(s.chance);
				if (s.heal !== '' && s.heal !== undefined) obj.heal = Number(s.heal) || 0;
				if (Object.keys(obj).length) abilitiesObj[`skill${idx+1}`] = obj;
			});
			if (passive.name || passive.description) abilitiesObj.passive = { name: passive.name || '', description: passive.description || '' };
			if (Object.keys(abilitiesObj).length === 0) abilitiesObj = undefined;
		}
		const body = {
			id: form.id,
			name: form.name,
			region: form.region || null,
			category: form.category || null,
			attack: Number(form.attack) || 0,
			defense: Number(form.defense) || 0,
			cost: Number(form.cost) || 0,
			rarity: form.rarity,
			element: form.element || null,
			life: Number(form.life) || 1,
			lore: form.lore || null,
			cardType: form.cardType || null,
			unlockCondition: form.unlockCondition || null,
			isStarter: !!form.isStarter,
			images: (form.portrait || form.full) ? { retrato: form.portrait || null, completa: form.full || null } : null,
			tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
			abilities: abilitiesObj
		};
		if (editingId) {
			await jsonFetch('/api/cards', { method: 'PUT', body: { ...body, id: editingId } });
		} else {
			await jsonFetch('/api/cards', { method: 'POST', body });
		}
		setFormOpen(false); await load();
	} catch (er) { setError(er.message); } finally { setSaving(false); } };

	// Ability form helpers
	const updateSkill = (index, field, value) => {
		setSkills(arr => arr.map((s,i)=> i===index ? { ...s, [field]: value } : s));
	};

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
						<button onClick={startCreate} className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-500">Nova Carta</button>
					{loading && <LoadingInline />}
				</div>
				<p className="text-xs text-gray-600">Gerencie todas as propriedades das cartas. Preencha somente o necessário; campos avançados são opcionais.</p>
				<ErrorInline error={error} />
				{formOpen && (
					<form onSubmit={submit} className="border rounded border-gray-300 p-3 bg-gray-50 grid md:grid-cols-6 gap-2 text-xs mb-4">
						<div className="flex flex-col"> <label>ID</label> <input disabled={!!editingId} required value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value}))} className="border rounded px-2 py-1" /> </div>
						<div className="flex flex-col md:col-span-2"> <label>Nome</label> <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="border rounded px-2 py-1" /> </div>
						<div className="flex flex-col"> <label>Raridade</label> <select value={form.rarity} onChange={e=>setForm(f=>({...f,rarity:e.target.value}))} className="border rounded px-2 py-1">{rarityOptions.map(o=> <option key={o} value={o}>{rarityLabel(o)}</option>)}</select> </div>
						<div className="flex flex-col"> <label>Região</label> <select value={form.region} onChange={e=>setForm(f=>({...f,region:e.target.value}))} className="border rounded px-2 py-1">{regionOptions.map(o=> <option key={o} value={o}>{o}</option>)}</select> </div>
						<div className="flex flex-col"> <label>Categoria</label> <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="border rounded px-2 py-1">{categoryOptions.map(o=> <option key={o} value={o}>{o}</option>)}</select> </div>
						<div className="flex flex-col"> <label>Elemento</label> <select value={form.element} onChange={e=>setForm(f=>({...f,element:e.target.value}))} className="border rounded px-2 py-1">{elementOptions.map(o=> <option key={o} value={o}>{o}</option>)}</select> </div>
						<div className="flex flex-col"> <label>Ataque</label> <input type="number" value={form.attack} onChange={e=>setForm(f=>({...f,attack:e.target.value}))} className="border rounded px-2 py-1" /> </div>
						<div className="flex flex-col"> <label>Defesa</label> <input type="number" value={form.defense} onChange={e=>setForm(f=>({...f,defense:e.target.value}))} className="border rounded px-2 py-1" /> </div>
						<div className="flex flex-col"> <label>Custo</label> <input type="number" value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} className="border rounded px-2 py-1" /> </div>
						<div className="flex flex-col"> <label>Vida</label> <input type="number" value={form.life} onChange={e=>setForm(f=>({...f,life:e.target.value}))} className="border rounded px-2 py-1" /> </div>
						<div className="flex flex-col"> <label>Card Type</label> <select value={form.cardType} onChange={e=>setForm(f=>({...f,cardType:e.target.value}))} className="border rounded px-2 py-1">{cardTypeOptions.map(o=> <option key={o} value={o}>{o}</option>)}</select> </div>
						<div className="flex flex-col"> <label>Starter?</label> <select value={form.isStarter? 'yes':'no'} onChange={e=>setForm(f=>({...f,isStarter:e.target.value==='yes'}))} className="border rounded px-2 py-1"><option value="no">Não</option><option value="yes">Sim</option></select> </div>
						<div className="flex flex-col md:col-span-3"> <label>Lore / História</label> <textarea rows={3} value={form.lore} onChange={e=>setForm(f=>({...f,lore:e.target.value}))} className="border rounded px-2 py-1" /> </div>
						<div className="flex flex-col md:col-span-3"> <label>Condição Desbloqueio</label> <input value={form.unlockCondition} onChange={e=>setForm(f=>({...f,unlockCondition:e.target.value}))} className="border rounded px-2 py-1" /> </div>
						<button type="button" onClick={()=>setAdvanced(a=>!a)} className="col-span-6 mt-1 text-left text-indigo-600 underline">{advanced? 'Esconder campos avançados':'Mostrar campos avançados'}</button>
						{advanced && (<>
							<div className="flex flex-col"> <label>Portrait URL</label> <input value={form.portrait} onChange={e=>setForm(f=>({...f,portrait:e.target.value}))} className="border rounded px-2 py-1" /> </div>
							<div className="flex flex-col"> <label>Full URL</label> <input value={form.full} onChange={e=>setForm(f=>({...f,full:e.target.value}))} className="border rounded px-2 py-1" /> </div>
							<div className="flex flex-col md:col-span-2"> <label>Tags (csv)</label> <input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} className="border rounded px-2 py-1" /> </div>
							<div className="md:col-span-4 flex flex-col gap-2">
								<label className="font-medium">Habilidades (skill1..skill5 + passiva)</label>
								<div className="flex flex-col gap-3">
									{skills.map((s, idx) => (
										<div key={idx} className="border rounded p-2 bg-white shadow-sm flex flex-col gap-2">
											<div className="text-[11px] font-semibold">Habilidade {idx+1}</div>
											<div className="grid grid-cols-6 gap-2">
												<div className="col-span-3 flex flex-col"><label className="text-[10px] text-gray-500">Nome</label><input value={s.name} onChange={e=>updateSkill(idx,'name',e.target.value)} className="border rounded px-2 py-1 text-xs" /></div>
												<div className="col-span-3 flex flex-col"><label className="text-[10px] text-gray-500">Descrição</label><input value={s.description} onChange={e=>updateSkill(idx,'description',e.target.value)} className="border rounded px-2 py-1 text-xs" /></div>
												<div className="col-span-2 flex flex-col"><label className="text-[10px] text-gray-500">Kind</label><select value={s.kind} onChange={e=>updateSkill(idx,'kind',e.target.value)} className="border rounded px-2 py-1 text-xs"><option value="">—</option><option value="damage">damage</option><option value="debuff">debuff</option><option value="stun">stun</option><option value="buff">buff</option></select></div>
												<div className="col-span-1 flex flex-col"><label className="text-[10px] text-gray-500">Custo</label><input type="number" value={s.cost} onChange={e=>updateSkill(idx,'cost',e.target.value)} className="border rounded px-2 py-1 text-xs" /></div>
												<div className="col-span-1 flex flex-col"><label className="text-[10px] text-gray-500">Base</label><input type="number" value={s.base} onChange={e=>updateSkill(idx,'base',e.target.value)} className="border rounded px-2 py-1 text-xs" /></div>
												<div className="col-span-1 flex flex-col"><label className="text-[10px] text-gray-500">PP Max</label><input type="number" value={s.ppMax} onChange={e=>updateSkill(idx,'ppMax',e.target.value)} className="border rounded px-2 py-1 text-xs" /></div>
												<div className="col-span-1 flex flex-col"><label className="text-[10px] text-gray-500">Stun</label><input type="number" value={s.stun} onChange={e=>updateSkill(idx,'stun',e.target.value)} className="border rounded px-2 py-1 text-xs" /></div>
												<div className="col-span-1 flex flex-col"><label className="text-[10px] text-gray-500">Chance</label><input type="number" step="0.01" value={s.chance} onChange={e=>updateSkill(idx,'chance',e.target.value)} className="border rounded px-2 py-1 text-xs" /></div>
												<div className="col-span-1 flex flex-col"><label className="text-[10px] text-gray-500">Heal</label><input type="number" value={s.heal} onChange={e=>updateSkill(idx,'heal',e.target.value)} className="border rounded px-2 py-1 text-xs" /></div>
											</div>
										</div>
									))}
									<div className="border rounded p-2 bg-white shadow-sm flex flex-col gap-2">
										<div className="text-[11px] font-semibold">Passiva</div>
										<div className="grid grid-cols-6 gap-2">
											<div className="col-span-2 flex flex-col"><label className="text-[10px] text-gray-500">Nome</label><input value={passive.name} onChange={e=>setPassive(p=>({...p,name:e.target.value}))} className="border rounded px-2 py-1 text-xs" /></div>
											<div className="col-span-4 flex flex-col"><label className="text-[10px] text-gray-500">Descrição</label><input value={passive.description} onChange={e=>setPassive(p=>({...p,description:e.target.value}))} className="border rounded px-2 py-1 text-xs" /></div>
										</div>
									</div>
								</div>
							</div>
						</>)}
						<div className="flex items-end gap-2 col-span-6 mt-1">
							<button disabled={saving} className="px-3 py-1 rounded bg-indigo-600 text-white text-xs">{editingId ? 'Salvar alterações' : 'Criar carta'}</button>
							<button type="button" onClick={()=>setFormOpen(false)} className="px-2 py-1 rounded bg-gray-300 text-xs">Cancelar</button>
						</div>
					</form>
				)}
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
									<td className="p-2"><span className={`px-2 py-0.5 rounded-sm text-[11px] font-medium inline-block leading-tight ${rarityColor(c.rarity)}`}>{rarityLabel(c.rarity)}</span></td>
									<td className="p-2 flex gap-2">
										<span>{c.element}</span>
										<button onClick={()=>startEdit(c)} className="text-indigo-600 hover:underline">Editar</button>
										<button onClick={()=>remove(c.id)} className="text-red-600 hover:underline">Del</button>
									</td>
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

/* ------------------------- ITEM CARDS SECTION ---------------------------- */
function ItemCardsSection() {
	const [items, setItems] = useState([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [formOpen, setFormOpen] = useState(false);
	const emptyForm = { 
		id: '', 
		name: '', 
		description: '', 
		itemType: 'CONSUMABLE', 
		rarity: 'COMMON', 
		lore: '', 
		unlockCondition: '', 
		isTradeable: true, 
		portrait: '', 
		full: '' 
	};
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [saving, setSaving] = useState(false);
	const [effects, setEffects] = useState({ type: '', value: '', duration: '', description: '' });

	const load = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const qs = new URLSearchParams();
			if (search) qs.set('search', search);
			qs.set('limit', '200');
			const data = await jsonFetch(`/api/item-cards?${qs.toString()}`);
			setItems(data.itemCards || []);
		} catch (e) {
			setError(e.message);
		} finally { setLoading(false); }
	}, [search]);

	useEffect(() => { load(); }, [load]);

	const rarityOptions = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
	const itemTypeOptions = ['CONSUMABLE', 'EQUIPMENT', 'ARTIFACT', 'RELIC', 'SCROLL'];

	const rarityColor = (rRaw) => {
		const key = (rRaw || '').toString().toUpperCase();
		return ({
			COMMON: 'bg-gray-100 text-gray-800 border border-gray-300',
			RARE: 'bg-blue-100 text-blue-800 border border-blue-300',
			EPIC: 'bg-purple-100 text-purple-800 border border-purple-300',
			LEGENDARY: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
			MYTHIC: 'bg-pink-100 text-pink-800 border border-pink-300'
		}[key]) || 'bg-neutral-100 text-neutral-800 border border-neutral-300';
	};

	const startCreate = () => { 
		setEditingId(null); 
		setForm(emptyForm); 
		setEffects({ type: '', value: '', duration: '', description: '' });
		setFormOpen(true); 
	};

	const startEdit = (item) => { 
		setEditingId(item.id); 
		setForm({
			id: item.id,
			name: item.name || '',
			description: item.description || '',
			itemType: item.itemType || 'CONSUMABLE',
			rarity: item.rarity || 'COMMON',
			lore: item.lore || '',
			unlockCondition: item.unlockCondition || '',
			isTradeable: item.isTradeable !== undefined ? item.isTradeable : true,
			portrait: item.images?.retrato || item.images?.portrait || '',
			full: item.images?.completa || item.images?.full || ''
		});
		const itemEffects = item.effects || {};
		setEffects({
			type: itemEffects.type || '',
			value: itemEffects.value || '',
			duration: itemEffects.duration || '',
			description: itemEffects.description || ''
		});
		setFormOpen(true); 
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true); setError(null);
		
		try {
			const payload = {
				...form,
				effects: effects.type ? effects : {},
				images: {
					retrato: form.portrait,
					completa: form.full
				}
			};

			if (editingId) {
				await jsonFetch('/api/item-cards', { method: 'PUT', body: payload });
			} else {
				await jsonFetch('/api/item-cards', { method: 'POST', body: payload });
			}
			
			setFormOpen(false); 
			load();
		} catch (e) {
			setError(e.message);
		} finally { 
			setSaving(false); 
		}
	};

	const remove = async (id) => {
		if (!confirm('Deletar este item card?')) return;
		try {
			await jsonFetch(`/api/item-cards?id=${id}`, { method: 'DELETE' });
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	return (
		<SectionContainer>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-green-800">Item Cards</h2>
				<button onClick={startCreate} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium">+ Criar Item</button>
			</div>
			
			{formOpen && (
				<div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
					<h3 className="font-medium mb-3 text-green-800">{editingId ? 'Editar' : 'Criar'} Item Card</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">ID</label>
								<input type="text" value={form.id} onChange={(e) => setForm(f => ({...f, id: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" required />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Nome</label>
								<input type="text" value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" required />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Tipo</label>
								<select value={form.itemType} onChange={(e) => setForm(f => ({...f, itemType: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm">
									{itemTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Raridade</label>
								<select value={form.rarity} onChange={(e) => setForm(f => ({...f, rarity: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm">
									{rarityOptions.map(r => <option key={r} value={r}>{r}</option>)}
								</select>
							</div>
						</div>
						
						<div>
							<label className="block text-sm font-medium mb-1">Descrição</label>
							<textarea value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" rows={3}></textarea>
						</div>

						<div className="border-t pt-4">
							<h4 className="font-medium mb-2">Efeitos</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1">Tipo do Efeito</label>
									<input type="text" value={effects.type} onChange={(e) => setEffects(f => ({...f, type: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" placeholder="heal, damage, buff..." />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Valor</label>
									<input type="text" value={effects.value} onChange={(e) => setEffects(f => ({...f, value: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" placeholder="50, +2, etc" />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Duração</label>
									<input type="text" value={effects.duration} onChange={(e) => setEffects(f => ({...f, duration: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" placeholder="instant, 3 turns..." />
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Descrição do Efeito</label>
									<input type="text" value={effects.description} onChange={(e) => setEffects(f => ({...f, description: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" />
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">Imagem Retrato (URL)</label>
								<input type="url" value={form.portrait} onChange={(e) => setForm(f => ({...f, portrait: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Imagem Completa (URL)</label>
								<input type="url" value={form.full} onChange={(e) => setForm(f => ({...f, full: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" />
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">Condição de Unlock</label>
								<input type="text" value={form.unlockCondition} onChange={(e) => setForm(f => ({...f, unlockCondition: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" />
							</div>
							<div className="flex items-center gap-2 mt-6">
								<input type="checkbox" checked={form.isTradeable} onChange={(e) => setForm(f => ({...f, isTradeable: e.target.checked}))} />
								<label className="text-sm">É Trocável</label>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1">Lore</label>
							<textarea value={form.lore} onChange={(e) => setForm(f => ({...f, lore: e.target.value}))} className="w-full border rounded px-2 py-1 text-sm" rows={3}></textarea>
						</div>

						<div className="flex gap-2">
							<button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">{saving ? 'Salvando...' : (editingId ? 'Atualizar' : 'Criar')}</button>
							<button type="button" onClick={() => setFormOpen(false)} className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded text-sm">Cancelar</button>
						</div>
					</form>
					<ErrorInline error={error} />
				</div>
			)}

			<div className="mb-4">
				<input type="text" placeholder="Buscar item cards..." value={search} onChange={(e) => setSearch(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-80" />
			</div>

			<div className="border border-gray-200 rounded-lg overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-green-50">
							<tr>
								<th className="text-left p-2 font-medium">ID</th>
								<th className="text-left p-2 font-medium">Nome</th>
								<th className="text-left p-2 font-medium">Tipo</th>
								<th className="text-left p-2 font-medium">Raridade</th>
								<th className="text-left p-2 font-medium">Trocável</th>
								<th className="text-left p-2 font-medium">Ações</th>
							</tr>
						</thead>
						<tbody>
							{loading && (
								<tr><td className="p-4 text-center" colSpan={6}><LoadingInline /></td></tr>
							)}
							{items.map(item => (
								<tr key={item.id} className="border-t hover:bg-gray-50">
									<td className="p-2 font-mono text-xs">{item.id}</td>
									<td className="p-2">{item.name}</td>
									<td className="p-2">{item.itemType}</td>
									<td className="p-2"><span className={`px-2 py-0.5 rounded-sm text-[11px] font-medium inline-block leading-tight ${rarityColor(item.rarity)}`}>{item.rarity}</span></td>
									<td className="p-2">{item.isTradeable ? 'Sim' : 'Não'}</td>
									<td className="p-2 flex gap-2">
										<button onClick={()=>startEdit(item)} className="text-green-600 hover:underline">Editar</button>
										<button onClick={()=>remove(item.id)} className="text-red-600 hover:underline">Del</button>
									</td>
								</tr>
							))}
							{!loading && items.length === 0 && (
								<tr><td className="p-4 text-center text-gray-500" colSpan={6}>Nenhum item card encontrado</td></tr>
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
	const [form, setForm] = useState({ uid: '', name: '', avatarUrl: '', mmr: '', banned: false });
	const [updating, setUpdating] = useState(false);

		const load = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const data = await jsonFetch('/api/players');
			setPlayers(data.players || []);
		} catch (e) { setError(e.message); } finally { setLoading(false); }
		}, []);
		useEffect(() => { load(); }, [load]);

	const resetForm = () => { setForm({ uid: '', name: '', avatarUrl: '', mmr: '', banned: false }); setEditing(null); };

	const handleSubmit = async (e) => {
		e.preventDefault();
		setUpdating(true); setError(null);
		try {
			if (editing) {
				await jsonFetch('/api/players', { method: 'PUT', body: { uid: editing, data: { name: form.name, avatarUrl: form.avatarUrl, mmr: form.mmr ? +form.mmr : undefined, banned: form.banned } } });
			} else {
				await jsonFetch('/api/players', { method: 'POST', body: { uid: form.uid, name: form.name, avatarUrl: form.avatarUrl } });
			}
			resetForm();
			await load();
		} catch (e) { setError(e.message); } finally { setUpdating(false); }
	};

	const startEdit = (p) => {
		setEditing(p.uid);
		setForm({ uid: p.uid, name: p.name, avatarUrl: p.avatarUrl || '', mmr: p.mmr ?? '', banned: !!p.banned });
	};

	const remove = async (uid) => { if (!confirm('Deletar jogador?')) return; try { await jsonFetch(`/api/players?uid=${uid}`, { method: 'DELETE' }); await load(); } catch (e) { setError(e.message); } };

	return (
		<SectionContainer>
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<h3 className="font-semibold">Players</h3>
					<button onClick={load} disabled={loading} className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Recarregar</button>
					{loading && <LoadingInline />}
				</div>
				<form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-6 bg-gray-50 p-3 rounded border text-sm">
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
					<div className="flex flex-col">
						<label className="text-xs text-gray-500">MMR</label>
						<input value={form.mmr} onChange={(e) => setForm(f => ({ ...f, mmr: e.target.value }))} className="border rounded px-2 py-1" />
					</div>
					<div className="flex flex-col">
						<label className="text-xs text-gray-500">Banido</label>
						<select value={form.banned ? 'true' : 'false'} onChange={(e)=>setForm(f=>({...f,banned:e.target.value==='true'}))} className="border rounded px-2 py-1"><option value="false">Não</option><option value="true">Sim</option></select>
					</div>
					<div className="flex items-end gap-2">
						<button disabled={updating} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-500 disabled:opacity-50">
							{editing ? 'Salvar' : 'Criar'}
						</button>
						{editing && <button type="button" onClick={resetForm} className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>}
					</div>
					<div className="sm:col-span-6"><ErrorInline error={error} /></div>
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
									<td className="p-2 flex gap-2">
										<button onClick={() => startEdit(p)} className="text-indigo-600 hover:underline text-xs">Editar</button>
										<button onClick={() => remove(p.uid)} className="text-red-600 hover:underline text-xs">Del</button>
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
	const [editingId, setEditingId] = useState(null);

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
			if (editingId) {
				await jsonFetch('/api/contos', { method: 'PUT', body: { id: editingId, slug: form.slug, titulo: form.titulo, resumo: form.resumo, corpo: form.corpo } });
			} else {
				await jsonFetch('/api/contos', { method: 'POST', body: { ...form, corpo: form.corpo } });
			}
			setForm({ slug: '', titulo: '', resumo: '', corpo: '' });
			setEditingId(null);
			await load();
		} catch (e) { setError(e.message); } finally { setCreating(false); }
	};

	const startEdit = (s) => { setEditingId(s.id); setForm({ slug: s.slug, titulo: s.title, resumo: s.summary || '', corpo: s.body || '' }); };
	const remove = async (id) => { if (!confirm('Deletar conto?')) return; try { await jsonFetch(`/api/contos?id=${id}`, { method: 'DELETE' }); await load(); } catch (e) { setError(e.message); } };

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
							<button disabled={creating} className="px-3 py-1 rounded bg-amber-600 text-white text-sm hover:bg-amber-500 disabled:opacity-50">{editingId ? 'Salvar alterações' : 'Criar conto'}</button>
							{editingId && <button type="button" onClick={()=>{ setEditingId(null); setForm({ slug:'', titulo:'', resumo:'', corpo:'' }); }} className="px-2 py-1 text-xs rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>}
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
									<td className="p-2 flex gap-2">{s.publishedAt ? new Date(s.publishedAt).toLocaleDateString() : '—'}
										<button onClick={()=>startEdit(s)} className="text-indigo-600 hover:underline">Editar</button>
										<button onClick={()=>remove(s.id)} className="text-red-600 hover:underline">Del</button>
									</td>
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
				{tab === 'item-cards' && <ItemCardsSection />}
				{tab === 'players' && <PlayersSection />}
				{tab === 'contos' && <ContosSection />}
				{tab === 'card-inventory' && <CardInventorySection />}
			</div>
		</div>
	);
}

