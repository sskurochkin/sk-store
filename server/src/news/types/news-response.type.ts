export type NewsResponse = {
  id: string;
  title: string;
  alias: string;
  description: string;
  mainPhoto: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};
