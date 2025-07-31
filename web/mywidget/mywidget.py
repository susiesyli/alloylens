import os
import pathlib
from time import time

import anywidget
import numpy as np
import pandas as pd
import torch
# import torch.nn as nn
import traitlets
from traitlets import (Any, Bool, Callable, Dict, Enum, Float, Instance, Int,
                       List, Set, Unicode, default, observe)

from .conversions import numpy2json, pandas2json
from .PropertyPredictor import PropertyPredictor

# import torch.optim as optim
# from torch.utils.data import DataLoader, TensorDataset


class MyWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "js-build" / "mywidget.js"
    _css = pathlib.Path(__file__).parent / "css" / "mywidget.css"

    ## define widget attributes as traitlets
    value = traitlets.Int(0).tag(sync=True)
    data = Instance(pd.DataFrame).tag(sync=True, to_json=pandas2json)
    col_attrs = List([]).tag(sync=True)
    row_attrs = List([]).tag(sync=True)
    x_cols = List([]).tag(sync=True)
    y_cols = List([]).tag(sync=True)
    surrogate = Bool(True).tag(sync=True)

    width = Float(0).tag(sync=True)
    height = Float(0).tag(sync=True)
    subplot_width = Float(0).tag(sync=True)
    subplot_height = Float(0).tag(sync=True)

    ## output / retunables from widget
    selected = List([]).tag(sync=True)
    dists = List([]).tag(sync=True)
    curves = Dict({}).tag(sync=True)
    # curves_updated = Float(0.0).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        selected = [1, 2, 3]
        # load model checkpoint (mc)
        # current_directory = os.getcwd()
        # print("Current Working Directory:", current_directory)

        # load surrogate model
        if self.surrogate:
            model_path = pathlib.Path("./model_checkpoint/best.pth")
            self.model_checkpoint = torch.load(model_path, weights_only=True)
            mc = self.model_checkpoint  # shorthand
            # init model
            self.model = PropertyPredictor(
                input_dim=len(mc["x_cols"]),
                hidden_dim=1024,
                output_dim=len(mc["y_cols"]),
            )
            # load weights
            self.model.load_state_dict(mc["state_dict"])
            self.x_cols = self.model_checkpoint["x_cols"]
            self.y_cols = self.model_checkpoint["y_cols"]
            self.y_mean = self.model_checkpoint["y_mean"]
            self.y_std = self.model_checkpoint["y_std"]

            self.X = torch.from_numpy(
                self.data[self.model_checkpoint["x_cols"]]
                .to_numpy()
                .astype(np.float32),
            )
            self.x_min = self.X.min(axis=0).values
            self.x_max = self.X.max(axis=0).values
        # self.x_extent = torch.stack([self.x_min, self.x_max], dim=1)
        # print(f"surrogate model at '{model_path}' does not exist.")
        # self.model = None

    @observe("selected")
    def _observe_selected(self, change):
        if self.surrogate:
            # response to value change triggered by JavaScript model.set('selected', ...)
            subsets = change.new
            # print("selected changed", subsets)
            x_cols = self.model_checkpoint[
                "x_cols"
            ]  # surrogate models input feature names
            # print("x_cols", x_cols)
            X_local = self.data[x_cols][subsets].to_numpy()
            curves = {}
            for xdim in range(len(x_cols)):
                curves[x_cols[xdim]] = self.predict_local(X_local, xdim=xdim)
            ## this triggers js update (see mywidget.js: model.on("change:curves"))
            self.curves = curves

        # custom message to JS can be monitored frm JS via model.on("msg:custom", (msg) => {})
        # self.send(dict(event="trans"))

    def predict_local(
        self,
        X_local,
        xdim=0,
        num_points_on_curve=100,
    ):
        """
        description

        Parameters
        ----------
        X_local: numpy array, shape == [n_records, n_input_dim]
            Set of points to compute reference center that surrogate model condition on
        xdim: Int, default 0
            Scanning dimension to compute the curve
        num_points_on_curve: Int, default 100
            Number of points the polyline curve is computed on

        Returns
        -------
        y_curves: numpy array, shape == [num_points_on_curve, model_output_dim]
            set of curves that is scanned over xdim
        """
        x_cols = self.x_cols
        y_cols = self.y_cols
        X_local = torch.from_numpy(X_local.astype(np.float32))
        model = self.model

        x_ref = X_local.mean(axis=0)
        # print("X_local", X_local.shape)
        # print("x_ref", x_ref.shape)
        # print(x_ref)
        r = torch.arange(len(x_cols))
        all_except_current = r != xdim

        # model prediction curve
        n = num_points_on_curve
        x_test = x_ref.repeat([n, 1])

        # set the domain of the curve
        # option1: plot curve on the entire data domain
        # xmin, xmax = (
        #     self.x_min[xdim],
        #     self.x_max[xdim],
        # )
        # option2: only plot curve on local selected domain
        xmin, xmax = (
            X_local[:, xdim].min(),
            X_local[:, xdim].max(),
        )
        # x_test[:, xdim] = torch.linspace(self.x_min[xdim], self.x_max[xdim], n)
        x_test[:, xdim] = torch.linspace(xmin, xmax, n)
        # print("x_test", x_test.shape)
        # print(x_test)

        x_curve = x_test[:, xdim]
        with torch.no_grad():
            y_curves = model(x_test)
            y_curves = y_curves * self.y_std + self.y_mean  # de-normalize

        x_curve = x_curve.cpu().numpy()  # shape (n,)
        y_curves = y_curves.cpu().numpy()  # shape (n, output_dim)
        return {
            y_col: np.c_[x_curve, y_curve].tolist()
            for y_col, y_curve in zip(y_cols, y_curves.T)
        }

    def __repr__(self):
        """bypass ipywidget's __repr__() from printing Pandas DataFrame"""
        return "MyWidget()"
