import httpx
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("erp_backend")

async def append_to_sheet(name: str, number: str):
    url = os.getenv("SHEETDB_URL")
    if not url:
        logger.error("SHEETDB_URL not found in environment variables")
        return False
        
    data = {
        "Name": name,
        "Number": number
    }
    
    logger.info(f"Sending to SheetDB: {data}")
    
    async with httpx.AsyncClient() as client:
        try:
            # SheetDB usually expects a single object for a single row, or a list in "data" key.
            # We'll try the simplest format first.
            response = await client.post(url, json=data)
            if response.status_code not in [200, 201]:
                logger.error(f"SheetDB Error {response.status_code}: {response.text}")
                # Try the "data" wrapper if the first one failed
                wrapped_data = {"data": [data]}
                response = await client.post(url, json=wrapped_data)
                if response.status_code not in [200, 201]:
                    logger.error(f"SheetDB Retry Error {response.status_code}: {response.text}")
                    return False
            
            logger.info(f"Successfully appended data to sheet: {name}")
            return True
        except Exception as e:
            logger.error(f"Error appending data to sheet: {e}")
            return False
