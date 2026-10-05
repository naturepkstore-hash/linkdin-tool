import { SEO_365_PLAN } from '@/data/seo365Plan';

export interface SeriesTopic {
  dayNumber: number;
  topic: string;
}

export function isCanonicalSeo365Series(seriesPosts: SeriesTopic[]): boolean {
  if (seriesPosts.length !== SEO_365_PLAN.length) return false;

  const topicsByDay = new Map(seriesPosts.map((post) => [post.dayNumber, post.topic]));
  return SEO_365_PLAN.every((day) => topicsByDay.get(day.dayNumber) === day.topic);
}
