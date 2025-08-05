// src/app/museum/quiz/page.js
"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);

  const questions = [
    {
      question: "Qual criatura folclórica brasileira tem os pés virados para trás?",
      options: ["Saci-Pererê", "Curupira", "Iara", "Boitatá"],
      correct: 1,
      explanation: "O Curupira é conhecido por ter os pés virados para trás, o que confunde os caçadores e invasores da floresta."
    },
    {
      question: "Onde vive a Iara, segundo a lenda brasileira?",
      options: ["Na floresta", "Nos rios", "Nas montanhas", "No céu"],
      correct: 1,
      explanation: "A Iara é uma sereia que vive nos rios da Amazônia e atrai os homens com seu canto."
    },
    {
      question: "O que o Saci-Pererê carrega sempre consigo?",
      options: ["Uma vara de pescar", "Um gorro vermelho", "Uma flauta", "Um machado"],
      correct: 1,
      explanation: "O Saci-Pererê sempre usa um gorro vermelho, que é fonte de seus poderes mágicos."
    },
    {
      question: "Qual criatura é conhecida como 'serpente de fogo'?",
      options: ["Curupira", "Cuca", "Boitatá", "Lobisomem"],
      correct: 2,
      explanation: "O Boitatá é uma serpente gigante de fogo que protege os campos e florestas."
    },
    {
      question: "Em qual região do Brasil a lenda da Mula sem Cabeça é mais comum?",
      options: ["Norte", "Nordeste", "Sul", "Sudeste"],
      correct: 3,
      explanation: "A lenda da Mula sem Cabeça é mais comum na região Sudeste do Brasil."
    }
  ];

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setQuizComplete(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return "🏆 Excelente! Você é um verdadeiro especialista em folclore brasileiro!";
    if (percentage >= 70) return "👏 Muito bom! Você conhece bem nossa mitologia!";
    if (percentage >= 50) return "👍 Bom trabalho! Continue estudando nosso folclore!";
    return "📚 Continue aprendendo! Explore mais sobre nossa rica cultura!";
  };

  if (quizComplete) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-900 via-blue-900 to-purple-900 text-white flex items-center justify-center p-4">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 max-w-md w-full border border-green-500/30 text-center">
          <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Quiz Concluído!
          </h1>
          
          <div className="mb-6">
            <div className="text-6xl mb-4">
              {score >= 4 ? '🏆' : score >= 3 ? '🥉' : score >= 2 ? '📚' : '🌱'}
            </div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-lg text-gray-300 mb-4">
              {Math.round((score / questions.length) * 100)}% de acertos
            </div>
            <p className="text-sm text-yellow-300">
              {getScoreMessage()}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-black/40 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">Recompensas Ganhas:</h3>
              <div className="text-sm space-y-1">
                <div>💰 +{score * 50} moedas</div>
                <div>⭐ +{score * 10} XP</div>
                {score >= 4 && <div>🎁 Nova carta desbloqueada!</div>}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={resetQuiz}
                className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors"
              >
                Jogar Novamente
              </button>
              <Link
                href="/museum"
                className="block w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-colors text-center"
              >
                Voltar ao Museu
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-900 via-blue-900 to-purple-900 text-white">
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
                Pergunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm text-green-400">
                Pontuação: {score}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Pergunta */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 border border-gray-600/30">
            <h2 className="text-2xl font-bold mb-8 text-center">
              {questions[currentQuestion].question}
            </h2>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showResult
                      ? index === questions[currentQuestion].correct
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : index === selectedAnswer && index !== questions[currentQuestion].correct
                        ? 'border-red-500 bg-red-500/20 text-red-300'
                        : 'border-gray-600 bg-black/20 text-gray-400'
                      : selectedAnswer === index
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

            {showResult && (
              <div className="mt-6 p-4 bg-black/40 rounded-lg border border-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {selectedAnswer === questions[currentQuestion].correct ? '✅' : '❌'}
                  </div>
                  <div>
                    <div className="font-semibold mb-2">
                      {selectedAnswer === questions[currentQuestion].correct 
                        ? 'Correto!' 
                        : 'Resposta incorreta'
                      }
                    </div>
                    <p className="text-sm text-gray-300">
                      {questions[currentQuestion].explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showResult && (
              <div className="mt-6 text-center">
                <button
                  onClick={nextQuestion}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                >
                  {currentQuestion < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
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
    </main>
  );
}
