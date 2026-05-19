from openai import OpenAI

API_KEY = "ragflow-y34pfWPrF_lMXCHRwOAgdtMtD534KE8ietIzMNwRN5o"
BASE_URL = "http://178.105.162.169"
CHAT_ID = "bdc1ec0c538211f197965b999180db67"

client = OpenAI(
    api_key=API_KEY,
    base_url=f"{BASE_URL}/api/v1/openai/{CHAT_ID}",
)

response = client.chat.completions.create(
    model="model",
    messages=[{"role": "user", "content": "What can you help me with?"}],
    stream=False,
)

print("Answer:", response.choices[0].message.content)
