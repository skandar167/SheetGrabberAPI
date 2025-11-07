# SheetGrabberAPI

A Streamlit application that processes Excel files with latitude and longitude coordinates to retrieve address information using the LocationIQ reverse geocoding API.

## Features

- Upload Excel files (.xlsx or .xls) with coordinate data
- Automatic detection of latitude/longitude columns
- Reverse geocoding using LocationIQ API to get commune and address details
- Batch processing with progress tracking
- Export processed data with selectable columns
- Phone number formatting for Algerian numbers

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Streamlit application:
```bash
streamlit run streamlit_app.py
```

## Testing

The project includes a comprehensive test suite covering the main functions.

### Running Tests

1. Install development dependencies:
```bash
pip install -r requirements-dev.txt
```

2. Run the tests:
```bash
pytest test_streamlit_app.py -v
```

### Test Coverage

The test suite includes:

- **reverse_geocode tests**: Tests for successful geocoding, API errors, exceptions, and fallback logic
- **detect_coordinate_columns tests**: Tests for automatic detection of latitude/longitude columns with various naming conventions
- **process_excel_file tests**: Tests for processing valid/invalid coordinates, progress updates, and column additions

Total: 17 test cases covering all main functions

## Usage

1. Upload an Excel file containing latitude and longitude coordinates
2. The app will automatically detect coordinate columns (or you can select them manually)
3. Click "Process Data with LocationIQ" to start the geocoding process
4. Review the results and select columns to export
5. Download the processed file with address information

## API Configuration

The application uses LocationIQ API for reverse geocoding. The API key is configured in the code. For production use, consider using environment variables to manage API keys securely.

## License

This project is open source and available for use and modification.
