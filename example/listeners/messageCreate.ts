import { Client, Message } from "discord.js";
import { redisInteractionRouter, staticInteractionRouter } from "../routers";

export default (client: Client): void => {
  client.on("messageCreate", async (msg: Message<boolean>) => {
    // Tries routing dms to the redis interaction router and the static interaction router
    if (msg.channel.isDMBased() && !msg.author.bot) {
      const usedRedisInteraction = await redisInteractionRouter.useMsgRoute(client, msg);
      if (usedRedisInteraction)
        return;

      const usedStaticInteraction = await staticInteractionRouter.useMsgRoute(client, msg);
      if (usedStaticInteraction)
        return;
    }
  });
};
