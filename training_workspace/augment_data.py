import pandas as pd
import numpy as np

def augment_data():
    df = pd.read_csv('final_training_data.csv')
    
    # Approximate Cost of Cultivation per Hectare (in INR)
    # These are estimates for demonstration purposes
    cost_map = {
        'Rice': 40000,
        'Banana': 100000,
        'Maize': 30000,
        'Linseed': 20000,
        'Cowpea(Lobia)': 25000,
        'Peas & beans (Pulses)': 35000,
        'Rapeseed &Mustard': 25000,
        'Sugarcane': 80000,
        'Tobacco': 50000,
        'Wheat': 35000,
        'Jute': 45000,
        'Mesta': 20000,
        'Potato': 60000,
        'Turmeric': 70000,
        'Ginger': 80000,
        'Arecanut': 90000,
        'Black pepper': 100000,
        'Cashewnut': 50000,
        'Tapioca': 40000
    }
    
    # Function to get base cost
    def get_cost(crop):
        # Fuzzy match or default
        for key in cost_map:
            if key.lower() in str(crop).lower():
                return cost_map[key]
        return 30000 # Default
    
    # Calculate Cost
    # Cost = Area * Base_Cost * Variance (0.9 to 1.1)
    # This simulates real-world variance
    np.random.seed(42)
    
    costs = []
    for index, row in df.iterrows():
        base = get_cost(row['Crop'])
        area = row['Area']
        variance = np.random.uniform(0.9, 1.1)
        total_cost = area * base * variance
        costs.append(total_cost)
        
    df['Cost'] = costs
    
    print("Added Cost column.")
    print(df[['Crop', 'Area', 'Cost']].head())
    
    df.to_csv('final_training_data_with_cost.csv', index=False)
    print("Saved to final_training_data_with_cost.csv")

if __name__ == "__main__":
    augment_data()
