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

    # ---- traits coming back from JS ----
    selected = T.List(T.Bool(), default_value=[]).tag(sync=True)        # boolean per row (view)
    selected_indices = T.List(T.Int(), default_value=[]).tag(sync=True) # positions within the view
    dists = T.List(default_value=[]).tag(sync=True)          # distance score (view)

    # internal references to original df and the sampled view we sent to JS
    _df: pd.DataFrame | None = None
    _view: pd.DataFrame | None = None
    _view_index: list | None = None

    def set_dataframe(self, df: pd.DataFrame, max_rows: int = 50_000,
                      sample: bool = True, random_state: int = 0):
        """Store original df, build a sampled view to send to JS, and keep its index."""
        self._df = df
        if sample and len(df) > max_rows:
            self._view = df.sample(max_rows, random_state=random_state).copy()
        else:
            self._view = df.copy()
        self._view_index = self._view.index.to_list()
        self.data = {
            "columns": list(self._view.columns),
            "records": self._view.to_dict(orient="records"),
        }
        return self

    # ---------- selection helpers ----------
    def selected_mask(self) -> pd.Series:
        """Boolean mask over the *view* (indexed by original df index)."""
        if self._view_index is None:
            return pd.Series(dtype=bool)
        if not self.selected:
            return pd.Series([False]*len(self._view_index), index=self._view_index)
        return pd.Series(self.selected, index=self._view_index)

    def selected_ids(self) -> list[int]:
        """Original df index values for selected rows in the current view."""
        if self._view_index is None:
            return []
        if self.selected_indices:
            return [self._view_index[i] for i in self.selected_indices]
        # derive from mask if indices weren’t provided
        return [idx for idx, flag in zip(self._view_index, self.selected) if flag]

    def selected_dataframe(self, include_dist: bool = False) -> pd.DataFrame:
        """Slice of the original df for the current selection."""
        if self._df is None or self._view_index is None:
            return pd.DataFrame()
        ids = self.selected_ids()
        out = self._df.loc[ids]
        if include_dist and self.dists and len(self.dists) == len(self._view_index):
            dist_s = pd.Series(self.dists, index=self._view_index, name="_dist")
            out = out.join(dist_s).loc[ids]
        return out

    # def set_dataframe(self, df: pd.DataFrame, max_rows: int = 50_000,
    #                   sample: bool = True, random_state: int = 0):
    #     """Safety cap to avoid Jupyter comm size issues."""
    #     if sample and len(df) > max_rows:
    #         df = df.sample(max_rows, random_state=random_state)
    #     self.data = {"columns": list(df.columns),
    #                  "records": df.to_dict(orient="records")}
    #     return self