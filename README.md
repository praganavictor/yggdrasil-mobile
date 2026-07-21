# Yggdrasil Mobile

App React Native do Yggdrasil — port nativo do `yggdrasil-frontend`, consumindo o
mesmo backend (`yggdrasil`).

## Pré-requisitos

Este projeto usa **React Native CLI** (bare), não Expo. É necessário ter a
toolchain nativa instalada:

- **Node** >= 22.11
- **JDK 17** (`sudo apt install openjdk-17-jdk`)
- **Android SDK** — via Android Studio ou command line tools, com as variáveis:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```

- **iOS**: só compila em macOS com Xcode (`cd ios && pod install`).

## Configuração

```bash
npm install
cp .env.example .env
```

Edite o `.env` com a URL do backend. Atenção ao host:

| Ambiente          | `API_URL`                         |
| ----------------- | --------------------------------- |
| Emulador Android  | `http://10.0.2.2:8000`            |
| Simulador iOS     | `http://localhost:8000`           |
| Aparelho físico   | `http://<ip-da-sua-maquina>:8000` |

O emulador Android não enxerga `localhost` — `10.0.2.2` é o alias do host.

> As variáveis são injetadas em tempo de build pelo Babel. Depois de alterar o
> `.env`, reinicie o Metro com cache limpo: `npm start -- --reset-cache`.

## Comandos

```bash
npm start          # Metro bundler
npm run android    # Build e instala no emulador/aparelho
npm run ios        # Build iOS (somente macOS)
npm run typecheck  # tsc --noEmit
npm run lint       # Biome lint
npm run check      # Biome lint + format
```

## Arquitetura

Mesma arquitetura limpa do projeto web, por módulo de domínio:

```
src/modules/<modulo>/
  domain/          entidades e interfaces de repositório  (portado verbatim)
  application/     use cases e DTOs                       (portado verbatim)
  infrastructure/  clientes de API e repositórios         (portado verbatim)
  presentation/    hooks, telas e componentes             (hooks verbatim; UI nativa)
```

As camadas `domain`, `application` e `infrastructure` são idênticas às do
`yggdrasil-frontend` — são platform-agnostic. Ao corrigir uma regra de negócio,
aplique nos dois repositórios.

### Decisões de port

| Web                        | Mobile                            | Motivo |
| -------------------------- | --------------------------------- | ------ |
| `localStorage`             | `react-native-mmkv`               | MMKV é **síncrono**, então `tokenStorage`, repositories e use cases migraram sem refactor async |
| TanStack Router            | React Navigation (Drawer + Stack) | Navegação nativa; o `RootNavigator` observa o `tokenStorage`, então login/logout trocam a árvore de telas sem navegação imperativa |
| shadcn/ui + Radix          | Kit próprio em `src/components/ui` | Radix é DOM-only; os componentes replicam a mesma API (`Button`, `Sheet`, `Select`, …) |
| Tailwind CSS               | NativeWind v4                     | Mantém as mesmas classes utilitárias e o tema dark |
| `@zxing/browser`           | `react-native-vision-camera`      | Leitura nativa via MLKit — mais rápida e sem exigir HTTPS |
| `<input type="date">`      | `@react-native-community/datetimepicker` | Date picker nativo |
| Tabelas (breakpoint `md:`) | Apenas as listas mobile           | O app é exclusivamente mobile; a variante desktop foi descartada |

### Ponto de atenção: vision-camera

Está fixado em **v4.7.3**, não na v5. A v5 é uma reescrita sobre Nitro em que a
API de leitura de códigos (`useObjectOutput` / `ScannedObject`) está marcada
como **iOS-only**. A v4 usa `useCodeScanner`, que funciona no Android via MLKit.
Reavalie quando a v5 tiver suporte a Android.
