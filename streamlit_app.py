import streamlit as st
import pandas as pd
import time
import os
from io import BytesIO
import numpy as np
import plotly.graph_objects as go
import plotly.express as px

# Configure page - MUST be first Streamlit command
st.set_page_config(page_title="Chemical Engineering KPI Platform",
                   page_icon="🧪",
                   layout="wide")

# KPI Calculation Functions

def calculate_reactor_conversion(initial_conc, final_conc):
    """Calculate reactor conversion percentage"""
    if initial_conc == 0:
        return 0
    return ((initial_conc - final_conc) / initial_conc) * 100


def calculate_yield(actual_output, theoretical_output):
    """Calculate process yield percentage"""
    if theoretical_output == 0:
        return 0
    return (actual_output / theoretical_output) * 100


def calculate_selectivity(desired_product, total_products):
    """Calculate selectivity percentage"""
    if total_products == 0:
        return 0
    return (desired_product / total_products) * 100


def calculate_efficiency(useful_output, total_input):
    """Calculate process efficiency percentage"""
    if total_input == 0:
        return 0
    return (useful_output / total_input) * 100


def calculate_heat_transfer_coefficient(q, area, delta_t):
    """Calculate overall heat transfer coefficient (U)"""
    if area == 0 or delta_t == 0:
        return 0
    return q / (area * delta_t)


def calculate_reynolds_number(density, velocity, diameter, viscosity):
    """Calculate Reynolds number for flow characterization"""
    if viscosity == 0:
        return 0
    return (density * velocity * diameter) / viscosity


def calculate_mass_flow_rate(volumetric_flow, density):
    """Calculate mass flow rate"""
    return volumetric_flow * density


def calculate_residence_time(volume, volumetric_flow):
    """Calculate residence time"""
    if volumetric_flow == 0:
        return 0
    return volume / volumetric_flow


def calculate_pressure_drop(friction_factor, length, diameter, density, velocity):
    """Calculate pressure drop using Darcy-Weisbach equation"""
    if diameter == 0:
        return 0
    return friction_factor * (length / diameter) * (density * velocity**2) / 2


def calculate_oee(availability, performance, quality):
    """Calculate Overall Equipment Effectiveness"""
    return (availability / 100) * (performance / 100) * (quality / 100) * 100


def calculate_energy_consumption_per_unit(total_energy, production_volume):
    """Calculate specific energy consumption"""
    if production_volume == 0:
        return 0
    return total_energy / production_volume


def calculate_cost_per_unit(total_cost, production_volume):
    """Calculate unit production cost"""
    if production_volume == 0:
        return 0
    return total_cost / production_volume


