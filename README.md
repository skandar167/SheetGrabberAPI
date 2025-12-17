# Chemical Engineering KPI Platform 🧪

A comprehensive web application for calculating and analyzing Key Performance Indicators (KPIs) in chemical engineering processes.

## Features

- **Multiple KPI Calculations**: Support for 12 different chemical engineering KPIs
- **Excel Integration**: Upload Excel files with process data for batch calculations
- **Manual Calculations**: Individual KPI calculations with manual input
- **Data Visualization**: Interactive charts including line, bar, histogram, and box plots
- **Statistical Analysis**: Automatic calculation of mean, median, min, and max values
- **Export Results**: Download processed data as Excel files

## Supported KPIs

### 1. Reactor Conversion
Measures the percentage of reactant converted to product.

**Formula**: `Conversion (%) = ((C₀ - C) / C₀) × 100`

Where:
- C₀ = Initial concentration
- C = Final concentration

### 2. Yield
Ratio of actual output to theoretical output.

**Formula**: `Yield (%) = (Actual Output / Theoretical Output) × 100`

### 3. Selectivity
Percentage of desired product in total products.

**Formula**: `Selectivity (%) = (Desired Product / Total Products) × 100`

### 4. Efficiency
Ratio of useful output to total input.

**Formula**: `Efficiency (%) = (Useful Output / Total Input) × 100`

### 5. Heat Transfer Coefficient
Overall heat transfer coefficient (U).

**Formula**: `U = Q / (A × ΔT)`

Where:
- Q = Heat transfer rate (W)
- A = Area (m²)
- ΔT = Temperature difference (K)

### 6. Reynolds Number
Dimensionless number for flow characterization.

**Formula**: `Re = (ρ × v × D) / μ`

Where:
- ρ = Density (kg/m³)
- v = Velocity (m/s)
- D = Diameter (m)
- μ = Viscosity (Pa·s)

Flow regimes:
- Re < 2300: Laminar
- 2300 ≤ Re < 4000: Transitional
- Re ≥ 4000: Turbulent

### 7. Mass Flow Rate
Mass of fluid passing per unit time.

**Formula**: `ṁ = Q × ρ`

Where:
- Q = Volumetric flow rate (m³/s)
- ρ = Density (kg/m³)

### 8. Residence Time
Average time fluid spends in reactor.

**Formula**: `τ = V / Q`

Where:
- V = Volume (m³)
- Q = Volumetric flow rate (m³/s)

### 9. Pressure Drop
Pressure loss in pipe/system using Darcy-Weisbach equation.

**Formula**: `ΔP = f × (L / D) × (ρ × v²) / 2`

Where:
- f = Friction factor
- L = Length (m)
- D = Diameter (m)
- ρ = Density (kg/m³)
- v = Velocity (m/s)

### 10. Overall Equipment Effectiveness (OEE)
Measures overall equipment performance.

**Formula**: `OEE (%) = (Availability × Performance × Quality) / 10000`

Where all three factors are percentages.

Performance benchmarks:
- OEE ≥ 85%: World Class
- OEE ≥ 60%: Good
- OEE < 60%: Improvement Needed

### 11. Energy Consumption per Unit
Specific energy consumption.

**Formula**: `SEC = Total Energy / Production Volume`

### 12. Cost per Unit
Unit production cost.

**Formula**: `Unit Cost = Total Cost / Production Volume`

## Installation

1. Clone the repository:
```bash
git clone https://github.com/skandar167/SheetGrabberAPI.git
cd SheetGrabberAPI
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
streamlit run streamlit_app.py
```

## Usage

### Excel File Upload Method

1. **Select KPI Type**: Choose the KPI you want to calculate from the sidebar
2. **Upload Excel File**: Upload an Excel file (.xlsx or .xls) containing your process data
3. **Map Columns**: Select which columns correspond to the KPI parameters
4. **Calculate**: Click "Calculate KPIs" to process the data
5. **View Results**: Review the calculated KPIs, statistics, and visualizations
6. **Export**: Download the results as an Excel file

### Manual Input Method

1. **Select KPI Type**: Choose the KPI from the sidebar
2. **Switch to Manual Tab**: Click on "Manual Input" tab
3. **Enter Values**: Input the required parameters
4. **Calculate**: Click "Calculate" to see the result

## Example Excel File Structure

For Reactor Conversion:
```
Batch | Initial_Concentration | Final_Concentration
A     | 100                   | 75
B     | 120                   | 85
C     | 90                    | 60
```

For OEE:
```
Equipment  | Availability | Performance | Quality
Reactor-1  | 95          | 88          | 97
Reactor-2  | 90          | 85          | 95
```

## Dependencies

- streamlit: Web application framework
- pandas: Data manipulation and analysis
- numpy: Numerical computing
- plotly: Interactive visualizations
- openpyxl: Excel file handling
- xlrd: Excel file reading

## Project Structure

```
SheetGrabberAPI/
├── streamlit_app.py      # Main application
├── requirements.txt      # Python dependencies
├── config.toml          # Streamlit configuration
├── README.md            # Documentation
└── .gitignore           # Git ignore rules
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Authors

- skandar167

## Acknowledgments

- Chemical engineering formulas and best practices
- Streamlit community for the excellent framework
- Plotly for interactive visualizations
