from django.http import JsonResponse
from django.shortcuts import render
from .models import *
from joblib import load
import pandas as pd
import pickle
import requests
import json
from django.views.decorators.csrf import csrf_exempt


with open('/var/www/weather/Model/pakka_final_model.pkl', 'rb') as model_file:
    loaded_model = pickle.load(model_file)
historical_data = pd.read_csv("/var/www/weather/Model/output.csv")

# Create your views here.
@csrf_exempt
def index(request):
    if request.method == "POST":
        post_data = json.loads(request.body)
        city = post_data["city"]
        date = post_data["date"]
        pred = predict_aqi(city, date, loaded_model, historical_data)
        pred1 = predict_aqi(city, date, loaded_model, historical_data)
        label = "undefined"
        if pred<=50:
            pred = "Good"
            label = "1"
        elif pred<=100 and pred>50:
            pred = "Fair"
            label = "2"
        elif pred<=150 and pred>100:
            pred = "Moderate"
            label = "3"
        elif pred<=200 and pred>150:
            pred = "Poor"
            label = "4"
        else:
            pred = "Very Poor"
            label = "5"

        response_data = {"label":label, "pred":pred, "pred":pred1}
        return JsonResponse(response_data)
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