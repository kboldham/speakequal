import { NextRequest, NextResponse } from "next/server";

interface CalendlyTime {
  status:         string;
  start_time:     string;
  scheduling_url: string;
}

async function fetchCalendlyMonth(year: number, month: number): Promise<CalendlyTime[]> {
  const token    = process.env.CALENDLY_API_TOKEN;
  const eventUri = process.env.CALENDLY_EVENT_TYPE_URI;
  if (!token || !eventUri) return [];

  const now        = new Date();
  const monthStart = new Date(year, month, 1);
  const monthEnd   = new Date(year, month + 1, 0, 23, 59, 59);
  if (monthEnd < now) return [];

  const start  = new Date(Math.max(monthStart.getTime(), now.getTime()));
  const results: CalendlyTime[] = [];
  const cursor = new Date(start);

  // Calendly max range per request is 7 days — chunk the month
  while (cursor < monthEnd) {
    const chunkEnd = new Date(Math.min(
      cursor.getTime() + 7 * 24 * 60 * 60 * 1000,
      monthEnd.getTime(),
    ));

    const params = new URLSearchParams({
      event_type: eventUri,
      start_time: cursor.toISOString(),
      end_time:   chunkEnd.toISOString(),
    });

    const res = await fetch(
      `https://api.calendly.com/event_type_available_times?${params}`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } },
    );

    if (res.ok) {
      const data = await res.json();
      const available = (data.collection ?? []).filter(
        (t: CalendlyTime) => t.status === "available",
      );
      results.push(...available);
    }

    cursor.setTime(chunkEnd.getTime());
  }

  return results;
}

// GET — returns available times for the given month via Calendly API
// Query params: year (e.g. 2026), month (0-indexed, e.g. 3 = April)
export async function GET(req: NextRequest) {
  const now   = new Date();
  const year  = parseInt(req.nextUrl.searchParams.get("year")  ?? String(now.getFullYear()));
  const month = parseInt(req.nextUrl.searchParams.get("month") ?? String(now.getMonth()));

  const times = await fetchCalendlyMonth(year, month);

  const slots = times.map(t => ({
    id:             t.start_time,
    startTime:      t.start_time,
    endTime:        new Date(new Date(t.start_time).getTime() + 30 * 60 * 1000).toISOString(),
    schedulingUrl:  t.scheduling_url,
  }));

  return NextResponse.json(slots);
}
