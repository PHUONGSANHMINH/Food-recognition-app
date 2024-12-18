import {
  Card,
  CardHeader,
  CardFooter,
  Table,
  Container,
  Row,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
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
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;

  // Fetch dữ liệu từ API
  const fetchUsers = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiDomain}/api/user/users?page=${page}&limit=${limit}&search=${search}`,
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
    fetchUsers(currentPage, itemsPerPage, searchKeyword);
  }, [currentPage, searchKeyword]);

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
    setCurrentPage(1);
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
              <CardHeader className="border-0">
                <h3 className="mb-0">Users List</h3>
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  className="mt-3"
                />
              </CardHeader>
              <div className="table-responsive">
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Username</th>
                      <th scope="col">Email</th>
                      <th scope="col">Status</th>
                      <th scope="col">Total Contributions</th>
                      <th scope="col">Approved</th>
                      <th scope="col">Waiting</th>
                      <th scope="col">Rejected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="7" className="text-center text-danger">
                          {error}
                        </td>
                      </tr>
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id_user}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.status || "Active"}</td>
                          <td>{user.recipes_contribution}</td>
                          <td>{user.recipes_contribution_approved}</td>
                          <td>{user.recipes_contribution_waiting}</td>
                          <td>{user.recipes_contribution_rejected}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
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
         min-height: 400px; /* Cho phép trang trình hiển thị 300 dòng dữ liệu */m
          overflow-x: auto;
        }
        .table-flush {
          min-width: 1200px; /* Tăng kích thước tối thiểu của bảng */
        }
      `}</style>
    </>

  );
};

export default Users;
