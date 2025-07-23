import neo4j, { Driver, Session, Result, int } from "neo4j-driver";
import { WikipediaPage } from "./types.js";

export class Neo4jClient {
  private driver: Driver;
  private isConnected: boolean = false;

  constructor(
    uri: string = "bolt://localhost:7687",
    user: string = "neo4j",
    password: string = "password"
  ) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async connect(): Promise<void> {
    try {
      await this.driver.verifyConnectivity();
      this.isConnected = true;
      console.log("Connected to Neo4j database");
    } catch (error) {
      console.error("Failed to connect to Neo4j:", error);
      throw new Error(`Neo4j connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.isConnected = false;
      console.log("Disconnected from Neo4j database");
    }
  }

  private async executeQuery<T>(
    query: string,
    { limit, ...parameters }: Record<string, any> = {}
  ): Promise<Result> {
    if (!this.isConnected) {
      await this.connect();
    }
    if (typeof limit == "number") parameters.limit = int(limit);

    const session: Session = this.driver.session();
    try {
      console.log(parameters);
      return await session.run(query, parameters);
    } finally {
      await session.close();
    }
  }

  async searchKnowledge(
    query: string,
    limit: number = 5
  ): Promise<WikipediaPage[]> {
    const cypher = `
      MATCH (p:WikipediaPage) 
      WHERE p.title CONTAINS $query OR p.summary CONTAINS $query 
      RETURN p.page_id as page_id, p.title as title, p.summary as summary, 
             p.url as url, p.topic as topic, p.word_count as word_count,
             p.extracted_at as extracted_at
      LIMIT $limit
    `;

    const result = await this.executeQuery(cypher, { query, limit });
    return result.records.map((record) => ({
      page_id: record.get("page_id"),
      title: record.get("title"),
      summary: record.get("summary"),
      url: record.get("url"),
      topic: record.get("topic"),
      word_count: record.get("word_count"),
      extracted_at: record.get("extracted_at"),
    }));
  }

  async getPageById(pageId: string): Promise<WikipediaPage | null> {
    const cypher = `
      MATCH (p:WikipediaPage {page_id: $pageId})
      RETURN p.page_id as page_id, p.title as title, p.summary as summary,
             p.url as url, p.topic as topic, p.word_count as word_count,
             p.extracted_at as extracted_at
    `;

    const result = await this.executeQuery(cypher, { pageId });
    const record = result.records[0];

    if (!record) return null;

    return {
      page_id: record.get("page_id"),
      title: record.get("title"),
      summary: record.get("summary"),
      url: record.get("url"),
      topic: record.get("topic"),
      word_count: record.get("word_count"),
      extracted_at: record.get("extracted_at"),
    };
  }

  async getPageByTitle(title: string): Promise<WikipediaPage | null> {
    const cypher = `
      MATCH (p:WikipediaPage)
      WHERE toLower(p.title) = toLower($title)
      RETURN p.page_id as page_id, p.title as title, p.summary as summary,
             p.url as url, p.topic as topic, p.word_count as word_count,
             p.extracted_at as extracted_at
    `;

    const result = await this.executeQuery(cypher, { title });
    const record = result.records[0];

    if (!record) return null;

    return {
      page_id: record.get("page_id"),
      title: record.get("title"),
      summary: record.get("summary"),
      url: record.get("url"),
      topic: record.get("topic"),
      word_count: record.get("word_count"),
      extracted_at: record.get("extracted_at"),
    };
  }

  async searchByTopic(
    topic: string,
    limit: number = 5
  ): Promise<WikipediaPage[]> {
    const cypher = `
      MATCH (p:WikipediaPage)
      WHERE p.topic CONTAINS $topic
      RETURN p.page_id as page_id, p.title as title, p.summary as summary,
             p.url as url, p.topic as topic, p.word_count as word_count,
             p.extracted_at as extracted_at
      LIMIT $limit
    `;

    const result = await this.executeQuery(cypher, { topic, limit });
    return result.records.map((record) => ({
      page_id: record.get("page_id"),
      title: record.get("title"),
      summary: record.get("summary"),
      url: record.get("url"),
      topic: record.get("topic"),
      word_count: record.get("word_count"),
      extracted_at: record.get("extracted_at"),
    }));
  }

  async getStats(): Promise<{ totalPages: number; topics: string[] }> {
    const countCypher = "MATCH (p:WikipediaPage) RETURN count(p) as total";
    const topicsCypher =
      "MATCH (p:WikipediaPage) RETURN DISTINCT p.topic as topic ORDER BY topic";

    const [countResult, topicsResult] = await Promise.all([
      this.executeQuery(countCypher),
      this.executeQuery(topicsCypher),
    ]);

    return {
      totalPages: countResult.records[0]?.get("total") || 0,
      topics: topicsResult.records.map((record) => record.get("topic")),
    };
  }
}
