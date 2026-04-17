import requests
import time

url = "http://127.0.0.1:8000/api/internships/list"
print(f"Fetching {url}...")
try:
    start = time.time()
    response = requests.get(url, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}")
    print(f"Time taken: {time.time() - start:.2f}s")
    if response.status_code == 200:
        data = response.json()
        print(f"Total registrations: {len(data)}")
        for reg in data[:5]:
            print(f"- {reg.get('name')} | {reg.get('registration_id', 'NO ID')} | {reg.get('internshipTrack')}")
except Exception as e:
    print(f"Error: {e}")
