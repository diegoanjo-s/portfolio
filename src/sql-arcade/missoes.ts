// ============================================================
//  Missões do SQL Arcade
//  Para criar uma missão nova, copie um bloco { ... }.
//  "ordenado: true" = a ordem das linhas também é conferida.
// ============================================================

export type Fase = { numero: number; nome: string; descricao: string }

export type Missao = {
  id: string
  fase: number
  titulo: string
  enunciado: string
  dica: string
  solucao: string
  ordenado: boolean
  tipo?: 'resultado' | 'indice'
}

export const FASES: Fase[] = [
  { numero: 1, nome: 'Primeiros passos', descricao: 'SELECT, WHERE, ORDER BY, LIMIT e COUNT' },
  { numero: 2, nome: 'Juntando tabelas', descricao: 'JOIN, GROUP BY, HAVING e funções de agregação' },
  { numero: 3, nome: 'Chefão', descricao: 'Subconsultas, CASE e window functions' },
  { numero: 4, nome: 'Bônus: performance', descricao: 'EXPLAIN ANALYZE e índices' },
]

export const MISSOES: Missao[] = [
  // ---------------- FASE 1 ----------------
  {
    id: 'catalogo',
    fase: 1,
    titulo: 'Catálogo completo',
    enunciado: 'Liste o título e o preço de todos os jogos, do mais caro para o mais barato. Em caso de empate no preço, ordene pelo título.',
    dica: 'Use ORDER BY com duas colunas: a primeira com DESC e a segunda em ordem normal.',
    solucao: 'SELECT titulo, preco\nFROM jogos\nORDER BY preco DESC, titulo;',
    ordenado: true,
  },
  {
    id: 'promocao',
    fase: 1,
    titulo: 'Caça às promoções',
    enunciado: 'Mostre o título e o preço dos jogos que custam menos de R$ 50,00.',
    dica: 'Filtre com WHERE preco < ...',
    solucao: 'SELECT titulo, preco\nFROM jogos\nWHERE preco < 50;',
    ordenado: false,
  },
  {
    id: 'paulistas',
    fase: 1,
    titulo: 'Jogadores paulistas',
    enunciado: 'Mostre o nome e a cidade dos clientes do estado de São Paulo (SP).',
    dica: 'A coluna estado guarda a sigla com 2 letras. Texto vai entre aspas simples.',
    solucao: "SELECT nome, cidade\nFROM clientes\nWHERE estado = 'SP';",
    ordenado: false,
  },
  {
    id: 'lancamentos',
    fase: 1,
    titulo: 'Lançamentos',
    enunciado: 'Mostre o título e a data de lançamento dos 5 jogos lançados mais recentemente, do mais novo para o mais antigo.',
    dica: 'Ordene pela data de lançamento de forma decrescente e use LIMIT.',
    solucao: 'SELECT titulo, data_lancamento\nFROM jogos\nORDER BY data_lancamento DESC\nLIMIT 5;',
    ordenado: true,
  },
  {
    id: 'letra-c',
    fase: 1,
    titulo: 'Começa com C',
    enunciado: 'Mostre o título dos jogos cujo título começa com a letra C.',
    dica: "LIKE com % funciona como curinga: 'C%' significa \"começa com C\".",
    solucao: "SELECT titulo\nFROM jogos\nWHERE titulo LIKE 'C%';",
    ordenado: false,
  },
  {
    id: 'livres',
    fase: 1,
    titulo: 'Para todas as idades',
    enunciado: "Quantos jogos têm classificação livre (classificacao = 'L')? O resultado deve ser um único número.",
    dica: 'COUNT(*) conta as linhas que passaram pelo WHERE.',
    solucao: "SELECT COUNT(*)\nFROM jogos\nWHERE classificacao = 'L';",
    ordenado: false,
  },

  // ---------------- FASE 2 ----------------
  {
    id: 'jogo-plataforma',
    fase: 2,
    titulo: 'Onde eu jogo isso?',
    enunciado: 'Mostre o título de cada jogo e o nome da plataforma dele.',
    dica: 'A tabela jogos tem plataforma_id. Ligue com plataformas usando JOIN ... ON jogos.plataforma_id = plataformas.id.',
    solucao: 'SELECT j.titulo, p.nome\nFROM jogos j\nJOIN plataformas p ON p.id = j.plataforma_id;',
    ordenado: false,
  },
  {
    id: 'por-genero',
    fase: 2,
    titulo: 'Gêneros mais populares',
    enunciado: 'Mostre o nome de cada gênero e quantos jogos ele tem, do maior total para o menor. Em caso de empate, ordene pelo nome do gênero.',
    dica: 'JOIN entre generos e jogos, depois GROUP BY no nome do gênero e COUNT.',
    solucao: 'SELECT g.nome, COUNT(*) AS total\nFROM generos g\nJOIN jogos j ON j.genero_id = g.id\nGROUP BY g.nome\nORDER BY total DESC, g.nome;',
    ordenado: true,
  },
  {
    id: 'faturamento',
    fase: 2,
    titulo: 'Caixa da loja',
    enunciado: 'Quanto a loja faturou no total? O faturamento de cada item é quantidade × preco_unitario.',
    dica: 'SUM aceita contas dentro dele: SUM(coluna_a * coluna_b).',
    solucao: 'SELECT SUM(quantidade * preco_unitario) AS faturamento\nFROM itens_venda;',
    ordenado: false,
  },
  {
    id: 'faturamento-plataforma',
    fase: 2,
    titulo: 'Qual console vende mais?',
    enunciado: 'Mostre o nome de cada plataforma e o faturamento dela, do maior para o menor.',
    dica: 'São 3 tabelas: itens_venda → jogos → plataformas. Agrupe pelo nome da plataforma.',
    solucao: 'SELECT p.nome, SUM(i.quantidade * i.preco_unitario) AS faturamento\nFROM itens_venda i\nJOIN jogos j ON j.id = i.jogo_id\nJOIN plataformas p ON p.id = j.plataforma_id\nGROUP BY p.nome\nORDER BY faturamento DESC;',
    ordenado: true,
  },
  {
    id: 'notas',
    fase: 2,
    titulo: 'Os queridinhos da crítica',
    enunciado: 'Mostre o título e a nota média (arredondada com 2 casas decimais) dos jogos com pelo menos 10 avaliações, da maior média para a menor. Em caso de empate, ordene pelo título.',
    dica: 'ROUND(AVG(nota), 2) faz a média arredondada. Para filtrar depois de agrupar, use HAVING COUNT(*) >= 10.',
    solucao: 'SELECT j.titulo, ROUND(AVG(a.nota), 2) AS media\nFROM avaliacoes a\nJOIN jogos j ON j.id = a.jogo_id\nGROUP BY j.titulo\nHAVING COUNT(*) >= 10\nORDER BY media DESC, j.titulo;',
    ordenado: true,
  },
  {
    id: 'sem-compras',
    fase: 2,
    titulo: 'Só olhando a vitrine',
    enunciado: 'Mostre o nome dos clientes que nunca fizeram nenhuma compra.',
    dica: 'LEFT JOIN mantém todos os clientes. Quem não tem venda fica com as colunas de vendas nulas: filtre com IS NULL.',
    solucao: 'SELECT c.nome\nFROM clientes c\nLEFT JOIN vendas v ON v.cliente_id = c.id\nWHERE v.id IS NULL;',
    ordenado: false,
  },

  // ---------------- FASE 3 ----------------
  {
    id: 'mais-vendido',
    fase: 3,
    titulo: 'Campeão de vendas',
    enunciado: 'Qual é o jogo mais vendido em unidades? Mostre o título e o total de unidades vendidas (uma única linha).',
    dica: 'Some a quantidade por jogo, ordene do maior para o menor e pegue só o primeiro com LIMIT 1.',
    solucao: 'SELECT j.titulo, SUM(i.quantidade) AS unidades\nFROM itens_venda i\nJOIN jogos j ON j.id = i.jogo_id\nGROUP BY j.titulo\nORDER BY unidades DESC\nLIMIT 1;',
    ordenado: true,
  },
  {
    id: 'acima-media',
    fase: 3,
    titulo: 'Acima da média',
    enunciado: 'Mostre o título e o preço dos jogos que custam mais do que a média de preço de todos os jogos.',
    dica: 'Uma subconsulta calcula a média: WHERE preco > (SELECT AVG(preco) FROM jogos).',
    solucao: 'SELECT titulo, preco\nFROM jogos\nWHERE preco > (SELECT AVG(preco) FROM jogos);',
    ordenado: false,
  },
  {
    id: 'faixas',
    fase: 3,
    titulo: 'Etiquetas de preço',
    enunciado: "Mostre o título, o preço e uma faixa para cada jogo: 'Grátis' se o preço for 0, 'Barato' até R$ 50,00, 'Médio' até R$ 200,00 e 'Caro' acima disso.",
    dica: 'CASE WHEN ... THEN ... WHEN ... THEN ... ELSE ... END. A ordem dos WHEN importa: teste o 0 primeiro.',
    solucao: "SELECT titulo, preco,\n  CASE\n    WHEN preco = 0 THEN 'Grátis'\n    WHEN preco <= 50 THEN 'Barato'\n    WHEN preco <= 200 THEN 'Médio'\n    ELSE 'Caro'\n  END AS faixa\nFROM jogos;",
    ordenado: false,
  },
  {
    id: 'melhor-por-plataforma',
    fase: 3,
    titulo: 'O rei de cada console',
    enunciado: 'Para cada plataforma, mostre o jogo com maior faturamento: nome da plataforma, título do jogo e faturamento.',
    dica: 'Calcule o faturamento por jogo e use ROW_NUMBER() OVER (PARTITION BY plataforma ORDER BY faturamento DESC) numa subconsulta. Depois filtre a posição 1.',
    solucao: 'SELECT plataforma, titulo, faturamento\nFROM (\n  SELECT p.nome AS plataforma, j.titulo,\n         SUM(i.quantidade * i.preco_unitario) AS faturamento,\n         ROW_NUMBER() OVER (PARTITION BY p.nome ORDER BY SUM(i.quantidade * i.preco_unitario) DESC) AS posicao\n  FROM itens_venda i\n  JOIN jogos j ON j.id = i.jogo_id\n  JOIN plataformas p ON p.id = j.plataforma_id\n  GROUP BY p.nome, j.titulo\n) ranking\nWHERE posicao = 1;',
    ordenado: false,
  },
  {
    id: 'acumulado',
    fase: 3,
    titulo: 'Linha do tempo do caixa',
    enunciado: "Mostre, mês a mês, o mês (no formato 'AAAA-MM'), o faturamento do mês e o faturamento acumulado até aquele mês, em ordem cronológica.",
    dica: "TO_CHAR(data_venda, 'YYYY-MM') gera o mês. O acumulado é SUM(...) OVER (ORDER BY mes) aplicado sobre o faturamento mensal.",
    solucao: "SELECT mes, faturamento,\n       SUM(faturamento) OVER (ORDER BY mes) AS acumulado\nFROM (\n  SELECT TO_CHAR(v.data_venda, 'YYYY-MM') AS mes,\n         SUM(i.quantidade * i.preco_unitario) AS faturamento\n  FROM vendas v\n  JOIN itens_venda i ON i.venda_id = v.id\n  GROUP BY mes\n) mensal\nORDER BY mes;",
    ordenado: true,
  },

  // ---------------- FASE 4 ----------------
  {
    id: 'indice',
    fase: 4,
    titulo: 'Acelera, servidor!',
    enunciado: 'A tabela historico_partidas tem 150 mil linhas e nenhum índice em jogador_id. Rode EXPLAIN ANALYZE SELECT * FROM historico_partidas WHERE jogador_id = 4242; e veja o "Seq Scan" lendo a tabela inteira. Depois crie um índice que faça essa busca usar "Index Scan" e rode o EXPLAIN de novo para comparar o tempo.',
    dica: 'CREATE INDEX nome_do_indice ON tabela (coluna);',
    solucao: 'CREATE INDEX idx_partidas_jogador ON historico_partidas (jogador_id);\n\nEXPLAIN ANALYZE SELECT * FROM historico_partidas WHERE jogador_id = 4242;',
    ordenado: false,
    tipo: 'indice',
  },
]
