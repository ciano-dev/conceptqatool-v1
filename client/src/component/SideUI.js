import React from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Input,
  InputNumber,
  Card,
  Divider,
  Button,
  Row,
  Col,
  Menu,
  Dropdown,
  Select,
  Skeleton,
} from "antd";

import {
  FontSizeOutlined,
  FontColorsOutlined,
  TranslationOutlined,
  FlagOutlined,
} from "@ant-design/icons";

import { languageData } from "../language";

const SideUI = (props) => {
  let history = useHistory();
  const { Option } = Select;
  const [state, setState] = React.useState({});
  const [pValues, setPValues] = React.useState({});
  const [skLoad, setSKLoad] = React.useState(true);
  const [language, setLanguage] = React.useState("Select Language");
  const [form] = Form.useForm();

  const getMDBId = history.location.pathname.replace("/", "");

  React.useEffect(() => {
    if (getMDBId !== "") {
      axios
        .get("/api/getCreative", {
          params: {
            mdbId: getMDBId,
          },
        })
        .then((response) => {
          const tstObj = {};
          Object.keys(response.data.defaultValue).map((data, index) => {
            return (tstObj[data] = {
              text: response.data.defaultValue[data],
              textIsCap: false,
              textMax: null,
            });
          });
          setState(tstObj);
          setPValues(response.data.possibleValue);
          props.hasValue(false);
        });
    }
  }, [getMDBId]);

  const onTextChange = (e) => {
    const newState = { ...state };
    newState[e.target.name].text = e.target.value;
    setState(newState);
    props.textChange(state);
  };

  const onSelectChange = (e, d) => {
    const newState = { ...state };
    newState[d].text = e;
    setState(newState);
    props.textChange(state);
  };

  const onTextResize = (d) => {
    const newState = { ...state };

    newState[d].textIsCap = !newState[d].textIsCap;

    !newState[d].textIsCap
      ? (newState[d].text = newState[d].text
          .toLowerCase()
          .replace(/\.\s+([a-z])|^(\s*[a-z])/g, (s) =>
            s.replace(/([a-z])/, (s) => s.toUpperCase())
          ))
      : (newState[d].text = newState[d].text.toUpperCase());

    setState(newState);
    props.textChange(state);
  };

  const onMaxChange = (e, d) => {
    const newState = { ...state };

    newState[d].textMax = e;
    newState[d].text = !newState[d].textIsCap
      ? languageData[language]
          .toLowerCase()
          .replace(/\.\s+([a-z])|^(\s*[a-z])/g, (s) =>
            s.replace(/([a-z])/, (s) => s.toUpperCase())
          )
          .substr(0, e)
      : languageData[language].substr(0, e).toUpperCase();
    setState(newState);
    props.textChange(state);
  };

  const handleMenuClick = (e) => {
    setLanguage(e.domEvent.target.textContent);
    setSKLoad(false);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {Object.keys(languageData).map((data, index) => {
        return (
          <Menu.Item key={index} icon={<FlagOutlined />}>
            {data}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <Card style={{ border: 0 }}>
      <Row justify="end">
        <Col>
          <Dropdown overlay={menu}>
            <Button type="text" size="small">
              {language}
              <TranslationOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>

      <Divider orientation="left">Dynamic Elements</Divider>
      <Form layout="vertical" form={form}>
        {Object.keys(state).map((obj, index) => {
          if (
            ![
              "image",
              "logo",
              "img",
              "background",
              "roundel",
              "video",
              "audio",
              "packshot",
            ].some((t) => obj.toLowerCase().includes(t))
          ) {
            return (
              <Form.Item
                name={obj}
                label={obj}
                key={index}
                rules={[{ required: true }]}
              >
                {pValues !== undefined ? (
                  typeof pValues[obj] !== "undefined" ||
                  pValues[obj] !== undefined ? (
                    <Input.Group>
                      <Select
                        name={obj}
                        defaultValue={state[obj].text}
                        style={{ width: "100%" }}
                        onChange={(e) => onSelectChange(e, obj)}
                      >
                        {pValues[obj].split(",").map((pval, pindex) => {
                          return (
                            <Option
                              value={pval.split('')[0] === " "? pval.split('').slice(1).join(""): pval}
                              key={pindex}
                            >
                              {pval.split('')[0] === " "? pval.split('').slice(1).join(""): pval}
                            </Option>
                          );
                        })}
                      </Select>
                    </Input.Group>
                  ) : (
                    <Input.Group>
                      <Input
                        name={obj}
                        value={state[obj].text}
                        style={{ width: "80%" }}
                        onChange={(e) => onTextChange(e)}
                        suffix={
                          <Button
                            type="text"
                            size="small"
                            block
                            style={{ height: "21px" }}
                            onClick={() => onTextResize(obj)}
                          >
                            {state[obj].textIsCap ? (
                              <FontSizeOutlined />
                            ) : (
                              <FontColorsOutlined />
                            )}
                          </Button>
                        }
                      />
                      <InputNumber
                        value={state[obj].textMax}
                        style={{ width: "20%" }}
                        placeholder="Max"
                        min={0}
                        onChange={(e) => onMaxChange(e, obj)}
                        disabled={skLoad}
                      />
                    </Input.Group>
                  )
                ) : (
                  <Input.Group>
                    <Input
                      name={obj}
                      value={state[obj].text}
                      style={{ width: "80%" }}
                      onChange={(e) => onTextChange(e)}
                      suffix={
                        <Button
                          type="text"
                          size="small"
                          block
                          style={{ height: "21px" }}
                          onClick={() => onTextResize(obj)}
                        >
                          {state[obj].textIsCap ? (
                            <FontSizeOutlined />
                          ) : (
                            <FontColorsOutlined />
                          )}
                        </Button>
                      }
                    />
                    <InputNumber
                      value={state[obj].textMax}
                      style={{ width: "20%" }}
                      placeholder="Max"
                      min={0}
                      onChange={(e) => onMaxChange(e, obj)}
                      disabled={skLoad}
                    />
                  </Input.Group>
                )}
              </Form.Item>
            );
          } else {
            return null;
          }
        })}
      </Form>
    </Card>
  );
};

export default SideUI;
