# GuiGym Studio — migração React (prévia)

Uma nova interface em **React + TypeScript + Tailwind CSS v4 + Vite + Lucide React**, criada em paralelo ao GuiGym atual.

## Por que fica separado?

A versão em produção usa um `index.html` monolítico e armazena os dados localmente como `localStorage.forgeDB`. Uma substituição direta arriscaria perder sessões, pesos e personalizações no iPhone. Esta prévia é **somente leitura**: lê os dados atuais ou um backup JSON, sem sobrescrever `forgeDB`.

## Rodar localmente

Requer Node.js compatível com o Vite atual (Node 20.19+ ou 22.12+).

```sh
cd modern
npm install
npm run dev
npm run typecheck
npm run build
```

Abra o endereço exibido pelo Vite. Como `localStorage` é isolado por origem e por contexto do navegador, o app local provavelmente não verá automaticamente os dados do GitHub Pages. Na aba **Mais**, importe o backup JSON do GuiGym atual.

## Incluído nesta primeira etapa

- Layout escuro premium e responsivo para desktop e celular.
- Navegação com **cinco abas** preservadas: Início, Treinos, Evolução, Água e Mais.
- Componentes React tipados, ícones Lucide e Tailwind v4 usando o plugin oficial do Vite.
- Leitura da rotina, exercícios, cargas anteriores, histórico, medidas e água.
- Importação temporária de backup e opção de baixar `forgeDB` local.
- Sem rastreadores, sem envio de backup para servidor, sem alterações nos registros originais.

## Antes de disponibilizar como substituto

1. Migrar o fluxo completo de iniciar/concluir treino e salvar séries.
2. Migrar editor de planos, exercício substituto, cronômetro, Academy, conquistas, água e relatórios.
3. Adicionar importação/exportação e testes automatizados para `forgeDB`.
4. Migrar Spotify Connect com OAuth PKCE e tratamento seguro de sessão.
5. Validar dados reais em Safari **e** PWA instalada; os armazenamentos podem diferir.
6. Implementar atualização gradual e reversível da PWA sem apagar caches/dados do usuário.

**Não altere o deployment do GitHub Pages nem faça merge deste protótipo como substituto do app atual sem concluir os testes.**
