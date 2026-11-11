// ============================================================
//  Banco da loja de games "Pixel Vault" (fictícia)
//  Roda dentro do navegador (PGlite = PostgreSQL em WebAssembly).
//  setseed() deixa os dados "aleatórios" sempre iguais.
// ============================================================

export const TABELAS = [
  { nome: 'plataformas', colunas: ['id', 'nome', 'fabricante', 'ano_lancamento'] },
  { nome: 'generos', colunas: ['id', 'nome'] },
  { nome: 'jogos', colunas: ['id', 'titulo', 'genero_id', 'plataforma_id', 'preco', 'data_lancamento', 'classificacao', 'desenvolvedora'] },
  { nome: 'clientes', colunas: ['id', 'nome', 'email', 'cidade', 'estado', 'data_cadastro'] },
  { nome: 'vendas', colunas: ['id', 'cliente_id', 'data_venda', 'forma_pagamento'] },
  { nome: 'itens_venda', colunas: ['id', 'venda_id', 'jogo_id', 'quantidade', 'preco_unitario'] },
  { nome: 'avaliacoes', colunas: ['id', 'cliente_id', 'jogo_id', 'nota', 'data_avaliacao'] },
  { nome: 'historico_partidas', colunas: ['id', 'jogador_id', 'jogo_id', 'pontuacao', 'jogado_em'] },
]

