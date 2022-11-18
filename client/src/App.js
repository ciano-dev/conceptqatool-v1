import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout, Row, Col } from "antd";
import DraggerUI from "./component/DraggerUI";
import IFrameUI from "./component/IFrameUI";
import SideUI from "./component/SideUI";
import "./App.css";
import logo from "./logo.svg";

const { Content, Footer, Sider } = Layout;

function App() {
  const newObj = {};
  const [state, setState] = React.useState(0);
  const [obj, setObj] = React.useState({});
  const [collapsed, setCollapsed] = React.useState(true);
  const [scollapsed, setSCollapsed] = React.useState(false);
  const textChange = (e) => {
    Object.keys(e).map((data, index) => {
      return (newObj[data] = e[data].text);
    });

    clearTimeout();
    setTimeout(() => {
      setState(state + 1);
      setObj(newObj);
      clearTimeout();
    }, 2000);
  };

  const onCollapse = (e) => {
    setCollapsed(!collapsed);
  };

  const hasSideValue = (e) => {
    setCollapsed(e);
    setSCollapsed(!e);
  };

  const isRefresh = (e) => {
    setState(state + 1);
  };

  return (
    <Router>
      <Layout>
        <Content style={{ padding: "0 50px" }}>
          <Row style={{ margin: "1em 0" }} gutter={[24, 0]}>
            <Col style={{ padding: "0" }}>
              <img src={logo} style={{ width: "2em" }} />
            </Col>
            <Col
              style={{
                display: "flex",
                alignItems: "center",
              }}
              className="title"
            >
              Concept QA Tool
            </Col>
          </Row>
          <Layout className="site-layout-background" id="sider">
            <Switch>
              <React.Fragment>
                <Content
                  style={{
                    minHeight: 280,
                    position: "relative",
                  }}
                >
                  <Route exact path="/">
                    <DraggerUI />
                  </Route>
                  <Route exact path="/:id">
                    <IFrameUI keyx={state} obj={obj} isRefresh={isRefresh} scrolling="auto" />
                  </Route>
                </Content>
              </React.Fragment>
            </Switch>
            <Sider
              className="site-layout-background"
              collapsible={scollapsed}
              collapsed={collapsed}
              width={350}
              style={{
                borderLeft: "1px solid #ececec",
              }}
              collapsedWidth={0}
              onCollapse={onCollapse}
            >
              <Switch>
                <Route exact path="/:id">
                  <SideUI textChange={textChange} hasValue={hasSideValue} />
                </Route>
              </Switch>
            </Sider>
          </Layout>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ad-Lib Innovation PH ©2021
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
