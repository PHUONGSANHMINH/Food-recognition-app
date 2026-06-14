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
    Spinner,
    Button,
} from "reactstrap";
import React, { useState, useEffect } from "react";
import Header from "components/Headers/HeaderScanLogs.js";
import axios from "axios";

const ScanLogs = () => {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchFocused, setSearchFocused] = useState(false);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN || 'http://localhost:5207';
    const API_URL = `${apiDomain}/api`;

    useEffect(() => {
        fetchLogs();
    }, [currentPage, filterStatus, searchKeyword]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("access_token");
            const response = await axios.get(`${API_URL}/detect/scan-logs`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: currentPage,
                    per_page: 10,
                    search: searchKeyword,
                    status: filterStatus
                }
            });

            if (response.data && response.data.logs) {
                setLogs(response.data.logs);
                setTotalPages(response.data.pages || 1);
                setTotalLogs(response.data.total || 0);
            } else {
                setLogs([]);
            }
        } catch (error) {
            console.error("Error fetching scan logs:", error);
            setError(error.message || "Failed to fetch scan logs");
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setLogs(logs.map(log => log.id === id ? { ...log, status: newStatus } : log));
    };

    const getStatusBadge = (status) => {
        switch (Number(status)) {
            case 1:
                return (
                    <Badge color="success" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#dcfce7', color: '#166534', border: 'none' }}>
                        ✓ Success
                    </Badge>
                );
            case 2:
                return (
                    <Badge color="danger" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' }}>
                        ✕ Mismatch
                    </Badge>
                );
            case 0:
                return (
                    <Badge color="warning" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#fef3c7', color: '#92400e', border: 'none' }}>
                        ? Needs Confirmation
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
                                                    onChange={(e) => {
                                                        setSearchKeyword(e.target.value);
                                                        setCurrentPage(1); // Reset to first page on search
                                                    }}
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
                                                {filterStatus === "all" ? "All Results" :
                                                    filterStatus === "1" ? "Success" :
                                                        filterStatus === "2" ? "Mismatch" : "No Food"}
                                            </DropdownToggle>
                                            <DropdownMenu right style={{ borderRadius: '12px', padding: '8px', border: '1px solid #f1f3f9' }}>
                                                <DropdownItem onClick={() => { setFilterStatus("all"); setCurrentPage(1); }} className="py-2">All</DropdownItem>
                                                <DropdownItem onClick={() => { setFilterStatus("1"); setCurrentPage(1); }} className="py-2">Success</DropdownItem>
                                                <DropdownItem onClick={() => { setFilterStatus("2"); setCurrentPage(1); }} className="py-2">Mismatch</DropdownItem>
                                                <DropdownItem onClick={() => { setFilterStatus("0"); setCurrentPage(1); }} className="py-2">No Food</DropdownItem>
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
                                        {error ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5">
                                                    <div className="text-danger">
                                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                                        {error}
                                                    </div>
                                                    <Button
                                                        color="link"
                                                        size="sm"
                                                        onClick={() => fetchLogs()}
                                                        className="mt-2"
                                                    >
                                                        Try Again
                                                    </Button>
                                                </td>
                                            </tr>
                                        ) : loading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5">
                                                    <Spinner color="success" />
                                                </td>
                                            </tr>
                                        ) : logs.length > 0 ? (
                                            logs.map((log) => (
                                                <React.Fragment key={log.id}>
                                                    <tr style={{ backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                                        <td className="border-0">
                                                            <Media className="align-items-center">
                                                                <div className="mr-3 bg-light overflow-hidden shadow-sm" style={{ width: '55px', height: '55px', borderRadius: '4px' }}>
                                                                    {log.image ? (
                                                                        <img
                                                                            src={`${API_URL}/file/get-file/${log.image}`}
                                                                            alt={log.food_name}
                                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                        />
                                                                    ) : (
                                                                        <i className="far fa-image text-muted" />
                                                                    )}
                                                                </div>
                                                                <Media>
                                                                    <span className="mb-0 text-sm font-weight-bold" style={{ color: '#32325d' }}>
                                                                        {log.food_name || "Unknown"}
                                                                    </span>
                                                                </Media>
                                                            </Media>
                                                        </td>
                                                        <td className="border-0 text-muted">{log.user}</td>
                                                        <td className="border-0">
                                                            <div className="d-flex align-items-center">
                                                                <span className="mr-2">{log.accuracy?.toFixed(1) || 0}%</span>
                                                                <div>
                                                                    <Progress
                                                                        max="100"
                                                                        value={log.accuracy || 0}
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
                                                                {log.image && (
                                                                    <a
                                                                        href={`${API_URL}/file/get-file/${log.image}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="mr-3"
                                                                    >
                                                                        <i className="far fa-eye text-muted" title="View Original Image" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr style={{ height: '10px' }}><td colSpan="6" style={{ border: 'none', padding: 0 }}></td></tr>
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5">
                                                    <div className="text-muted">
                                                        <i className="fas fa-info-circle mr-2"></i>
                                                        No logs found in database.
                                                        <div className="small mt-2">
                                                            API URL: {API_URL}<br />
                                                            Search: "{searchKeyword}" | Status: {filterStatus}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            <CardFooter className="py-4">
                                <Pagination className="pagination justify-content-end mb-0">
                                    <PaginationItem className={currentPage === 1 ? "disabled" : ""}>
                                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>
                                            <i className="fas fa-angle-left" />
                                            <span className="sr-only">Previous</span>
                                        </PaginationLink>
                                    </PaginationItem>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i + 1} className={currentPage === i + 1 ? "active" : ""}>
                                            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem className={currentPage === totalPages ? "disabled" : ""}>
                                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>
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
