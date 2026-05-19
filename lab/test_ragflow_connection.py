import json
import requests

API_KEY = "ragflow-y34pfWPrF_lMXCHRwOAgdtMtD534KE8ietIzMNwRN5o"
BASE_URL = "http://178.105.162.169"

headers = {"Authorization": f"Bearer {API_KEY}"}

# Check server version
r = requests.get(f"{BASE_URL}/api/v1/system/version", headers=headers)
print("Version:", r.status_code, r.text[:200])

# List chat assistants
r = requests.get(f"{BASE_URL}/api/v1/chats", headers=headers)
print("Chats:", r.status_code)
data = r.json()
print(json.dumps(data, indent=2, ensure_ascii=False)[:1000])
