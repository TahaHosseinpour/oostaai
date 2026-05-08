import logging
import os

from django.conf import settings
from langchain_community.agent_toolkits import create_sql_agent
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

DB_SCHEMA_DESCRIPTION = """
DuckDB analytical database — Oosta platform (read-only).

TABLES:
  province(id, name)
  city(id, province_id, name)

  gold_seller(id, role, shop_name, company_name, province_id, city_id, is_verified, commission)
    role: 'seller'|'support'|'distribution'  |  is_verified: 0=pending,1=approved,2=rejected

  ostadkar(id, first_name, last_name, age, experience_years, city_id, is_verified, commission, created_at)
  skill(id, name)
  ostadkar_skill(ostadkar_id, skill_id)

  shop_category(id, parent_id, name)           -- tree, parent_id NULL = root
  brand(id, name)
  collection(id, name)
  variety(id, name)
  variety_detail(id, variety_id, name)
  product(id, seller_id, name, code, category_id, collection_id, brand_id, variety_id,
          special, bestseller, featured, active, status, created_at)
    status: 0=pending,1=approved,2=rejected  |  special/bestseller/featured/active: 0|1
  product_variety(id, product_id, variety_detail_id, discount_percent, stock, extra_price,
                  max_order, min_order)
    extra_price in Tomans

  "order"(id, status, pay_type, total_price, city, created_at)
    status: '0'=pending_payment,'1'=paid  |  pay_type: '0'=gateway,'1'=wallet  |  total_price in Tomans
  order_item(id, order_id, product_variety_id, seller_id, quantity, price, status)
  order_shipping(id, order_id, seller_id, shipping_price)

  club_category(id, parent_id, name)
  club(id, name, slug, category_id, province, city, status, created_at)
    status: 'pending'|'approved'|'rejected'|'suspended'
  subscription_level(id, name, level_type, max_gallery_images, max_videos, max_products,
                     can_be_featured, analytics_access, is_active)
    level_type: 'level_1'|'level_2'|'level_3'
  subscription_plan(id, level_id, name, price, duration_days)
  club_subscription(id, club_id, plan_id, start_date, end_date, paid_amount, status, auto_renewal)
    status: 'pending'|'active'|'expired'|'cancelled'

  article_category(id, name)
  article_tag(id, name)
  article(id, title, category_id, author_name, reading_time, views_count, likes_count, created_at)
  article_tag_map(article_id, tag_id)

NOTES:
  - All monetary values are in Tomans
  - Dates are TIMESTAMP
  - The table named "order" must always be quoted: SELECT * FROM "order"
  - is_verified=1 or status='approved' means active/approved records
"""

SQL_AGENT_PREFIX = f"""You are an expert SQL analyst for the Oosta e-commerce and business platform.
You have access to a DuckDB read-only database. Always write correct DuckDB SQL.

{DB_SCHEMA_DESCRIPTION}

Rules:
- Only use SELECT statements — never INSERT, UPDATE, DELETE, DROP
- The table named "order" MUST always be double-quoted in SQL: FROM "order"
- For Persian text comparisons use ILIKE or exact match
- Monetary amounts are in Tomans
- If a query returns no results, say so clearly
"""


def is_available() -> bool:
    path = getattr(settings, "DUCKDB_PATH", "")
    if not path:
        return False
    if not os.path.isfile(path):
        logger.warning("DuckDB file not found at %s — db source will be skipped", path)
        return False
    if not getattr(settings, "RESPONDER_LLM_API_KEY", ""):
        logger.warning("RESPONDER_LLM_API_KEY not set — db source will be skipped")
        return False
    return True


def _get_db() -> SQLDatabase:
    return SQLDatabase.from_uri(
        f"duckdb:///{settings.DUCKDB_PATH}",
        sample_rows_in_table_info=2,
        engine_args={"connect_args": {"read_only": True}},
    )


def _get_sql_llm() -> ChatOpenAI:
    return ChatOpenAI(
        model="gpt-4o-mini",
        openai_api_key=settings.RESPONDER_LLM_API_KEY,
        openai_api_base=settings.RESPONDER_LLM_BASE_URL,
        temperature=0,
    )


async def query_database(question: str) -> str:
    db = _get_db()
    agent = create_sql_agent(
        llm=_get_sql_llm(),
        db=db,
        verbose=False,
        prefix=SQL_AGENT_PREFIX,
        agent_executor_kwargs={"handle_parsing_errors": True},
    )
    result = await agent.ainvoke({"input": question})
    return result.get("output", "")
