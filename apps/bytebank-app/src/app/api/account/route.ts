import { toErrorResponse } from "@/lib/error-response";
import { getAccountOverview } from "@/lib/getAccountOverview";
import { toAccountOverviewDto } from "@/lib/serializers/account";

export async function GET() {
  try {
    const overview = await getAccountOverview();

    if (!overview) {
      return Response.json(
        { error: "Falha ao carregar conta" },
        { status: 502 },
      );
    }

    return Response.json(toAccountOverviewDto(overview), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
