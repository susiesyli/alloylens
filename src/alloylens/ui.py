# SPDX-License-Identifier: MIT
# alloylens/ui.py
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List, Optional, Sequence

import ipywidgets as W
import pandas as pd
from IPython.display import display

from .widget import AlloyLensWidget

def _numeric_columns(df: pd.DataFrame) -> List[str]:
    return df.select_dtypes(include=["number"]).columns.tolist()

@dataclass
class Groups:
    """Optional named column groups for convenience in the UI."""
    elements: Sequence[str] = field(default_factory=list)
    properties: Sequence[str] = field(default_factory=list)
    microstructures: Sequence[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: Dict[str, Sequence[str]]) -> "Groups":
        return cls(
            elements=d.get("elements", []),
            properties=d.get("properties", []),
            microstructures=d.get("microstructures", []),
        )

class AlloyLensApp(W.VBox):
    """
    Notebook UI: a checkbox bank + Apply button that renders AlloyLensWidget.

    Parameters
    ----------
    df : pd.DataFrame
        Source data.
    groups : Dict[str, Sequence[str]] | Groups
        Optional named groups (e.g., {'elements': [...], 'properties': [...]}).
        Only used to help users pick columns; the widget itself only needs
        row_attrs and col_attrs.
    row_group : str
        Which named group populates the *row* checkboxes by default.
    col_group : str
        Which named group populates the *columns* (fixed) by default.
    subplot_width, subplot_height : int
        Tile size passed through to the widget.
    max_rows : int
        Sample/limit passed to widget.set_dataframe for perf.
    """

    def __init__(
        self,
        df: pd.DataFrame,
        groups: Dict[str, Sequence[str]] | Groups = None,
        *,
        x: str = "elements",
        y: str = "properties",
        subplot_width: int = 120,
        subplot_height: int = 120,
        max_rows: int = 50_000,
        checkbox_width: int = 160,
        checkbox_area_width: int = 1250,
        checkbox_area_height: int = 220,
    ):
        super().__init__()

        self.df = df.fillna(0)
        self.numeric = set(_numeric_columns(self.df))
        self.groups = Groups.from_dict(groups or {}) if not isinstance(groups, Groups) else groups
        self.row_group = y
        self.col_group = x
        self.subplot_width = subplot_width
        self.subplot_height = subplot_height
        self.max_rows = max_rows

        # --- controls
        self._checkboxes = self._build_checkboxes(
            getattr(self.groups, self.row_group, []),
            checkbox_width=checkbox_width,
        )
        self._checkbox_box = W.HBox(
            self._checkboxes,
            layout=W.Layout(
                display="flex",
                flex_flow="row wrap",
                justify_content="flex-start",
                border="1px solid #ccc",
                width=f"{checkbox_area_width}px",
                max_height=f"{checkbox_area_height}px",
                overflow="auto",
            ),
        )

        # action buttons
        self._apply = W.Button(description="Apply", button_style="primary")
        self._select_all = W.Button(description="Select all")
        self._clear_all = W.Button(description="Clear all")
        self._out = W.Output()

        # wire up actions
        self._apply.on_click(self._on_apply)
        self._select_all.on_click(lambda _btn: self.select_all())
        self._clear_all.on_click(lambda _btn: self.clear_all())

        # initial render
        header = W.Label("Select features to plot:")
        controls = W.HBox([self._select_all, self._clear_all, self._apply], layout=W.Layout(gap="6px"))
        self.children = (header, self._checkbox_box, controls, self._out)

        # expose the inner widget later (after first Apply)
        self.widget: Optional[AlloyLensWidget] = None

    # ------------- public helpers -------------

    def set_dataframe(self, df: pd.DataFrame) -> "AlloyLensApp":
        self.df = df.fillna(0)
        self.numeric = set(_numeric_columns(self.df))
        return self

    def select_all(self) -> None:
        for cb in self._checkboxes:
            cb.value = True

    def clear_all(self) -> None:
        for cb in self._checkboxes:
            cb.value = False

    # ------------- internals -------------

    def _build_checkboxes(
        self, cols: Iterable[str], *, checkbox_width: int
    ) -> List[W.Checkbox]:
        # Only show numeric columns; keep order as given
        cols = [c for c in cols if c in self.numeric]
        return [
            W.Checkbox(
                # value=(c in cols),
                value=True,
                description=c,
                indent=False,
                layout=W.Layout(width=f"{checkbox_width}px"),
            )
            # for c in sorted(self.numeric)  # still let user pick any numeric
            for c in cols
        ]

    def _current_selection(self) -> List[str]:
        return [cb.description for cb in self._checkboxes if cb.value and cb.description in self.numeric]

    def _on_apply(self, _btn):
        row_attrs = self._current_selection()
        if not row_attrs:
            with self._out:
                self._out.clear_output(wait=True)
                print("Pick at least one numeric column.")
            return

        # columns fixed from group; fall back to "all numeric"
        col_attrs = list(getattr(self.groups, self.col_group, [])) or sorted(self.numeric)

        # Build/refresh the AlloyLensWidget
        w = AlloyLensWidget(
            subplot_width=self.subplot_width,
            subplot_height=self.subplot_height,
        ).set_dataframe(self.df, max_rows=self.max_rows)

        w.row_attrs = row_attrs
        w.col_attrs = col_attrs

        self.widget = w  # keep a reference for programmatic updates

        with self._out:
            self._out.clear_output(wait=True)
            print("You selected:", row_attrs)
            display(w)


# --------- one-liner convenience (no UI) ---------

def splom(
    df: pd.DataFrame,
    *,
    row_attrs: Sequence[str],
    col_attrs: Sequence[str],
    subplot_width: int = 120,
    subplot_height: int = 120,
    max_rows: int = 50_000,
) -> AlloyLensWidget:
    """Direct SPLOM display from a DataFrame (no checkboxes)."""
    w = AlloyLensWidget(subplot_width=subplot_width, subplot_height=subplot_height)
    w = w.set_dataframe(df.fillna(0), max_rows=max_rows)
    w.row_attrs = list(row_attrs)
    w.col_attrs = list(col_attrs)
    return w