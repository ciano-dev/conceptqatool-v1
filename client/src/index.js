import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import PreviewUI from "./component/PreviewUI";
import reportWebVitals from "./reportWebVitals";
import { createBrowserHistory } from "history";

const customHistory = createBrowserHistory();

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path="/shareable/:id">
          <PreviewUI />
        </Route>
        <Route path="/">
          <App history={customHistory} />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
