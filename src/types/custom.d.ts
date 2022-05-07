import { AccessTokenData } from "./resolver";

declare global {
  namespace Express {
    interface Request {
      access?: AccessTokenData;
    }
  }
}