def process_kpi_data(df, kpi_type, parameters):
    """Process dataframe and calculate KPIs based on selected type"""
    result_df = df.copy()
    
    try:
        if kpi_type == "Reactor Conversion":
            result_df['Conversion (%)'] = result_df.apply(
                lambda row: calculate_reactor_conversion(
                    float(row[parameters['initial_conc']]),
                    float(row[parameters['final_conc']])
                ), axis=1
            )
            
        elif kpi_type == "Yield":
            result_df['Yield (%)'] = result_df.apply(
                lambda row: calculate_yield(
                    float(row[parameters['actual_output']]),
                    float(row[parameters['theoretical_output']])
                ), axis=1
            )
            
        elif kpi_type == "Selectivity":
            result_df['Selectivity (%)'] = result_df.apply(
                lambda row: calculate_selectivity(
                    float(row[parameters['desired_product']]),
                    float(row[parameters['total_products']])
                ), axis=1
            )
            
        elif kpi_type == "Efficiency":
            result_df['Efficiency (%)'] = result_df.apply(
                lambda row: calculate_efficiency(
                    float(row[parameters['useful_output']]),
                    float(row[parameters['total_input']])
                ), axis=1
            )
            
        elif kpi_type == "Heat Transfer Coefficient":
            result_df['Heat Transfer Coefficient (W/m²K)'] = result_df.apply(
                lambda row: calculate_heat_transfer_coefficient(
                    float(row[parameters['heat_transfer_rate']]),
                    float(row[parameters['area']]),
                    float(row[parameters['temperature_difference']])
                ), axis=1
            )
            
        elif kpi_type == "Reynolds Number":
            result_df['Reynolds Number'] = result_df.apply(
                lambda row: calculate_reynolds_number(
                    float(row[parameters['density']]),
                    float(row[parameters['velocity']]),
                    float(row[parameters['diameter']]),
                    float(row[parameters['viscosity']])
                ), axis=1
            )
            
        elif kpi_type == "Mass Flow Rate":
            result_df['Mass Flow Rate (kg/s)'] = result_df.apply(
                lambda row: calculate_mass_flow_rate(
                    float(row[parameters['volumetric_flow']]),
                    float(row[parameters['density']])
                ), axis=1
            )
            
        elif kpi_type == "Residence Time":
            result_df['Residence Time (s)'] = result_df.apply(
                lambda row: calculate_residence_time(
                    float(row[parameters['volume']]),
                    float(row[parameters['volumetric_flow']])
                ), axis=1
            )
            
        elif kpi_type == "Pressure Drop":
            result_df['Pressure Drop (Pa)'] = result_df.apply(
                lambda row: calculate_pressure_drop(
                    float(row[parameters['friction_factor']]),
                    float(row[parameters['length']]),
                    float(row[parameters['diameter']]),
                    float(row[parameters['density']]),
                    float(row[parameters['velocity']])
                ), axis=1
            )
            
        elif kpi_type == "OEE":
            result_df['OEE (%)'] = result_df.apply(
                lambda row: calculate_oee(
                    float(row[parameters['availability']]),
                    float(row[parameters['performance']]),
                    float(row[parameters['quality']])
                ), axis=1
            )
            
        elif kpi_type == "Energy Consumption per Unit":
            result_df['Specific Energy Consumption'] = result_df.apply(
                lambda row: calculate_energy_consumption_per_unit(
                    float(row[parameters['total_energy']]),
                    float(row[parameters['production_volume']])
                ), axis=1
            )
            
        elif kpi_type == "Cost per Unit":
            result_df['Unit Cost'] = result_df.apply(
                lambda row: calculate_cost_per_unit(
                    float(row[parameters['total_cost']]),
                    float(row[parameters['production_volume']])
                ), axis=1
            )
            
        return result_df, True, ""
    except Exception as e:
        return result_df, False, str(e)


