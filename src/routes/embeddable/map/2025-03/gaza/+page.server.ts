import { parse } from "csv-parse/sync";
import type { PageServerLoad } from "./$types";
import type { IncidentData } from "$lib/components/GazaMap/types";

// Helper to calculate ISO week number + year
function getISOWeekYearString(date: Date): string {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7
  );
  return `${String(weekNumber).padStart(2, "0")}-${target.getFullYear()}`;
}

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
      const requiredFields = ['id', 'title', 'date', 'latitude', 'longitude', 'killedOrWounded'];

      const hasMissingRequired = requiredFields.some((field) => {
        const value = record[field];

        // Handle numeric values or missing strings
        if (value === undefined || value === null) return true;
        if (typeof value === 'string') return value.trim() === '';
        return false;
      });

      return hasMissingRequired ? undefined : record;
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
        case "videoUrl":
        case "videoCaption":
        default:
          return value;
      }
    }
  });

  // ✅ Sort by date ascending
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // ✅ Add chronoId and weekYear
  sorted.forEach((incident, index) => {
    (incident as any).chronoId = index;
    (incident as any).weekYear = getISOWeekYearString(new Date(incident.date));
  });

  return {
    incidentsData: sorted
  };
};
