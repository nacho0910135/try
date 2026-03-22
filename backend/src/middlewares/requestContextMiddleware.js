import { randomUUID } from "node:crypto";

export const attachRequestContext = (req, res, next) => {
  req.requestId = req.headers["x-request-id"] || randomUUID();
  req.startedAt = Date.now();

  res.setHeader("x-request-id", req.requestId);

  next();
};
