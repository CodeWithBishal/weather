from django.shortcuts import render
from .models import *
from joblib import load

model = load("./Model/model.joblib")


# Create your views here.
def index(request):
    if request.method == "POST":
        city = request.POST['city']
        date = request.POST['date']
        prediction = model.predict([[city, date]])
        context={"pred":prediction}
        return render(request,"index.html",context=context)
    return render(request,"index.html",)