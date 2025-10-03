// src/app/museum/quiz/page.js
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import LayoutDePagina from '@/components/UI/PageLayout';
import { calcularRecompensaQuiz } from '@/utils/boosterSystem';
import { useAuth } from '@/hooks/useAuth';

// Quiz cultural do Museu
export default function QuizCultural() {
  const { user } = useAuth();
  const [dificuldadeSelecionada, setDificuldadeSelecionada] = useState(null);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [pontuacao, setPontuacao] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [quizConcluido, setQuizConcluido] = useState(false);
  const [recompensas, setRecompensas] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const DIFICULDADES = {
    FACIL: {
      nome: 'Fácil',
      icone: '🌱',
      descricao: '5 perguntas básicas',
      numPerguntas: 5,
      multiplicadorXP: 1,
      multiplicadorMoedas: 1,
      cor: 'green',
    },
    MEDIO: {
      nome: 'Médio',
      icone: '⚡',
      descricao: '8 perguntas desafiadoras',
      numPerguntas: 8,
      multiplicadorXP: 1.5,
      multiplicadorMoedas: 1.5,
      cor: 'yellow',
    },
    DIFICIL: {
      nome: 'Difícil',
      icone: '🔥',
      descricao: '12 perguntas para especialistas',
      numPerguntas: 12,
      multiplicadorXP: 2,
      multiplicadorMoedas: 2,
      cor: 'red',
    },
  };

  useEffect(() => {
    async function fetchQuizzes() {
      if (!dificuldadeSelecionada) return;
      
      const config = DIFICULDADES[dificuldadeSelecionada];
      
      try {
        setLoading(true);
        const res = await fetch('/api/quizzes');
        if (!res.ok) throw new Error('Erro ao buscar quizzes');
        const data = await res.json();
        if (data.quizzes && data.quizzes.length > 0) {
          const todasPerguntas = data.quizzes[0].questions || [];
          // Selecionar perguntas aleatórias baseado na dificuldade
          const numPerguntas = config.numPerguntas;
          const perguntasSelecionadas = todasPerguntas
            .sort(() => Math.random() - 0.5)
            .slice(0, numPerguntas);
          setQuestions(perguntasSelecionadas);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        setApiError(err.message);
        alert('Erro ao carregar quiz: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dificuldadeSelecionada]);

  const responder = (indice) => {
    setRespostaSelecionada(indice);
    setMostrarResultado(true);
    if (indice === questions[perguntaAtual].correct) {
      setPontuacao(pontuacao + 1);
    }
  };

  const proximaPergunta = () => {
    if (perguntaAtual < questions.length - 1) {
      setPerguntaAtual(perguntaAtual + 1);
      setRespostaSelecionada(null);
      setMostrarResultado(false);
    } else {
      finalizarQuiz();
    }
  };

  const finalizarQuiz = async () => {
    const percentualAcerto = (pontuacao / questions.length) * 100;
    const dificuldade = DIFICULDADES[dificuldadeSelecionada];
    
    // Calcular recompensas usando o sistema de booster
    const recompensasCalculadas = calcularRecompensaQuiz(
      dificuldadeSelecionada,
      percentualAcerto
    );
    
    // Aplicar multiplicadores de dificuldade
    recompensasCalculadas.moedas = Math.floor(
      (pontuacao * 50) * dificuldade.multiplicadorMoedas
    );
    recompensasCalculadas.xp = Math.floor(
      (pontuacao * 10) * dificuldade.multiplicadorXP
    );
    
    setRecompensas(recompensasCalculadas);
    
    // Aplicar recompensas no backend se usuário estiver logado
    if (user && recompensasCalculadas.boostersGanhos > 0) {
      try {
        const response = await fetch('/api/boosters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: user.id,
            acao: 'RECOMPENSAR_QUIZ',
            boosters: recompensasCalculadas.boostersGanhos,
            moedas: recompensasCalculadas.moedas,
          }),
        });
        
        if (!response.ok) {
          console.error('Erro ao aplicar recompensas');
        }
      } catch (error) {
        console.error('Erro ao conectar com API:', error);
      }
    }
    
    setQuizConcluido(true);
  };

  const reiniciarQuiz = () => {
    setPerguntaAtual(0);
    setPontuacao(0);
    setMostrarResultado(false);
    setRespostaSelecionada(null);
    setQuizConcluido(false);
    setDificuldadeSelecionada(null);
    setRecompensas(null);
  };

  const mensagemPontuacao = () => {
    const percentage = (pontuacao / questions.length) * 100;
    if (percentage >= 90) return "🏆 Excelente! Você é um verdadeiro especialista em folclore brasileiro!";
    if (percentage >= 70) return "👏 Muito bom! Você conhece bem nossa mitologia!";
    if (percentage >= 50) return "👍 Bom trabalho! Continue estudando nosso folclore!";
    return "📚 Continue aprendendo! Explore mais sobre nossa rica cultura!";
  };

  // Tela de seleção de dificuldade
  if (!dificuldadeSelecionada) {
    return (
      <LayoutDePagina>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              🧠 Quiz Cultural
            </h1>
            <p className="text-xl text-green-300 mb-2">
              Teste seus conhecimentos sobre folclore brasileiro
            </p>
            <p className="text-sm text-gray-400">
              Escolha a dificuldade e ganhe recompensas incríveis!
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {Object.entries(DIFICULDADES).map(([key, dificuldade]) => (
              <button
                key={key}
                onClick={() => setDificuldadeSelecionada(key)}
                className={`bg-black/30 backdrop-blur-sm rounded-lg p-6 border-2 hover:border-${dificuldade.cor}-500 border-gray-600/30 hover:bg-black/40 transition-all group`}
              >
                <div className="text-5xl mb-4">{dificuldade.icone}</div>
                <h3 className={`text-2xl font-bold mb-2 text-${dificuldade.cor}-400`}>
                  {dificuldade.nome}
                </h3>
                <p className="text-gray-300 mb-4">{dificuldade.descricao}</p>
                
                <div className="space-y-2 text-sm text-left bg-black/30 p-4 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Perguntas:</span>
                    <span className="font-semibold">{dificuldade.numPerguntas}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">XP:</span>
                    <span className="font-semibold text-blue-400">
                      x{dificuldade.multiplicadorXP}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Moedas:</span>
                    <span className="font-semibold text-yellow-400">
                      x{dificuldade.multiplicadorMoedas}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Booster:</span>
                      <span className="font-semibold text-purple-400">
                        {key === 'FACIL' && '30% chance'}
                        {key === 'MEDIO' && '60% chance'}
                        {key === 'DIFICIL' && '100% garantido'}
                      </span>
                    </div>
                    {key === 'DIFICIL' && (
                      <div className="text-xs text-center text-purple-300 mt-1">
                        +1 booster bônus!
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/museum"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-semibold inline-block"
            >
              ← Voltar ao Museu
            </Link>
          </div>
        </div>
      </LayoutDePagina>
    );
  }

  if (loading) {
    return (
      <LayoutDePagina>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center text-xl text-gray-400">Carregando quiz...</div>
        </div>
      </LayoutDePagina>
    );
  }

  if (questions.length === 0) {
    return (
      <LayoutDePagina>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center text-xl text-red-400">Nenhum quiz disponível.</div>
        </div>
      </LayoutDePagina>
    );
  }

  if (quizConcluido) {
    const dificuldade = DIFICULDADES[dificuldadeSelecionada];
    const percentualAcerto = (pontuacao / questions.length) * 100;
    
    return (
      <LayoutDePagina>
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 max-w-md w-full border border-green-500/30 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="text-3xl mr-2">{dificuldade.icone}</div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Quiz Concluído!
              </h1>
            </div>
            
            <div className="text-sm text-gray-400 mb-6">
              Dificuldade: <span className={`text-${dificuldade.cor}-400 font-semibold`}>
                {dificuldade.nome}
              </span>
            </div>
          
            <div className="mb-6">
              <div className="text-6xl mb-4">
                {percentualAcerto >= 90 ? '🏆' : percentualAcerto >= 70 ? '🥉' : percentualAcerto >= 50 ? '📚' : '🌱'}
              </div>
              <div className="text-2xl font-bold text-green-400 mb-2">
                {pontuacao}/{questions.length}
              </div>
              <div className="text-lg text-gray-300 mb-4">
                {Math.round(percentualAcerto)}% de acertos
              </div>
              <p className="text-sm text-yellow-300">
                {mensagemPontuacao()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-black/40 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-3">Recompensas Ganhas:</h3>
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span>💰 Moedas:</span>
                    <span className="font-bold text-yellow-400">+{recompensas?.moedas || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>⭐ Experiência:</span>
                    <span className="font-bold text-blue-400">+{recompensas?.xp || 0} XP</span>
                  </div>
                  
                  {recompensas?.boostersGanhos > 0 ? (
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex items-center justify-between bg-purple-500/20 p-2 rounded">
                        <span className="flex items-center">
                          🎁 Boosters:
                        </span>
                        <span className="font-bold text-purple-300 text-lg">
                          +{recompensas.boostersGanhos}
                        </span>
                      </div>
                      <p className="text-xs text-purple-300 mt-2">
                        Use na loja para abrir pacotes de cartas!
                      </p>
                    </div>
                  ) : (
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <p className="text-xs text-gray-500">
                        Nenhum booster ganho. Tente obter mais de 70% de acertos!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={reiniciarQuiz}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors"
                >
                  Jogar Novamente
                </button>
                {recompensas?.boostersGanhos > 0 && (
                  <Link
                    href="/shop"
                    className="block w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold transition-colors text-center"
                  >
                    Ir para Loja 🎁
                  </Link>
                )}
                <Link
                  href="/museum"
                  className="block w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors text-center"
                >
                  Voltar ao Museu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </LayoutDePagina>
    );
  }

  return (
    <LayoutDePagina>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            🧠 Quiz Cultural
          </h1>
          <p className="text-xl text-green-300">
            Teste seus conhecimentos sobre folclore brasileiro
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progresso */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-600/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">
                Pergunta {perguntaAtual + 1} de {questions.length}
              </span>
              <span className="text-sm text-green-400">
                Pontuação: {pontuacao}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((perguntaAtual + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Pergunta */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-gray-600/30">
            <h2 className="text-2xl font-bold mb-8 text-center">
              {questions[perguntaAtual].question}
            </h2>

            <div className="space-y-4">
              {questions[perguntaAtual].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !mostrarResultado && responder(index)}
                  disabled={mostrarResultado}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    mostrarResultado
                      ? index === questions[perguntaAtual].correct
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : index === respostaSelecionada && index !== questions[perguntaAtual].correct
                        ? 'border-red-500 bg-red-500/20 text-red-300'
                        : 'border-gray-600 bg-black/20 text-gray-400'
                      : respostaSelecionada === index
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-black/20 text-white hover:border-gray-500 hover:bg-black/30'
                  }`}
                >
                  <span className="font-semibold mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {mostrarResultado && (
              <div className="mt-6 p-4 bg-black/40 rounded-lg border border-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {respostaSelecionada === questions[perguntaAtual].correct ? '✅' : '❌'}
                  </div>
                  <div>
                    <div className="font-semibold mb-2">
                      {respostaSelecionada === questions[perguntaAtual].correct 
                        ? 'Correto!' 
                        : 'Resposta incorreta'
                      }
                    </div>
                    <p className="text-sm text-gray-300">
                      {questions[perguntaAtual].explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mostrarResultado && (
              <div className="mt-6 text-center">
                <button
                  onClick={proximaPergunta}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                >
                  {perguntaAtual < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/museum"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-semibold"
          >
            ← Voltar ao Museu
          </Link>
        </div>
      </div>
    </LayoutDePagina>
  );
}
