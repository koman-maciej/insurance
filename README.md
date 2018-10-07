# Insurance

## Prerequisites

- [git](http://git-scm.com/downloads) - for version control
- [nodejs](https://nodejs.org/en/download/) - runtime for JavaScript (at least v8.12.0)
- [npm](https://docs.npmjs.com/cli/install) - dependency management (at least 6.4.1)

## Get started

- Choose your favourite text editor for develop
- Install dependencies via `npm install`
- Run each microservice by typing e.g.:

```bash
nodejs authorizeService
nodejs userService
nodejs policyService
```

- Make sure you have available following ports: `9998`, `8001` and `8002`

## Use it

### OAuth2.0 JWT Secrets

- client_id (only password grant): `amaris`
- client_secret: `amarissecret`
- username: _user email_
- password (for every user): `qwerty`

### Documentation

- Swagger documentation of the services:
  - Authorize service: http://localhost:9998/api-docs/
  - User service: http://localhost:8001/api-docs/
  - Policy service: http://localhost:8002/api-docs/
  
### Flow

- Example flow (curl):
  - Get access_token for futher use:
  
  ```bash
  curl -X POST \
    http://localhost:9998/oauth/token \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -d 'grant_type=password&username=whitleyblankenship%40quotezart.com&password=qwerty&client_id=amaris&client_secret=amarissecret'
  ```

  - If everything's fine, the service should respond something like that:
  ```json
  {
      "token_type": "bearer",
      "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbWFyaXMiLCJ1c2VybmFtZSI6IjAxNzg5MTRjLTU0OGItNGE0Yy1iOTE4LTQ3ZDZhMzkxNTMwYyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUzODkxMDc2MSwiaWF0IjoxNTM4OTA3MTYwfQ.vZMI-gJy0-j0m_Ct4jiL16qd7LJPtGgLnwcFV-96O54",
      "expires_in": 3600
  }
  ```
  - Please, do remember the access_token has 1h lifetime before expiration
  - Now you can access to the users and policies resource e.g.:
    - Get user by user id
    ```bash
    curl -X GET \
      http://localhost:8001/rest/users/e8fd159b-57c4-4d36-9bd7-a59ca13057bb \
      -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbWFyaXMiLCJ1c2VybmFtZSI6IjAxNzg5MTRjLTU0OGItNGE0Yy1iOTE4LTQ3ZDZhMzkxNTMwYyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUzODkxMDc2MSwiaWF0IjoxNTM4OTA3MTYwfQ.vZMI-gJy0-j0m_Ct4jiL16qd7LJPtGgLnwcFV-96O54'
    ```
    - Get user by name
    ```bash
    curl -X GET \
      'http://localhost:8001/rest/users?name=Manning' \
      -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbWFyaXMiLCJ1c2VybmFtZSI6IjAxNzg5MTRjLTU0OGItNGE0Yy1iOTE4LTQ3ZDZhMzkxNTMwYyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUzODkxMDc2MSwiaWF0IjoxNTM4OTA3MTYwfQ.vZMI-gJy0-j0m_Ct4jiL16qd7LJPtGgLnwcFV-96O54'
    ```
    - Get policies by user name
    ```bash
    curl -X GET \
      'http://localhost:8002/rest/policies?userName=Britney' \
      -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbWFyaXMiLCJ1c2VybmFtZSI6IjAxNzg5MTRjLTU0OGItNGE0Yy1iOTE4LTQ3ZDZhMzkxNTMwYyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUzODkxMDc2MSwiaWF0IjoxNTM4OTA3MTYwfQ.vZMI-gJy0-j0m_Ct4jiL16qd7LJPtGgLnwcFV-96O54'
    ```
    - Get user by policy id
    ```bash
    curl -X GET \
      http://localhost:8002/rest/policies/facd2c78-65f0-4a49-8a66-560109d263bc/user \
      -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbWFyaXMiLCJ1c2VybmFtZSI6IjAxNzg5MTRjLTU0OGItNGE0Yy1iOTE4LTQ3ZDZhMzkxNTMwYyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUzODkxMDc2MSwiaWF0IjoxNTM4OTA3MTYwfQ.vZMI-gJy0-j0m_Ct4jiL16qd7LJPtGgLnwcFV-96O54'
    ```

## Assumptions

- Id's are unique
- The user name field is unique
- Datasource API does not change (contract)

## TODO

- Unit tests
- Integration tests