import streamlit as st
from datetime import datetime, timedelta
import pandas as pd
from prophet import Prophet
historical_data = pd.read_csv('/var/www/weather/Model/output.csv')
import matplotlib.pyplot as plt
def predict_aqi(city, input_date, df):
    # Filter data for the specified city
    city_df = df[df['City'] == city].copy()

    #city_df['ds'] = pd.to_datetime(city_df['ds'])

    # Rename columns to 'ds' and 'y' as required by Prophet
    city_df = city_df.rename(columns={'ds': 'ds', 'y': 'y'})

    model = Prophet()
    model.fit(city_df)

    # Create a dataframe with the input date
    future = pd.DataFrame({'ds': [input_date]})

    # Make predictions for the input date
    forecast = model.predict(future)


    predicted_aqi = forecast.loc[0, 'yhat']

    return predicted_aqi

st.title("Weather Forecast Calendar")
selected_date = st.date_input("Select a future date:", datetime.now() + timedelta(days=1))
city = st.text_input("Enter a City")
if st.button("Get Weather Prediction"):
    prediction = predict_aqi(city, selected_date, historical_data)
    
    st.subheader(f"Weather prediction for {selected_date.strftime('%Y-%m-%d')}:")
    st.write(f"Prediction: {prediction}")