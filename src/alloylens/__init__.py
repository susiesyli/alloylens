"""AlloyLens

Expose a small API for the AlloyLens package so users can import
"""

# public API sketch: 

# usage:
# from alloylens.widget import AlloyLensWidget
# w = AlloyLensWidget(
#     data=df,                      # pandas DataFrame the user provides
#     col_attrs=[...],
#     row_attrs=[...],
#     subplot_width=150,
#     subplot_height=150,
#     surrogate=True,
# )
# w

from .ui import AlloyLensApp, splom
from .widget import AlloyLensWidget
from .test import say_hello
from importlib.metadata import version, PackageNotFoundError

try:
    __version__ = version("alloylens")
except PackageNotFoundError:
    __version__ = "0.0.0"


__all__ = ["AlloyLensApp", "splom",
            "say_hello",
            "AlloyLensWidget",
            "__version__"]