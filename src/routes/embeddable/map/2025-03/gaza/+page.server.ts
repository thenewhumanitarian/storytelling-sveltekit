import { parse } from "csv-parse/sync";
import type { PageServerLoad } from "./$types";
import type { IncidentData } from "$lib/components/GazaMap/types";

const sheetUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQYgKblF52DLu-hmfA1xHL94GAJrzQQLQsNTchOv4aIVL1TnFAT8WEAw4DwFox9pCqiuzJhEfn4mp9s/pub?output=csv";

export const load: PageServerLoad = async ({ params }) => {
  const response = await fetch(sheetUrl);
  const csvText = await response.text();

  const records: IncidentData[] = parse(csvText, {
    columns: true,
    trim: true,
    skip_empty_lines: true,
    on_record: (record: Record<string, string>) => {
      const hasMissing = Object.values(record).some((value) => value === "");
      return hasMissing ? undefined : record;
    },
    cast: (value, context) => {
      switch (context.column as keyof IncidentData) {
        case "id":
        case "killedOrWounded":
          return parseInt(value);
        case "latitude":
        case "longitude":
          return parseFloat(value);
        case "title":
        case "date":
        case "description":
        default:
          return value;
      }
    }
  });

  // ✅ Sort by date ascending
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // ✅ Add chronoId (based on sorted index)
  sorted.forEach((incident, index) => {
    (incident as any).chronoId = index;
  });

  return {
    incidentsData: sorted
  };
};
