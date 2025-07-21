export interface IncidentData {
  id: number;
  type: 'incident' | 'event';
  title: string;
  latitude?: number;
  longitude?: number;
  date: string;
  killedOrWounded?: number;
  description: string;
  chronoId: number;
  weekYear: string;
  imageUrl?: string;
  imageCaption?: string;
  videoUrl?: string;
  videoCaption?: string;
}