def main():
    st.title("🧪 Chemical Engineering KPI Platform")
    st.markdown(
        "Calculate and analyze Key Performance Indicators for chemical engineering processes"
    )

    # Sidebar for KPI selection
    with st.sidebar:
        st.header("⚙️ KPI Selection")
        
        kpi_options = {
            "Reactor Conversion": "Measures the percentage of reactant converted to product",
            "Yield": "Ratio of actual output to theoretical output",
            "Selectivity": "Percentage of desired product in total products",
            "Efficiency": "Ratio of useful output to total input",
            "Heat Transfer Coefficient": "Overall heat transfer coefficient (U)",
            "Reynolds Number": "Dimensionless number for flow characterization",
            "Mass Flow Rate": "Mass of fluid passing per unit time",
            "Residence Time": "Average time fluid spends in reactor",
            "Pressure Drop": "Pressure loss in pipe/system",
            "OEE": "Overall Equipment Effectiveness",
            "Energy Consumption per Unit": "Specific energy consumption",
            "Cost per Unit": "Unit production cost"
        }
        
        selected_kpi = st.selectbox(
            "Select KPI Type",
            options=list(kpi_options.keys()),
            help="Choose the KPI you want to calculate"
        )
        
        st.info(f"**{selected_kpi}**: {kpi_options[selected_kpi]}")
        
        st.header("📋 Instructions")
        st.markdown("""
        1. Select a KPI type
        2. Upload an Excel file with process data
        3. Map columns to KPI parameters
        4. Calculate KPIs
        5. View results and visualizations
        6. Download processed data
        """)

    # Tabs for different input methods
    tab1, tab2 = st.tabs(["📤 Upload Excel File", "✍️ Manual Input"])
    
    with tab1:
        st.header("Upload Process Data")
        uploaded_file = st.file_uploader(
            "Choose an Excel file",
            type=['xlsx', 'xls'],
            help="Upload an Excel file containing process data"
        )
        
        if uploaded_file is not None:
            try:
                # Read the Excel file
                with st.spinner("Reading Excel file..."):
                    df = pd.read_excel(uploaded_file)
                
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
                
                # Show data preview
                st.subheader("📊 Data Preview")
                st.dataframe(df.head(10), use_container_width=True)
                
                # KPI parameter mapping
                st.header("🎯 Map Columns to KPI Parameters")
                
                parameters = {}
                
                if selected_kpi == "Reactor Conversion":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['initial_conc'] = st.selectbox(
                            "Initial Concentration Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['final_conc'] = st.selectbox(
                            "Final Concentration Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Yield":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['actual_output'] = st.selectbox(
                            "Actual Output Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['theoretical_output'] = st.selectbox(
                            "Theoretical Output Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Selectivity":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['desired_product'] = st.selectbox(
                            "Desired Product Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['total_products'] = st.selectbox(
                            "Total Products Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Efficiency":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['useful_output'] = st.selectbox(
                            "Useful Output Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['total_input'] = st.selectbox(
                            "Total Input Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Heat Transfer Coefficient":
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        parameters['heat_transfer_rate'] = st.selectbox(
                            "Heat Transfer Rate (Q) Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['area'] = st.selectbox(
                            "Area Column",
                            options=df.columns.tolist()
                        )
                    with col3:
                        parameters['temperature_difference'] = st.selectbox(
                            "ΔT Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Reynolds Number":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['density'] = st.selectbox(
                            "Density Column",
                            options=df.columns.tolist()
                        )
                        parameters['velocity'] = st.selectbox(
                            "Velocity Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['diameter'] = st.selectbox(
                            "Diameter Column",
                            options=df.columns.tolist()
                        )
                        parameters['viscosity'] = st.selectbox(
                            "Viscosity Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Mass Flow Rate":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['volumetric_flow'] = st.selectbox(
                            "Volumetric Flow Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['density'] = st.selectbox(
                            "Density Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Residence Time":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['volume'] = st.selectbox(
                            "Volume Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['volumetric_flow'] = st.selectbox(
                            "Volumetric Flow Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Pressure Drop":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['friction_factor'] = st.selectbox(
                            "Friction Factor Column",
                            options=df.columns.tolist()
                        )
                        parameters['length'] = st.selectbox(
                            "Length Column",
                            options=df.columns.tolist()
                        )
                        parameters['diameter'] = st.selectbox(
                            "Diameter Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['density'] = st.selectbox(
                            "Density Column",
                            options=df.columns.tolist()
                        )
                        parameters['velocity'] = st.selectbox(
                            "Velocity Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "OEE":
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        parameters['availability'] = st.selectbox(
                            "Availability (%) Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['performance'] = st.selectbox(
                            "Performance (%) Column",
                            options=df.columns.tolist()
                        )
                    with col3:
                        parameters['quality'] = st.selectbox(
                            "Quality (%) Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Energy Consumption per Unit":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['total_energy'] = st.selectbox(
                            "Total Energy Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['production_volume'] = st.selectbox(
                            "Production Volume Column",
                            options=df.columns.tolist()
                        )
                        
                elif selected_kpi == "Cost per Unit":
                    col1, col2 = st.columns(2)
                    with col1:
                        parameters['total_cost'] = st.selectbox(
                            "Total Cost Column",
                            options=df.columns.tolist()
                        )
                    with col2:
                        parameters['production_volume'] = st.selectbox(
                            "Production Volume Column",
                            options=df.columns.tolist()
                        )
                
                # Calculate button
                if st.button("🚀 Calculate KPIs", type="primary"):
                    with st.spinner("Calculating KPIs..."):
                        processed_df, success, error_msg = process_kpi_data(df, selected_kpi, parameters)
                    
                    if success:
                        st.session_state.processed_df = processed_df
                        st.session_state.kpi_type = selected_kpi
                        st.success("✅ KPI calculation completed successfully!")
                        
                        # Show results
                        st.header("📈 Results")
                        st.dataframe(processed_df, use_container_width=True)
                        
                        # Statistics
                        kpi_column = [col for col in processed_df.columns if col not in df.columns][0]
                        st.subheader("📊 Statistics")
                        
                        col1, col2, col3, col4 = st.columns(4)
                        with col1:
                            st.metric("Mean", f"{processed_df[kpi_column].mean():.2f}")
                        with col2:
                            st.metric("Median", f"{processed_df[kpi_column].median():.2f}")
                        with col3:
                            st.metric("Min", f"{processed_df[kpi_column].min():.2f}")
                        with col4:
                            st.metric("Max", f"{processed_df[kpi_column].max():.2f}")
                        
                        # Visualization
                        st.subheader("📉 Visualization")
                        
                        viz_type = st.radio(
                            "Select Visualization Type",
                            ["Line Chart", "Bar Chart", "Histogram", "Box Plot"],
                            horizontal=True
                        )
                        
                        if viz_type == "Line Chart":
                            fig = px.line(processed_df, y=kpi_column, title=f"{selected_kpi} Trend")
                            st.plotly_chart(fig, use_container_width=True)
                        elif viz_type == "Bar Chart":
                            fig = px.bar(processed_df, y=kpi_column, title=f"{selected_kpi} by Row")
                            st.plotly_chart(fig, use_container_width=True)
                        elif viz_type == "Histogram":
                            fig = px.histogram(processed_df, x=kpi_column, title=f"{selected_kpi} Distribution")
                            st.plotly_chart(fig, use_container_width=True)
                        elif viz_type == "Box Plot":
                            fig = px.box(processed_df, y=kpi_column, title=f"{selected_kpi} Box Plot")
                            st.plotly_chart(fig, use_container_width=True)
                    else:
                        st.error(f"❌ Error calculating KPIs: {error_msg}")
                        
            except Exception as e:
                st.error(f"❌ Error reading the Excel file: {str(e)}")
                st.info("Please make sure the file is a valid Excel file (.xlsx or .xls)")
    
    with tab2:
        st.header("Manual KPI Calculation")
        st.info("Enter values manually to calculate individual KPIs")
        
        if selected_kpi == "Reactor Conversion":
            col1, col2 = st.columns(2)
            with col1:
                initial_conc = st.number_input("Initial Concentration", min_value=0.0, value=100.0)
            with col2:
                final_conc = st.number_input("Final Concentration", min_value=0.0, value=75.0)
            
            if st.button("Calculate"):
                result = calculate_reactor_conversion(initial_conc, final_conc)
                st.success(f"**Reactor Conversion: {result:.2f}%**")
                
        elif selected_kpi == "Yield":
            col1, col2 = st.columns(2)
            with col1:
                actual = st.number_input("Actual Output", min_value=0.0, value=85.0)
            with col2:
                theoretical = st.number_input("Theoretical Output", min_value=0.0, value=100.0)
            
            if st.button("Calculate"):
                result = calculate_yield(actual, theoretical)
                st.success(f"**Yield: {result:.2f}%**")
                
        elif selected_kpi == "Selectivity":
            col1, col2 = st.columns(2)
            with col1:
                desired = st.number_input("Desired Product", min_value=0.0, value=80.0)
            with col2:
                total = st.number_input("Total Products", min_value=0.0, value=100.0)
            
            if st.button("Calculate"):
                result = calculate_selectivity(desired, total)
                st.success(f"**Selectivity: {result:.2f}%**")
                
        elif selected_kpi == "Efficiency":
            col1, col2 = st.columns(2)
            with col1:
                output = st.number_input("Useful Output", min_value=0.0, value=75.0)
            with col2:
                input_val = st.number_input("Total Input", min_value=0.0, value=100.0)
            
            if st.button("Calculate"):
                result = calculate_efficiency(output, input_val)
                st.success(f"**Efficiency: {result:.2f}%**")
                
        elif selected_kpi == "Heat Transfer Coefficient":
            col1, col2, col3 = st.columns(3)
            with col1:
                q = st.number_input("Heat Transfer Rate (W)", min_value=0.0, value=1000.0)
            with col2:
                area = st.number_input("Area (m²)", min_value=0.0, value=10.0)
            with col3:
                delta_t = st.number_input("ΔT (K)", min_value=0.0, value=50.0)
            
            if st.button("Calculate"):
                result = calculate_heat_transfer_coefficient(q, area, delta_t)
                st.success(f"**Heat Transfer Coefficient: {result:.2f} W/m²K**")
                
        elif selected_kpi == "Reynolds Number":
            col1, col2 = st.columns(2)
            with col1:
                density = st.number_input("Density (kg/m³)", min_value=0.0, value=1000.0)
                velocity = st.number_input("Velocity (m/s)", min_value=0.0, value=2.0)
            with col2:
                diameter = st.number_input("Diameter (m)", min_value=0.0, value=0.1)
                viscosity = st.number_input("Viscosity (Pa·s)", min_value=0.0, value=0.001)
            
            if st.button("Calculate"):
                result = calculate_reynolds_number(density, velocity, diameter, viscosity)
                st.success(f"**Reynolds Number: {result:.2f}**")
                flow_type = "Laminar" if result < 2300 else "Transitional" if result < 4000 else "Turbulent"
                st.info(f"Flow regime: {flow_type}")
                
        elif selected_kpi == "Mass Flow Rate":
            col1, col2 = st.columns(2)
            with col1:
                vol_flow = st.number_input("Volumetric Flow (m³/s)", min_value=0.0, value=0.01)
            with col2:
                density = st.number_input("Density (kg/m³)", min_value=0.0, value=1000.0)
            
            if st.button("Calculate"):
                result = calculate_mass_flow_rate(vol_flow, density)
                st.success(f"**Mass Flow Rate: {result:.2f} kg/s**")
                
        elif selected_kpi == "Residence Time":
            col1, col2 = st.columns(2)
            with col1:
                volume = st.number_input("Volume (m³)", min_value=0.0, value=5.0)
            with col2:
                flow = st.number_input("Volumetric Flow (m³/s)", min_value=0.0, value=0.1)
            
            if st.button("Calculate"):
                result = calculate_residence_time(volume, flow)
                st.success(f"**Residence Time: {result:.2f} seconds ({result/60:.2f} minutes)**")
                
        elif selected_kpi == "Pressure Drop":
            col1, col2 = st.columns(2)
            with col1:
                f = st.number_input("Friction Factor", min_value=0.0, value=0.02)
                length = st.number_input("Length (m)", min_value=0.0, value=100.0)
                diameter = st.number_input("Diameter (m)", min_value=0.0, value=0.1)
            with col2:
                density = st.number_input("Density (kg/m³)", min_value=0.0, value=1000.0)
                velocity = st.number_input("Velocity (m/s)", min_value=0.0, value=2.0)
            
            if st.button("Calculate"):
                result = calculate_pressure_drop(f, length, diameter, density, velocity)
                st.success(f"**Pressure Drop: {result:.2f} Pa ({result/1000:.2f} kPa)**")
                
        elif selected_kpi == "OEE":
            col1, col2, col3 = st.columns(3)
            with col1:
                availability = st.number_input("Availability (%)", min_value=0.0, max_value=100.0, value=90.0)
            with col2:
                performance = st.number_input("Performance (%)", min_value=0.0, max_value=100.0, value=85.0)
            with col3:
                quality = st.number_input("Quality (%)", min_value=0.0, max_value=100.0, value=95.0)
            
            if st.button("Calculate"):
                result = calculate_oee(availability, performance, quality)
                st.success(f"**OEE: {result:.2f}%**")
                if result >= 85:
                    st.info("🌟 World Class Performance")
                elif result >= 60:
                    st.info("✅ Good Performance")
                else:
                    st.warning("⚠️ Improvement Needed")
                    
        elif selected_kpi == "Energy Consumption per Unit":
            col1, col2 = st.columns(2)
            with col1:
                energy = st.number_input("Total Energy (kWh)", min_value=0.0, value=1000.0)
            with col2:
                production = st.number_input("Production Volume", min_value=0.0, value=500.0)
            
            if st.button("Calculate"):
                result = calculate_energy_consumption_per_unit(energy, production)
                st.success(f"**Specific Energy Consumption: {result:.2f} kWh/unit**")
                
        elif selected_kpi == "Cost per Unit":
            col1, col2 = st.columns(2)
            with col1:
                cost = st.number_input("Total Cost ($)", min_value=0.0, value=10000.0)
            with col2:
                production = st.number_input("Production Volume", min_value=0.0, value=1000.0)
            
            if st.button("Calculate"):
                result = calculate_cost_per_unit(cost, production)
                st.success(f"**Unit Cost: ${result:.2f}/unit**")

    # Export section
    if 'processed_df' in st.session_state:
        st.header("📥 Export Results")
        
        processed_df = st.session_state.processed_df
        
        # Download button
        output = BytesIO()
        processed_df.to_excel(output, index=False, sheet_name='KPI_Results', engine='openpyxl')
        excel_data = output.getvalue()
        
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.download_button(
                label="📥 Download Results as Excel",
                data=excel_data,
                file_name=f"kpi_results_{time.strftime('%Y%m%d_%H%M%S')}.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                type="primary"
            )
            
            st.info(f"File ready for download with {len(processed_df)} rows.")


if __name__ == "__main__":
    main()
