# CLAUDE.md

Guia para o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## Comandos

```bash
npm start          # Metro bundler
npm run android    # Build e instala no Android
npm run ios        # Build iOS (somente macOS)
npm run typecheck  # tsc --noEmit
npm run lint       # Biome lint
npm run format     # Biome format --write
npm run check      # Biome lint + format
```

Não há suíte de testes. Para validar mudanças, use `npm run typecheck` e
`npm run check` — ambos rodam sem toolchain nativa instalada.

## Arquitetura

App **React Native 0.86 (bare CLI, sem Expo)** + TypeScript. É o port nativo do
`../yggdrasil-frontend`, consumindo o backend `../yggdrasil`.

**Entrypoint:** `index.js` → `App.tsx`, que monta `GestureHandlerRootView` →
`SafeAreaProvider` → `QueryClientProvider` → `RootNavigator`.

**Navegação:** React Navigation em `src/navigation/`. O `RootNavigator` é um
native stack que troca entre a tela de login e o `MainDrawer` conforme
`useAuthState()`. Por isso **login e logout não navegam imperativamente** — eles
só mexem no `tokenStorage` e a árvore de telas reage.

Para navegar entre telas, use `useAppNavigation()` de `src/navigation/types.ts`:
é um tipo composto Drawer + Stack, necessário porque as telas ficam dentro do
Drawer mas precisam alcançar telas do Stack raiz (ex: `Scanner`).

**Estrutura modular** (`src/modules/<modulo>/`), espelhando o projeto web:

- `domain/` — entidades e interfaces de repositório
- `application/` — use cases e DTOs
- `infrastructure/` — clientes de API e implementações de repositório
- `presentation/` — hooks (TanStack Query), telas e componentes

As três primeiras camadas são **compartilhadas verbatim com o
`yggdrasil-frontend`**. Ao alterar regra de negócio nelas, replique no outro
repositório para não divergirem.

**Storage:** `react-native-mmkv` via `src/shared/storage/storage.ts`. É
**síncrono** de propósito — foi o que permitiu portar `tokenStorage`,
repositories e use cases sem convertê-los para async. Não troque por
AsyncStorage. Note que no MMKV v4 o método é `remove()`, não `delete()`.

**Estilo:** NativeWind v4 (`className` nas primitivas do RN). Os tokens de tema
(`bg-background`, `text-muted-foreground`, …) são variáveis CSS definidas em
`global.css` e mapeadas no `tailwind.config.js`.

**Componentes de UI:** `src/components/ui/` — kit próprio que substitui
shadcn/Radix, mantendo APIs parecidas. `Button` recebe `label`/`icon` (não
children de texto), pois em RN todo texto precisa estar dentro de `<Text>`.
Use o `Text` de `@/components/ui/Text`, que já aplica a cor do tema.

**Variáveis de ambiente:** injetadas em build via `react-native-dotenv`,
importadas de `@env` e validadas em `src/shared/config/env.ts`. Após alterar o
`.env`, reinicie o Metro com `--reset-cache`.

**Alias de path:** `@/` → `src/`, configurado em dois lugares que precisam ficar
em sincronia — `babel.config.js` (module-resolver) e `tsconfig.json` (paths).

**Lint/format:** Biome (não ESLint/Prettier), com tabs e aspas duplas.

## Restrições

- `react-native-vision-camera` está fixado na **v4.7.3**. A v5 é uma reescrita
  em que a leitura de códigos é iOS-only. Não atualize sem verificar o suporte
  a Android.
- O plugin Babel do Reanimated 4 é `react-native-worklets/plugin` (não mais
  `react-native-reanimated/plugin`) e deve ser sempre o **último** da lista.
- O app é exclusivamente mobile — não porte as variantes de tabela desktop do
  projeto web.
