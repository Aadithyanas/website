import httpx
import asyncio

async def test():
    url = "https://sheetdb.io/api/v1/4f1sngp7vdkp3"
    data = {"Name": "Test", "Number": "123"}
    async with httpx.AsyncClient() as client:
        print(f"Testing URL: {url}")
        try:
            r = await client.post(url, json=data)
            print(f"Status: {r.status_code}")
            print(f"Response: {r.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
