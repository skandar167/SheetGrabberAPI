# Chemical Engineering KPI Platform - Examples

This document provides practical examples for using the KPI platform.

## Example 1: Reactor Conversion Analysis

### Scenario
A chemical plant operates 5 reactors and wants to analyze conversion rates across different batches.

### Input Data (Excel)
| Batch | Initial_Concentration | Final_Concentration |
|-------|----------------------|---------------------|
| A     | 100                  | 75                  |
| B     | 120                  | 85                  |
| C     | 90                   | 60                  |
| D     | 110                  | 80                  |
| E     | 105                  | 70                  |

### Steps
1. Select "Reactor Conversion" from the sidebar
2. Upload Excel file with the data
3. Map columns: Initial_Concentration → Initial Concentration, Final_Concentration → Final Concentration
4. Click "Calculate KPIs"

### Expected Output
| Batch | Initial_Concentration | Final_Concentration | Conversion (%) |
|-------|----------------------|---------------------|----------------|
| A     | 100                  | 75                  | 25.00          |
| B     | 120                  | 85                  | 29.17          |
| C     | 90                   | 60                  | 33.33          |
| D     | 110                  | 80                  | 27.27          |
| E     | 105                  | 70                  | 33.33          |

**Statistics:**
- Mean: 29.62%
- Median: 29.17%
- Min: 25.00%
- Max: 33.33%

---

## Example 2: Overall Equipment Effectiveness (OEE)

### Scenario
Manufacturing facility wants to measure equipment performance across three reactors.

### Input Data (Excel)
| Equipment | Availability | Performance | Quality |
|-----------|-------------|-------------|---------|
| Reactor-1 | 95          | 88          | 97      |
| Reactor-2 | 90          | 85          | 95      |
| Reactor-3 | 92          | 90          | 96      |

### Steps
1. Select "OEE" from the sidebar
2. Upload Excel file
3. Map columns accordingly
4. Click "Calculate KPIs"

### Expected Output
| Equipment | Availability | Performance | Quality | OEE (%)  |
|-----------|-------------|-------------|---------|----------|
| Reactor-1 | 95          | 88          | 97      | 81.07    |
| Reactor-2 | 90          | 85          | 95      | 72.68    |
| Reactor-3 | 92          | 90          | 96      | 79.49    |

**Interpretation:**
- Reactor-1: Good Performance (OEE > 60%)
- Reactor-2: Good Performance (OEE > 60%)
- Reactor-3: Good Performance (OEE > 60%)
- Target: World Class (OEE > 85%)

---

## Example 3: Reynolds Number for Flow Characterization

### Scenario
Engineer needs to determine flow regime in a pipe system.

### Manual Calculation
**Input:**
- Density: 1000 kg/m³ (water)
- Velocity: 2 m/s
- Diameter: 0.1 m
- Viscosity: 0.001 Pa·s

**Steps:**
1. Select "Reynolds Number" from sidebar
2. Go to "Manual Input" tab
3. Enter values
4. Click "Calculate"

**Output:**
- Reynolds Number: 200,000
- Flow Regime: **Turbulent** (Re > 4000)

---

## Example 4: Pressure Drop Calculation

### Scenario
Calculate pressure drop in a 100m pipe with specified flow conditions.

### Manual Calculation
**Input:**
- Friction Factor: 0.02
- Length: 100 m
- Diameter: 0.1 m
- Density: 1000 kg/m³
- Velocity: 2 m/s

**Steps:**
1. Select "Pressure Drop" from sidebar
2. Go to "Manual Input" tab
3. Enter values
4. Click "Calculate"

**Output:**
- Pressure Drop: 40,000 Pa (40 kPa)

---

## Example 5: Energy Efficiency Analysis

### Scenario
Production facility wants to optimize energy consumption across 5 production runs.

### Input Data (Excel)
| Run | Total_Energy_kWh | Production_Volume |
|-----|------------------|-------------------|
| 1   | 1000             | 500               |
| 2   | 1100             | 550               |
| 3   | 950              | 480               |
| 4   | 1050             | 520               |
| 5   | 980              | 490               |

### Expected Output
| Run | Total_Energy_kWh | Production_Volume | Specific Energy Consumption |
|-----|------------------|-------------------|-----------------------------|
| 1   | 1000             | 500               | 2.00                        |
| 2   | 1100             | 550               | 2.00                        |
| 3   | 950              | 480               | 1.98                        |
| 4   | 1050             | 520               | 2.02                        |
| 5   | 980              | 490               | 2.00                        |

**Analysis:**
- Most efficient run: Run 3 (1.98 kWh/unit)
- Least efficient run: Run 4 (2.02 kWh/unit)
- Average: 2.00 kWh/unit

---

## Example 6: Heat Transfer Coefficient

### Scenario
Design a heat exchanger with the following conditions.

### Manual Calculation
**Input:**
- Heat Transfer Rate (Q): 1000 W
- Area: 10 m²
- Temperature Difference (ΔT): 50 K

**Output:**
- Heat Transfer Coefficient (U): 2.00 W/m²K

**Interpretation:**
- Typical U values:
  - Gas-to-gas: 10-50 W/m²K
  - Gas-to-liquid: 10-300 W/m²K
  - Liquid-to-liquid: 100-2000 W/m²K
  - This value (2.00) suggests gas-to-gas heat transfer

---

## Best Practices

### Data Preparation
1. **Clean Data**: Ensure no missing values in critical columns
2. **Correct Units**: Use SI units consistently
3. **Valid Ranges**: Check that values are within physical limits
4. **Column Names**: Use descriptive names for easy mapping

### Interpretation
1. **Context Matters**: Compare KPIs against industry benchmarks
2. **Trends**: Look for patterns over time
3. **Outliers**: Investigate unusual values
4. **Correlations**: Analyze relationships between KPIs

### Export and Reporting
1. **Documentation**: Include calculation date and parameters
2. **Visualization**: Use appropriate chart types for your data
3. **Sharing**: Export results for stakeholder review
4. **Version Control**: Keep track of different analyses

---

## Common Use Cases

1. **Process Optimization**: Identify inefficient operations
2. **Equipment Monitoring**: Track performance over time
3. **Energy Management**: Reduce energy consumption
4. **Quality Control**: Ensure product consistency
5. **Cost Reduction**: Lower production costs
6. **Compliance**: Meet regulatory requirements
7. **Research & Development**: Test new processes
8. **Benchmarking**: Compare against industry standards

---

## Tips for Success

1. **Start Simple**: Begin with manual calculations to understand the KPIs
2. **Validate Results**: Cross-check calculated values with expected ranges
3. **Batch Processing**: Use Excel upload for analyzing multiple data points
4. **Regular Monitoring**: Track KPIs over time for trend analysis
5. **Document Assumptions**: Note any special conditions or assumptions
6. **Share Insights**: Use visualizations to communicate findings effectively
