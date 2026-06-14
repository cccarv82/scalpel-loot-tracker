# Scalpel Loot Tracker

Plugin pro [Scalpel](https://github.com/scalpelpoe/scalpel) (overlay PoE1/PoE2).

Rastreia loot da sessão de jogo, valor estimado via poe.ninja, drops/hora, top items, agrupa por mapa, exporta JSON/CSV.

## Limitação importante

Scalpel não loga drop automático do chão. Só captura item que o jogador inspeciona via hotkey de price-check (Ctrl+C). Então isto é "tracker do que você checou", não "tudo que caiu". Na prática isto até ajuda — só conta o que importa.

## Features

**v1**
- Captura via `onCurrentItem`
- Lookup preço via `ctx.prices` (poe.ninja)
- Total da sessão + por hora + drops/hora
- Agrupa por mapa (via `onCurrentZone`)
- Persistência em `ctx.storage`
- Dedupe por hash de item (nome, base, mods, sockets, etc.)

**v2**
- Filtro: ignorar itens abaixo de X chaos
- Export JSON e CSV
- Gráfico SVG simples por mapa
- Hotkey "marcar last item ⭐"

**v3**
- Timing preciso via `Client.txt` (`onLogLine`)
- Reset auto em mudança de liga (com archive)
- Histórico de sessões anteriores

## Dev

```bash
npm install
npm run dev        # vite build --watch -> dist/plugin.js
npm run build      # produção
npm run typecheck
```

Output: `dist/plugin.js` + `manifest.json`.

## Teste local

1. `npm run build`
2. Em Scalpel → Settings → Plugins → "Load from disk"
3. Aponta pra `dist/plugin.js`
4. Aba "Loot Tracker" aparece

## Release

1. `npm run build`
2. `gh release create v0.1.0 dist/plugin.js manifest.json`
3. PR no [scalpel-plugins-registry](https://github.com/scalpelpoe/scalpel-plugins-registry)

## License

AGPL-3.0-only (mesmo do Scalpel).