export const SEED_SQL = `
SELECT setseed(0.42);

CREATE TABLE plataformas (
  id             SERIAL PRIMARY KEY,
  nome           VARCHAR(40) NOT NULL,
  fabricante     VARCHAR(40) NOT NULL,
  ano_lancamento INT NOT NULL
);

CREATE TABLE generos (
  id   SERIAL PRIMARY KEY,
  nome VARCHAR(30) NOT NULL
);

CREATE TABLE jogos (
  id              SERIAL PRIMARY KEY,
  titulo          VARCHAR(80) NOT NULL,
  genero_id       INT NOT NULL REFERENCES generos (id),
  plataforma_id   INT NOT NULL REFERENCES plataformas (id),
  preco           NUMERIC(10, 2) NOT NULL,
  data_lancamento DATE NOT NULL,
  classificacao   VARCHAR(2) NOT NULL,
  desenvolvedora  VARCHAR(60) NOT NULL
);

CREATE TABLE clientes (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(80) NOT NULL,
  email         VARCHAR(120) NOT NULL,
  cidade        VARCHAR(40) NOT NULL,
  estado        CHAR(2) NOT NULL,
  data_cadastro DATE NOT NULL
);

CREATE TABLE vendas (
  id              SERIAL PRIMARY KEY,
  cliente_id      INT NOT NULL REFERENCES clientes (id),
  data_venda      DATE NOT NULL,
  forma_pagamento VARCHAR(20) NOT NULL
);

CREATE TABLE itens_venda (
  id             SERIAL PRIMARY KEY,
  venda_id       INT NOT NULL REFERENCES vendas (id),
  jogo_id        INT NOT NULL REFERENCES jogos (id),
  quantidade     INT NOT NULL,
  preco_unitario NUMERIC(10, 2) NOT NULL
);

CREATE TABLE avaliacoes (
  id             SERIAL PRIMARY KEY,
  cliente_id     INT NOT NULL REFERENCES clientes (id),
  jogo_id        INT NOT NULL REFERENCES jogos (id),
  nota           INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  data_avaliacao DATE NOT NULL
);

-- Tabela grande, sem índice de propósito (para a missão de performance)
CREATE TABLE historico_partidas (
  id         SERIAL PRIMARY KEY,
  jogador_id INT NOT NULL,
  jogo_id    INT NOT NULL,
  pontuacao  INT NOT NULL,
  jogado_em  TIMESTAMP NOT NULL
);

INSERT INTO plataformas (nome, fabricante, ano_lancamento) VALUES
  ('PC', 'Diversos', 1981),
  ('PlayStation 5', 'Sony', 2020),
  ('PlayStation 4', 'Sony', 2013),
  ('Xbox Series X', 'Microsoft', 2020),
  ('Nintendo Switch', 'Nintendo', 2017),
  ('Mobile', 'Diversos', 2008);

INSERT INTO generos (nome) VALUES
  ('Ação'), ('Aventura'), ('RPG'), ('Esporte'), ('Corrida'),
  ('Estratégia'), ('Terror'), ('Luta'), ('Simulação'), ('Plataforma');

INSERT INTO jogos (titulo, genero_id, plataforma_id, preco, data_lancamento, classificacao, desenvolvedora) VALUES
  ('Lenda de Aurora',            3, 2, 299.90, '2024-03-14', '14', 'Estúdio Boreal'),
  ('Asfalto Neon',               5, 1, 149.90, '2023-07-02', 'L',  'Turbo Bits'),
  ('Ecos do Abismo',             7, 1, 89.90,  '2022-10-28', '18', 'Lanterna Games'),
  ('Reino de Cristal',           6, 1, 129.90, '2021-05-20', '10', 'Coroa Digital'),
  ('Punhos de Aço',              8, 2, 249.90, '2025-02-11', '16', 'Arena Forte'),
  ('Gol de Placa 26',            4, 4, 349.90, '2025-09-26', 'L',  'Campo Aberto'),
  ('Pixel Saltitante',          10, 5, 59.90,  '2020-12-03', 'L',  'Pulo Alto'),
  ('Fazenda Sossego',            9, 5, 79.90,  '2021-08-17', 'L',  'Raiz Studio'),
  ('Sombra do Samurai',          1, 2, 279.90, '2024-11-08', '18', 'Lâmina Leste'),
  ('Cidade em Chamas',           1, 4, 229.90, '2023-04-21', '16', 'Ruído Urbano'),
  ('Caçadores de Relíquias',     2, 3, 99.90,  '2019-09-10', '12', 'Mapa Antigo'),
  ('Galáxia Partida',            3, 1, 199.90, '2025-06-05', '14', 'Órbita 9'),
  ('Rally das Dunas',            5, 6, 19.90,  '2022-01-25', 'L',  'Turbo Bits'),
  ('Torre dos Magos',            6, 6, 9.90,   '2020-04-30', '10', 'Coroa Digital'),
  ('Mansão Silenciosa',          7, 2, 189.90, '2025-10-31', '18', 'Lanterna Games'),
  ('Arena dos Titãs',            8, 4, 199.90, '2022-06-14', '14', 'Arena Forte'),
  ('Quadra Infinita',            4, 2, 299.90, '2024-09-20', 'L',  'Campo Aberto'),
  ('Vale Encantado',             2, 5, 249.90, '2023-11-17', '10', 'Raiz Studio'),
  ('Piloto Fantasma',            5, 2, 179.90, '2021-11-05', '12', 'Turbo Bits'),
  ('Crônicas de Ferro',          3, 3, 69.90,  '2019-03-22', '16', 'Estúdio Boreal'),
  ('Esquadrão Ômega',            1, 1, 119.90, '2022-08-09', '16', 'Ruído Urbano'),
  ('Ilha Perdida',               2, 1, 49.90,  '2020-07-16', '12', 'Mapa Antigo'),
  ('Simulador de Trem BR',       9, 1, 39.90,  '2021-02-12', 'L',  'Trilho Certo'),
  ('Dragões de Papel',           3, 5, 299.90, '2025-03-28', '10', 'Órbita 9'),
  ('Coliseu',                    6, 4, 159.90, '2024-01-19', '12', 'Coroa Digital'),
  ('Noite sem Fim',              7, 3, 79.90,  '2020-10-23', '18', 'Lanterna Games'),
  ('Salto Quântico',            10, 4, 89.90,  '2023-02-07', 'L',  'Pulo Alto'),
  ('Lutadores de Rua 3',         8, 3, 39.90,  '2019-06-28', '14', 'Arena Forte'),
  ('Futsal Mania',               4, 6, 14.90,  '2023-05-12', 'L',  'Campo Aberto'),
  ('Cozinha Caótica',            9, 5, 129.90, '2022-12-01', 'L',  'Raiz Studio'),
  ('Herói de Bolso',            10, 6, 4.90,   '2021-09-03', 'L',  'Pulo Alto'),
  ('Guerra das Estrelas Frias',  6, 1, 179.90, '2026-01-23', '12', 'Órbita 9'),
  ('Lâmina Carmesim',            1, 2, 349.90, '2026-04-10', '18', 'Lâmina Leste'),
  ('Expedição Ártica',           2, 4, 219.90, '2026-06-18', '12', 'Mapa Antigo'),
  ('Kart Turbo Deluxe',          5, 5, 299.90, '2024-05-24', 'L',  'Turbo Bits'),
  ('Contos do Pântano',          7, 1, 59.90,  '2024-08-30', '16', 'Lanterna Games'),
  ('Mestre do Xadrez',           6, 6, 0.00,   '2020-02-14', 'L',  'Coroa Digital'),
  ('Ritmo Selvagem',             9, 2, 149.90, '2025-12-05', 'L',  'Raiz Studio'),
  ('Saga do Dragão Dourado',     3, 4, 329.90, '2026-08-21', '14', 'Estúdio Boreal'),
  ('Corrida Cósmica',            5, 1, 99.90,  '2026-09-11', 'L',  'Órbita 9');

INSERT INTO clientes (nome, email, cidade, estado, data_cadastro)
SELECT
  n.nome || ' ' || s.sobrenome,
  translate(lower(n.nome || '.' || s.sobrenome), 'áâãéêíóôõúç', 'aaaeeiooouc') || g || '@email.com',
  c.cidade,
  c.estado,
  DATE '2023-01-01' + (g * 11 % 900)
FROM generate_series(1, 60) g
JOIN LATERAL (SELECT (ARRAY['Ana','Bruno','Carla','Diego','Eduarda','Felipe','Gabriela','Henrique','Isabela','João','Larissa','Marcos','Natália','Otávio','Paula'])[1 + (g % 15)] AS nome) n ON true
JOIN LATERAL (SELECT (ARRAY['Silva','Souza','Oliveira','Santos','Lima','Costa','Pereira','Almeida'])[1 + ((g * 7) % 8)] AS sobrenome) s ON true
JOIN LATERAL (
  SELECT (ARRAY['São Paulo','Rio de Janeiro','Belo Horizonte','Curitiba','Porto Alegre','Salvador','Recife','Santo André','Campinas','Fortaleza'])[1 + (g % 10)] AS cidade,
         (ARRAY['SP','RJ','MG','PR','RS','BA','PE','SP','SP','CE'])[1 + (g % 10)] AS estado
) c ON true;

-- 600 vendas entre 01/2025 e 10/2026. Clientes 51 a 60 nunca compraram.
INSERT INTO vendas (cliente_id, data_venda, forma_pagamento)
SELECT
  1 + floor(random() * 50)::int,
  DATE '2025-01-01' + floor(random() * 669)::int,
  (ARRAY['Pix','Pix','Cartão de crédito','Cartão de crédito','Cartão de débito','Boleto'])[1 + floor(random() * 6)::int]
FROM generate_series(1, 600);

-- 1 a 3 jogos por venda; jogos com id menor vendem mais (para ter "mais vendidos" claros)
INSERT INTO itens_venda (venda_id, jogo_id, quantidade, preco_unitario)
SELECT v.id, j.id, q.quantidade, j.preco
FROM vendas v
CROSS JOIN LATERAL generate_series(1, 1 + floor(random() * 3)::int + (v.id * 0)) item
CROSS JOIN LATERAL (SELECT 1 + floor(power(random(), 1.8) * 40)::int + (item * 0) AS jogo_id) e
JOIN jogos j ON j.id = e.jogo_id
CROSS JOIN LATERAL (SELECT CASE WHEN random() < 0.85 THEN 1 ELSE 2 END + (item * 0) AS quantidade) q;

-- Avaliações: cada jogo tem uma "qualidade" e as notas variam em volta dela
INSERT INTO avaliacoes (cliente_id, jogo_id, nota, data_avaliacao)
SELECT
  1 + floor(random() * 60)::int,
  j.id,
  least(5, greatest(1, round(2.2 + (j.id * 37 % 23) / 9.0 + (random() - 0.5) * 2)))::int,
  DATE '2025-01-01' + floor(random() * 669)::int
FROM generate_series(1, 320) g
CROSS JOIN LATERAL (SELECT 1 + floor(power(random(), 1.4) * 40)::int + (g * 0) AS id) j;

-- 150 mil partidas para o desafio de índice
INSERT INTO historico_partidas (jogador_id, jogo_id, pontuacao, jogado_em)
SELECT
  1 + floor(random() * 40000)::int,
  1 + floor(random() * 40)::int,
  floor(random() * 100000)::int,
  TIMESTAMP '2025-01-01' + random() * INTERVAL '670 days'
FROM generate_series(1, 150000);

ANALYZE;
`
