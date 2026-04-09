import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AsyncStorage from "../AsyncStorageHelper";
import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Col,
} from "reactstrap";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (accessToken) {
        // Nếu đã có access token, chuyển hướng đến /admin/index
        navigate("/admin/index");
      }
    };
    checkLoginStatus();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
      const response = await axios.post(`${apiDomain}/admin/superadmin_login`, { username, password });
      const { access_token, refresh_token } = response.data;

      // Lưu access token và refresh token vào AsyncStorage
      await AsyncStorage.setItem("access_token", access_token);
      await AsyncStorage.setItem("refresh_token", refresh_token);

      // Chuyển hướng đến route /admin/index
      navigate("/admin/index");
    } catch (error) {
      setError("Login failed. Please check your username and password.");
    }
  };

  return (
    <Col lg="5" md="7">
      <Card className="bg-secondary shadow border-0">
        <CardBody className="px-lg-5 py-lg-5">
          <div className="text-center text-muted mb-4">
            <h3>Welcome back to Admin dashboard!</h3>
          </div>
          <Form role="form">
            <FormGroup className="mb-3">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fa fa-user" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="UserName"
                  type="text"
                  autoComplete="new-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </FormGroup>
            {error && <div className="text-danger text-center mb-3">{error}</div>}
            <div className="text-center">
              <Button className="my-4" color="warning" type="button" onClick={handleLogin}>
                Sign in
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Col>
  );
};

export default Login;
