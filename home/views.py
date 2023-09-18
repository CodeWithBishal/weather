from django.shortcuts import render
from .models import *
from joblib import load
import pandas as pd
import pickle
import requests
from decouple import config

# debug = config('DEBUG')

# if not debug:
#     path = "/var/www/weather/Model/new/"
# else:
#     path = "./Model/new/"
# # path = "./Model/new/"
# with open(path+'main_final_model.pkl', 'rb') as model_file:
#     loaded_model = pickle.load(model_file)
# historical_data = pd.read_csv(path+"2nd_exp.csv")

# Create your views here.
def index(request):
    if request.method == "POST":
        city = request.POST['city']
        date = request.POST['date']
        pred = predict_aqi(city, date, loaded_model, historical_data)
        api_key = 'ab909bfc29fc6d1a9010f00d8f3530d1'
        weather_data_req = requests.get(f'https://api.openweathermap.org/data/2.5/weather?q={city}&units=imperial&APPID={api_key}')
        weather_data = weather_data_req.json()
        desc = weather_data['weather'][0]['description']
        temp = 5/9*(weather_data['main']['temp'] - 32)
        humi = weather_data['main']['humidity']
        context={"pred":pred, "date":date, "city":city,"desc":desc,"temp":temp,"humi":humi}
        return render(request,"index.html",context=context)
    return render(request,"index.html",)

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