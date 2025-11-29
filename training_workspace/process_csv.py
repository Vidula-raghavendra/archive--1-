import pandas as pd
import os

def process_data():
    # Load data
    df1 = pd.read_csv('crop_production.csv')
    df2 = pd.read_csv('file2.csv')

    # Normalize column names for easier processing
    # df1: State_Name, District_Name, Crop_Year, Season, Crop, Area, Production
    # df2: State, District, Crop, Year, Season, Area, Area Units, Production, Production Units, Yield

    print("Original df1 shape:", df1.shape)
    print("Original df2 shape:", df2.shape)

    # Filter for Meghalaya (case insensitive)
    df1_meghalaya = df1[df1['State_Name'].str.contains('Meghalaya', case=False, na=False)].copy()
    df2_meghalaya = df2[df2['State'].str.contains('Meghalaya', case=False, na=False)].copy()

    print("Meghalaya df1 shape:", df1_meghalaya.shape)
    print("Meghalaya df2 shape:", df2_meghalaya.shape)

    # Normalize data for matching
    
    # 1. Year
    # df1 has integer year (e.g., 2000)
    # df2 has string year (e.g., 2001-02) -> we'll take the first part
    def normalize_year(y):
        if isinstance(y, str) and '-' in y:
            return int(y.split('-')[0])
        return int(y)

    df2_meghalaya['Year_Normalized'] = df2_meghalaya['Year'].apply(normalize_year)
    df1_meghalaya['Crop_Year'] = df1_meghalaya['Crop_Year'].astype(int)

    # 2. Season
    # Trim whitespace
    df1_meghalaya['Season'] = df1_meghalaya['Season'].str.strip()
    df2_meghalaya['Season'] = df2_meghalaya['Season'].str.strip()

    # 3. Strings
    # Ensure other string columns are stripped
    for col in ['State_Name', 'District_Name', 'Crop']:
        df1_meghalaya[col] = df1_meghalaya[col].str.strip()
    
    for col in ['State', 'District', 'Crop']:
        df2_meghalaya[col] = df2_meghalaya[col].str.strip()

    # Perform Merge
    # We match on: State, District, Crop, Year, Season, Area, Production
    # Note: Area and Production are floats. Exact float matching can be tricky, but usually in CSVs they are consistent if from same source.
    # We will try exact match first.

    merged = pd.merge(
        df1_meghalaya,
        df2_meghalaya,
        left_on=['State_Name', 'District_Name', 'Crop_Year', 'Season', 'Crop', 'Area', 'Production'],
        right_on=['State', 'District', 'Year_Normalized', 'Season', 'Crop', 'Area', 'Production'],
        how='inner'
    )

    print("Merged shape:", merged.shape)

    # Save output
    if not merged.empty:
        merged.to_csv('meghalaya_matched_entries.csv', index=False)
        print("Successfully saved to meghalaya_matched_entries.csv")
    else:
        print("No matching entries found.")

if __name__ == "__main__":
    process_data()
