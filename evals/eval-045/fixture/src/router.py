class Router:
    """add(method, path, handler); match(method, path) -> (handler, params) or None.
    Path segments starting with : are params, e.g. /u/:id"""
    def __init__(self):
        raise NotImplementedError
