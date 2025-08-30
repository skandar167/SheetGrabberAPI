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


def detect_coordinate_columns(df):
    """Automatically detect latitude and longitude columns"""
    lat_candidates = []
    lng_candidates = []

    for col in df.columns:
        col_lower = col.lower()
        if any(term in col_lower for term in ['lat', 'latitude', 'y']):
            lat_candidates.append(col)
        if any(term in col_lower
               for term in ['lng', 'lon', 'long', 'longitude', 'x']):
            lng_candidates.append(col)

    return lat_candidates, lng_candidates


def process_excel_file(df, lat_col, lng_col, progress_bar, status_text):
    """Process the Excel file and add commune information"""
    processed_data = df.copy()

    # Add new columns for location data
    new_columns = [
        'commune', 'full_address', 'country', 'state', 'city', 'postcode',
        'municipality', 'town', 'district', 'suburb', 'geocoding_status'
    ]
    for col in new_columns:
        processed_data[col] = ''

    total_rows = len(df)
    successful_geocodes = 0
    failed_geocodes = 0

    for idx, row in df.iterrows():
        try:
            lat_str = str(row[lat_col]).strip()
            lng_str = str(row[lng_col]).strip()

            if not lat_str or not lng_str or lat_str == 'nan' or lng_str == 'nan':
                processed_data.at[idx, 'commune'] = 'Invalid Coordinates'
                processed_data.at[idx, 'geocoding_status'] = 'skipped'
                failed_geocodes += 1
                continue

            lat = float(lat_str)
            lng = float(lng_str)

            if pd.isna(lat) or pd.isna(lng) or lat == 0 or lng == 0:
                processed_data.at[idx, 'commune'] = 'Invalid Coordinates'
                processed_data.at[idx, 'geocoding_status'] = 'skipped'
                failed_geocodes += 1
                continue

            status_text.text(
                f"Processing row {idx + 1} of {total_rows}: Geocoding coordinates..."
            )

            # Call LocationIQ API
            location_info = reverse_geocode(lat, lng, LOCATIONIQ_API_KEY)

            # Update the dataframe
            for key in [
                    'commune', 'full_address', 'country', 'state', 'city',
                    'postcode', 'municipality', 'town', 'district', 'suburb',
                    'status'
            ]:
                if key == 'status':
                    processed_data.at[idx,
                                      'geocoding_status'] = location_info[key]
                else:
                    processed_data.at[idx, key] = location_info[key]

            if location_info['status'] == 'success':
                successful_geocodes += 1
            else:
                failed_geocodes += 1

            # Update progress bar
            progress = (idx + 1) / total_rows
            progress_bar.progress(progress)

            # Rate limiting
            if idx < total_rows - 1:
                time.sleep(1)

        except Exception as e:
            processed_data.at[idx, 'commune'] = 'Processing Error'
            processed_data.at[idx, 'geocoding_status'] = 'error'
            failed_geocodes += 1
            continue

    status_text.text(
        f"Processing complete! {successful_geocodes} successful, {failed_geocodes} failed geocodes."
    )
    return processed_data, successful_geocodes, failed_geocodes


