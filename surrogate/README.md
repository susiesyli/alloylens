# AlloyLens surrogate model

The model that predicts alloy properties from composition. The web demo doesn't run it: it reads curves precomputed by `notebooks/generate_curves.ipynb` from `web/data/curves.json`.

- `property_predictor.py`: the model definition
- `checkpoints/`: trained model weights
- `notebooks/surrogate.ipynb`: model training
- `notebooks/generate_curves.ipynb`: generates `web/data/curves.json`
- `app.py`: an optional FastAPI backend that computes curves on request

Training and `app.py` need the full contest dataset in `surrogate/dataset/`, which isn't included in this repository. Run `app.py` from this folder.
