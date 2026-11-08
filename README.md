# GuiGym V11.1 — Academy + Fila Corrigida

Aplicativo pessoal de treino para hipertrofia, com identidade premium preta e vermelha.

## Novidades V11
- **GuiGym Academy durante o treino:** músculos principais e auxiliares, dicas de execução e revisão de memória sem interromper as séries.
- **Modo Foco** com um exercício por vez.
- **Quiz opcional durante o descanso** e reforço ao finalizar o exercício.
- **Narração opcional** usando a síntese de voz do navegador.
- **Imagens de IA** integradas às capas e seções; conteúdos anatômicos esquemáticos.

## Também incluído
- Fila inteligente: não pula treinos faltados.
- Editor de treinos e divisões sugeridas.
- Cronômetro e descanso maior configurável para pernas; low volume por sessão.
- Hidratação diária, RIR, progressão sugerida de cargas, relatórios e recordes pessoais.
- Backup JSON exportável e importável.

## Link público
https://kurtzada.github.io/GuiGym/

## Melhoria incremental — ícones, gráficos e segurança
- Ícones Lucide nos atalhos e indicadores da tela inicial, com a mesma identidade preta e vermelha.
- Chart.js na aba **Evolução**: carga por exercício, volume em séries, frequência semanal e peso corporal (quando houver medições).
- DOMPurify nos relatórios HTML gerados, com nomes personalizados codificados como texto e seleção de exercícios criada sem interpolar HTML.
- Bibliotecas servidas localmente de `vendor/` e disponíveis no cache offline do PWA; sem React, sem migração de dados e sem alterações no Spotify.

Dependências incluídas: Chart.js 4.6.1 (MIT), Lucide 1.70.0 (ISC) e DOMPurify 3.4.17 (Apache-2.0/MPL-2.0). As licenças originais estão nos pacotes oficiais publicados pelos respectivos projetos.

## Dados e limites
Os registros são guardados no armazenamento local do dispositivo/navegador (`forgeDB`). Não há sincronização automática entre aparelhos. Exporte backups regularmente. Algumas funções de narração/vibração dependem do aparelho.

A página publicada usa um HTML autocontido para evitar falhas de carregamento das imagens e scripts. O pacote ZIP da V11 contém também os arquivos modulares de desenvolvimento.

## Correção V11.1 — próximo treino
- Em **Treinos → Sua sequência ativa**, toque em **Aplicar minha sequência** para escolher Superiores completo → Pernas completas → primeiro treino do ciclo.
- O botão **Ser próximo** marca manualmente o próximo treino sem exigir conclusão do anterior.
- As setas continuam reorganizando os treinos independentemente de qual está definido como próximo.
- A mudança não apaga histórico de cargas, séries, RIR, hidratação ou medidas. O ajuste de fila deve ser feito no mesmo navegador em que você treina.
