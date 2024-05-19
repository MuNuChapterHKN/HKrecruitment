<p align="center">
    <img src="https://www.hknpolito.org/Signature/hkn_logo_blu.png" width="100">
</p>

<h1 align="center">HKRecruitment</h1>
<p align="center">Official HKN Polito recruitment platform 🚀</p>

<p align="center">
<img alt="Quality Gate Status" src="https://sonarcloud.io/api/project_badges/measure?project=MuNuChapterHKN_HKrecruitment&metric=alert_status">
<img alt="Coverage" src="https://sonarcloud.io/api/project_badges/measure?project=MuNuChapterHKN_HKrecruitment&metric=coverage">
<img alt="Duplicated Lines (%)" src="https://sonarcloud.io/api/project_badges/measure?project=MuNuChapterHKN_HKrecruitment&metric=duplicated_lines_density">
<img alt="Lines of Code" src="https://sonarcloud.io/api/project_badges/measure?project=MuNuChapterHKN_HKrecruitment&metric=ncloc">
<img alt="Security Rating" src="https://sonarcloud.io/api/project_badges/measure?project=MuNuChapterHKN_HKrecruitment&metric=security_rating">
</p>

## Useful Links

[Reports](https://drive.google.com/drive/folders/1RqGVtzU4TV6RJPmtjZQPpHVybDpU6DZk?usp=sharing)

[Tasks](https://github.com/orgs/MuNuChapterHKN/projects/3/views/2)

[UI Mockups](https://miro.com/app/board/uXjVOdvzKAk=/)

[Database Schema](https://app.diagrams.net/#G19QUWxP5BBB3tWXnATnHP8wFE4wW7NsXw)

## Getting started

### Requirements
- [Node.js](https://nodejs.org/en/download/current), version >= 18 
- [pnpm](https://pnpm.io/installation)
- Either [Docker Compose](https://docs.docker.com/compose/install/) or a [PostgreSQL database](https://www.postgresql.org/download/)

### Clone the repository 
```
git clone https://github.com/MuNuChapterHKN/HKrecruitment.git
```

### Install dependencies 

From the root folder run:

```
pnpm install
```

### Setup environment
#### Database
Place this [.env file](https://drive.google.com/file/d/1_TbKfKMlw9Rpy6H8AFWDVxRYtMCgsiy6/view?usp=drive_link) in the `/api` folder. It contains environmental variables used to connect to the database and for external services.

#### Auth0
Place this [.env file](https://drive.google.com/file/d/1o_HY3KvsCyTsTvY_BcIeymQy5TO6w8Ts/view?usp=drive_link) in the `/frontend` folder. It contains environmental variables used to interact with Auth0.

### Run the project

Execute the following commands from the root folder.

#### Backend
```Shell
docker compose up # Spins up a PostgreSQL database

pnpm dev:api # Starts the backend server
``` 
#### Frontend
```Shell
pnpm dev:web # Runs the frontend
```

## Project structure

This repository follows the structure:

- **api** - API endpoints, back-end logic, and data storage
- **frontend** - React Application UI
- **shared** - Models, interfaces, and validation logic common to frontend and backend

## Contributors

- **Riccardo Zaccone** - _API server_ - [HKN Polito](https://hknpolito.org/)
- **Arianna Ravera** - _API server_ - [HKN Polito](https://hknpolito.org/)
- **Vincenzo Pellegrini** - _API server_ - [HKN Polito](https://hknpolito.org/)
- **Alberto Baroso** - _API server_ - [HKN Polito](https://hknpolito.org/)
- **Marco De Luca** - _API server_ - [HKN Polito](https://hknpolito.org/)
- **Matteo Mugnai** - _API server_ - [HKN Polito](https://hknpolito.org/)
- **Pasquale Bianco** - _API server_ - [HKN Polito](https://hknpolito.org/)

- **Marco Pappalardo** - _React application_ - [HKN Polito](https://hknpolito.org/)
- **Damiano Bonaccorsi** - _React application_ - [HKN Polito](https://hknpolito.org/)
- **Isabella Lombardi** - _React application_ - [HKN Polito](https://hknpolito.org/)
- **Filippo Goffredo** - _React application_ - [HKN Polito](https://hknpolito.org/)

- **Alessio Menichinelli** - _DevOps_ - [HKN Polito](https://hknpolito.org/)

## License

HKRecruitment is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. See the [COPYING](COPYING) file for details.
