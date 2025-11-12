import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: {
    allowedOrigins: [
      process.env.SITE_URL!,
      "http://localhost:5173",
      "https://story-tellingv2-web.vercel.app",
    ],
  }, });

export default http;
