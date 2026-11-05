import { cache } from "react";

import { makeGetAccountOverview } from "@/composition/container";

export const getAccountOverview = cache((token: string) =>
  makeGetAccountOverview().execute(token),
);
