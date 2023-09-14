import pandas as pd
from prophet import Prophet
import pickle
import streamlit as st
import requests
from datetime import datetime, timedelta


# Load the Prophet model from the saved file
with open('/var/www/weather/stlit/pakka_final_model.pkl', 'rb') as model_file:
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
    today_date = datetime.today().strftime('%Y-%m-%d')
    date = st.code(f'{today_date}')

    # prediction part
    aqi = ''
        




    api_key = 'ab909bfc29fc6d1a9010f00d8f3530d1'
    weather_data = requests.get(f'https://api.openweathermap.org/data/2.5/weather?q={city}&units=imperial&APPID={api_key}')
    st.title()
    if weather_data.status_code == "200":
        weather_data = weather_data.json()
        desc = weather_data['weather'][0]['description']
        temp = 5/9*(weather_data['main']['temp'] - 32)
        humi = weather_data['main']['humidity']
    


    if st.button('Predict AQI'):
        aqi = predict_aqi(city, date, loaded_model, historical_data)
        st.success(f"Predicted AQI for {city} on {date}: {aqi:.2f} µg/m³")
        st.write(f'Current weather in {city} is',desc.capitalize())
        st.write(f'Current temperature in {city} is', round(temp, 2),'°C')
        st.write(f'Current humidity in {city} is', humi,'%')

if __name__ == "__main__":
    # Load historical AQI data into a DataFrame (assuming 'ds', 'y', and 'city' columns)
    historical_data = pd.read_csv('/var/www/weather/Model/output.csv')
    main()

