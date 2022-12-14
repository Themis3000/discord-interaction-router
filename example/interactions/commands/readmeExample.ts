import {Command} from "discord-interaction-router";
import {ApplicationCommandType, Client, CommandInteraction} from "discord.js";
import SignupFlow from "../interactionSteps/readmeExampleFlow";
import {redisInteractionRouter} from "../../routers";

const createAskButtonCommand: Command = {
  commandData: {
    name: "readme_example",
    description: "Runs the readme example",
    type: ApplicationCommandType.ChatInput
  },
  run: async (client: Client, interaction: CommandInteraction) => {
    const route = new SignupFlow();
    await redisInteractionRouter.addRoute(route, {interaction, client});
  }
};

export default createAskButtonCommand;
