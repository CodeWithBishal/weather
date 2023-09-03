import pandas as pd
from prophet import Prophet
import pickle5 as pickle
import streamlit as st

# Load the Prophet model from the saved file
with open('final_model.pkl', 'rb') as model_file:
    loaded_model = pickle.load(model_file)

def predict_aqi(city, input_date, model, df):
    # Filter data for the specified city
    city_df = df[df['City'] == city].copy()

    # Ensure 'ds' column is in datetime format
    city_df['ds'] = pd.to_datetime(city_df['ds'])

    # Rename columns to 'ds' and 'y' as required by Prophet
    city_df = city_df.rename(columns={'ds': 'ds', 'y': 'y'})

    # Create a dataframe with the input date
    future = pd.DataFrame({'ds': [pd.to_datetime(input_date)]})

    # Make predictions for the input date
    forecast = model.predict(future)

    # Extract the predicted AQI value
    predicted_aqi = forecast.loc[0, 'yhat']

    return predicted_aqi

def main():
    # Title
    st.title("AQI Prediction WebApp")

    # fetching the input data from the user
    city = st.text_input('Enter the city:')
    date = st.text_input('Enter the date (YYYY-MM-DD):')

    # prediction part
    aqi = ''

    # creating button for prediction
    if st.button('Predict AQI'):
        aqi = predict_aqi(city, date, loaded_model, historical_data)
        st.success(f"Predicted AQI for {city} on {date}: {aqi:.2f} µg/m³")

if __name__ == "__main__":
    # Load historical AQI data into a DataFrame (assuming 'ds', 'y', and 'city' columns)
    historical_data = pd.read_csv('output.csv')
    main()

