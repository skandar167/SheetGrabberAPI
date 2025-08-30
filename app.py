import streamlit as st
import pandas as pd
import requests
import time
import os
from io import BytesIO

# Configure page - MUST be first Streamlit command
st.set_page_config(page_title="Excel Address Processor",
                   page_icon="📍",
                   layout="wide")

# LocationIQ API configuration
LOCATIONIQ_API_KEY = "pk.f7c2de6505f7ae1d0e56b1a340f1359e"
LOCATIONIQ_BASE_URL = "https://us1.locationiq.com/v1/reverse.php"


def reverse_geocode(lat, lng, api_key):
    """
    Reverse geocode coordinates to get address information including commune
    """
    try:
        params = {
            'key': api_key,
            'lat': lat,
            'lon': lng,
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
