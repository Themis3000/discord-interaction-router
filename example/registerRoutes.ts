import {commandRouter, redisInteractionRouter, staticInteractionRouter} from "./routers";
import askButton from "./interactions/interactions/askButton";
import createAskButtonCommand from "./interactions/commands/createAskButton";
import askFlowCls from "./interactions/interactionSteps/askFlow";


export default async function registerRoutes(): Promise<void> {
  // Add all the routes to your routers
  await staticInteractionRouter.addRoute(askButton);
  // Add commands to your command router
  commandRouter.addCommand(createAskButtonCommand);

  // Register interaction step classes (only needed for redis)
  redisInteractionRouter.addRouteType(askFlowCls);
}
