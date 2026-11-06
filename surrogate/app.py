# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Optional, Literal
import numpy as np
import pandas as pd
import torch
import pathlib

from property_predictor import PropertyPredictor

# ---------- fastapi basics ----------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to http://127.0.0.1:8000
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the website
app.mount("/", StaticFiles(directory="../web", html=True), name="web")

# ---------- load model & data once ----------
torch.set_float32_matmul_precision("high")  # optional
device = torch.device("cpu")

CKPT_PATH = pathlib.Path("./checkpoints/best.pth")
mc = torch.load(CKPT_PATH, map_location=device, weights_only=True)

X_COLS: List[str] = mc["x_cols"]
Y_COLS: List[str] = mc["y_cols"]
y_mean = torch.tensor(mc["y_mean"], dtype=torch.float32, device=device)
y_std  = torch.tensor(mc["y_std"],  dtype=torch.float32, device=device)

model = PropertyPredictor(
    input_dim=len(X_COLS),
    hidden_dim=1024,
    output_dim=len(Y_COLS),
).to(device)
model.load_state_dict(mc["state_dict"])
model.eval()

# Load dataset the model expects (must contain X_COLS)
DF = pd.read_csv("./dataset/Dataset_VisContest_Rapid_Alloy_development_v3.txt",
                 encoding="latin1", sep="\t", usecols=range(70))
X_df = DF[X_COLS].astype(np.float32, copy=False)
X_all = torch.from_numpy(X_df.to_numpy()).to(device)  # (N, D), float32

# Precompute global ranges (for 'global' domain)
x_min_global = X_all.min(dim=0).values
x_max_global = X_all.max(dim=0).values

# ---------- request/response schemas ----------
class CurvesRequest(BaseModel):
    # Boolean mask (length N) OR indices (one is enough)
    selected: Optional[List[bool]] = None
    selected_indices: Optional[List[int]] = None
    # which axes are currently shown 
    x_cols: Optional[List[str]] = None
    y_cols: Optional[List[str]] = None
    # curve sampling
    n_points: int = 100
    # 'local' = min/max over selected rows; 'global' = dataset min/max
    domain: Literal["local","global"] = "local"

class CurvesResponse(BaseModel):
    curves: Dict[str, Dict[str, List[List[float]]]]  # xcol -> ycol -> [[x,y],...]

# ---------- helpers ----------
@torch.no_grad()
def predict_local_curves(
    X_local: torch.Tensor,           # (M, D)
    n_points: int,
    domain: str,                     # 'local' | 'global'
    x_cols: List[str],
    y_cols: List[str],
) -> Dict[str, Dict[str, List[List[float]]]]:
    """
    Replicates widget logic:
      - reference = mean over X_local
      - for each xdim, scan that dimension across [xmin,xmax] (local or global)
      - denormalize outputs using y_std / y_mean
    """
    D = X_all.shape[1]
    assert D == len(x_cols)
    x_ref = X_local.mean(dim=0)  # (D,)

    # choose domain per dimension
    if domain == "local":
        x_min = X_local.min(dim=0).values
        x_max = X_local.max(dim=0).values
    else:
        x_min = x_min_global
        x_max = x_max_global

    result: Dict[str, Dict[str, List[List[float]]]] = {}
    for xdim, xname in enumerate(x_cols):
        x_scan = torch.linspace(x_min[xdim], x_max[xdim], n_points, device=device)
        # (n_points, D)
        x_test = x_ref.unsqueeze(0).repeat(n_points, 1).clone()
        x_test[:, xdim] = x_scan

        y_pred = model(x_test)               # normalized
        y_pred = y_pred * y_std + y_mean     # de-normalize

        # (n_points,) + (n_points, K)
        x_np = x_scan.cpu().numpy()
        y_np = y_pred.cpu().numpy()          # shape (n_points, K)

        # pack per ycol
        y_dict: Dict[str, List[List[float]]] = {}
        for k, yname in enumerate(y_cols):
            pts = np.column_stack([x_np, y_np[:, k]]).tolist()
            y_dict[yname] = pts

        result[xname] = y_dict

    return result

# ---------- endpoint ----------
@app.post("/data/curves.json", response_model=CurvesResponse)
def surrogate_curves(req: CurvesRequest):
    # choose dims to compute for (fall back to full)
    x_cols = req.x_cols if req.x_cols else X_COLS
    y_cols = req.y_cols if req.y_cols else Y_COLS
    # map names -> indices in training order
    # name_to_idx = {n:i for i, n in enumerate(X_COLS)}
    # x_idx = [name_to_idx[n] for n in x_cols]

    # build X_local from selection
    if req.selected_indices:
        sel_idx = np.array(req.selected_indices, dtype=np.int64)
    elif req.selected:
        sel_idx = np.flatnonzero(np.array(req.selected, dtype=bool))
    else:
        sel_idx = np.arange(X_all.shape[0])

    # guard: if empty selection, use whole dataset (or nearest neighbor)
    if sel_idx.size == 0:
        sel_idx = np.arange(X_all.shape[0])

    # subset columns to keep training order for forward()
    X_local_full = X_all[sel_idx, :]             # (M, D)
    curves = predict_local_curves(
        X_local=X_local_full,
        n_points=req.n_points,
        domain=req.domain,
        x_cols=X_COLS,   # full ordering for xdim indexing
        y_cols=Y_COLS,
    )

    # If client only asked for a subset of x/y columns, filter the dict here:
    filtered = {
        x: {y: curves[x][y] for y in y_cols if y in curves[x]}
        for x in x_cols
    }

    return CurvesResponse(curves=filtered)