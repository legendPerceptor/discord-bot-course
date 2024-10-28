FROM node:20

WORKDIR /usr/src/app/discord-bot

# Copy the production environment
COPY .prod.env ./.env
COPY tsconfig.json package.json yarn.lock ./

RUN yarn install

COPY src ./src
RUN yarn build

# register the GUILD commands
RUN npm run register-guild-commands

CMD ["npm", "start"]