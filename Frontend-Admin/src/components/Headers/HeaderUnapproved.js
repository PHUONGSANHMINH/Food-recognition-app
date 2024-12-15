import React from "react";
import {Container, Row, Col } from "reactstrap";


const Header = () => {
  return (
    <>
      <div className="header bg-gradient-warning pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row className="justify-content-end">
              <Col lg="6" xl="3"m>

              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Header;
