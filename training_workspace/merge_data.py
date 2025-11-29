import pandas as pd

def merge_datasets():
    # Load datasets
    crops = pd.read_csv('meghalaya_matched_entries.csv')
    rainfall = pd.read_csv('rainfall_historical.csv')

    print("Crops shape:", crops.shape)
    print("Rainfall shape:", rainfall.shape)

    # Normalize Year in crops to match Rainfall Year
    # Crop_Year is int (e.g. 2000). Rainfall Year is int (e.g. 2006).
    # We need to ensure types match.
    crops['Crop_Year'] = crops['Crop_Year'].astype(int)
    rainfall['Year'] = rainfall['Year'].astype(int)

    # Normalize District names
    # We already did some in process_rainfall.py but let's ensure consistency
    crops['District_Name'] = crops['District_Name'].str.upper().str.strip()
    rainfall['District'] = rainfall['District'].str.upper().str.strip()

    # Merge
    # We use 'inner' join because we only want rows where we have BOTH crop and rainfall data
    # This will filter the dataset to only the years 2006, 2008, 2010, 2012, 2013, 2014, 2016
    # Note: 2016 might not be in crop data (which goes up to 2014 usually).
    merged = pd.merge(
        crops,
        rainfall,
        left_on=['District_Name', 'Crop_Year'],
        right_on=['District', 'Year'],
        how='inner'
    )

    print("Merged shape:", merged.shape)
    
    if merged.empty:
        print("WARNING: Merged dataset is empty! Checking for mismatches...")
        print("Crop Years:", crops['Crop_Year'].unique())
        print("Rainfall Years:", rainfall['Year'].unique())
        print("Crop Districts:", crops['District_Name'].unique())
        print("Rainfall Districts:", rainfall['District'].unique())
    else:
        merged.to_csv('final_training_data.csv', index=False)
        print("Saved to final_training_data.csv")
        print(merged.head())

if __name__ == "__main__":
    merge_datasets()
