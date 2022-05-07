import Redis from "ioredis";

export const redis = new Redis();

export const accessPrefix = "access:";

export const confirmPrefix = "confirm:";

export const passwordPrefix = "password:";
