import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Frontpage from "./frontpage";
import NotFound from "./NotFound";
import client from "./client";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    client
      .authenticate()
      .then(() => {})
      .catch((e) => {
        this.setState({ user: null });
      });

    client.on("authenticated", (user) => {
      this.setState({ user: user.user });
    });

    client.on("logout", () => {
      this.setState({
        user: null,
      });
      window.location.reload();
    });
  }

  render() {
    if (this.state.user === undefined) {
      return null;
    }
    return (
      <div className="clips-absolute clips-bottom-0 clips-flex clips-flex-column clips-flex-nowrap clips-left-0 clips-overflow-hidden clips-right-0 clips-top-0">
        <BrowserRouter>
          <Switch>
            <Route
              exact
              path="/"
              render={(props) => (
                <div className="clips-root clips-flex clips-flex-column clips-flex-nowrap clips-full-height">
                  <Frontpage user={this.state.user} {...props} />
                </div>
              )}
            />
            <Route
              render={(props) => (
                <div className="clips-root clips-flex clips-flex-column clips-flex-nowrap clips-full-height">
                  <NotFound {...props} />
                </div>
              )}
            />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
