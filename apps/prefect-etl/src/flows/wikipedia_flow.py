"""
Wikipedia ETL Flow - Extract data from Wikipedia and load into Neo4j
"""

import os
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

from prefect import flow, task, get_run_logger
from prefect.task_runners import ConcurrentTaskRunner
from neo4j import GraphDatabase

# Load environment variables
load_dotenv()

@task(retries=3)
def extract_wikipedia_data(topic: str = "artificial_intelligence") -> Dict[str, Any]:
    """Extract data from Wikipedia API"""
    logger = get_run_logger()
    
    url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + topic
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        logger.info(f"Successfully extracted data for topic: {topic}")
        return {
            "title": data.get("title", ""),
            "extract": data.get("extract", ""),
            "page_id": data.get("pageid", ""),
            "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
            "extracted_at": datetime.now().isoformat(),
            "topic": topic
        }
    except requests.RequestException as e:
        logger.error(f"Failed to extract data for {topic}: {e}")
        raise

@task
def transform_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Transform Wikipedia data for Neo4j storage"""
    logger = get_run_logger()
    
    transformed = {
        "page_id": str(raw_data.get("page_id", "")),
        "title": raw_data.get("title", "").strip(),
        "summary": raw_data.get("extract", "").strip(),
        "url": raw_data.get("url", ""),
        "topic": raw_data.get("topic", ""),
        "extracted_at": raw_data.get("extracted_at", ""),
        "word_count": len(raw_data.get("extract", "").split())
    }
    
    logger.info(f"Transformed data for: {transformed['title']}")
    return transformed

@task
def load_to_neo4j(data: Dict[str, Any]) -> bool:
    """Load transformed data into Neo4j"""
    logger = get_run_logger()
    
    # Neo4j connection details
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "password")
    
    try:
        with GraphDatabase.driver(uri, auth=(user, password)) as driver:
            with driver.session() as session:
                # Create or update Wikipedia page node
                cypher = """
                MERGE (p:WikipediaPage {page_id: $page_id})
                SET p.title = $title,
                    p.summary = $summary,
                    p.url = $url,
                    p.topic = $topic,
                    p.extracted_at = $extracted_at,
                    p.word_count = $word_count,
                    p.updated_at = datetime()
                RETURN p.title as title
                """
                
                result = session.run(cypher, **data)
                record = result.single()
                
                if record:
                    logger.info(f"Successfully loaded page: {record['title']}")
                    return True
                else:
                    logger.warning("No record returned from Neo4j")
                    return False
                    
    except Exception as e:
        logger.error(f"Failed to load data to Neo4j: {e}")
        raise

@flow(
    name="Wikipedia ETL Flow",
    task_runner=ConcurrentTaskRunner(),
    description="Extract Wikipedia data and load into Neo4j"
)
def wikipedia_etl_flow(topics: Optional[List[str]] = None) -> None:
    """Main ETL flow for Wikipedia data"""
    logger = get_run_logger()
    
    if topics is None:
        topics = ["artificial_intelligence", "machine_learning", "data_science"]
    
    logger.info(f"Starting Wikipedia ETL flow for topics: {topics}")
    
    for topic in topics:
        # Extract data
        raw_data = extract_wikipedia_data(topic)
        
        # Transform data
        transformed_data = transform_data(raw_data)
        
        # Load to Neo4j
        load_to_neo4j(transformed_data)
    
    logger.info("Wikipedia ETL flow completed successfully")

if __name__ == "__main__":
    # Run the flow
    wikipedia_etl_flow()