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
  Button,
} from "reactstrap";
import React, { useState, useEffect } from "react";
import Header from "components/Headers/HeaderUsers.js";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchFocused, setSearchFocused] = useState(false);
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;

  // Fetch dữ liệu từ API
  const fetchUsers = async (page = 1, limit = 10, search = "", status = "all") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiDomain}/api/user/users?page=${page}&limit=${limit}&search=${search}&status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      setUsers(result.users || []);
      setTotalRecords(result.total || 0);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage, searchKeyword, filterStatus);
  }, [currentPage, searchKeyword, filterStatus]);

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
    setCurrentPage(1);
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm("Are you sure you want to deactivate this account?")) {
      try {
        const response = await fetch(`${apiDomain}/api/user/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ user_id: userId, status: 0 }),
        });

        if (response.ok) {
          fetchUsers(currentPage, itemsPerPage, searchKeyword, filterStatus);
          alert("User deactivated successfully!");
        } else {
          alert("Could not deactivate user.");
        }
      } catch (error) {
        console.error("Error deactivating user:", error);
      }
    }
  };

  const handleActivate = async (userId) => {
    if (window.confirm("Are you sure you want to reactivate this account?")) {
      try {
        const response = await fetch(`${apiDomain}/api/user/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ user_id: userId, status: 1 }), // Set back to Active (1)
        });

        if (response.ok) {
          await fetchUsers(currentPage, itemsPerPage, searchKeyword, filterStatus);
          alert("Account activated successfully!");
        } else {
          alert("Could not activate user.");
        }
      } catch (error) {
        console.error("Error activating user:", error);
      }
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
                    <h2 className="mb-0 font-weight-bold">User Management</h2>
                    <p className="text-muted small mb-0">Manage system users and their contribution statistics</p>
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
                          placeholder="Search by name or email..."
                          type="text"
                          value={searchKeyword}
                          onChange={handleSearchChange}
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
                        {filterStatus === "all" ? "All Users" :
                          filterStatus === "active" ? "Active" : "Inactive"}
                      </DropdownToggle>
                      <DropdownMenu right style={{ borderRadius: '12px', padding: '8px', border: '1px solid #f1f3f9' }}>
                        <DropdownItem onClick={() => setFilterStatus("all")} className="py-2">All Users</DropdownItem>
                        <DropdownItem onClick={() => setFilterStatus("active")} className="py-2">Active</DropdownItem>
                        <DropdownItem onClick={() => setFilterStatus("inactive")} className="py-2">Inactive</DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </Col>
                </Row>
              </CardHeader>
              <div className="table-responsive mt-4">
                <Table className="align-items-center table-flush" responsive>
                  <thead style={{ backgroundColor: '#2dce89', color: 'white' }}>
                    <tr>
                      <th scope="col" className="text-white">Username</th>
                      <th scope="col" className="text-white">Email</th>
                      <th scope="col" className="text-white">Status</th>
                      <th scope="col" className="text-white text-center">Total Contributions</th>
                      <th scope="col" className="text-white text-center">Approved</th>
                      <th scope="col" className="text-white text-center">Pending</th>
                      <th scope="col" className="text-white text-center">Rejected</th>
                      <th scope="col" className="text-white text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ height: '15px' }}><td colSpan="8" style={{ border: 'none', padding: 0 }}></td></tr>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="8" className="text-center text-danger">
                          {error}
                        </td>
                      </tr>
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <React.Fragment key={user.id_user}>
                          <tr style={{ backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                            <td className="border-0">
                              <Media className="align-items-center">
                                <a className="avatar rounded-circle mr-3" href="#pablo" onClick={(e) => e.preventDefault()}>
                                  <img
                                    alt="..."
                                    src={user.avatar_image ? `${apiDomain}/api/file/get-file/${user.avatar_image}` : require("../assets/img/theme/team-1-800x800.jpg")}
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                </a>
                                <Media>
                                  <span className="mb-0 text-sm font-weight-bold" style={{ color: '#32325d' }}>
                                    {user.username}
                                  </span>
                                </Media>
                              </Media>
                            </td>
                            <td className="border-0 text-muted">{user.email}</td>
                            <td className="border-0">
                              {user.status === 0 ? (
                                <Badge color="secondary" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none' }}>
                                  Inactive
                                </Badge>
                              ) : (
                                <Badge color="success" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#dcfce7', color: '#166534', border: 'none' }}>
                                  ✓ Active
                                </Badge>
                              )}
                            </td>
                            <td className="border-0 font-weight-bold text-center">{user.recipes_contribution}</td>
                            <td className="border-0 text-success font-weight-bold text-center">{user.recipes_contribution_approved}</td>
                            <td className="border-0 text-warning font-weight-bold text-center">{user.recipes_contribution_waiting}</td>
                            <td className="border-0 text-danger font-weight-bold text-center">{user.recipes_contribution_rejected}</td>
                            <td className="border-0 text-right">
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
                                  <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()} className="d-flex align-items-center py-2" style={{ borderRadius: '8px' }}>
                                    <i className="far fa-eye mr-2" style={{ fontSize: '14px', color: '#8898aa' }}></i>
                                    <span style={{ color: '#32325d' }}>View Details</span>
                                  </DropdownItem>
                                  <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()} className="d-flex align-items-center py-2" style={{ borderRadius: '8px' }}>
                                    <i className="fas fa-chart-line mr-2" style={{ fontSize: '14px', color: '#8898aa' }}></i>
                                    <span style={{ color: '#32325d' }}>View Activity</span>
                                  </DropdownItem>
                                  <div className="dropdown-divider" />
                                  {user.status !== 0 ? (
                                    <DropdownItem onClick={() => handleDeactivate(user.id_user)} className="d-flex align-items-center py-2 text-danger" style={{ borderRadius: '8px' }}>
                                      <span>Deactivate</span>
                                    </DropdownItem>
                                  ) : (
                                    <DropdownItem onClick={() => handleActivate(user.id_user)} className="d-flex align-items-center py-2 text-success" style={{ borderRadius: '8px' }}>
                                      <span>Activate Account</span>
                                    </DropdownItem>
                                  )}
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </td>
                          </tr>
                          <tr style={{ height: '10px' }}><td colSpan="8" style={{ border: 'none', padding: 0 }}></td></tr>
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <CardFooter className="py-4">
                <Pagination className="pagination justify-content-end mb-0">
                  {Array.from(
                    { length: Math.ceil(totalRecords / itemsPerPage) },
                    (_, index) => (
                      <PaginationItem
                        key={index}
                        active={currentPage === index + 1}
                      >
                        <PaginationLink onClick={() => paginate(index + 1)}>
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
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
          min-width: 1200px;
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
        .gap-2 {
          gap: 0.5rem;
        }
        .dropdown-item:hover {
          background-color: #f6f9fc !important;
        }
        .dropdown-item.text-danger:hover {
          background-color: #fff5f5 !important;
        }
      `}</style>
    </>

  );
};

export default Users;
