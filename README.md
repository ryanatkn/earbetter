# earbetter

> ear training game and tools for playing and programming music and audio 🎶🦜
> [earbetter.ryanatkn.com](https://earbetter.ryanatkn.com/)

see [contributing.md](contributing.md)

## intro

In 2016 I made a simple ear training game named
[`ear-sharpener`](https://github.com/ryanatkn/ear-sharpener).
This is a followup with a new design.
The goal is to make an ear training experience that's fun and useful,
and also publish reusable components and helpers for music and audio programming.
It's online at [earbetter.ryanatkn.com](https://earbetter.ryanatkn.com/).

earbetter is designed for MIDI devices like piano keyboards, but it also works without them.

## develop

> [Windows is not yet supported](https://github.com/feltjs/gro/issues/319)
> (we recommend [WSL](https://docs.microsoft.com/en-us/windows/wsl/about))

```bash
gro dev # npm i -g @feltjs/gro
```

See [SvelteKit](https://github.com/sveltejs/kit),
[Vite](https://github.com/vitejs/vite),
[Svelte](https://github.com/sveltejs/svelte),
[Gro](https://github.com/feltjs/gro),
and [Felt](https://github.com/feltjs/felt-ui) for more.

## build

```bash
gro build
```

See [Gro's build docs](https://github.com/feltjs/gro/blob/main/src/docs/build.md) for more.

## test

```bash
gro test
```

See [`uvu`](https://github.com/lukeed/uvu)
and [Gro's test docs](https://github.com/feltjs/gro/blob/main/src/docs/test.md).

## deploy

[Deploy](https://github.com/feltjs/gro/blob/main/src/docs/deploy.md)
(build, commit, and push) to the `deploy` branch, e.g. for GitHub Pages:

```bash
gro deploy
```

To configure GitHub pages (which this repo uses) or another static host,
customize or delete [src/static/CNAME](/src/static/CNAME).

## credits 🐢<sub>🐢</sub><sub><sub>🐢</sub></sub>

[Svelte](https://github.com/sveltejs/svelte) ∙
[SvelteKit](https://github.com/sveltejs/kit) ∙
[Vite](https://github.com/vitejs/vite) ∙
[esbuild](https://github.com/evanw/esbuild) ∙
[uvu](https://github.com/lukeed/uvu) ∙
[TypeScript](https://github.com/microsoft/TypeScript) ∙
[ESLint](https://github.com/eslint/eslint) ∙
[Prettier](https://github.com/prettier/prettier) ∙
[Felt](https://github.com/feltjs/felt-ui) ∙
[@feltjs/util](https://github.com/feltjs/util) ∙
[Gro](https://github.com/feltjs/gro)
& [more](package.json)

## license [🐦](https://wikipedia.org/wiki/Free_and_open-source_software)

public domain ⚘ [The Unlicense](license)
