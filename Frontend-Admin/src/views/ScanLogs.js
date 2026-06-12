import {
    Card,
    CardHeader,
    CardFooter,
    Table,
    Container,
    Row,
    Col,
    Input,
    Pagination,
    PaginationItem,
    PaginationLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Badge,
    Media,
    Progress,
} from "reactstrap";
import React, { useState } from "react";
import Header from "components/Headers/HeaderScanLogs.js";

const ScanLogs = () => {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchFocused, setSearchFocused] = useState(false);

    // Mock data
    const [logs, setLogs] = useState([
        {
            id: 1,
            food_name: "Hainanese Chicken Rice",
            user: "Nguyen Van A",
            accuracy: 96.5,
            status: "Success",
            time: "2024-01-17 14:30",
            image: "https://via.placeholder.com/40"
        },
        {
            id: 2,
            food_name: "Green Salad",
            user: "Tran Thi B",
            accuracy: 88.2,
            status: "Success",
            time: "2024-01-17 13:15",
            image: "https://via.placeholder.com/40"
        },
        {
            id: 3,
            food_name: "Pizza (Unidentified)",
            user: "Le Minh C",
            accuracy: 62.4,
            status: "Needs Confirmation",
            time: "2024-01-17 12:45",
            image: "https://via.placeholder.com/40"
        },
        {
            id: 4,
            food_name: "Tomato Sauce",
            user: "Nguyen Van A",
            accuracy: 94.8,
            status: "Success",
            time: "2024-01-17 11:20",
            image: "https://via.placeholder.com/40"
        },
        {
            id: 5,
            food_name: "Beef Noodle Soup",
            user: "Pham Van D",
            accuracy: 45.0,
            status: "Mismatch",
            time: "2024-01-17 10:05",
            image: "https://via.placeholder.com/40"
        }
    ]);

    const handleStatusChange = (id, newStatus) => {
        setLogs(logs.map(log => log.id === id ? { ...log, status: newStatus } : log));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Success":
                return (
                    <Badge color="success" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#dcfce7', color: '#166534', border: 'none' }}>
                        ✓ Success
                    </Badge>
                );
            case "Needs Confirmation":
                return (
                    <Badge color="warning" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#fef3c7', color: '#92400e', border: 'none' }}>
                        ? Needs Confirmation
                    </Badge>
                );
            case "Mismatch":
                return (
                    <Badge color="danger" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' }}>
                        ✕ Mismatch
                    </Badge>
                );
            default:
                return null;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.food_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            log.user.toLowerCase().includes(searchKeyword.toLowerCase());
        const matchesFilter = filterStatus === "all" || log.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="border-0 bg-white">
                                <Row className="align-items-center">
                                    <div className="col">
                                        <h2 className="mb-0 font-weight-bold">Scan Logs</h2>
                                        <p className="text-muted small mb-0">View and manage food recognition scan logs and results</p>
                                    </div>
                                </Row>
                                <Row className="mt-4 align-items-center">
                                    <Col md="6">
                                        <div className="form-group mb-0">
                                            <div className={`input-group input-group-alternative ${searchFocused ? 'focused' : ''}`}
                                                style={{
                                                    border: searchFocused ? '1px solid #2dce89' : '1px solid #e9ecef',
                                                    borderRadius: '10px',
                                                    transition: 'border-color 0.2s ease-in-out'
                                                }}>
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <i className="fas fa-search" style={{ color: searchFocused ? '#2dce89' : '#adb5bd' }} />
                                                    </span>
                                                </div>
                                                <Input
                                                    placeholder="Search for food or user..."
                                                    type="text"
                                                    value={searchKeyword}
                                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                                    onFocus={() => setSearchFocused(true)}
                                                    onBlur={() => setSearchFocused(false)}
                                                    style={{
                                                        border: 'none',
                                                        boxShadow: 'none',
                                                        borderRadius: '0 10px 10px 0'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md="6" className="text-right">
                                        <UncontrolledDropdown>
                                            <DropdownToggle
                                                color="secondary"
                                                outline
                                                style={{ borderRadius: '10px', height: '45px', borderColor: '#e9ecef', color: '#32325d' }}
                                                className="d-flex align-items-center ml-auto"
                                            >
                                                <i className="fas fa-filter mr-2"></i>
                                                {filterStatus === "all" ? "All Results" : filterStatus}
                                            </DropdownToggle>
                                            <DropdownMenu right style={{ borderRadius: '12px', padding: '8px', border: '1px solid #f1f3f9' }}>
                                                <DropdownItem onClick={() => setFilterStatus("all")} className="py-2">All</DropdownItem>
                                                <DropdownItem onClick={() => setFilterStatus("Success")} className="py-2">Success</DropdownItem>
                                                <DropdownItem onClick={() => setFilterStatus("Needs Confirmation")} className="py-2">Needs Confirmation</DropdownItem>
                                            </DropdownMenu>
                                        </UncontrolledDropdown>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <div className="table-responsive mt-4">
                                <Table className="align-items-center table-flush" responsive>
                                    <thead style={{ backgroundColor: '#2dce89', color: 'white' }}>
                                        <tr>
                                            <th scope="col" className="text-white">Food Item</th>
                                            <th scope="col" className="text-white">User</th>
                                            <th scope="col" className="text-white">Accuracy</th>
                                            <th scope="col" className="text-white text-center">Status</th>
                                            <th scope="col" className="text-white">Time</th>
                                            <th scope="col" className="text-white text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ height: '15px' }}><td colSpan="6" style={{ border: 'none', padding: 0 }}></td></tr>
                                        {filteredLogs.length > 0 ? (
                                            filteredLogs.map((log) => (
                                                <React.Fragment key={log.id}>
                                                    <tr style={{ backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                                        <td className="border-0">
                                                            <Media className="align-items-center">
                                                                <div className="avatar rounded mr-3 bg-light">
                                                                    <i className="far fa-image text-muted" />
                                                                </div>
                                                                <Media>
                                                                    <span className="mb-0 text-sm font-weight-bold" style={{ color: '#32325d' }}>
                                                                        {log.food_name}
                                                                    </span>
                                                                </Media>
                                                            </Media>
                                                        </td>
                                                        <td className="border-0 text-muted">{log.user}</td>
                                                        <td className="border-0">
                                                            <div className="d-flex align-items-center">
                                                                <span className="mr-2">{log.accuracy}%</span>
                                                                <div>
                                                                    <Progress
                                                                        max="100"
                                                                        value={log.accuracy}
                                                                        barClassName={log.accuracy > 80 ? "bg-success" : log.accuracy > 60 ? "bg-warning" : "bg-danger"}
                                                                        style={{ height: "5px", width: "100px" }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="border-0 text-center">
                                                            {getStatusBadge(log.status)}
                                                        </td>
                                                        <td className="border-0">
                                                            <div className="d-flex align-items-center">
                                                                <i className="far fa-calendar-alt mr-2 text-muted" />
                                                                <span className="text-muted small">{log.time}</span>
                                                            </div>
                                                        </td>
                                                        <td className="border-0 text-right">
                                                            <div className="d-flex justify-content-end align-items-center">
                                                                <i className="far fa-eye mr-3 text-muted" style={{ cursor: 'pointer' }} title="View Original Image" />
                                                                <UncontrolledDropdown>
                                                                    <DropdownToggle
                                                                        className="btn-icon-only text-light"
                                                                        role="button"
                                                                        size="sm"
                                                                        color=""
                                                                        onClick={(e) => e.preventDefault()}
                                                                        style={{ boxShadow: 'none' }}
                                                                    >
                                                                        <i className="fas fa-ellipsis-v" style={{ color: '#adb5bd' }} />
                                                                    </DropdownToggle>
                                                                    <DropdownMenu className="dropdown-menu-arrow" right style={{ borderRadius: '12px', padding: '8px', border: '1px solid #f1f3f9', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                                                                        <DropdownItem onClick={() => alert("Viewing original image...")} className="d-flex align-items-center py-2" style={{ borderRadius: '8px' }}>
                                                                            <i className="far fa-image mr-2" style={{ fontSize: '14px', color: '#8898aa' }}></i>
                                                                            <span style={{ color: '#32325d' }}>View original image</span>
                                                                        </DropdownItem>
                                                                        <DropdownItem onClick={() => handleStatusChange(log.id, "Success")} className="d-flex align-items-center py-2" style={{ borderRadius: '8px' }}>
                                                                            <i className="fas fa-check-circle mr-2" style={{ fontSize: '14px', color: '#2dce89' }}></i>
                                                                            <span style={{ color: '#32325d' }}>Confirm result</span>
                                                                        </DropdownItem>
                                                                        <DropdownItem onClick={() => handleStatusChange(log.id, "Mismatch")} className="d-flex align-items-center py-2 text-danger" style={{ borderRadius: '8px' }}>
                                                                            <i className="fas fa-times-circle mr-2" style={{ fontSize: '14px', color: '#f5365c' }}></i>
                                                                            <span>Mark as incorrect</span>
                                                                        </DropdownItem>
                                                                    </DropdownMenu>
                                                                </UncontrolledDropdown>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr style={{ height: '10px' }}><td colSpan="6" style={{ border: 'none', padding: 0 }}></td></tr>
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    No logs found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            <CardFooter className="py-4">
                                <Pagination className="pagination justify-content-end mb-0">
                                    <PaginationItem className="disabled">
                                        <PaginationLink href="#pablo" onClick={(e) => e.preventDefault()} tabIndex="-1">
                                            <i className="fas fa-angle-left" />
                                            <span className="sr-only">Previous</span>
                                        </PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem className="active">
                                        <PaginationLink href="#pablo" onClick={(e) => e.preventDefault()}>
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink href="#pablo" onClick={(e) => e.preventDefault()}>
                                            <i className="fas fa-angle-right" />
                                            <span className="sr-only">Next</span>
                                        </PaginationLink>
                                    </PaginationItem>
                                </Pagination>
                            </CardFooter>
                        </Card>
                    </div>
                </Row>
            </Container>
            <style jsx>{`
        .table-responsive {
          min-height: 400px;
          overflow-x: auto;
          overflow-y: hidden;
        }
        .table-flush {
          min-width: 1000px;
        }
        .table thead th {
          border-top: 0;
          text-transform: uppercase;
          font-size: 0.65rem;
          padding: 15px 25px;
          letter-spacing: 1px;
        }
        .table tbody td {
          padding: 15px 25px;
          vertical-align: middle;
          border-top: 1px solid #f6f9fc;
        }
        .dropdown-item:hover {
          background-color: #f6f9fc !important;
        }
        .dropdown-item.text-danger:hover {
          background-color: #fff5f5 !important;
        }
        .avatar {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
      `}</style>
        </>
    );
};

export default ScanLogs;
