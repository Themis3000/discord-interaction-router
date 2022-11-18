import {Client, GatewayIntentBits, Partials} from "discord.js";
import registerReadyListener from './listeners/ready';
import registerMessageListener from './listeners/messageCreate';
import registerInteractionListener from './listeners/interactionCreate';
import registerRoutes from "./registerRoutes";
import {redisInteractionRouter} from "./routers";

const token = process.env.TOKEN;

const bot = new Client({
  partials: [Partials.Channel],
  intents: [
    GatewayIntentBits.DirectMessages
  ]
})

void async function main() {
  await redisInteractionRouter.startRedis();
  await registerRoutes();
  registerReadyListener(bot);
  registerInteractionListener(bot);
  registerMessageListener(bot);
  await bot.login(token);
}();
