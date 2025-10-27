<div align="center">
  <img src="/docs/img/cover.svg" alt="HKRecruitment">

  ![](https://img.shields.io/badge/HKN_Chapter-MuNu-blue) ![GitHub commit activity](https://img.shields.io/github/commit-activity/w/MuNuChapterHKN/HKrecruitment) ![GitHub contributors](https://img.shields.io/github/contributors/MuNuChapterHKN/HKrecruitment) 
</div>

A recruitment platform used by the Mu Nu Chapter of Eta Kappa Nu, check out our website to learn more about our chapter [hknpolito.org](https://hknpolito.org).

## Getting Started

### Prerequisites

First of all check that your machine has all the dependencies to run the platform for development.

- `node>=24`
- `pnpm>=10`
- `docker`

In order to manage multiple versions of node.js and pnpm, I'd suggest using [asdf](https://asdf-vm.com/) or [mise](https://github.com/jdx/mise).

### Set up

1. `pnpm i` in order to install the required packages;
2. Create a new `.env` file based on the [`.env.example`](/.env.example);
3. Start the database with `docker compose up -d postgres`;
4. Push the migrations to the database with `pnpm db:push`;
5. Start the development server with `pnpm dev`;
6. Go to `https://localhost:3000/dashboard` and log in with your Google account;
7. (Optional) If you want to seed the database, you can use `pnpm db:seed`. You can also set your account as admin by passing `pnpm db:seed --admin-email=your.email@hknpolito.org`.

### Development 

Whenever you make any change to the codebase, try to follow these guidelines:

1. Try to check if there's something similar already that you can use, instead of creating it from scratch.
2. Check if you're following the same guidelines as the other file and entities in the project.
3. Check if you're commiting in the right branch, check the [CONTRIBUTING](/docs/CONTRIBUTING.md) docs for more info.
4. If you're using any AI related software, make sure they also follow these guidelines. Refer to [AGENTS](/AGENTS.md) for more info.
5. Make sure that your commit has a significant message, in order to explain others what you did. There is no syntax that we impose, but [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) are suggested.

## Contributing

This project is managed by the IT area and usually only accepts internal contributors, but if you wish to take part in the project contact [it@hknpolito.org](mailto:it@hknpolito.org).

For approved contributors, check out the contributing guidelines in [CONTRIBUTING](/docs/CONTRIBUTING.md). Thank you for contributing to this project 💙

<a href="https://github.com/MuNuChapterHKN/HKrecruitment/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MuNuChapterHKN/HKrecruitment" />
</a>

## License

This project is released under [GNU GPLv3](/LICENSE). Forking, redistribution, and modification for both personal and commercial use are allowed as long as the source code stays open under the same license.
