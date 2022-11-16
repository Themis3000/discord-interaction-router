import { Client } from "discord.js";
import { commandRouter } from "../routers";

export default (client: Client): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) {
      return;
    }

    console.log(`Setting Commands`);
    await client.application.commands.set(commandRouter.getCommands());

    console.log(`${client.user.username} is online`);
  });
};
