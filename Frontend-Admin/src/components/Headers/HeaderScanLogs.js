import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";

const HeaderScanLogs = () => {
    return (
        <>
            <div className="header bg-gradient-success pb-8 pt-5 pt-md-8">
                <Container fluid>
                    <div className="header-body">
                        {/* Card stats */}
                        <Row>
                            <Col lg="6" xl="3">
                                <Card className="card-stats mb-4 mb-xl-0" style={{ borderRadius: '15px', border: 'none' }}>
                                    <CardBody>
                                        <Row>
                                            <div className="col">
                                                <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                                                    Total Scans
                                                </CardTitle>
                                                <span className="h2 font-weight-bold mb-0">3,245</span>
                                            </div>
                                            <Col className="col-auto">
                                                <div className="icon icon-shape bg-primary text-white rounded-circle shadow">
                                                    <i className="fas fa-camera" />
                                                </div>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col lg="6" xl="3">
                                <Card className="card-stats mb-4 mb-xl-0" style={{ borderRadius: '15px', border: 'none' }}>
                                    <CardBody>
                                        <Row>
                                            <div className="col">
                                                <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                                                    Successful
                                                </CardTitle>
                                                <span className="h2 font-weight-bold mb-0">2,987</span>
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
                            <Col lg="6" xl="3">
                                <Card className="card-stats mb-4 mb-xl-0" style={{ borderRadius: '15px', border: 'none' }}>
                                    <CardBody>
                                        <Row>
                                            <div className="col">
                                                <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                                                    Needs Confirmation
                                                </CardTitle>
                                                <span className="h2 font-weight-bold mb-0">128</span>
                                            </div>
                                            <Col className="col-auto">
                                                <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                                                    <i className="fas fa-question" />
                                                </div>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col lg="6" xl="3">
                                <Card className="card-stats mb-4 mb-xl-0" style={{ borderRadius: '15px', border: 'none' }}>
                                    <CardBody>
                                        <Row>
                                            <div className="col">
                                                <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                                                    Mismatched
                                                </CardTitle>
                                                <span className="h2 font-weight-bold mb-0">342</span>
                                            </div>
                                            <Col className="col-auto">
                                                <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                                                    <i className="fas fa-times" />
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

export default HeaderScanLogs;
