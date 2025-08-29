# Excel Address Processor

## Overview

Excel Address Processor is a Streamlit-based web application designed to perform reverse geocoding operations on coordinate data. The application allows users to upload Excel files containing latitude and longitude coordinates and enriches them with address information, specifically focusing on extracting commune/municipality data using the LocationIQ geocoding service.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Streamlit web framework for rapid prototyping and deployment
- **UI Design**: Wide layout configuration with custom page branding (📍 icon)
- **File Handling**: Built-in file upload capabilities through Streamlit's file uploader component
- **Data Display**: Pandas integration for tabular data presentation and manipulation

### Backend Architecture
- **Core Language**: Python-based application
- **Data Processing**: Pandas DataFrame operations for Excel file manipulation
- **API Integration**: RESTful HTTP requests using the `requests` library
- **Error Handling**: Timeout-based request handling with fallback mechanisms
- **Rate Limiting**: Built-in delay mechanisms to respect API rate limits

### Geocoding Service Integration
- **Provider**: LocationIQ reverse geocoding API
- **Endpoint**: US-based LocationIQ reverse geocoding service
- **Data Extraction**: Multi-field commune detection strategy that checks various administrative level fields (suburb, neighbourhood, quarter, district, town, city, municipality)
- **Fallback Strategy**: Hierarchical field checking with "Unknown" as final fallback

### Configuration Management
- **Environment Variables**: API key management through environment variables with hardcoded fallback
- **API Configuration**: Centralized base URL and timeout configuration
- **Request Parameters**: Structured parameter passing with JSON format response and detailed address components

## External Dependencies

### Third-Party Services
- **LocationIQ API**: Primary geocoding service provider
  - Service: Reverse geocoding (coordinates to address)
  - Rate Limits: Subject to LocationIQ API rate limiting
  - Geographic Coverage: Global coverage with US-specific endpoint

### Python Libraries
- **streamlit**: Web application framework and UI components
- **pandas**: Data manipulation and Excel file processing
- **requests**: HTTP client library for API communication
- **json**: JSON data parsing and manipulation
- **os**: Environment variable access
- **io.BytesIO**: In-memory binary data handling for file operations
- **time**: Rate limiting and delay functionality

### Data Formats
- **Input**: Excel files (.xlsx, .xls) containing latitude/longitude coordinates
- **Output**: Enhanced Excel files with commune/municipality information
- **API Response**: JSON-formatted address data with detailed component breakdown