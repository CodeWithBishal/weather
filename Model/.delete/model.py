import warnings
warnings.filterwarnings('ignore')
import numpy as np
import pickle 


load_model = pickle.load(open('final_model.pkl', 'rb'))