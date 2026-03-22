from tensorflow.keras.models import load_model
from tensorflow.keras.layers import InputLayer

model = load_model(
    "models_saved/unet_territories.h5",
    compile=False,
    custom_objects={"InputLayer": InputLayer}
)