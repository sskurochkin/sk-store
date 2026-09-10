export type LegalSectionResponse = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalPageResponse = {
  slug: string;
  title: string;
  sections: LegalSectionResponse[];
  updatedAt: string;
};
