from django.http import JsonResponse
from django.shortcuts import render
from .models import *
from joblib import load
import pandas as pd
import pickle
import requests
import json
from django.views.decorators.csrf import csrf_exempt

historical_data = pd.read_csv("/var/www/weather/Model/new/2nd_exp.csv")

# Create your views here.
@csrf_exempt
def index(request):
    if request.method == "POST":
        post_data = json.loads(request.body)
        city = post_data["city"]
        date = post_data["date"]
        pred = predict_aqi(city, date, historical_data)
        pred1 = predict_aqi(city, date, historical_data)
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
def predict_aqi(city, date, df):
    city_df = df[df['City']==city].copy()
    global model
    model = Prophet(
        seasonality_prior_scale=5.0,
    )
    model.fit(city_df)
    future = pd.DataFrame({'ds': pd.to_datetime([date])})
    forecast = model.predict(future)
    predicted = forecast.loc[0:'yhat']
    return predicted