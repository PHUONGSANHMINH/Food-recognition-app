import React, { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";
import AsyncStorage from "../../AsyncStorageHelper";
import axios from "axios";

const Header = () => {
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) {
          throw new Error("Access token is missing");
        }

        const response = await axios.get(`${apiDomain}/api/recipe/stats`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        setStats(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError("Unauthorized access. Please log in again.");
        } else {
          setError("Error fetching recipe statistics.");
        }
        console.error("Error fetching recipe statistics:", error);
      }
    };

    fetchStats();
  }, [apiDomain]);

  return (
    <>
      <div className="header bg-gradient-success pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row>
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                          Total Recipes
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {error ? "Error" : stats.total}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                          <i className="fas fa-utensils" />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                          Approved
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0 text-success">
                          {error ? "Error" : stats.approved}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                          <i className="fas fa-check" />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                          Pending Review
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0 text-warning">
                          {error ? "Error" : stats.pending}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                          <i className="fas fa-clock" />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Header;
