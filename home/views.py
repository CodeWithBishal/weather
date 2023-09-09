from django.shortcuts import render
from .models import *
from joblib import load
import pandas as pd

# model = load("./Model/model.joblib")
historical_data = pd.read_csv('./Model/.delete/output.csv')

# Create your views here.
def index(request):
    if request.method == "POST":
        city = request.POST['city']
        date = request.POST['date']
        print(city)
        # date=date
        print(date)
        pred = predict_aqi(city, date, historical_data)
        context={"pred":pred, "date":date, "city":city}
        return render(request,"index.html",context=context)
    return render(request,"index.html",)

from prophet import Prophet
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