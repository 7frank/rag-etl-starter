import { tags } from "typia";

export interface SearchKnowledgeParams {
  query: string & tags.MinLength<1> & tags.MaxLength<200>;
  limit?: number & tags.Type<"uint32"> & tags.Minimum<1> & tags.Maximum<50>;
}

export interface GetPageParams {
  identifier: string & tags.MinLength<1>;
  type?: "id" | "title";
}

export interface SearchByTopicParams {
  topic: string & tags.MinLength<1> & tags.MaxLength<100>;
  limit?: number & tags.Type<"uint32"> & tags.Minimum<1> & tags.Maximum<50>;
}

export interface GetRelatedParams {
  pageId: string & tags.MinLength<1>;
  limit?: number & tags.Type<"uint32"> & tags.Minimum<1> & tags.Maximum<20>;
}

export interface WikipediaPage {
  page_id: string;
  title: string;
  summary: string;
  url: string;
  topic: string;
  word_count: number;
  extracted_at: string;
}

export interface SearchResult {
  pages: WikipediaPage[];
  total: number;
  query: string;
}