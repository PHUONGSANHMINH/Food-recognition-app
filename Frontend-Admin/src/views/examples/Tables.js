import {
  Card,
  CardHeader,
  CardFooter,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Table,
  Container,
  Row,
} from "reactstrap";
import React, { useState, useEffect } from "react";
import Header from "components/Headers/Header.js";

const Tables = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;

  const fetchTotalRecords = async () => {
    try {
      const response = await fetch(`${apiDomain}/api/recipe/total`);
      if (!response.ok) {
        throw new Error("Lỗi khi lấy tổng số bản ghi");
      }
      const result = await response.json();
      setTotalRecords(result.total);
      setTotalPages(Math.ceil(result.total / itemsPerPage));
    } catch (error) {
      console.error("Error fetching total records: ", error);
      setError(error.message);
    }
  };

  const fetchData = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/api/recipe/?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Lỗi khi lấy dữ liệu");
      }
      const result = await response.json();
      setData(result || []);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchTotalRecords();
  }, []);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchData(pageNumber, itemsPerPage);
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Dish added to suggestions</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Image</th>
                    <th scope="col">Status</th>
                    <th scope="col">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Hiển thị skeleton khi đang tải
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="skeleton-row">
                        <td><div className="skeleton skeleton-text" /></td>
                        <td><div className="skeleton skeleton-image" /></td>
                        <td><div className="skeleton skeleton-text" /></td>
                        <td><div className="skeleton skeleton-text" /></td>
                      </tr>
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan="4" className="text-center text-danger">
                        {error}
                      </td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.id_recipe}>
                        <td>{item.name_recipe}</td>
                        <td>
                          <Media>
                            <a href="#pablo" onClick={(e) => e.preventDefault()}>
                              <img
                                alt={item.name_recipe}
                                src={`${apiDomain}/api/file/get-file/${item.image}`}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "5px",
                                }}
                              />
                            </a>
                          </Media>
                        </td>
                        <td>{item.status}</td>
                        <td>{item.summary}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        Không có dữ liệu để hiển thị
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <CardFooter className="py-4">
                <nav aria-label="...">
                  <Pagination className="pagination justify-content-end mb-0">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <PaginationItem key={index} active={currentPage === index + 1}>
                        <PaginationLink onClick={() => paginate(index + 1)}>
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  </Pagination>
                </nav>
              </CardFooter>
            </Card>
          </div>
        </Row>
      </Container>

      {/* CSS styles for skeleton loading */}
      <style jsx>{`
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

        .skeleton-text {
          width: 100px;
          height: 20px;
        }

        .skeleton-image {
          width: 50px;
          height: 50px;
          border-radius: 5px;
        }
      `}</style>
    </>
  );
};

export default Tables;
