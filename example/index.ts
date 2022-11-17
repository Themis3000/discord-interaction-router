import { Client, Intents } from "discord.js";
import registerReadyListener from './listeners/ready';
import registerMessageListener from './listeners/messageCreate';
import registerInteractionListener from './listeners/interactionCreate';
import registerRoutes from "./registerRoutes";
import { redisInteractionRouter } from "./routers";

const token = process.env.TOKEN;

const bot = new Client({
  partials: ["CHANNEL"],
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES
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
