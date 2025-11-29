import re
import pandas as pd

def parse_rainfall_data(file_path):
    data = []
    current_year = None
    current_district = None

    with open(file_path, 'r') as f:
        lines = f.readlines()

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check for Year
        year_match = re.search(r'--- Year (\d{4}) ---', line)
        if year_match:
            current_year = int(year_match.group(1))
            continue

        # Check for District
        if "Stations" not in line and not line[0].isdigit() and "\t" not in line:
            current_district = line.strip()
            continue

        # Check for Data Rows
        if "\t" in line and "Stations" not in line:
            parts = line.split('\t')
            
            # We expect: Station(0), Jan(1), Feb(2), ..., Dec(12), Total(13), RainyDays(14)
            if len(parts) >= 13:
                station_name = parts[0]
                try:
                    # Extract monthly data
                    monthly_data = {}
                    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    
                    for i, month in enumerate(months):
                        # Index 1 to 12
                        val = parts[i+1]
                        monthly_data[month] = float(val) if val else 0.0
                    
                    total_rainfall = float(parts[13]) if len(parts) > 13 and parts[13] else sum(monthly_data.values())

                    entry = {
                        'Year': current_year,
                        'District': current_district,
                        'Station': station_name,
                        'Rainfall': total_rainfall
                    }
                    # Add monthly data to entry
                    entry.update(monthly_data)
                    
                    data.append(entry)
                except ValueError:
                    continue

    df = pd.DataFrame(data)
    
    # Normalize District Names
    df['District'] = df['District'].str.upper().str.strip()
    df['District'] = df['District'].replace('RI BHOI DISTRICT', 'RI BHOI')

    # Group by District and Year for Total Rainfall (for training)
    df_total = df.groupby(['District', 'Year'])['Rainfall'].mean().reset_index()
    
    # Group by District for Monthly Averages (for forecasting)
    # We average across all available years for each month
    monthly_cols = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    df_monthly = df.groupby(['District'])[monthly_cols].mean().reset_index()
    
    return df_total, df_monthly

if __name__ == "__main__":
    df_total, df_monthly = parse_rainfall_data('rainfall_raw.txt')
    
    print("Total Rainfall Data (Head):")
    print(df_total.head())
    df_total.to_csv('rainfall_historical.csv', index=False)
    print("Saved to rainfall_historical.csv")
    
    print("\nMonthly Averages (Head):")
    print(df_monthly.head())
    df_monthly.to_csv('rainfall_monthly_averages.csv', index=False)
    print("Saved to rainfall_monthly_averages.csv")
