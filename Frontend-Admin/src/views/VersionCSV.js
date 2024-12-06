import {
  Card,
  CardHeader,
  CardFooter,
  Table,
  Container,
  Row,
  Input,
  Button,
  FormGroup,
  Label,
} from "reactstrap";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from "components/Headers/HeaderRecipeList.js";

const VersionCSV = () => {
  const [data, setData] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy access token từ AsyncStorage
        const accessToken = await AsyncStorage.getItem("access_token");

        // Thực hiện yêu cầu API với token trong header
        const response = await axios.get(`${apiDomain}/api/csv/versions`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [apiDomain]);

  const handleSelectVersion = (versionId) => {
    setSelectedVersion(versionId);
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">CSV Versions</h3>
                </div>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Select</th>
                    <th scope="col">Filename</th>
                    <th scope="col">Created At</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="radio"
                                name="selectedVersion"
                                value={item.id}
                                disabled={item.status === "file not found"}
                                checked={selectedVersion === item.id}
                                onChange={() => handleSelectVersion(item.id)}
                                className="custom-radio"
                              />
                              <span className="checkmark" />
                            </Label>
                          </FormGroup>
                        </td>
                        <td>{item.filename}</td>
                        <td>{new Date(item.created_at).toLocaleString()}</td>
                        <td className={item.status === "file not found" ? "text-muted" : ""}>
                          {item.status}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <CardFooter className="py-4">
                <Button
                  color="primary"
                  disabled={!selectedVersion || data.find(item => item.id === selectedVersion)?.status === "file not found"}
                >
                  Import Selected Version
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Row>
      </Container>
      <style jsx>{`
        .custom-radio {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          position: relative;
          height: 20px;
          width: 20px;
          background-color: #eee;
          border: 1px solid #ddd;
          display: inline-block;
        }

        .custom-radio:checked + .checkmark {
          background-color: orange;
        }

        .custom-radio:checked + .checkmark:after {
          content: "";
          position: absolute;
          display: block;
          top: 5px;
          left: 5px;
          width: 8px;
          height: 8px;
          background: white;
        }

        .text-muted {
          color: #6c757d !important;
        }
      `}</style>
    </>
  );
};

export default VersionCSV;
