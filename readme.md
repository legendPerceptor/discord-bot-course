# Discord Bot Building

In this repo, we walk though the process of building a Discord Bot.

## Get Started

First of all, we want to configure the workspace with all the code formatting, prettier, typescript config, etc.

```bash
yarn add -D prettier eslint typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

> If you opened this repo, since there is a package.json file, you can install all the dependencies with `yarn install`.

`.nvmrc` is a Node.js version control configuration that is used by NVM. You can use `nvm use` to select the node version configured in this project.

## Recommended VSCode Extensions for Development

1. Error Lens (shows the ESLint errors inline instead of just a red underline).
2. ESLint (for finding Javascript/Typescript problems).
3. indent-rainbow (for more colorful and obvious indentation in code).
4. Prettier (to format the code with customizable options).
5. Material Theme Icons (The files will have a small icon next to it in the side bar).

## Deploy the app with docker

We can directly use the docker compose file to ease the control:

```bash
# start the container (build it if not exist)
docker compose up -d

# stop the container and kill the app
docker compose down
```

If ignoring the docker compose file, we can directly work with Dockerfile.

1. Build the Dockerfile into a docker image

```bash
docker build -t skillshare-discord-bot .
```

2. Run the docker container

```bash
docker run -d --name discord-bot-container skillshare-discord-bot
```

3. If there are problems, we can log into the container and see what problems are there.

```bash
docker exec -it discord-bot-container /bin/bash
```

If the container is not running at all, run the container from the image in interactive mode.
This will create another container with a random name.

```bash
docker run -it skillshare-discord-bot /bin/bash
```
