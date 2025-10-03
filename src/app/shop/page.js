// src/app/shop/page.js// src/app/shop/page.js"use client";

"use client";

"use client";

import Link from 'next/link';

import { useState, useEffect } from 'react';import Link from 'next/link';

import LayoutDePagina from '@/components/UI/PageLayout';

import { useAuth } from '@/hooks/useAuth';import Link from 'next/link';import Image from 'next/image';

import { BOOSTER_CONFIG } from '@/utils/boosterSystem';

import { useState, useEffect } from 'react';import { useEffect, useMemo, useState } from 'react';

export default function Loja() {

  const { user } = useAuth();import LayoutDePagina from '@/components/UI/PageLayout';import LayoutDePagina from '@/components/UI/PageLayout';

  const [pullHistory, setPullHistory] = useState(null);

  const [loading, setLoading] = useState(true);import { useAuth } from '@/hooks/useAuth';import { obterRaridades } from '@/utils/constantsAPI';

  const [comprando, setComprando] = useState(false);

  const [abrindo, setAbrindo] = useState(false);import { BOOSTER_CONFIG } from '@/utils/boosterSystem';

  const [cartasAbertas, setCartasAbertas] = useState(null);

// Tema visual por raridade (usando strings diretas por enquanto)

  useEffect(() => {

    if (user) {export default function Loja() {const temaDeRaridade = {

      carregarHistorico();

    }  const { user } = useAuth();  Mítico: 'border-red-500 text-red-300',

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [user]);  const [pullHistory, setPullHistory] = useState(null);  Lendário: 'border-yellow-500 text-yellow-300',



  const carregarHistorico = async () => {  const [loading, setLoading] = useState(true);  Épico: 'border-purple-500 text-purple-300',

    try {

      setLoading(true);  const [comprando, setComprando] = useState(false);};

      const response = await fetch(`/api/boosters?playerId=${user.id}`);

      const data = await response.json();  const [abrindo, setAbrindo] = useState(false);

      setPullHistory(data.pullHistory);

    } catch (error) {  const [cartasAbertas, setCartasAbertas] = useState(null);// Rola a raridade com base em uma tabela de probabilidades [{raridade, p}]

      console.error('Erro ao carregar histórico:', error);

    } finally {function rolarRaridade(tabela) {

      setLoading(false);

    }  useEffect(() => {	const r = Math.random() * 100;

  };

    if (user) {	let acumulado = 0;

  const comprarBooster = async (tamanho) => {

    if (!user || comprando) return;      carregarHistorico();	for (const item of tabela) {



    const preco = BOOSTER_CONFIG.PRECOS[tamanho];    }		acumulado += item.p;

    if (pullHistory.moedas < preco) {

      alert('Moedas insuficientes!');  }, [user]);		if (r < acumulado) return item.raridade;

      return;

    }	}



    try {  const carregarHistorico = async () => {	// Garantia: retorna a última raridade disponível

      setComprando(true);

      const response = await fetch('/api/boosters', {    try {	return tabela[tabela.length - 1].raridade;

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },      setLoading(true);}

        body: JSON.stringify({

          playerId: user.id,      const response = await fetch(`/api/boosters?playerId=${user.id}`);

          acao: 'COMPRAR',

          tamanhoBooster: tamanho,      const data = await response.json();export default function Loja() {

        }),

      });      setPullHistory(data.pullHistory);	const [gemas, definirGemas] = useState(75);



      const data = await response.json();    } catch (error) {	const [resultados, definirResultados] = useState([]);

      

      if (data.sucesso) {      console.error('Erro ao carregar histórico:', error);	const [mostrarResultados, definirMostrarResultados] = useState(false);

        setPullHistory(data.pullHistory);

        alert(data.mensagem);    } finally {	const [ocupado, definirOcupado] = useState(false);

      } else {

        alert(data.error || 'Erro ao comprar booster');      setLoading(false);	const [cartas, definirCartas] = useState([]);

      }

    } catch (error) {    }	const [raridades, definirRaridades] = useState({});

      console.error('Erro ao comprar:', error);

      alert('Erro ao processar compra');  };	const [carregando, definirCarregando] = useState(true);

    } finally {

      setComprando(false);	// Estados de pity por banner

    }

  };  const comprarBooster = async (tamanho) => {	const [pitySemanal5, definirPitySemanal5] = useState(0);



  const abrirBooster = async (tamanho) => {    if (!user || comprando) return;	const [pitySemanal4, definirPitySemanal4] = useState(0);

    if (!user || abrindo) return;

	const [cinquentaPorCentoPerdidoSemanal, definirCinquentaPorCentoPerdidoSemanal] = useState(false);

    if (pullHistory.boostersDisponiveis < 1) {

      alert('Você não tem boosters disponíveis!');    const preco = BOOSTER_CONFIG.PRECOS[tamanho];	const [pityPadrao5, definirPityPadrao5] = useState(0);

      return;

    }    if (pullHistory.moedas < preco) {	const [pityPadrao4, definirPityPadrao4] = useState(0);



    try {      alert('Moedas insuficientes!');

      setAbrindo(true);

      const response = await fetch('/api/boosters', {      return;	// Carrega dados da API

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },    }	useEffect(() => {

        body: JSON.stringify({

          playerId: user.id,		async function carregarDados() {

          acao: 'ABRIR',

          tamanhoBooster: tamanho,    try {			try {

        }),

      });      setComprando(true);				// Carregar cartas da API



      const data = await response.json();      const response = await fetch('/api/boosters', {				const respostaCartas = await fetch('/api/cards');

      

      if (data.sucesso) {        method: 'POST',				const dadosCartas = await respostaCartas.json();

        setPullHistory(data.pullHistory);

        setCartasAbertas(data.cartas);        headers: { 'Content-Type': 'application/json' },				definirCartas(dadosCartas.cards || []);

      } else {

        alert(data.error || 'Erro ao abrir booster');        body: JSON.stringify({

      }

    } catch (error) {          playerId: user.id,				// Carregar raridades

      console.error('Erro ao abrir booster:', error);

      alert('Erro ao processar abertura');          acao: 'COMPRAR',				const dadosRaridades = await obterRaridades();

    } finally {

      setAbrindo(false);          tamanhoBooster: tamanho,				definirRaridades(dadosRaridades);

    }

  };        }),			} catch (erroCarregamento) {



  const fecharModal = () => {      });				console.error('Erro ao carregar dados:', erroCarregamento);

    setCartasAbertas(null);

  };			} finally {



  if (!user) {      const data = await response.json();				definirCarregando(false);

    return (

      <LayoutDePagina>      			}

        <div className="min-h-[60vh] flex items-center justify-center">

          <div className="text-center">      if (data.sucesso) {		}

            <p className="text-xl text-gray-400 mb-4">Faça login para acessar a loja</p>

            <Link        setPullHistory(data.pullHistory);		

              href="/login"

              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold inline-block"        alert(data.mensagem);		carregarDados();

            >

              Fazer Login      } else {	}, []);

            </Link>

          </div>        alert(data.error || 'Erro ao comprar booster');

        </div>

      </LayoutDePagina>      }	// Carrega pity do localStorage

    );

  }    } catch (error) {	useEffect(() => {



  if (loading) {      console.error('Erro ao comprar:', error);		try {

    return (

      <LayoutDePagina>      alert('Erro ao processar compra');			const w5 = Number(localStorage.getItem('gacha.semanal.p5') ?? localStorage.getItem('gacha.weekly.p5') ?? '0');

        <div className="min-h-[60vh] flex items-center justify-center">

          <div className="text-xl text-gray-400">Carregando loja...</div>    } finally {			const w4 = Number(localStorage.getItem('gacha.semanal.p4') ?? localStorage.getItem('gacha.weekly.p4') ?? '0');

        </div>

      </LayoutDePagina>      setComprando(false);			const wf = (localStorage.getItem('gacha.semanal.perdeu50') ?? localStorage.getItem('gacha.weekly.fifty')) === '1';

    );

  }    }			const s5 = Number(localStorage.getItem('gacha.padrao.p5') ?? localStorage.getItem('gacha.standard.p5') ?? '0');



  return (  };			const s4 = Number(localStorage.getItem('gacha.padrao.p4') ?? localStorage.getItem('gacha.standard.p4') ?? '0');

    <LayoutDePagina>

      <div className="container mx-auto px-4 py-8">			definirPitySemanal5(isNaN(w5) ? 0 : w5);

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">  const abrirBooster = async (tamanho) => {			definirPitySemanal4(isNaN(w4) ? 0 : w4);

            🎁 Loja de Boosters

          </h1>    if (!user || abrindo) return;			definirCinquentaPorCentoPerdidoSemanal(wf);

          <p className="text-xl text-purple-300">

            Compre pacotes de cartas e expanda sua coleção!			definirPityPadrao5(isNaN(s5) ? 0 : s5);

          </p>

        </div>    if (pullHistory.boostersDisponiveis < 1) {			definirPityPadrao4(isNaN(s4) ? 0 : s4);



        <div className="max-w-4xl mx-auto mb-8">      alert('Você não tem boosters disponíveis!');		} catch {}

          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">

            <div className="grid md:grid-cols-2 gap-6">      return;	}, []);

              <div className="text-center">

                <div className="text-sm text-gray-400 mb-2">Suas Moedas</div>    }

                <div className="text-3xl font-bold text-yellow-400">

                  💰 {pullHistory?.moedas || 0}	// Persiste pity

                </div>

              </div>    try {	useEffect(() => {

              <div className="text-center">

                <div className="text-sm text-gray-400 mb-2">Boosters Disponíveis</div>      setAbrindo(true);		try {

                <div className="text-3xl font-bold text-purple-400">

                  🎁 {pullHistory?.boostersDisponiveis || 0}      const response = await fetch('/api/boosters', {			localStorage.setItem('gacha.semanal.p5', String(pitySemanal5));

                </div>

              </div>        method: 'POST',			localStorage.setItem('gacha.semanal.p4', String(pitySemanal4));

            </div>

          </div>        headers: { 'Content-Type': 'application/json' },			localStorage.setItem('gacha.semanal.perdeu50', cinquentaPorCentoPerdidoSemanal ? '1' : '0');

        </div>

        body: JSON.stringify({			localStorage.setItem('gacha.padrao.p5', String(pityPadrao5));

        <div className="max-w-4xl mx-auto mb-8">

          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">          playerId: user.id,			localStorage.setItem('gacha.padrao.p4', String(pityPadrao4));

            <h3 className="text-xl font-bold mb-4 text-center text-blue-300">

              📊 Contadores de Pity          acao: 'ABRIR',		} catch {}

            </h3>

            <div className="grid md:grid-cols-3 gap-4">          tamanhoBooster: tamanho,	}, [pitySemanal5, pitySemanal4, cinquentaPorCentoPerdidoSemanal, pityPadrao5, pityPadrao4]);

              <div className="bg-black/30 p-4 rounded-lg border border-purple-500/30">

                <div className="text-center">        }),

                  <div className="text-purple-400 font-semibold mb-2">Épico</div>

                  <div className="text-2xl font-bold mb-1">      });	// Conjuntos por raridade

                    {pullHistory?.pityCounters.epico || 0}

                  </div>	const conjuntos = useMemo(() => {

                  <div className="text-xs text-gray-400">

                    {15 - (pullHistory?.pityCounters.epico || 0)} pulls até garantido      const data = await response.json();		if (!raridades || !cartas.length) return { 'Mítico': [], 'Lendário': [], 'Épico': [] };

                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">      		

                    <div 

                      className="bg-purple-500 h-2 rounded-full transition-all"      if (data.sucesso) {		const porRaridade = {

                      style={{ width: `${((pullHistory?.pityCounters.epico || 0) / 15) * 100}%` }}

                    ></div>        setPullHistory(data.pullHistory);			[raridades.MYTHIC || 'Mítico']: [],

                  </div>

                </div>        setCartasAbertas(data.cartas);			[raridades.LEGENDARY || 'Lendário']: [],

              </div>

      } else {			[raridades.EPIC || 'Épico']: [],

              <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/30">

                <div className="text-center">        alert(data.error || 'Erro ao abrir booster');		};

                  <div className="text-yellow-400 font-semibold mb-2">Lendário</div>

                  <div className="text-2xl font-bold mb-1">      }		

                    {pullHistory?.pityCounters.lendario || 0}

                  </div>    } catch (error) {		for (const c of cartas) {

                  <div className="text-xs text-gray-400">

                    {90 - (pullHistory?.pityCounters.lendario || 0)} pulls até garantido      console.error('Erro ao abrir booster:', error);			if (porRaridade[(c.raridade || c.rarity)]) porRaridade[(c.raridade || c.rarity)].push(c);

                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">      alert('Erro ao processar abertura');		}

                    <div 

                      className="bg-yellow-500 h-2 rounded-full transition-all"    } finally {		return porRaridade;

                      style={{ width: `${((pullHistory?.pityCounters.lendario || 0) / 90) * 100}%` }}

                    ></div>      setAbrindo(false);	}, [cartas, raridades]);

                  </div>

                </div>    }

              </div>

  };	// Banner semanal: destaque Mítico

              <div className="bg-black/30 p-4 rounded-lg border border-red-500/30">

                <div className="text-center">	const destaqueSemanal = useMemo(() => {

                  <div className="text-red-400 font-semibold mb-2">Mítico</div>

                  <div className="text-2xl font-bold mb-1">  const fecharModal = () => {		// Seleciona o primeiro Mítico como destaque (rotacionar no futuro)

                    {pullHistory?.pityCounters.mitico || 0}

                  </div>    setCartasAbertas(null);		const miticos = conjuntos[raridades.MYTHIC || 'Mítico'] || [];

                  <div className="text-xs text-gray-400">

                    {300 - (pullHistory?.pityCounters.mitico || 0)} pulls até garantido  };		return miticos[0] || null;

                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">	}, [conjuntos, raridades]);

                    <div 

                      className="bg-red-500 h-2 rounded-full transition-all"  if (!user) {

                      style={{ width: `${((pullHistory?.pityCounters.mitico || 0) / 300) * 100}%` }}

                    ></div>    return (	const probabilidadesSemanais = [

                  </div>

                </div>      <LayoutDePagina>		{ raridade: 'Mítico', p: 0.8 },

              </div>

            </div>        <div className="min-h-[60vh] flex items-center justify-center">		{ raridade: 'Lendário', p: 9.2 },

          </div>

        </div>          <div className="text-center">		{ raridade: 'Épico', p: 90 },



        <div className="max-w-6xl mx-auto mb-8">            <p className="text-xl text-gray-400 mb-4">Faça login para acessar a loja</p>	];

          <h2 className="text-2xl font-bold mb-6 text-center text-purple-300">

            Pacotes Disponíveis            <Link

          </h2>

          <div className="grid md:grid-cols-3 gap-6">              href="/login"	// Banner padrão: chance um pouco maior de Lendárias

            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border-2 border-green-500/30 hover:border-green-500 transition-all">

              <div className="text-center mb-4">              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold inline-block"	const probabilidadesPadrao = [

                <div className="text-4xl mb-2">📦</div>

                <h3 className="text-xl font-bold text-green-400">Booster Pequeno</h3>            >		{ raridade: 'Mítico', p: 0.5 },

                <p className="text-sm text-gray-400 mt-2">3 cartas</p>

              </div>              Fazer Login		{ raridade: 'Lendário', p: 9.5 },

              

              <div className="bg-black/40 p-4 rounded-lg mb-4">            </Link>		{ raridade: 'Épico', p: 90 },

                <div className="text-center">

                  <div className="text-2xl font-bold text-yellow-400 mb-1">          </div>	];

                    💰 {BOOSTER_CONFIG.PRECOS.PEQUENO}

                  </div>        </div>

                  <div className="text-xs text-gray-400">moedas</div>

                </div>      </LayoutDePagina>	// Custos

              </div>

    );	const custoUnico = 8; // gemas

              <button

                onClick={() => comprarBooster('PEQUENO')}  }	const custoDez = 75; // gemas

                disabled={comprando || pullHistory?.moedas < BOOSTER_CONFIG.PRECOS.PEQUENO}

                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors mb-2"

              >

                {comprando ? 'Comprando...' : 'Comprar'}  if (loading) {	function realizarInvocacoes(tipoBanner, quantidade) {

              </button>

    return (		const probabilidades = tipoBanner === 'semanal' ? probabilidadesSemanais : probabilidadesPadrao;

              {pullHistory?.boostersDisponiveis > 0 && (

                <button      <LayoutDePagina>		const cartasObtidas = [];

                  onClick={() => abrirBooster('PEQUENO')}

                  disabled={abrindo}        <div className="min-h-[60vh] flex items-center justify-center">

                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"

                >          <div className="text-xl text-gray-400">Carregando loja...</div>		let contadorPityMitico = tipoBanner === 'semanal' ? pitySemanal5 : pityPadrao5;

                  {abrindo ? 'Abrindo...' : 'Abrir Booster'}

                </button>        </div>		let contadorPityLendario = tipoBanner === 'semanal' ? pitySemanal4 : pityPadrao4;

              )}

            </div>      </LayoutDePagina>		let perdeuGarantiaSemanal = tipoBanner === 'semanal' ? cinquentaPorCentoPerdidoSemanal : false;



            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border-2 border-blue-500/30 hover:border-blue-500 transition-all">    );

              <div className="text-center mb-4">

                <div className="text-4xl mb-2">📦📦</div>  }		for (let indice = 0; indice < quantidade; indice += 1) {

                <h3 className="text-xl font-bold text-blue-400">Booster Médio</h3>

                <p className="text-sm text-gray-400 mt-2">5 cartas</p>			let raridadeAtual;

                <div className="text-xs text-purple-300 mt-1">+1 carta bônus!</div>

              </div>  return (			if (contadorPityMitico >= 29) {

              

              <div className="bg-black/40 p-4 rounded-lg mb-4">    <LayoutDePagina>				raridadeAtual = 'Mítico';

                <div className="text-center">

                  <div className="text-2xl font-bold text-yellow-400 mb-1">      <div className="container mx-auto px-4 py-8">			} else if (contadorPityLendario >= 9) {

                    💰 {BOOSTER_CONFIG.PRECOS.MEDIO}

                  </div>        {/* Header */}				const tentativa = rolarRaridade(probabilidades);

                  <div className="text-xs text-gray-400">moedas</div>

                  <div className="text-xs text-green-400 mt-1">        <div className="text-center mb-8">				raridadeAtual = tentativa === 'Mítico' ? 'Mítico' : 'Lendário';

                    Economize {BOOSTER_CONFIG.PRECOS.PEQUENO * 2 - BOOSTER_CONFIG.PRECOS.MEDIO} moedas!

                  </div>          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">			} else {

                </div>

              </div>            🎁 Loja de Boosters				raridadeAtual = rolarRaridade(probabilidades);



              <button          </h1>			}

                onClick={() => comprarBooster('MEDIO')}

                disabled={comprando || pullHistory?.moedas < BOOSTER_CONFIG.PRECOS.MEDIO}          <p className="text-xl text-purple-300">

                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors mb-2"

              >            Compre pacotes de cartas e expanda sua coleção!			const conjuntoPorRaridade = conjuntos[raridadeAtual] || [];

                {comprando ? 'Comprando...' : 'Comprar'}

              </button>          </p>			let cartaObtida = null;



              {pullHistory?.boostersDisponiveis > 0 && (        </div>

                <button

                  onClick={() => abrirBooster('MEDIO')}			if (raridadeAtual === 'Mítico') {

                  disabled={abrindo}

                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"        {/* Saldo do Jogador */}				if (tipoBanner === 'semanal') {

                >

                  {abrindo ? 'Abrindo...' : 'Abrir Booster'}        <div className="max-w-4xl mx-auto mb-8">					if (destaqueSemanal) {

                </button>

              )}          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">						if (perdeuGarantiaSemanal) {

            </div>

            <div className="grid md:grid-cols-2 gap-6">							cartaObtida = destaqueSemanal;

            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border-2 border-purple-500/30 hover:border-purple-500 transition-all relative overflow-hidden">

              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 transform rotate-12 translate-x-2 -translate-y-1">              <div className="text-center">							perdeuGarantiaSemanal = false;

                MELHOR VALOR!

              </div>                <div className="text-sm text-gray-400 mb-2">Suas Moedas</div>						} else {

              

              <div className="text-center mb-4">                <div className="text-3xl font-bold text-yellow-400">							const caiuDestaque = Math.random() < 0.5;

                <div className="text-4xl mb-2">📦📦📦</div>

                <h3 className="text-xl font-bold text-purple-400">Booster Grande</h3>                  💰 {pullHistory?.moedas || 0}							if (caiuDestaque) {

                <p className="text-sm text-gray-400 mt-2">10 cartas</p>

                <div className="text-xs text-purple-300 mt-1">+1 Épico garantido!</div>                </div>								cartaObtida = destaqueSemanal;

              </div>

                            </div>							} else {

              <div className="bg-black/40 p-4 rounded-lg mb-4">

                <div className="text-center">              <div className="text-center">								const opcoesForaDoBanner = conjuntoPorRaridade.filter((carta) => !destaqueSemanal || carta.id !== destaqueSemanal.id);

                  <div className="text-2xl font-bold text-yellow-400 mb-1">

                    💰 {BOOSTER_CONFIG.PRECOS.GRANDE}                <div className="text-sm text-gray-400 mb-2">Boosters Disponíveis</div>								cartaObtida = opcoesForaDoBanner[Math.floor(Math.random() * opcoesForaDoBanner.length)] || destaqueSemanal;

                  </div>

                  <div className="text-xs text-gray-400">moedas</div>                <div className="text-3xl font-bold text-purple-400">								if (cartaObtida && destaqueSemanal && cartaObtida.id !== destaqueSemanal.id) {

                  <div className="text-xs text-green-400 mt-1">

                    Economize {BOOSTER_CONFIG.PRECOS.PEQUENO * 4 - BOOSTER_CONFIG.PRECOS.GRANDE} moedas!                  🎁 {pullHistory?.boostersDisponiveis || 0}									perdeuGarantiaSemanal = true;

                  </div>

                </div>                </div>								}

              </div>

              </div>							}

              <button

                onClick={() => comprarBooster('GRANDE')}            </div>						}

                disabled={comprando || pullHistory?.moedas < BOOSTER_CONFIG.PRECOS.GRANDE}

                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors mb-2"          </div>					} else {

              >

                {comprando ? 'Comprando...' : 'Comprar'}        </div>						cartaObtida = conjuntoPorRaridade[Math.floor(Math.random() * conjuntoPorRaridade.length)] || null;

              </button>

					}

              {pullHistory?.boostersDisponiveis > 0 && (

                <button        {/* Pity Counters */}				} else {

                  onClick={() => abrirBooster('GRANDE')}

                  disabled={abrindo}        <div className="max-w-4xl mx-auto mb-8">					const opcoesPadrao = conjuntoPorRaridade.filter((carta) => !destaqueSemanal || carta.id !== destaqueSemanal.id);

                  className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"

                >          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">					cartaObtida = opcoesPadrao[Math.floor(Math.random() * opcoesPadrao.length)] || null;

                  {abrindo ? 'Abrindo...' : 'Abrir Booster'}

                </button>            <h3 className="text-xl font-bold mb-4 text-center text-blue-300">				}

              )}

            </div>              📊 Contadores de Pity			} else {

          </div>

        </div>            </h3>				cartaObtida = conjuntoPorRaridade[Math.floor(Math.random() * conjuntoPorRaridade.length)] || null;



        <div className="max-w-4xl mx-auto mb-8">            <div className="grid md:grid-cols-3 gap-4">			}

          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">

            <h3 className="text-xl font-bold mb-4 text-center text-gray-300">              <div className="bg-black/30 p-4 rounded-lg border border-purple-500/30">

              📈 Suas Estatísticas

            </h3>                <div className="text-center">			if (raridadeAtual === 'Mítico') {

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center text-sm">

              <div>                  <div className="text-purple-400 font-semibold mb-2">Épico</div>				contadorPityMitico = 0;

                <div className="text-gray-400">Total de Pulls</div>

                <div className="text-xl font-bold">{pullHistory?.total || 0}</div>                  <div className="text-2xl font-bold mb-1">				contadorPityLendario = 0;

              </div>

              <div>                    {pullHistory?.pityCounters.epico || 0}			} else if (raridadeAtual === 'Lendário') {

                <div className="text-gray-400">Míticos</div>

                <div className="text-xl font-bold text-red-400">{pullHistory?.porRaridade?.MITICO || 0}</div>                  </div>				contadorPityMitico += 1;

              </div>

              <div>                  <div className="text-xs text-gray-400">				contadorPityLendario = 0;

                <div className="text-gray-400">Lendários</div>

                <div className="text-xl font-bold text-yellow-400">{pullHistory?.porRaridade?.LENDARIO || 0}</div>                    {15 - (pullHistory?.pityCounters.epico || 0)} pulls até garantido			} else {

              </div>

              <div>                  </div>				contadorPityMitico += 1;

                <div className="text-gray-400">Épicos</div>

                <div className="text-xl font-bold text-purple-400">{pullHistory?.porRaridade?.EPICO || 0}</div>                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">				contadorPityLendario += 1;

              </div>

              <div>                    <div 			}

                <div className="text-gray-400">Raros</div>

                <div className="text-xl font-bold text-blue-400">{pullHistory?.porRaridade?.RARO || 0}</div>                      className="bg-purple-500 h-2 rounded-full transition-all"

              </div>

              <div>                      style={{ width: `${((pullHistory?.pityCounters.epico || 0) / 15) * 100}%` }}			if (cartaObtida) {

                <div className="text-gray-400">Comuns</div>

                <div className="text-xl font-bold text-gray-400">{pullHistory?.porRaridade?.COMUM || 0}</div>                    ></div>				cartasObtidas.push(cartaObtida);

              </div>

            </div>                  </div>			}

          </div>

        </div>                </div>		}



        {cartasAbertas && (              </div>

          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">

            <div className="bg-black/90 rounded-lg p-8 max-w-4xl w-full border border-purple-500 max-h-[90vh] overflow-y-auto">		if (tipoBanner === 'semanal') {

              <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-500">

                🎉 Suas Novas Cartas!              <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/30">			definirPitySemanal5(contadorPityMitico);

              </h2>

                              <div className="text-center">			definirPitySemanal4(contadorPityLendario);

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

                {cartasAbertas.map((carta, index) => (                  <div className="text-yellow-400 font-semibold mb-2">Lendário</div>			definirCinquentaPorCentoPerdidoSemanal(perdeuGarantiaSemanal);

                  <div

                    key={index}                  <div className="text-2xl font-bold mb-1">		} else {

                    className={`bg-black/50 p-4 rounded-lg border-2 ${

                      carta.raridadeSorteada === 'MITICO' ? 'border-red-500 shadow-lg shadow-red-500/50' :                    {pullHistory?.pityCounters.lendario || 0}			definirPityPadrao5(contadorPityMitico);

                      carta.raridadeSorteada === 'LENDARIO' ? 'border-yellow-500 shadow-lg shadow-yellow-500/50' :

                      carta.raridadeSorteada === 'EPICO' ? 'border-purple-500 shadow-lg shadow-purple-500/50' :                  </div>			definirPityPadrao4(contadorPityLendario);

                      carta.raridadeSorteada === 'RARO' ? 'border-blue-500' :

                      'border-gray-500'                  <div className="text-xs text-gray-400">		}

                    }`}

                  >                    {90 - (pullHistory?.pityCounters.lendario || 0)} pulls até garantido

                    <div className="text-center">

                      <div className="text-2xl mb-2">                  </div>		return cartasObtidas;

                        {carta.raridadeSorteada === 'MITICO' && '⭐⭐⭐'}

                        {carta.raridadeSorteada === 'LENDARIO' && '⭐⭐'}                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">	}

                        {carta.raridadeSorteada === 'EPICO' && '⭐'}

                      </div>                    <div 

                      <h3 className="font-bold mb-1">{carta.name}</h3>

                      <p className={`text-xs ${                      className="bg-yellow-500 h-2 rounded-full transition-all"	async function invocar(tipoBanner, quantidade) {

                        carta.raridadeSorteada === 'MITICO' ? 'text-red-400' :

                        carta.raridadeSorteada === 'LENDARIO' ? 'text-yellow-400' :                      style={{ width: `${((pullHistory?.pityCounters.lendario || 0) / 90) * 100}%` }}		if (ocupado) return;

                        carta.raridadeSorteada === 'EPICO' ? 'text-purple-400' :

                        carta.raridadeSorteada === 'RARO' ? 'text-blue-400' :                    ></div>		const custo = quantidade === 10 ? custoDez : custoUnico;

                        'text-gray-400'

                      }`}>                  </div>		if (gemas < custo) return;

                        {carta.raridadeSorteada}

                      </p>                </div>		definirOcupado(true);

                    </div>

                  </div>              </div>		try {

                ))}

              </div>			definirGemas((quantidadeAtual) => quantidadeAtual - custo);



              <button              <div className="bg-black/30 p-4 rounded-lg border border-red-500/30">			const cartasInvocadas = realizarInvocacoes(tipoBanner, quantidade);

                onClick={fecharModal}

                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"                <div className="text-center">			definirResultados(cartasInvocadas);

              >

                Continuar                  <div className="text-red-400 font-semibold mb-2">Mítico</div>			definirMostrarResultados(true);

              </button>

            </div>                  <div className="text-2xl font-bold mb-1">		} finally {

          </div>

        )}                    {pullHistory?.pityCounters.mitico || 0}			definirOcupado(false);



        <div className="text-center">                  </div>		}

          <Link

            href="/"                  <div className="text-xs text-gray-400">	}

            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-semibold inline-block"

          >                    {300 - (pullHistory?.pityCounters.mitico || 0)} pulls até garantido

            ← Voltar ao Menu Principal

          </Link>                  </div>		const CartaoDeBanner = ({ id, titulo, subtitulo, realce, destaque, probabilidades, pity5, pity4 }) => {

        </div>

      </div>                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">			const mapaDeRealce = {

    </LayoutDePagina>

  );                    <div 				emerald: {

}

                      className="bg-red-500 h-2 rounded-full transition-all"					borda: 'ring-emerald-400/40',

                      style={{ width: `${((pullHistory?.pityCounters.mitico || 0) / 300) * 100}%` }}					botao: 'bg-emerald-600 hover:bg-emerald-700',

                    ></div>					chip: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40',

                  </div>				},

                </div>				amber: {

              </div>					borda: 'ring-amber-400/40',

            </div>					botao: 'bg-amber-600 hover:bg-amber-700',

          </div>					chip: 'bg-amber-600/30 text-amber-200 border-amber-500/40',

        </div>				},

			};

        {/* Boosters à Venda */}

        <div className="max-w-6xl mx-auto mb-8">			const temaSelecionado = mapaDeRealce[realce] || mapaDeRealce.amber;

          <h2 className="text-2xl font-bold mb-6 text-center text-purple-300">

            Pacotes Disponíveis			return (

          </h2>				<div className={`relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm ring-1 ${temaSelecionado.borda} overflow-hidden`}>

          <div className="grid md:grid-cols-3 gap-6">					<div className="relative w-full h-[420px] md:h-[480px]">

            {/* Booster Pequeno */}						<Image

            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border-2 border-green-500/30 hover:border-green-500 transition-all">							src={

              <div className="text-center mb-4">								(id === 'semanal'

                <div className="text-4xl mb-2">📦</div>									? destaque?.imagens?.cheia || destaque?.imagens?.retrato || destaque?.images?.full || destaque?.images?.portrait

                <h3 className="text-xl font-bold text-green-400">Booster Pequeno</h3>									: destaque?.imagens?.retrato || destaque?.imagens?.cheia || destaque?.images?.portrait || destaque?.images?.full) ||

                <p className="text-sm text-gray-400 mt-2">3 cartas</p>								'/images/placeholder.svg'

              </div>							} 

              							alt={destaque?.nome || destaque?.name || 'Banner'}

              <div className="bg-black/40 p-4 rounded-lg mb-4">							fill

                <div className="text-center">							className="object-cover"

                  <div className="text-2xl font-bold text-yellow-400 mb-1">						/>

                    💰 {BOOSTER_CONFIG.PRECOS.PEQUENO}						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  </div>						<div className="absolute top-3 left-3">

                  <div className="text-xs text-gray-400">moedas</div>							<span className={`px-2 py-1 rounded text-[10px] border ${temaSelecionado.chip}`}>

                </div>								{id === 'semanal' ? 'ROTAÇÃO DA SEMANA' : 'INVOC. PADRÃO'}

              </div>							</span>

						</div>

              <button						<div className="absolute bottom-3 left-3 right-3">

                onClick={() => comprarBooster('PEQUENO')}							<h3 className="text-xl font-extrabold leading-tight">{titulo}</h3>

                disabled={comprando || pullHistory.moedas < BOOSTER_CONFIG.PRECOS.PEQUENO}							<p className="text-gray-300 text-xs">{subtitulo}</p>

                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors mb-2"							{id === 'semanal' && destaque && (

              >								<div className="text-xs text-yellow-300 mt-1">

                {comprando ? 'Comprando...' : 'Comprar'}									Em destaque: <span className="font-semibold">{destaque.nome || destaque.name}</span>

              </button>								</div>

							)}

              {pullHistory?.boostersDisponiveis > 0 && (						</div>

                <button					</div>

                  onClick={() => abrirBooster('PEQUENO')}					<div className="p-4 border-t border-white/10">

                  disabled={abrindo}						<div className="text-[11px] text-gray-400 mb-2">

                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"							Taxas: {probabilidades.map((probabilidade) => `${probabilidade.raridade}: ${probabilidade.p}%`).join(' • ')}

                >						</div>

                  {abrindo ? 'Abrindo...' : 'Abrir Booster'}						<div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">

                </button>							<div>

              )}								Pity Mítico: <span className="text-yellow-300 font-semibold">{pity5}/30</span>

            </div>							</div>

							<div>

            {/* Booster Médio */}								Pity Lendário: <span className="text-yellow-300 font-semibold">{pity4}/10</span>

            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border-2 border-blue-500/30 hover:border-blue-500 transition-all">							</div>

              <div className="text-center mb-4">						</div>

                <div className="text-4xl mb-2">📦📦</div>						<div className="flex gap-3">

                <h3 className="text-xl font-bold text-blue-400">Booster Médio</h3>							<button

                <p className="text-sm text-gray-400 mt-2">5 cartas</p>								disabled={ocupado || gemas < custoUnico}

                <div className="text-xs text-purple-300 mt-1">+1 carta bônus!</div>								onClick={() => invocar(id, 1)}

              </div>								className={`flex-1 py-2 rounded-lg font-semibold ${temaSelecionado.botao} disabled:bg-gray-600 disabled:cursor-not-allowed`}

              							>

              <div className="bg-black/40 p-4 rounded-lg mb-4">								Invocar x1 (💎{custoUnico})

                <div className="text-center">							</button>

                  <div className="text-2xl font-bold text-yellow-400 mb-1">							<button

                    💰 {BOOSTER_CONFIG.PRECOS.MEDIO}								disabled={ocupado || gemas < custoDez}

                  </div>								onClick={() => invocar(id, 10)}

                  <div className="text-xs text-gray-400">moedas</div>								className={`flex-1 py-2 rounded-lg font-semibold ${temaSelecionado.botao} disabled:bg-gray-600 disabled:cursor-not-allowed`}

                  <div className="text-xs text-green-400 mt-1">							>

                    Economize {BOOSTER_CONFIG.PRECOS.PEQUENO * 2 - BOOSTER_CONFIG.PRECOS.MEDIO} moedas!								Invocar x10 (💎{custoDez})

                  </div>							</button>

                </div>						</div>

              </div>					</div>

				</div>

              <button			);

                onClick={() => comprarBooster('MEDIO')}		};

                disabled={comprando || pullHistory.moedas < BOOSTER_CONFIG.PRECOS.MEDIO}

                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors mb-2"	if (carregando) {

              >		return (

                {comprando ? 'Comprando...' : 'Comprar'}			<LayoutDePagina>

              </button>				<div className="container mx-auto px-4 py-8">

					<div className="text-center">

              {pullHistory?.boostersDisponiveis > 0 && (						<div className="text-lg">Carregando loja...</div>

                <button					</div>

                  onClick={() => abrirBooster('MEDIO')}				</div>

                  disabled={abrindo}			</LayoutDePagina>

                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"		);

                >	}

                  {abrindo ? 'Abrindo...' : 'Abrir Booster'}

                </button>	return (

              )}		<LayoutDePagina>

            </div>			<div className="container mx-auto px-4 py-8">

				<div className="text-center mb-8">

            {/* Booster Grande */}					<h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500">

            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border-2 border-purple-500/30 hover:border-purple-500 transition-all relative overflow-hidden">						🧿 Invocações

              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 transform rotate-12 translate-x-2 -translate-y-1">					</h1>

                MELHOR VALOR!					<p className="text-xl text-pink-200">Gire os banners para obter novas lendas</p>

              </div>				</div>

              

              <div className="text-center mb-4">				{/* Carteira */}

                <div className="text-4xl mb-2">📦📦📦</div>				<div className="flex flex-wrap items-center justify-center gap-4 mb-8">

                <h3 className="text-xl font-bold text-purple-400">Booster Grande</h3>					<div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/10">

                <p className="text-sm text-gray-400 mt-2">10 cartas</p>						<span>💎</span>

                <div className="text-xs text-purple-300 mt-1">+1 Épico garantido!</div>						<span className="font-semibold">{gemas} gemas</span>

              </div>					</div>

              				</div>

              <div className="bg-black/40 p-4 rounded-lg mb-4">

                <div className="text-center">				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">

                  <div className="text-2xl font-bold text-yellow-400 mb-1">					<CartaoDeBanner

                    💰 {BOOSTER_CONFIG.PRECOS.GRANDE}						id="semanal"

                  </div>						titulo="Rota da Semana • Mítico em destaque"

                  <div className="text-xs text-gray-400">moedas</div>						subtitulo="Probabilidade aumentada para a carta Mítica da semana"

                  <div className="text-xs text-green-400 mt-1">						realce="amber"

                    Economize {BOOSTER_CONFIG.PRECOS.PEQUENO * 4 - BOOSTER_CONFIG.PRECOS.GRANDE} moedas!						destaque={destaqueSemanal}

                  </div>						probabilidades={probabilidadesSemanais}

                </div>						pity5={pitySemanal5}

              </div>						pity4={pitySemanal4}

					/>

              <button					<CartaoDeBanner

                onClick={() => comprarBooster('GRANDE')}						id="padrao"

                disabled={comprando || pullHistory.moedas < BOOSTER_CONFIG.PRECOS.GRANDE}						titulo="Invocação Padrão"

                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors mb-2"						subtitulo="Sempre disponível, inclui Lendárias e Míticas (sem a limitada)"

              >						realce="emerald"

                {comprando ? 'Comprando...' : 'Comprar'}						destaque={null}

              </button>						probabilidades={probabilidadesPadrao}

						pity5={pityPadrao5}

              {pullHistory?.boostersDisponiveis > 0 && (						pity4={pityPadrao4}

                <button					/>

                  onClick={() => abrirBooster('GRANDE')}				</div>

                  disabled={abrindo}

                  className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"				<div className="text-center mt-8">

                >					<Link href="/" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold">

                  {abrindo ? 'Abrindo...' : 'Abrir Booster'}						← Voltar ao Menu Principal

                </button>					</Link>

              )}				</div>

            </div>			</div>

          </div>

        </div>			{/* Modal de Resultados */}

			{mostrarResultados && (

        {/* Estatísticas */}				<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => definirMostrarResultados(false)}>

        <div className="max-w-4xl mx-auto mb-8">					<div className="bg-black/40 border border-white/10 rounded-2xl p-6 max-w-3xl w-full" onClick={(evento) => evento.stopPropagation()}>

          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">						<div className="flex items-center justify-between mb-4">

            <h3 className="text-xl font-bold mb-4 text-center text-gray-300">							<h3 className="text-xl font-bold">Resultados</h3>

              📈 Suas Estatísticas							<button onClick={() => definirMostrarResultados(false)} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Fechar</button>

            </h3>						</div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center text-sm">						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

              <div>							{resultados.map((carta, indice) => (

                <div className="text-gray-400">Total de Pulls</div>								<div

                <div className="text-xl font-bold">{pullHistory?.total || 0}</div>									key={indice}

              </div>									className={`relative rounded-lg p-2 border ${temaDeRaridade[carta.raridade || carta.rarity] || 'border-gray-600 text-gray-300'} bg-black/30`}

              <div>								>

                <div className="text-gray-400">Míticos</div>									<div className="relative w-full h-28 rounded overflow-hidden mb-2 border border-white/10">

                <div className="text-xl font-bold text-red-400">{pullHistory?.porRaridade.MITICO || 0}</div>										<Image

              </div>											src={carta.imagens?.retrato || carta.images?.portrait || '/images/placeholder.svg'}

              <div>											alt={carta.nome || carta.name}

                <div className="text-gray-400">Lendários</div>											fill

                <div className="text-xl font-bold text-yellow-400">{pullHistory?.porRaridade.LENDARIO || 0}</div>											className="object-cover"

              </div>										/>

              <div>									</div>

                <div className="text-gray-400">Épicos</div>									<div className="text-xs font-semibold line-clamp-2">{carta.nome || carta.name}</div>

                <div className="text-xl font-bold text-purple-400">{pullHistory?.porRaridade.EPICO || 0}</div>									<div className="text-[10px] text-gray-400">{carta.raridade || carta.rarity}</div>

              </div>								</div>

              <div>							))}

                <div className="text-gray-400">Raros</div>						</div>

                <div className="text-xl font-bold text-blue-400">{pullHistory?.porRaridade.RARO || 0}</div>						<div className="mt-4 text-right text-sm text-gray-400">

              </div>								Garantia: a cada x10, pelo menos 1 Lendário (ou Mítico se ativar o pity).

              <div>							</div>

                <div className="text-gray-400">Comuns</div>					</div>

                <div className="text-xl font-bold text-gray-400">{pullHistory?.porRaridade.COMUM || 0}</div>				</div>

              </div>			)}

            </div>		</LayoutDePagina>

          </div>	);

        </div>}



        {/* Modal de Cartas Abertas */}
        {cartasAbertas && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 rounded-lg p-8 max-w-4xl w-full border border-purple-500 max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-500">
                🎉 Suas Novas Cartas!
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {cartasAbertas.map((carta, index) => (
                  <div
                    key={index}
                    className={`bg-black/50 p-4 rounded-lg border-2 ${
                      carta.raridadeSorteada === 'MITICO' ? 'border-red-500 shadow-lg shadow-red-500/50' :
                      carta.raridadeSorteada === 'LENDARIO' ? 'border-yellow-500 shadow-lg shadow-yellow-500/50' :
                      carta.raridadeSorteada === 'EPICO' ? 'border-purple-500 shadow-lg shadow-purple-500/50' :
                      carta.raridadeSorteada === 'RARO' ? 'border-blue-500' :
                      'border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {carta.raridadeSorteada === 'MITICO' && '⭐⭐⭐'}
                        {carta.raridadeSorteada === 'LENDARIO' && '⭐⭐'}
                        {carta.raridadeSorteada === 'EPICO' && '⭐'}
                      </div>
                      <h3 className="font-bold mb-1">{carta.name}</h3>
                      <p className={`text-xs ${
                        carta.raridadeSorteada === 'MITICO' ? 'text-red-400' :
                        carta.raridadeSorteada === 'LENDARIO' ? 'text-yellow-400' :
                        carta.raridadeSorteada === 'EPICO' ? 'text-purple-400' :
                        carta.raridadeSorteada === 'RARO' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        {carta.raridadeSorteada}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={fecharModal}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Voltar */}
        <div className="text-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-semibold inline-block"
          >
            ← Voltar ao Menu Principal
          </Link>
        </div>
      </div>
    </LayoutDePagina>
  );
}
