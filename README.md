# Insurance

## Prerequisites

- [git](http://git-scm.com/downloads) - for version control
- [nodejs](https://nodejs.org/en/download/) - runtime for JavaScript (at least v8.12.0)
- [npm](https://docs.npmjs.com/cli/install) - dependency management (at least 6.4.1)

## Get started

- Choose your favourite text editor for develop
- Install dependencies via `npm install`
- Run each microservice by typing e.g.:
```shell
nodejs authorizeService
nodejs userService
nodejs policyService
```
- Make sure you have available following ports: `9998`, `8001` and `8002`

## Run it

TBD

OAUTH
http://localhost:9998/api-docs/

User Service
http://localhost:8001/api-docs/

Policy Service
http://localhost:8002/api-docs/



## Assumptions

- Id's are unique
- The user name field is unique
- Datasource API does not change (contract)

## TODO

- Unit tests
- Integration tests