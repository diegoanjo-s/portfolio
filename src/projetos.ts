// ============================================================
//  O MENU DE PROJETOS
//  Para adicionar um projeto novo, copie um bloco { ... } e
//  mude os campos. O card aparece sozinho no menu.
// ============================================================

export type Projeto = {
  nome: string
  descricao: string
  tecnologias: string[]
  status: 'online' | 'em-breve'
  rota?: string          // página dentro deste site (ex.: /projetos/devbank)
  repositorio?: string   // link do GitHub
}

export const projetos: Projeto[] = [
  {
    nome: 'DevBank',
    descricao:
      'API REST de um banco digital: cadastro, login com JWT, contas, depósito, saque, transferência e extrato. ' +
      'Cada cliente só acessa os próprios dados.',
    tecnologias: ['Java 21', 'Spring Boot 4', 'Spring Security', 'JWT', 'PostgreSQL', 'Flyway', 'Docker', 'JUnit'],
    status: 'online',
    rota: '/projetos/devbank',
    repositorio: 'https://github.com/diegoanjo-s/DevBank',
  },
  {
    nome: 'SQL Arcade',
    descricao:
      'Laboratório de SQL com um PostgreSQL de verdade rodando no navegador. Banco de uma loja de games ' +
      'e 18 missões com correção automática, do SELECT ao índice com EXPLAIN ANALYZE.',
    tecnologias: ['SQL', 'PostgreSQL', 'PGlite (WebAssembly)', 'React', 'TypeScript'],
    status: 'online',
    rota: '/projetos/sql-arcade',
    repositorio: 'https://github.com/diegoanjo-s/portfolio',
  },
  {
    nome: 'Próximo projeto',
    descricao: 'O próximo passo da jornada. Em construção.',
    tecnologias: ['Python?', 'Java?', '...'],
    status: 'em-breve',
  },
]
