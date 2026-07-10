export const HOME_ZONE_ROUTES = ["/", "/login", "/register"] as const;

export const APP_ZONE_ROUTES = ["/transactions"] as const;

export type HomeZoneRoute = (typeof HOME_ZONE_ROUTES)[number];
export type AppZoneRoute = (typeof APP_ZONE_ROUTES)[number];