def main():
    st.title("📍 Excel Address Processor with LocationIQ")
    st.markdown(
        "Upload an Excel file with latitude and longitude coordinates to get commune information for each address."
    )

    # Sidebar for settings
    with st.sidebar:
        st.header("⚙️ Settings")
        st.info(f"**API Key:** {LOCATIONIQ_API_KEY[:10]}...")

        st.header("📋 Instructions")
        st.markdown("""
        1. Upload an Excel file (.xlsx or .xls)
        2. Select latitude and longitude columns
        3. Click 'Process Data' to add commune information
        4. Choose columns to export
        5. Download the processed file
        """)

    # File upload
    uploaded_file = st.file_uploader(
        "Choose an Excel file",
        type=['xlsx', 'xls'],
        help=
        "Upload an Excel file containing latitude and longitude coordinates")

    if uploaded_file is not None:
        try:
            # Read the Excel file while preserving original formatting
            with st.spinner("Reading Excel file..."):
                df = pd.read_excel(uploaded_file, dtype=str)

            st.success(
                f"✅ File uploaded successfully! Found {len(df)} rows and {len(df.columns)} columns."
            )

            # Display basic info about the file
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Total Rows", len(df))
            with col2:
                st.metric("Total Columns", len(df.columns))
            with col3:
                st.metric("File Size", f"{uploaded_file.size / 1024:.1f} KB")

            # Auto-detect coordinate columns
            lat_candidates, lng_candidates = detect_coordinate_columns(df)

            # Column selection
            st.header("🎯 Select Coordinate Columns")

            col1, col2 = st.columns(2)

            with col1:
                lat_col = st.selectbox(
                    "Latitude Column",
                    options=df.columns.tolist(),
                    index=df.columns.tolist().index(lat_candidates[0])
                    if lat_candidates else 0,
                    help="Select the column containing latitude values")

            with col2:
                lng_col = st.selectbox(
                    "Longitude Column",
                    options=df.columns.tolist(),
                    index=df.columns.tolist().index(lng_candidates[0])
                    if lng_candidates else 0,
                    help="Select the column containing longitude values")

            # Show preview of selected coordinates
            if lat_col and lng_col:
                st.subheader("📊 Data Preview")
                preview_df = df[[lat_col, lng_col]].head(10)
                st.dataframe(preview_df, width=600)

                # Validate coordinates
                valid_coords = 0
                for _, row in df.iterrows():
                    try:
                        lat_str = str(row[lat_col]).strip()
                        lng_str = str(row[lng_col]).strip()

                        if lat_str and lng_str and lat_str != 'nan' and lng_str != 'nan':
                            lat = float(lat_str)
                            lng = float(lng_str)
                            if not (pd.isna(lat) or pd.isna(lng) or lat == 0
                                    or lng == 0):
                                valid_coords += 1
                    except:
                        continue

                if valid_coords > 0:
                    st.info(
                        f"Found {valid_coords} valid coordinate pairs out of {len(df)} total rows."
                    )

                    # Process button
                    if st.button("🚀 Process Data with LocationIQ",
                                 type="primary"):
                        # Processing section
                        st.header("⏳ Processing Data")

                        progress_bar = st.progress(0)
                        status_text = st.empty()

                        # Process the file
                        processed_df, successful, failed = process_excel_file(
                            df, lat_col, lng_col, progress_bar, status_text)

                        # Show results
                        st.header("✅ Processing Results")

                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Successful Geocodes", successful)
                        with col2:
                            st.metric("Failed Geocodes", failed)
                        with col3:
                            success_rate = (successful /
                                            (successful + failed)) * 100 if (
                                                successful + failed) > 0 else 0
                            st.metric("Success Rate", f"{success_rate:.1f}%")

                        # Store processed data in session state
                        st.session_state.processed_df = processed_df
                        st.session_state.original_columns = df.columns.tolist()

                        # Show processed data preview
                        st.subheader("📋 Processed Data Preview")
                        new_columns = [
                            'commune', 'municipality', 'town', 'district',
                            'suburb', 'full_address', 'country', 'state',
                            'city', 'postcode', 'geocoding_status'
                        ]
                        preview_columns = [lat_col, lng_col] + [
                            col for col in new_columns
                            if col in processed_df.columns
                        ]

                        st.dataframe(processed_df[preview_columns].head(10),
                                     width=600)
                else:
                    st.warning(
                        "⚠️ No valid coordinates found. Please check your column selection."
                    )

        except Exception as e:
            st.error(f"❌ Error reading the Excel file: {str(e)}")
            st.info(
                "Please make sure the file is a valid Excel file (.xlsx or .xls)"
            )

    # Export section
    if 'processed_df' in st.session_state:
        st.header("📥 Export Options")

        processed_df = st.session_state.processed_df
        original_columns = st.session_state.original_columns

        # Column selection for export
        st.subheader("Select Columns to Export")

        new_location_columns = [
            'commune', 'municipality', 'town', 'district', 'suburb',
            'full_address', 'country', 'state', 'city', 'postcode',
            'geocoding_status'
        ]
        available_new_columns = [
            col for col in new_location_columns if col in processed_df.columns
        ]

        col1, col2 = st.columns(2)

        with col1:
            st.write("**Original Columns:**")
            selected_original = st.multiselect("Choose original columns",
                                               options=original_columns,
                                               default=original_columns,
                                               key="original_cols")

        with col2:
            st.write("**New Location Columns:**")
            selected_new = st.multiselect("Choose location columns",
                                          options=available_new_columns,
                                          default=available_new_columns,
                                          key="new_cols")

        # Combine selected columns
        export_columns = selected_original + selected_new
        export_columns = [
            col for col in export_columns if col in processed_df.columns
        ]

        if export_columns:
            # Show export preview
            st.subheader("📊 Export Preview")
            export_df = processed_df[export_columns]
            st.dataframe(export_df.head(10), width=600)

            # Download button
            col1, col2, col3 = st.columns([1, 2, 1])
            with col2:
                # Create Excel file with preserved formatting
                output = BytesIO()

                # Data is already preserved as strings from file reading
                export_df_text = export_df.copy()

                # Add country code prefix for phone columns
                for col in export_df_text.columns:
                    col_lower = col.lower()
                    is_phone_col = any(term in col_lower for term in [
                        'tél', 'tel', 'phone', 'portable', 'mobile',
                        'telephone'
                    ])

                    if is_phone_col:
                        export_df_text[col] = export_df_text[col].astype(
                            str).apply(lambda x: f"+213{x[1:]}" if (
                                str(x).startswith('0') and len(str(x)) >= 9 and
                                str(x).replace('.', '').isdigit()) else str(x))

                # Create Excel file
                export_df_text.to_excel(output,
                                        index=False,
                                        sheet_name='Processed_Data',
                                        engine='openpyxl')
                excel_data = output.getvalue()

                st.download_button(
                    label="📥 Download Processed Excel File",
                    data=excel_data,
                    file_name=
                    f"processed_addresses_{time.strftime('%Y%m%d_%H%M%S')}.xlsx",
                    mime=
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    type="primary")

                st.info(
                    f"File ready for download with {len(export_df)} rows and {len(export_columns)} columns."
                )
        else:
            st.warning("⚠️ Please select at least one column to export.")


if __name__ == "__main__":
    main()
