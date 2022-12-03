<img src="https://hknpolito.org/wp-content/uploads/2018/05/hkn_logo_blu.png" width="100">

# HKRecruitment - API server
HKRecruitment is the platform used by HKN Polito to handle
the recruitment process. This software implements the server
side of the application, in form of endpoints for the RESTful APIs
described in the documentation.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

This project requires you to have Node JS installed and npm.

### Installing

To set up the project simply give this command on the project root directory:

```
npm install
```

To actually compile the project, because it is written in TypeScript, you will need
to give this command on the project root directory:

```
npm build
```

Finally, to start the program, give this command on the project root directory:

```
npm start
```

## Running the tests

To run the tests, simply run

```
npm test
```

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Build with
* [Typescript](https://www.typescriptlang.org/) - This project is written entirely in Typescript
* [AJV](https://ajv.js.org/) - JSON schema validator used for core entities and requests/responses
* [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript) - To obtain Typescript types from json-schemas
* [googleapis](https://googleapis.github.io/) - Google RESTful APIs used to integrate the system with GSuite services

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **Riccardo Zaccone** - *Initial work* - [HKN Polito](https://hknpolito.org/)
* **Arianna Ravera** - *Initial work* - [HKN Polito](https://hknpolito.org/)

## License
HKRecruitment is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. See the [COPYING](COPYING) file for details.

