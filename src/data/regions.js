// src/data/regions.js

export const regions = [
  {
    id: 'north',
    name: 'Região Norte',
    description: 'Amazônia e seus mistérios inexplorados',
    legends: [
      {
        name: 'Curupira',
        description: 'Protetor da floresta com pés virados para trás',
        discovered: true
      },
      {
        name: 'Iara',
        description: 'Sereia encantadora dos rios amazônicos',
        discovered: true
      },
      {
        name: 'Boto Cor-de-Rosa',
        description: 'Sedutor das festas ribeirinhas',
        discovered: true
      },
      {
        name: 'Mapinguari',
        description: 'Gigante peludo da floresta profunda',
        discovered: true
      },
      {
        name: 'Cobra Grande',
        description: 'Serpente gigante dos rios',
        discovered: false
      }
    ],
    characteristics: [
      'Rica biodiversidade',
      'Rios caudalosos',
      'Floresta densa',
      'Povos ribeirinhos',
      'Xamanismo indígena'
    ],
    culturalElements: [
      'Festivais folclóricos',
      'Lendas indígenas',
      'Artesanato tradicional',
      'Medicina natural',
      'Histórias ribeirinhas'
    ]
  },
  {
    id: 'northeast',
    name: 'Região Nordeste',
    description: 'Sertão árido e lendas do cangaço',
    legends: [
      {
        name: 'Cuca',
        description: 'Bruxa assombração das crianças',
        discovered: false
      },
      {
        name: 'Mãe d\'Água',
        description: 'Protetora das fontes e açudes',
        discovered: false
      },
      {
        name: 'Caboclo d\'Água',
        description: 'Guardião dos rios nordestinos',
        discovered: false
      },
      {
        name: 'Caipora',
        description: 'Protetor dos animais da caatinga',
        discovered: true
      },
      {
        name: 'Papa-Figo',
        description: 'Criatura que rouba órgãos das crianças',
        discovered: false
      }
    ],
    characteristics: [
      'Clima semiárido',
      'Vegetação de caatinga',
      'Cultura sertaneja',
      'Tradições religiosas',
      'Folclore rico'
    ],
    culturalElements: [
      'Literatura de cordel',
      'Forró e repente',
      'Festas juninas',
      'Artesanato regional',
      'Culinária típica'
    ]
  },
  {
    id: 'centerwest',
    name: 'Região Centro-Oeste',
    description: 'Pantanal místico e cerrado encantado',
    legends: [
      {
        name: 'Minhocão',
        description: 'Criatura gigante subterrânea',
        discovered: false
      },
      {
        name: 'Pisadeira',
        description: 'Mulher que pisa nos que dormem de estômago cheio',
        discovered: false
      },
      {
        name: 'Anhangá',
        description: 'Protetor dos animais do cerrado',
        discovered: false
      },
      {
        name: 'Matinta Perera',
        description: 'Bruxa que se transforma em ave',
        discovered: true
      }
    ],
    characteristics: [
      'Pantanal alagável',
      'Cerrado extenso',
      'Fauna diversificada',
      'Agronegócio',
      'Culturas indígenas'
    ],
    culturalElements: [
      'Tradições pantaneiras',
      'Música sertaneja',
      'Festivais regionais',
      'Pesca tradicional',
      'Artesanato local'
    ]
  },
  {
    id: 'southeast',
    name: 'Região Sudeste',
    description: 'Montanhas e vales com assombrações urbanas',
    legends: [
      {
        name: 'Saci-Pererê',
        description: 'Travesso de uma perna só',
        discovered: true
      },
      {
        name: 'Mula sem Cabeça',
        description: 'Mulher amaldiçoada que galopa à noite',
        discovered: true
      },
      {
        name: 'Cuca',
        description: 'Bruxa com cabeça de jacaré',
        discovered: true
      },
      {
        name: 'Corpo-Seco',
        description: 'Homem que não morre nem vai para o inferno',
        discovered: false
      },
      {
        name: 'Loira do Banheiro',
        description: 'Espírito que assombra banheiros escolares',
        discovered: false
      }
    ],
    characteristics: [
      'Centros urbanos',
      'Serra da Mantiqueira',
      'Mata Atlântica',
      'Industrialização',
      'Diversidade cultural'
    ],
    culturalElements: [
      'Folclore caipira',
      'Festas tradicionais',
      'Música popular',
      'Teatro e cinema',
      'Gastronomia variada'
    ]
  },
  {
    id: 'south',
    name: 'Região Sul',
    description: 'Pampas e tradições gaúchas ancestrais',
    legends: [
      {
        name: 'Boitatá',
        description: 'Serpente de fogo protetora dos campos',
        discovered: true
      },
      {
        name: 'Negrinho do Pastoreio',
        description: 'Menino que ajuda a encontrar objetos perdidos',
        discovered: false
      },
      {
        name: 'M\'Boi-Tatá',
        description: 'Cobra de fogo dos pampas',
        discovered: false
      },
      {
        name: 'Alamoa',
        description: 'Mulher fantasma dos campos',
        discovered: false
      }
    ],
    characteristics: [
      'Pampas extensos',
      'Clima temperado',
      'Imigração europeia',
      'Tradição gaúcha',
      'Pecuária'
    ],
    culturalElements: [
      'Tradições gaúchas',
      'Churrasco e chimarrão',
      'Festivais de inverno',
      'Música regional',
      'Danças folclóricas'
    ]
  }
];

export const getRegionById = (id) => {
  return regions.find(region => region.id === id);
};

export const getRegionByName = (name) => {
  return regions.find(region => region.name === name);
};

export const getAllRegions = () => {
  return regions;
};
