# Contributing

This project is gonna be managed by multiple people at the same time, thus we all have to follow some rules in order to keep the codebase clean and not loose trace of what is happening. Therefore, try to follow these guidelines whenever you contribute to the project:

1. Every new feature is gonna have an issue describing in brief terms the task. _E.g. Adding logout button in the dashboard._
2. Every new feature has a branch assigned to it that is followed by only one contributor, and its name has to be `yournickname/name-feature`. _E.g. peppe/dashboard-logout._ 
3. When you think your feature is ready to be merged, open a pull request to `dev` and add one of the Project Leads as a reviewer.

Regarding the code, as also defined in the [README](/docs/README.md):

1. Try to check if there's something similar already that you can use, instead of creating it from scratch.
2. Check if you're following the same guidelines as the other file and entities in the project.
3. Check if you're commiting in the right branch.
4. If you're using any AI related software, make sure they also follow these guidlines. Refer to [AGENTS](/AGENTS.md) for more info.
5. Make sure that your commit has a significant message, in order to explain others what you did. There is no syntax that we impose, but [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) are suggested.

## Regarding AI

You're completely free to use AI whenever you see fit. The only suggestion is to give it enough context not to go against the points described above. Sometimes AIs tend to rewrite whole files when it isn't really needed, try to review your AI generated code before submitting it for approval.

With that said, [opencode](https://opencode.ai/) seems to be a good tool, especially if combined with [Context7](https://context7.com/) and [Vercel Grep](https://grep.app/). The program is open source, and it can be used for free with GitHub Copilot if you're a student, learn more [here](https://github.com/education).
