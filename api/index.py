from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

# Fallback to the user's key if not set in environment
LOCATIONIQ_API_KEY = os.environ.get("LOCATIONIQ_API_KEY", "pk.f7c2de6505f7ae1d0e56b1a340f1359e")
LOCATIONIQ_BASE_URL = "https://us1.locationiq.com/v1/reverse.php"

class GeocodeRequest(BaseModel):
    lat: float
    lng: float

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/geocode")
def geocode(req: GeocodeRequest):
    try:
        params = {
            'key': LOCATIONIQ_API_KEY,
            'lat': req.lat,
            'lon': req.lng,
            'format': 'json',
            'addressdetails': 1
        }
        
        response = requests.get(LOCATIONIQ_BASE_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            address = data.get('address', {})
            
            # Extract commune information - prioritize most appropriate fields
            commune = (address.get('municipality') or address.get('town')
                       or address.get('city') or address.get('district')
                       or 'Unknown')
            
            return {
                'commune': commune,
                'full_address': data.get('display_name', 'Unknown Address'),
                'country': address.get('country', ''),
                'state': address.get('state', ''),
                'city': address.get('city', ''),
                'postcode': address.get('postcode', ''),
                'municipality': address.get('municipality', ''),
                'town': address.get('town', ''),
                'district': address.get('district', ''),
                'suburb': address.get('suburb', ''),
                'status': 'success'
            }
        else:
            return {
                'commune': 'API Error',
                'full_address': f'Error: {response.status_code}',
                'country': '',
                'state': '',
                'city': '',
                'postcode': '',
                'municipality': '',
                'town': '',
                'district': '',
                'suburb': '',
                'status': 'error'
            }
            
    except Exception as e:
        return {
            'commune': 'Error',
            'full_address': f'Error: {str(e)}',
            'country': '',
            'state': '',
            'city': '',
            'postcode': '',
            'municipality': '',
            'town': '',
            'district': '',
            'suburb': '',
            'status': 'error'
        }
