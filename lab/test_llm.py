import asyncio
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

API_KEY = "tpsg-zpUyLWgjmOLYw2H66cevLmSv9aoCJqE"
BASE_URL = "https://api.metisai.ir/openai/v1"
MODEL = "gpt-4o-mini"

async def test():
    print(f"Connecting to {BASE_URL} ...")
    llm = ChatOpenAI(
        model=MODEL,
        api_key=API_KEY,
        base_url=BASE_URL,
        temperature=0,
    )
    try:
        response = await llm.ainvoke([HumanMessage(content="Say hello in two word.")])
        print(f"SUCCESS: {response.content}")
    except Exception as e:
        print(f"FAILED: {type(e).__name__}: {e}")

asyncio.run(test())
