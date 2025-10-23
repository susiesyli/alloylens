"""AlloyLens

Expose a small API for the AlloyLens package so users can import
`load`, etc from the package root: `from example_package_susiesyli import add_one`.
"""

# public API sketch: 
# from alloylens import AlloyLens, load_dataframe, splom, neighbors

from ._version import __version__
from .core import AlloyLens, load_dataframe
from .splom import splom
from .metrics import neighbors

__all__ = ["__version__", "AlloyLens", "load_dataframe", "splom", "neighbors"]
