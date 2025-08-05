// src/data/quizzes.js

export const quizzes = [
  {
    id: 1,
    category: 'Amazônia',
    difficulty: 'Fácil',
    questions: [
      {
        question: "Qual criatura folclórica brasileira tem os pés virados para trás?",
        options: ["Saci-Pererê", "Curupira", "Iara", "Boitatá"],
        correct: 1,
        explanation: "O Curupira é conhecido por ter os pés virados para trás, o que confunde os caçadores e invasores da floresta, fazendo-os se perder."
      },
      {
        question: "Onde vive a Iara, segundo a lenda brasileira?",
        options: ["Na floresta", "Nos rios", "Nas montanhas", "No céu"],
        correct: 1,
        explanation: "A Iara é uma sereia que vive nos rios da Amazônia e atrai os homens com seu canto encantador."
      },
      {
        question: "Qual é a principal função do Curupira no folclore?",
        options: ["Assustar crianças", "Proteger a floresta", "Pregar peças", "Seduzir pessoas"],
        correct: 1,
        explanation: "O Curupira é o protetor da floresta, punindo aqueles que destroem a natureza ou caçam animais desnecessariamente."
      }
    ]
  },
  {
    id: 2,
    category: 'Nacional',
    difficulty: 'Médio',
    questions: [
      {
        question: "O que o Saci-Pererê carrega sempre consigo?",
        options: ["Uma vara de pescar", "Um gorro vermelho", "Uma flauta", "Um machado"],
        correct: 1,
        explanation: "O Saci-Pererê sempre usa um gorro vermelho, que é a fonte de seus poderes mágicos. Se alguém conseguir pegar seu gorro, pode fazer pedidos."
      },
      {
        question: "Quantas pernas tem o Saci-Pererê?",
        options: ["Duas", "Uma", "Três", "Nenhuma"],
        correct: 1,
        explanation: "O Saci-Pererê tem apenas uma perna, saltitando por onde vai e deixando pegadas características."
      },
      {
        question: "Qual é a travessura mais comum do Saci?",
        options: ["Roubar comida", "Esconder objetos", "Quebrar vidros", "Fazer barulho"],
        correct: 1,
        explanation: "O Saci é famoso por esconder objetos das pessoas, especialmente chaves, meias e outros itens pequenos do dia a dia."
      }
    ]
  },
  {
    id: 3,
    category: 'Sul/Sudeste',
    difficulty: 'Difícil',
    questions: [
      {
        question: "Qual criatura é conhecida como 'serpente de fogo'?",
        options: ["Curupira", "Cuca", "Boitatá", "Lobisomem"],
        correct: 2,
        explanation: "O Boitatá é uma serpente gigante de fogo que protege os campos e florestas contra incêndios e aqueles que os provocam."
      },
      {
        question: "Em qual região do Brasil a lenda da Mula sem Cabeça é mais comum?",
        options: ["Norte", "Nordeste", "Sul", "Sudeste"],
        correct: 3,
        explanation: "A lenda da Mula sem Cabeça é mais comum na região Sudeste, especialmente em áreas rurais de Minas Gerais e São Paulo."
      },
      {
        question: "Segundo a lenda, como uma mulher se transforma em Mula sem Cabeça?",
        options: ["Dormindo na lua cheia", "Namorando um padre", "Comendo carne na sexta-feira", "Mentindo para os pais"],
        correct: 1,
        explanation: "Segundo a tradição, uma mulher se transforma em Mula sem Cabeça quando namora ou se relaciona com um padre."
      }
    ]
  },
  {
    id: 4,
    category: 'Criaturas Aquáticas',
    difficulty: 'Médio',
    questions: [
      {
        question: "Como o Boto Cor-de-Rosa seduz as mulheres?",
        options: ["Cantando", "Se transformando em homem", "Oferecendo presentes", "Dançando"],
        correct: 1,
        explanation: "O Boto Cor-de-Rosa se transforma em um homem elegante e charmoso para seduzir mulheres nas festas ribeirinhas."
      },
      {
        question: "Qual é o perigo de seguir o canto da Iara?",
        options: ["Ficar surdo", "Se perder na floresta", "Ser levado para o fundo do rio", "Virar pedra"],
        correct: 2,
        explanation: "Quem segue o canto hipnótico da Iara é levado para o fundo do rio e nunca mais volta à superfície."
      },
      {
        question: "Em que tipo de ambiente vivem os espíritos aquáticos do folclore brasileiro?",
        options: ["Apenas no mar", "Rios e lagos", "Cachoeiras", "Todas as águas"],
        correct: 3,
        explanation: "Os espíritos aquáticos do folclore brasileiro habitam diversos ambientes: rios, lagos, cachoeiras e até o mar."
      }
    ]
  },
  {
    id: 5,
    category: 'Assombrações',
    difficulty: 'Difícil',
    questions: [
      {
        question: "Qual é a característica física mais marcante da Cuca?",
        options: ["Cabelos longos", "Cabeça de jacaré", "Pés grandes", "Olhos vermelhos"],
        correct: 1,
        explanation: "A Cuca é descrita como tendo cabeça de jacaré, sendo uma das características que mais aterroriza as crianças."
      },
      {
        question: "Em que momento o Lobisomem se transforma?",
        options: ["Toda noite", "Nas noites de lua cheia", "Quando está com raiva", "Nos dias de tempestade"],
        correct: 1,
        explanation: "O Lobisomem se transforma apenas nas noites de lua cheia, voltando à forma humana ao amanhecer."
      },
      {
        question: "Qual é o objetivo principal da Cuca nas histórias?",
        options: ["Proteger a floresta", "Ensinar lições", "Raptar crianças desobedientes", "Pregar peças"],
        correct: 2,
        explanation: "A Cuca é usada nas histórias para ensinar às crianças a importância da obediência, ameaçando raptar as desobedientes."
      }
    ]
  }
];

export const getQuizById = (id) => {
  return quizzes.find(quiz => quiz.id === id);
};

export const getQuizzesByCategory = (category) => {
  return quizzes.filter(quiz => quiz.category === category);
};

export const getQuizzesByDifficulty = (difficulty) => {
  return quizzes.filter(quiz => quiz.difficulty === difficulty);
};

export const getRandomQuiz = () => {
  const randomIndex = Math.floor(Math.random() * quizzes.length);
  return quizzes[randomIndex];
};

export const getAllCategories = () => {
  return [...new Set(quizzes.map(quiz => quiz.category))];
};

export const getAllDifficulties = () => {
  return [...new Set(quizzes.map(quiz => quiz.difficulty))];
};
