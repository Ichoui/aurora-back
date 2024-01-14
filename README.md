# Aurora Back
## Description

[NESTxFIREBASE](https://reza-rahmati.medium.com/setup-nest-and-firebase-functions-in-a-new-project-631ba1435289)

## Running the app

> Build app then run the firebase function emulator, hot realod included!<br>Can be logged with console.log / Log()<br>
`npm run start`<br>

### Deploy in PRODUCTION
> `npm run deploy:prod`

### Deploy in DEVELOPMENT
> `npm run deploy:dev`

NB : **Deploy Builds** should be done with correct :
- `.env.[dev/prod]` appropriate file
- setting up new `GOOGLE_APPLICATION_CREDENTIALS` sdk env variable for appropriate firebase remote project
- `firebase use [dev/prod]` command with appropriate project (https://firebase.google.com/docs/functions/config-env?gen=2nd&hl=fr#deploying_multiple_sets_of_environment_variables)


NB2 : In dev mode, don't forget to use `npm run conf:dev`, to change firebase remote project and setting up correct `.env` file (especially after a prod deployment / prod test)

NB3 : To try prod env on development mode, use `npm run conf:prod` before to start the project. This way we can try the app in prod mode (front should have build first the app in prod mode + install it on mobile with android studio)

## Warning

Never git files in folder ./environements/*

