import { RedisRouter } from "discord-interaction-router";
import { CommandRouter } from "discord-interaction-router"
import { BasicRouter } from "discord-interaction-router";

// Creates a router for handling the routing of commands
export const commandRouter = new CommandRouter();

// Creates a router for handling static routes
export const staticInteractionRouter = new BasicRouter();

// Creates a router for handling temporary dynamic routes
// This uses a redis server to store routes in order to allow for sharding. By default, attempts to connect to a redis
// server running on localhost. You can specify what url to connect to with a second argument if you wish to change this behavior.
// If you don't want to use redis, you can use ExpiringRouteStore in its place instead.
export const redisInteractionRouter = new RedisRouter("_redis_router_");
