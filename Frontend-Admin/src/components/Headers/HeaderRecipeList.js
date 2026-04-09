import React, { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";
import AsyncStorage from "../../AsyncStorageHelper";
import axios from "axios";

const Header = () => {
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
  const [unacceptedRecipes, setUnacceptedRecipes] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUnacceptedRecipes = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) {
          throw new Error("Access token is missing");
        }

        const response = await axios.get(`${apiDomain}/api/recipe/unaccepted_recipes`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        setUnacceptedRecipes(response.data.total_unaccepted_recipes);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setError("Unauthorized access. Please log in again.");
        } else {
          setError("Error fetching unaccepted recipes.");
        }
        console.error("Error fetching unaccepted recipes:", error);
      }
    };

    fetchUnacceptedRecipes();
  }, [apiDomain]);

  return (
    <>
      <div className="header bg-gradient-warning pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row className="justify-content-end">
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Unaccepted recipes
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {error ? "Error" : unacceptedRecipes}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-chart-bar" />
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
