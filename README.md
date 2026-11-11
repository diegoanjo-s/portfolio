# Portfólio · Diego Anjos

Site pessoal com os meus projetos. Na entrada você escolhe uma pílula: a **vermelha** abre o menu de projetos, a **azul** volta para o Google.

Tema preto e dourado, feito com **React + TypeScript + Vite**.

## Projetos

| Projeto | O que é | Código |
|---|---|---|
| **DevBank** | Banco digital: cadastro, login com JWT, depósito, saque, transferência e extrato | [diegoanjo-s/DevBank](https://github.com/diegoanjo-s/DevBank) |

O front do DevBank conversa com a API Java/Spring Boot pelo endereço em `VITE_DEVBANK_API_URL`.

## Como rodar no PC

1. Ligue a API do DevBank (porta 8080).
2. Neste projeto:

```bash
npm install
npm run dev
```

3. Abra http://localhost:5173

## Adicionar um projeto novo ao menu

Edite `src/projetos.ts` e copie um bloco `{ ... }`. O card aparece sozinho.
