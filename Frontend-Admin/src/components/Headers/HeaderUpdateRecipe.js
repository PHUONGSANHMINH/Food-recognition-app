/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// reactstrap components
import { Button, Container, Row, Col } from "reactstrap";

const HeaderUpdateRecipe = () => {
  return (
    <>
      <div
        className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
      >
        {/* Mask */}
        <span className="mask bg-gradient-warning opacity-8" />
        {/* Header container */}
        <Container className="d-flex align-items-center" fluid>
          <Row>
            <Col lg="7" md="10">
              <h1 className="display-2 text-white">Update Recipe</h1>
              <p className="text-white mt-0 mb-5">           
                You can change the formula information, including user-supplied data, or view the formula information and make no changes.
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default HeaderUpdateRecipe;
