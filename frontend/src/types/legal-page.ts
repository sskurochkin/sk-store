export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalPageContent = {
  slug: string;
  title: string;
  sections: LegalSection[];
  updatedAt: string;
};
