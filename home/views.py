from django.shortcuts import render
from .models import *
from joblib import load
import pandas as pd
import pickle

with open('/var/www/weather/stlit/pakka_final_model.pkl', 'rb') as model_file:
    loaded_model = pickle.load(model_file)
# model = load("./Model/model.joblib")
historical_data = pd.read_csv('/var/www/weather/Model/output.csv')

# Create your views here.
def index(request):
    if request.method == "POST":
        city = request.POST['city']
        date = request.POST['date']
        print(city)
        # date=date
        print(date)
        pred = predict_aqi(city, date, loaded_model, historical_data)
        context={"pred":pred, "date":date, "city":city}
        return render(request,"index.html",context=context)
    return render(request,"index.html",)

from prophet import Prophet
import matplotlib.pyplot as plt
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