import React from "react";
import Iframe from "react-iframe";
import QRCode from "qrcode";
import { BrowserView } from "react-device-detect";
import { useHistory } from "react-router-dom";
import axios from "axios";

import { Layout, PageHeader, Row, Col, Button, Popover } from "antd";

import { QrcodeOutlined } from "@ant-design/icons";
const { Content, Footer } = Layout;

const PreviewUI = () => {
  const [state, setState] = React.useState({});
  const [dv, setDV] = React.useState({});
  const [qrCode, setQRCode] = React.useState(null);
  let history = useHistory();
  const getMDBId = history.location.pathname.replace("/shareable/", "");
  React.useEffect(() => {
    if (getMDBId !== "") {
      axios
        .get("/api/getPreviewSingle", {
          params: {
            mdbId: getMDBId,
          },
        })
        .then((response) => {
          setState(response.data);
          setDV(response.data.defaultValues);
        });
      //get preview lists
      //getPreview();
    }
  }, [getMDBId]);

  const loaded = (e) => {
    e.target.contentWindow.postMessage(
      dv,
      `https://storage.googleapis.com/${state.url}/${
        state.uid
      }/${decodeURIComponent(state.directory)}/index.html`
    );
  };

  const generateQR = (e) => {
    QRCode.toDataURL(`${window.location.href}`)
      .then((url) => {
        document.querySelector("#qrImg").src = url;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ padding: "0 1rem" }}>
          <PageHeader
            title={<p className="title">{state.directory}</p>}
            extra={[
              <BrowserView key={1}>
                <Popover
                  key={2}
                  placement="bottomRight"
                  content={<img id="qrImg" />}
                  trigger="click"
                  onVisibleChange={generateQR}
                >
                  <Button
                    key={3}
                    icon={<QrcodeOutlined />}
                    style={{ color: "black" }}
                  >
                    QR Code
                  </Button>
                </Popover>
              </BrowserView>,
            ]}
            style={{ padding: "16px 0" }}
          ></PageHeader>

          <Layout
            className="site-layout-background"
            style={{ padding: "24px 0" }}
          >
            <Content style={{ padding: "0 8px", minHeight: 280 }}>
              <Row
                type="flex"
                justify="center"
                style={{
                  background: "#ececec",
                  minHeight: "500px",
                  alignItems: "center",
                }}
              >
                <Col>
                  {Object.keys(state).length !== 0 ? (
                    
                    <Iframe
                      key={1}
                      url={`https://storage.googleapis.com/${state.url}/${
                        state.uid
                      }/${decodeURIComponent(state.directory)}/index.html`}
                      width={`${state.width}px`}
                      height={`${state.height}px`}
                      id="innov-iframe"
                      className="innov-iframe"
                      display="initial"
                      position="relative"
                      onLoad={(e) => loaded(e)}
                      scrolling="auto"
                    />
                  ) : null}
                </Col>
              </Row>
            </Content>
          </Layout>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ad-Lib Innovation PH ©2021
        </Footer>
      </Layout>
    </div>
  );
};

export default PreviewUI;
