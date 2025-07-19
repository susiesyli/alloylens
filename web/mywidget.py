import anywidget
import traitlets

class MyWidget(anywidget.AnyWidget):
    _esm = "mywidget.js"
    _css = "mywidget.css"
    value = traitlets.Int(0).tag(sync=True)

