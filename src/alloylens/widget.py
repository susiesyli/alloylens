# AnyWidget class & Python API for AlloyLens

from __future__ import annotations
import importlib.resources as r
import anywidget, traitlets as T
import pandas as pd

def _read(p: str) -> str:
    return r.files("alloylens").joinpath(p).read_text(encoding="utf-8")

class AlloyLensWidget(anywidget.AnyWidget):
    """Public widget users will import."""
    _esm = _read("js-build/mywidget.js")

    # synced traits the JS expects
    data = T.Any(default_value=None).tag(sync=True)               # {columns, records}
    row_attrs = T.List(T.Unicode(), default_value=[]).tag(sync=True)
    col_attrs = T.List(T.Unicode(), default_value=[]).tag(sync=True)
    subplot_width  = T.Int(150).tag(sync=True)
    subplot_height = T.Int(150).tag(sync=True)

    selected_indices = T.List(T.Int(), default_value=[]).tag(sync=True)

    def set_dataframe(self, df: pd.DataFrame, max_rows: int = 50_000,
                      sample: bool = True, random_state: int = 0):
        """Safety cap to avoid Jupyter comm size issues."""
        if sample and len(df) > max_rows:
            df = df.sample(max_rows, random_state=random_state)
        self.data = {"columns": list(df.columns),
                     "records": df.to_dict(orient="records")}
        return self


# import importlib.resources as r
# import anywidget, traitlets as T

# def _read(p): return r.files("alloylens").joinpath(p).read_text(encoding="utf-8")

# class AlloyLensWidget(anywidget.AnyWidget):
#     _esm = _read("js-build/mywidget.js")
#     _css = _read("css/mywidget.css")

#     data = T.Any(default_value=None).tag(sync=True)
#     row_attrs = T.List(T.Unicode(), default_value=[]).tag(sync=True)
#     col_attrs = T.List(T.Unicode(), default_value=[]).tag(sync=True)
#     subplot_width  = T.Int(150).tag(sync=True)
#     subplot_height = T.Int(150).tag(sync=True)

#     # selection coming back from JS (optional)
#     selected_indices = T.List(T.Int(), default_value=[]).tag(sync=True)

    
# class AlloyLensWidget(anywidget.AnyWidget):
#     _esm = r.files("alloylens").joinpath("js-build/mywidget.js").read_text(encoding="utf-8")
#     theme = T.Unicode("light").tag(sync=True)