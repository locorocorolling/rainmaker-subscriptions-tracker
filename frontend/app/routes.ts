import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  {
    path: "/subscriptions",
    file: "./routes/subscriptions.tsx",
  },
] satisfies RouteConfig;
