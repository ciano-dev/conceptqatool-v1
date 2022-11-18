import React from "react";
import Iframe from "react-iframe";
import { useHistory } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  PageHeader,
  Popover,
  Divider,
  Input,
  Menu,
  message,
  Alert,
  Typography,
} from "antd";
import {
  AppstoreAddOutlined,
  CodeSandboxOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  LinkOutlined,
  ReloadOutlined,
  LayoutOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";

const IFrameUI = (props) => {
  let history = useHistory();
  const { Text } = Typography;
  const [state, setState] = React.useState({});
  const [dv, setDV] = React.useState({});
  const [timer, setTimer] = React.useState(0);
  const [isPause, setIsPause] = React.useState(false);
  const getMDBId = history.location.pathname.replace("/", "");
  // save to preview
  const [popVisible, setPopVisible] = React.useState(false);
  const [text, setText] = React.useState(null);
  const [dataList, setDataList] = React.useState([]);

  React.useEffect(() => {
    if (getMDBId !== "") {
      axios
        .get("/api/getCreative", {
          params: {
            mdbId: getMDBId,
          },
        })
        .then((response) => {
          setState(response.data);
          setDV(response.data.defaultValue);
        });
      //get preview lists
      //getPreview();
    }
  }, [getMDBId]);

  const getPreview = () => {
    axios
      .get("/api/getPreview", {
        params: {
          mdbId: getMDBId,
        },
      })
      .then((response) => {
        setDataList(response.data);
      });
  };

  let interval = null;
  const loaded = (e) => {
    window.addEventListener("message", (event) => {}, false);

    if (Object.keys(props.obj).length !== 0) {
      Object.keys(props.obj).map((data, index) => {
        return (dv[data] = props.obj[data]);
      });
      // dv[Object.keys(props.obj)] = props.obj[Object.keys(props.obj)];
      setDV(dv);
      setIsPause(false);
    }

    e.target.contentWindow.postMessage(
      dv,
      `https://storage.googleapis.com/${state.url}/${
        state.uid
      }/${decodeURIComponent(state.directory)}/index.html`
    );

    document.addEventListener("visibilitychange", () => setIsPause(false));
  };

  const setPlayPause = () => {
    setIsPause(!isPause);

    document
      .querySelector(".innov-iframe")
      .contentWindow.postMessage(
        !isPause ? "pause" : "play",
        `https://storage.googleapis.com/${state.url}/${
          state.uid
        }/${decodeURIComponent(state.directory)}/index.html`
      );
  };

  const handleVisibleChange = () => {
    setPopVisible(!popVisible);
  };
  const onSavePreview = (e) => {
    setPopVisible(false);
  };

  const onAddTextList = (e) => {
    setText(e.target.value);
  };

  const addList = (e) => {
    if (text === null) {
      message.error(`The value is blank`);
    } else {
      setDataList([...dataList, text]);
      setText(null);

      axios
        .post("/api/addPreview", { previewNode: text, cId: getMDBId })
        .then((res) => {
          //getPreview();
        });
    }
  };

  const shareSingle = () => {
    axios
      .post("/api/addPreviewSingle", {
        previewNane: state.directory,
        cId: getMDBId,
        defaultValues: dv,
        ur: state.url,
        uid: state.uid,
        directory: state.directory,
        width: state.width,
        height: state.height,
      })
      .then((res) => {
        window.open(`/shareable/${res.data._id}`, "_blank");
        window.focus();
      });
  };

  const menu = (
    <div>
      {dataList.length !== 0 ? (
        <Menu mode="inline" style={{ border: 0 }} onClick={onSavePreview}>
          {dataList.map((arr, index) => {
            return (
              <Menu.Item key={index} style={{ margin: 0, padding: 0 }}>
                {arr.previewName}
              </Menu.Item>
            );
          })}
        </Menu>
      ) : (
        <Alert
          message="No predefined previews"
          type="warning"
          showIcon
          style={{ marginBottom: ".8em" }}
        />
      )}
      <Divider style={{ margin: "4px 0" }} />
      <div style={{ display: "flex", flexWrap: "nowrap", padding: 8 }}>
        <Input
          style={{ flex: "auto" }}
          value={text}
          placeholder="New Item"
          onChange={onAddTextList}
        />
        <a
          style={{
            flex: "none",
            padding: "8px",
            display: "block",
            cursor: "pointer",
          }}
          onClick={addList}
        >
          <PlusOutlined /> Add item
        </a>
      </div>
    </div>
  );

  const onRefresh = () => {
    props.isRefresh();
    setIsPause(false);
  };

  return (
    <React.Fragment>
      <PageHeader
        ghost={false}
        title={
          <span>
            <LayoutOutlined style={{ color: "#fff", marginRight: "0.3em" }} />{" "}
            {state.directory}
          </span>
        }
        extra={[
          //   <Popover
          //     placement="bottomRight"
          //     content={menu}
          //     key={1}
          //     visible={popVisible}
          //     onVisibleChange={handleVisibleChange}
          //   >
          //     <Button
          //       type="dashed"
          //       icon={<AppstoreAddOutlined />}
          //       size="middle"
          //       key={3}
          //     >
          //       Add to Preview
          //     </Button>
          //   </Popover>,
          <Button
            type="link"
            className="listBtn"
            size="middle"
            key={2}
            icon={<LinkOutlined />}
            onClick={shareSingle}
          >
            Share
          </Button>,
        ]}
        className="pageHeader"
      ></PageHeader>

      <Row
        type="flex"
        justify="center"
        style={{
          background: "#ececec",
          padding: "2em",
          minHeight: "600px",
          alignItems: "center",
          margin: "10px",
        }}
      >
        {Object.keys(state).length !== 0 ? (
          <Col className="iframeContainer">
            <Iframe
              key={props.keyx}
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

            <Row style={{ color: "#f22176" }}>
              <Col span={12}>
                <Row gutter={[8, 0]}>
                  <Col>
                    <CodeSandboxOutlined />{" "}
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#f22176",
                        fontWeight: "bold",
                      }}
                    >{`${state.width}x${state.height}`}</Text>
                  </Col>
                  <Col>
                    <ClockCircleOutlined style={{ display: "none" }} />{" "}
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#f22176",
                        fontWeight: "bold",
                        display: "none",
                      }}
                    >
                      {timer}
                    </Text>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row justify="end">
                  <Col>
                    <Button
                      type="link"
                      icon={
                        isPause ? (
                          <PlayCircleOutlined />
                        ) : (
                          <PauseCircleOutlined />
                        )
                      }
                      size="small"
                      style={{
                        color: "#f22176",
                        width: "auto",
                        height: "auto",
                      }}
                      onClick={setPlayPause}
                    ></Button>
                  </Col>
                  <Col>
                    <Button
                      type="link"
                      icon={<ReloadOutlined />}
                      size="small"
                      style={{
                        color: "#f22176",
                        width: "auto",
                        height: "auto",
                      }}
                      onClick={onRefresh}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        ) : null}
      </Row>
    </React.Fragment>
  );
};

export default IFrameUI;
