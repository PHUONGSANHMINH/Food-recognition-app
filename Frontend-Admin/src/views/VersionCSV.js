import React, { useState, useEffect, useCallback  } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  Table,
  Container,
  Row,
  Button,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import AsyncStorage from "../AsyncStorageHelper";
import Header from "components/Headers/HeaderVersionsCSV.js";

const VersionCSV = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [csvDetails, setCsvDetails] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem("access_token");

      const [versionsResponse, configResponse] = await Promise.all([
        axios.get(`${apiDomain}/api/csv/versions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(`${apiDomain}/admin/config/get?config_name=data_recommend_csv`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const configValue = configResponse.data.config_value;
      const selected = versionsResponse.data.find(
        (item) => `recommend-dataset/${item.filename}` === configValue
      );

      if (selected) setSelectedVersion(selected.id);
      setData(versionsResponse.data || []);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  }, [apiDomain]);

  // Gọi fetchData trong useEffect
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectVersion = (versionId) => setSelectedVersion(versionId);

  const fetchCsvDetails = async (versionId) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");

      const response = await axios.get(`${apiDomain}/api/csv/version/${versionId}/content`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setCsvDetails(response.data || []);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching CSV details: ", error);
      alert("Failed to fetch CSV details");
    }
  };

  const handleImport = async () => {
    if (!selectedVersion) return;

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const selectedVersionData = data.find((item) => item.id === selectedVersion);
      if (!selectedVersionData) return;

      await axios.post(
        `${apiDomain}/admin/config/update`,
        {
          config_name: "data_recommend_csv",
          config_value: `recommend-dataset/${selectedVersionData.filename}`,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      alert("Config updated successfully!");
    } catch (error) {
      console.error("Error updating config: ", error);
      alert("Failed to update config. Please try again.");
    }
  };

  const handleCreateCSV = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      await axios.get(
        `${apiDomain}/api/file/export-csv`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      alert("Created successfully !");
      fetchData();
    } catch (error) {
      console.error("Error updating config: ", error);
      alert("Failed to create CSV. Please try again.");
    }
  };

  const handleDelete = async (versionId) => {
    if (!window.confirm("Are you sure you want to delete this version?")) return;

    try {
      const accessToken = await AsyncStorage.getItem("access_token");

      const response = await axios.delete(`${apiDomain}/api/csv/version/${versionId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Kiểm tra phản hồi từ API
      if (response.status === 200) {
        // Xóa phiên bản khỏi danh sách hiện tại
        setData((prevData) => prevData.filter((item) => item.id !== versionId));
        alert("Version deleted successfully!");
      } else if (response.status === 400) {
        alert("This version is currently in use and cannot be deleted.");
      } else {
        alert("Unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting version: ", error);

      if (error.response && error.response.status === 400) {
        alert("This version is currently in use and cannot be deleted.");
      } else if (error.response && error.response.status === 404) {
        alert("Version not found. It may have already been deleted.");
      } else {
        alert("Failed to delete version. Please try again.");
      }
    }
  };


  const renderCsvDetailsModal = () => (
    <Modal isOpen={isDetailsModalOpen} toggle={() => setIsDetailsModalOpen(false)} size="xl">
      <ModalHeader toggle={() => setIsDetailsModalOpen(false)}>CSV Details</ModalHeader>
      <ModalBody>
        <Table striped responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Summary</th>
              <th>Ingredients</th>
            </tr>
          </thead>
          <tbody>
            {csvDetails.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No details available
                </td>
              </tr>
            ) : (
              csvDetails.map((item) => {
                const ingredients = item.ingredients ? JSON.parse(item.ingredients) : [];
                return (
                  <tr key={item.id_recipe}>
                    <td>{item.id_recipe}</td>
                    <td>{item.name_recipe}</td>
                    <td>{item.type}</td>
                    <td>{item.status}</td>
                    <td>{item.summary}</td>
                    <td>
                      <ul>
                        {ingredients.map((ing, index) => (
                          <li key={index}>
                            {ing.name_ingredient} - {ing.quantity} {ing.unit}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => setIsDetailsModalOpen(false)}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );

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
                  <Button
                    color="success"
                    onClick={handleCreateCSV}
                    className="mb-3"
                  >
                    Create CSV
                  </Button>
                </div>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Select</th>
                    <th scope="col">Filename</th>
                    <th scope="col">Created At</th>
                    <th scope="col">Status</th>
                    <th scope="col">View</th>
                    <th scope="col">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="skeleton-row">
                        <td><div className="skeleton skeleton-radio" /></td>
                        <td><div className="skeleton skeleton-text" /></td>
                        <td><div className="skeleton skeleton-text" /></td>
                        <td><div className="skeleton skeleton-text" /></td>
                      </tr>
                    ))
                  ) : data.length > 0 ? (
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
                                className={`custom-radio ${item.status === "file not found" ? "not-found" : ""}`}
                              />
                              <span className={`checkmark ${item.status === "file not found" ? "not-found" : ""}`} />
                            </Label>
                          </FormGroup>
                        </td>
                        <td>{item.filename}</td>
                        <td>{new Date(item.created_at).toLocaleString()}</td>
                        <td className={item.status === "file not found" ? "text-muted" : ""}>
                          {item.status}
                        </td>
                        <td>
                          <Button
                            color="info"
                            size="sm"
                            className="action-button"
                            onClick={() => fetchCsvDetails(item.id)}
                          >
                            View Details
                          </Button>
                        </td>
                        <td>
                          <Button
                            color="danger"
                            size="sm"
                            className="action-button"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <CardFooter className="py-4">
                <Button
                  color="primary"
                  disabled={!selectedVersion || data.find((item) => item.id === selectedVersion)?.status === "file not found"}
                  onClick={handleImport}
                >
                  Use CSV
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Row>
      </Container>
      {renderCsvDetailsModal()}
      <style>{`
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

        .not-found {
          border: 1px solid red;
          background-color: rgba(255, 0, 0, 0.1);
        }

        .skeleton {
          background-color: #e0e0e0;
          border-radius: 4px;
          display: inline-block;
          position: relative;
          overflow: hidden;
        }

        .skeleton::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          height: 100%;
          width: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: skeleton-loading 1.5s infinite;
        }

        @keyframes skeleton-loading {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        .skeleton-row td {
          padding: 10px 0;
        }

        .skeleton-radio {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .skeleton-text {
          width: 100px;
          height: 20px;
        }
        
        .action-button {
          min-width: 100px; /* Đặt chiều rộng tối thiểu */
          height: 40px; /* Đặt chiều cao cố định */
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </>
  );
};

export default VersionCSV;
