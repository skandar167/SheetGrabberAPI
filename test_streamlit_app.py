import pytest
import pandas as pd
from unittest.mock import Mock, patch, MagicMock
from streamlit_app import reverse_geocode, detect_coordinate_columns, process_excel_file


class TestReverseGeocode:
    """Tests for the reverse_geocode function"""

    def test_reverse_geocode_success(self, mocker):
        """Test successful reverse geocoding"""
        # Mock the requests.get response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'address': {
                'municipality': 'TestCity',
                'country': 'TestCountry',
                'state': 'TestState',
                'city': 'TestCity',
                'postcode': '12345',
                'town': 'TestTown',
                'district': 'TestDistrict',
                'suburb': 'TestSuburb'
            },
            'display_name': 'Test Address, TestCity, TestCountry'
        }
        mocker.patch('requests.get', return_value=mock_response)

        result = reverse_geocode(36.7372, 3.0865, 'test_api_key')

        assert result['commune'] == 'TestCity'
        assert result['full_address'] == 'Test Address, TestCity, TestCountry'
        assert result['country'] == 'TestCountry'
        assert result['state'] == 'TestState'
        assert result['status'] == 'success'

    def test_reverse_geocode_commune_fallback(self, mocker):
        """Test commune field fallback logic"""
        # Test with only 'town' field available
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'address': {
                'town': 'TestTown',
                'country': 'TestCountry'
            },
            'display_name': 'Test Address'
        }
        mocker.patch('requests.get', return_value=mock_response)

        result = reverse_geocode(36.7372, 3.0865, 'test_api_key')
        assert result['commune'] == 'TestTown'

    def test_reverse_geocode_api_error(self, mocker):
        """Test handling of API error responses"""
        mock_response = Mock()
        mock_response.status_code = 404
        mocker.patch('requests.get', return_value=mock_response)

        result = reverse_geocode(36.7372, 3.0865, 'test_api_key')

        assert result['commune'] == 'API Error'
        assert 'Error: 404' in result['full_address']
        assert result['status'] == 'error'

    def test_reverse_geocode_exception(self, mocker):
        """Test handling of exceptions during geocoding"""
        mocker.patch('requests.get', side_effect=Exception('Network error'))

        result = reverse_geocode(36.7372, 3.0865, 'test_api_key')

        assert result['commune'] == 'Error'
        assert 'Network error' in result['full_address']
        assert result['status'] == 'error'

    def test_reverse_geocode_missing_address_fields(self, mocker):
        """Test handling when address fields are missing"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'address': {},
            'display_name': 'Incomplete Address'
        }
        mocker.patch('requests.get', return_value=mock_response)

        result = reverse_geocode(36.7372, 3.0865, 'test_api_key')

        assert result['commune'] == 'Unknown'
        assert result['country'] == ''
        assert result['status'] == 'success'


class TestDetectCoordinateColumns:
    """Tests for the detect_coordinate_columns function"""

    def test_detect_standard_lat_lng(self):
        """Test detection of standard latitude/longitude columns"""
        df = pd.DataFrame({
            'latitude': [36.7372, 36.7373],
            'longitude': [3.0865, 3.0866],
            'name': ['Place1', 'Place2']
        })

        lat_candidates, lng_candidates = detect_coordinate_columns(df)

        assert 'latitude' in lat_candidates
        assert 'longitude' in lng_candidates

    def test_detect_abbreviated_columns(self):
        """Test detection of abbreviated coordinate columns"""
        df = pd.DataFrame({
            'lat': [36.7372, 36.7373],
            'lng': [3.0865, 3.0866],
            'name': ['Place1', 'Place2']
        })

        lat_candidates, lng_candidates = detect_coordinate_columns(df)

        assert 'lat' in lat_candidates
        assert 'lng' in lng_candidates

    def test_detect_long_form_columns(self):
        """Test detection of long-form coordinate columns"""
        df = pd.DataFrame({
            'Latitude_Coordinate': [36.7372, 36.7373],
            'Longitude_Coordinate': [3.0865, 3.0866],
            'name': ['Place1', 'Place2']
        })

        lat_candidates, lng_candidates = detect_coordinate_columns(df)

        assert 'Latitude_Coordinate' in lat_candidates
        assert 'Longitude_Coordinate' in lng_candidates

    def test_detect_x_y_columns(self):
        """Test detection of x/y coordinate columns"""
        df = pd.DataFrame({
            'y': [36.7372, 36.7373],
            'x': [3.0865, 3.0866],
            'name': ['Place1', 'Place2']
        })

        lat_candidates, lng_candidates = detect_coordinate_columns(df)

        assert 'y' in lat_candidates
        assert 'x' in lng_candidates

    def test_detect_lon_variations(self):
        """Test detection of 'lon' and 'long' variations"""
        df = pd.DataFrame({
            'lat': [36.7372],
            'lon': [3.0865]
        })

        lat_candidates, lng_candidates = detect_coordinate_columns(df)
        assert 'lon' in lng_candidates

        df2 = pd.DataFrame({
            'lat': [36.7372],
            'long': [3.0865]
        })

        lat_candidates2, lng_candidates2 = detect_coordinate_columns(df2)
        assert 'long' in lng_candidates2

    def test_no_coordinate_columns(self):
        """Test when no coordinate columns are present"""
        df = pd.DataFrame({
            'name': ['Place1', 'Place2'],
            'value': [100, 200]
        })

        lat_candidates, lng_candidates = detect_coordinate_columns(df)

        assert len(lat_candidates) == 0
        assert len(lng_candidates) == 0


class TestProcessExcelFile:
    """Tests for the process_excel_file function"""

    def test_process_valid_coordinates(self, mocker):
        """Test processing file with valid coordinates"""
        df = pd.DataFrame({
            'lat': ['36.7372', '36.7373'],
            'lng': ['3.0865', '3.0866'],
            'name': ['Place1', 'Place2']
        })

        # Mock the progress bar and status text
        mock_progress_bar = Mock()
        mock_status_text = Mock()

        # Mock the reverse_geocode function
        mock_geocode_result = {
            'commune': 'TestCity',
            'full_address': 'Test Address',
            'country': 'TestCountry',
            'state': 'TestState',
            'city': 'TestCity',
            'postcode': '12345',
            'municipality': 'TestMunicipality',
            'town': 'TestTown',
            'district': 'TestDistrict',
            'suburb': 'TestSuburb',
            'status': 'success'
        }
        mocker.patch('streamlit_app.reverse_geocode', return_value=mock_geocode_result)
        mocker.patch('time.sleep')  # Skip the sleep delay

        processed_df, successful, failed = process_excel_file(
            df, 'lat', 'lng', mock_progress_bar, mock_status_text
        )

        assert successful == 2
        assert failed == 0
        assert 'commune' in processed_df.columns
        assert processed_df.at[0, 'commune'] == 'TestCity'
        assert processed_df.at[1, 'commune'] == 'TestCity'

    def test_process_invalid_coordinates(self, mocker):
        """Test processing file with invalid coordinates"""
        df = pd.DataFrame({
            'lat': ['invalid', '0', 'nan'],
            'lng': ['3.0865', '0', '3.0866'],
            'name': ['Place1', 'Place2', 'Place3']
        })

        mock_progress_bar = Mock()
        mock_status_text = Mock()
        mocker.patch('time.sleep')

        processed_df, successful, failed = process_excel_file(
            df, 'lat', 'lng', mock_progress_bar, mock_status_text
        )

        assert successful == 0
        assert failed == 3
        assert processed_df.at[0, 'commune'] in ['Invalid Coordinates', 'Processing Error']

    def test_process_mixed_coordinates(self, mocker):
        """Test processing file with mix of valid and invalid coordinates"""
        df = pd.DataFrame({
            'lat': ['36.7372', 'invalid', '36.7374'],
            'lng': ['3.0865', '3.0866', '3.0867'],
            'name': ['Place1', 'Place2', 'Place3']
        })

        mock_progress_bar = Mock()
        mock_status_text = Mock()

        mock_geocode_result = {
            'commune': 'TestCity',
            'full_address': 'Test Address',
            'country': 'TestCountry',
            'state': 'TestState',
            'city': 'TestCity',
            'postcode': '12345',
            'municipality': 'TestMunicipality',
            'town': 'TestTown',
            'district': 'TestDistrict',
            'suburb': 'TestSuburb',
            'status': 'success'
        }
        mocker.patch('streamlit_app.reverse_geocode', return_value=mock_geocode_result)
        mocker.patch('time.sleep')

        processed_df, successful, failed = process_excel_file(
            df, 'lat', 'lng', mock_progress_bar, mock_status_text
        )

        assert successful == 2
        assert failed == 1
        assert processed_df.at[0, 'commune'] == 'TestCity'
        assert processed_df.at[1, 'commune'] in ['Invalid Coordinates', 'Processing Error']

    def test_process_empty_coordinates(self, mocker):
        """Test processing file with empty coordinate values"""
        df = pd.DataFrame({
            'lat': ['', '36.7372'],
            'lng': ['3.0865', ''],
            'name': ['Place1', 'Place2']
        })

        mock_progress_bar = Mock()
        mock_status_text = Mock()
        mocker.patch('time.sleep')

        processed_df, successful, failed = process_excel_file(
            df, 'lat', 'lng', mock_progress_bar, mock_status_text
        )

        assert successful == 0
        assert failed == 2
        assert processed_df.at[0, 'geocoding_status'] == 'skipped'

    def test_process_adds_all_columns(self, mocker):
        """Test that processing adds all expected columns"""
        df = pd.DataFrame({
            'lat': ['36.7372'],
            'lng': ['3.0865']
        })

        mock_progress_bar = Mock()
        mock_status_text = Mock()

        mock_geocode_result = {
            'commune': 'TestCity',
            'full_address': 'Test Address',
            'country': 'TestCountry',
            'state': 'TestState',
            'city': 'TestCity',
            'postcode': '12345',
            'municipality': 'TestMunicipality',
            'town': 'TestTown',
            'district': 'TestDistrict',
            'suburb': 'TestSuburb',
            'status': 'success'
        }
        mocker.patch('streamlit_app.reverse_geocode', return_value=mock_geocode_result)
        mocker.patch('time.sleep')

        processed_df, successful, failed = process_excel_file(
            df, 'lat', 'lng', mock_progress_bar, mock_status_text
        )

        expected_columns = [
            'commune', 'full_address', 'country', 'state', 'city', 'postcode',
            'municipality', 'town', 'district', 'suburb', 'geocoding_status'
        ]
        for col in expected_columns:
            assert col in processed_df.columns

    def test_process_progress_updates(self, mocker):
        """Test that progress bar and status text are updated"""
        df = pd.DataFrame({
            'lat': ['36.7372', '36.7373'],
            'lng': ['3.0865', '3.0866']
        })

        mock_progress_bar = Mock()
        mock_status_text = Mock()

        mock_geocode_result = {
            'commune': 'TestCity',
            'full_address': 'Test Address',
            'country': 'TestCountry',
            'state': 'TestState',
            'city': 'TestCity',
            'postcode': '12345',
            'municipality': 'TestMunicipality',
            'town': 'TestTown',
            'district': 'TestDistrict',
            'suburb': 'TestSuburb',
            'status': 'success'
        }
        mocker.patch('streamlit_app.reverse_geocode', return_value=mock_geocode_result)
        mocker.patch('time.sleep')

        process_excel_file(df, 'lat', 'lng', mock_progress_bar, mock_status_text)

        # Verify progress bar was called
        assert mock_progress_bar.progress.called
        # Verify status text was updated
        assert mock_status_text.text.called
