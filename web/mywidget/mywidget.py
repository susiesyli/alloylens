import pathlib

import anywidget
import numpy as np
import pandas as pd
import traitlets
from traitlets import (Any, Bool, Callable, Dict, Enum, Float, Instance, Int,
                       List, Set, Unicode, default, observe)

#
from .conversions import numpy2json, pandas2json


class MyWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "js-build" / "mywidget.js"
    _css = pathlib.Path(__file__).parent / "css" / "mywidget.css"

    ## define widget attributes as traitlets
    value = traitlets.Int(0).tag(sync=True)
    data = Instance(pd.DataFrame).tag(sync=True, to_json=pandas2json)
    col_attrs = List([]).tag(sync=True)
    row_attrs = List([]).tag(sync=True)
    width = traitlets.Int(0).tag(sync=True)
    height = traitlets.Int(0).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # print(self.col_attrs)

    def __repr__(self):
        """bypass ipywidget's __repr__() from printing Pandas DataFrame"""
        return "MyWidget()"
