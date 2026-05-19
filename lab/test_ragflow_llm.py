from openai import OpenAI

client = OpenAI(
    api_key="aa-kgZu1t4RIHKh5MU7kEi8r8Q4ESkRmJHBQe5FxNsauHJf81Dr",
    base_url="https://api.avalai.ir/v1",
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello, are you working?"}],
)

print(response.choices[0].message.content)
