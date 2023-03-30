# Earbetter

> ear training game and tools for playing and programming music and audio 🎶🦜
> [earbetter.ryanatkn.com](https://earbetter.ryanatkn.com/)

see [contributing.md](contributing.md)

- configurable ear training challenges (first pass at functionality, more features to come)
- supports MIDI devices like piano keyboards
- TODO publish to npm as `@ryanatkn/earbetter` with audio/music utils/types and Svelte components

## intro

In 2016 I made a simple ear training game named
[Ear Sharpener](https://github.com/ryanatkn/ear-sharpener) to scratch an itch,
and while interesting it wasn't a good training tool.
The goal of Earbetter is to be a useful ear trainer.
I also want it to be fun so it motivates more training.
It's still early so I don't know how either goal is going.
It's online at [earbetter.ryanatkn.com](https://earbetter.ryanatkn.com/).

I'm a web developer, not a musician,
and I can't possibly design all of the best ear training challenges.
Knowing this, I designed the software so you can
create and share custom challenges and other content.

Earbetter's core gameplay has "levels" broken up into "trials".
Each trial is a sequence of notes that you hear and then play back.
While limited, it supports a decent range of ear training challenges
and there's room to add more capabilities.
In the level creator, you can click the "import" button
to get copy-pastable data as text that you can share with others.

"Realms" have many levels, and each realm may have a particular flavor, like the pentatonic scale.
Realms can be created and shared just like importing/exporting levels.

"Projects" are like save files. They group multiple realms together.
They can similarly be imported/exported.

In the future I'll probably add a way to share in-app,
but that requires some kind of server infrastructure.
For now I'm accepting content submissions in this repo,
so we get the benefit having a lot of static content without needing a server.
I'm open to input -- for now, feel free to open PRs with your exported data
following [the default example](src/lib//projects/default-project.ts).

To help improve things, please see [contributing.md](contributing.md),
and the GitHub [discussions](https://github.com/ryanatkn/earbetter/discussions)
and [issues](https://github.com/ryanatkn/earbetter/issues).

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
