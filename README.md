# Fitracker API

Backend for fitracker app using NestJS

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start:dev:db # setup local postresql db instance on docker
$ npm run start:dev # run development server

# production mode
$ npm run start:prod
```

## Test

```bash
# Unit tests - run all tests
$ npm run test

# Unit tests - run specific file
$ npm run test "filename"
# Example:
$ npm run test auth.controller

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migrations

```bash
#create an empty migration file
$ npm run migration:create "migration_name"

#generate a migration file based new/edited entities
$ npm run migration:generate --name="migration name"

# run migration
$ npm run migration:run
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
