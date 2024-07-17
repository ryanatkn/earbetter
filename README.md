# Earbetter

[<img src="static/logo.svg" alt="two beamed musical notes with ears" align="right" width="192" height="192">](https://earbetter.ryanatkn.com/)

> ear trainer and tools for playing and programming music and audio 🎶🦜
> [earbetter.ryanatkn.com](https://earbetter.ryanatkn.com/)

- features [a configurable ear trainer](https://earbetter.ryanatkn.com/trainer)
- also has [a playable piano](https://earbetter.ryanatkn.com/piano)
- supports MIDI devices like piano keyboards
- levels can be shared via their links or exporting/importing data

play at [earbetter.ryanatkn.com](https://earbetter.ryanatkn.com/)

[video intro on YouTube](https://www.youtube.com/watch?v=zW2zI1A_Ikw)

raw programming vods [YouTube playlist](https://www.youtube.com/playlist?list=PLio_5jgyVNVnamRztrGFag4XihZNmLKZT)

Feedback is super welcome,
please open any [discussions](https://github.com/ryanatkn/earbetter/discussions)
or issues. For more see [contributing.md](contributing.md).

## Usage

```bash
npm i -D @ryanatkn/earbetter
```

```ts
import Piano from '@ryanatkn/earbetter/Piano.svelte';
```

## About

[video intro on YouTube](https://www.youtube.com/watch?v=zW2zI1A_Ikw)

In 2016 I made a simple ear trainer named
[Ear Sharpener](https://github.com/ryanatkn/ear-sharpener)
because I thought ear training was interesting,
but it wasn't a good training tool.
The goal of Earbetter is to be a useful and customizable ear trainer.
I also want it to be fun so it motivates more training, but it's not there yet.

I'm not a musician and I'm one person so
I can't possibly make all of the best ear training challenges.
Knowing this, I designed the software so you can
create and share custom challenges - the content is all configurable.

Earbetter's trainer has "levels" broken up into "trials".
Each trial is a sequence of notes that you hear and then play back.
Your score for the level is the sum of mistakes made in each trial,
and you'll get a ★ when you reach 0 across four runs of the level.

When a sequence is two notes long, it trains individual intervals,
and longer sequences train a combination of relative pitch and working memory.

It's limited but supports a decent range of ear training challenges
and there's room to add more capabilities. (if you have ideas please share!)
In the level creator, you can click the "import" button
to get copy-pastable data as text that you can share with others.

"Realms" group multiple levels together, and each realm may have a particular flavor like a scale.
Realms can be created and shared just like importing/exporting levels.

"Projects" are like save files. They group multiple realms together.
They can similarly be imported/exported.

In the future I'll probably add a way to share in-app,
but that requires some kind of server infrastructure.
For now I'm accepting content submissions in this repo,
so we get the benefit having a lot of static content without needing a server.
I'm open to input but I'm hesitant to operate any kind of service or add non-static dependencies --
for now, you're invited to open PRs with your exported data
following [the default example](src/lib//projects/default_project.ts),
or email me if you don't use GitHub.

For more please see [contributing.md](contributing.md)
and the GitHub [discussions](https://github.com/ryanatkn/earbetter/discussions)
and [issues](https://github.com/ryanatkn/earbetter/issues).

## Develop

This project uses [SvelteKit](https://kit.svelte.dev/) with the static adapter
and [Vite](https://vitejs.dev/),
so the normal commands like `vite dev` work as expected.
I use [`gro`](https://github.com/feltjs/gro)
for additional things like deploying - see below for more.

> [Windows is not yet supported](https://github.com/feltjs/gro/issues/319)
> (we recommend [WSL](https://docs.microsoft.com/en-us/windows/wsl/about))

```bash
gro dev # npm i -g @feltjs/gro
```

See [SvelteKit](https://github.com/sveltejs/kit),
[Vite](https://github.com/vitejs/vite),
[Svelte](https://github.com/sveltejs/svelte),
[Fuz](https://github.com/fuz-dev/fuz),
and [Gro](https://github.com/feltjs/gro) for more.

## Build

```bash
gro build
```

See [Gro's build docs](https://github.com/feltjs/gro/blob/main/src/docs/build.md) for more.

## Test

```bash
gro test
```

See [`uvu`](https://github.com/lukeed/uvu)
and [Gro's test docs](https://github.com/feltjs/gro/blob/main/src/docs/test.md).

## Deploy

[Deploy](https://github.com/feltjs/gro/blob/main/src/docs/deploy.md)
(build, commit, and push) to the `deploy` branch, e.g. for GitHub Pages:

```bash
gro deploy
```

To configure GitHub pages (which this repo uses) or another static host,
customize or delete [src/static/CNAME](/src/static/CNAME).

## Credits 🐢<sub>🐢</sub><sub><sub>🐢</sub></sub>

[TypeScript](https://github.com/microsoft/TypeScript) ∙
[Svelte](https://github.com/sveltejs/svelte) ∙
[SvelteKit](https://github.com/sveltejs/kit) ∙
[Vite](https://github.com/vitejs/vite) ∙
[esbuild](https://github.com/evanw/esbuild) ∙
[Fuz](https://github.com/feltjs/felt-ui) ∙
[Gro](https://github.com/feltjs/gro) ∙
[uvu](https://github.com/lukeed/uvu) ∙
[ESLint](https://github.com/eslint/eslint) ∙
[Prettier](https://github.com/prettier/prettier)
& [more](package.json)

## License [🐦](https://wikipedia.org/wiki/Free_and_open-source_software)

public domain ⚘ [The Unlicense](license)
