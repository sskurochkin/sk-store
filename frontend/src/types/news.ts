export type News = {
  id: string;
  title: string;
  alias: string;
  description: string;
  mainPhoto: string;
  content: string;
  tags: string[];
  /** ISO-8601 datetime from the API. */
  createdAt: string;
  /** ISO-8601 datetime from the API. */
  updatedAt: string;
};
