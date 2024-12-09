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
  Input,
  Button
} from "reactstrap";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "components/Headers/HeaderRecipeList.js";

const Recipes = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hoveredImage, setHoveredImage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
  const navigate = useNavigate();

  const fetchTotalRecords = async (keyword = '') => {
    try {
      const response = await fetch(`${apiDomain}/api/recipe/total?search=${keyword}`);
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

  const fetchData = async (page = 1, limit = itemsPerPage, keyword = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiDomain}/api/recipe/?page=${page}&limit=${limit}&search=${keyword}`
      );
      if (!response.ok) {
        throw new Error("Lỗi khi lấy dữ liệu");
      }
      const result = await response.json();
      setData(result || []);

      fetchTotalRecords(keyword);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchKeyword);
  }, [currentPage, itemsPerPage, searchKeyword]);

  useEffect(() => {
    if (searchKeyword) {
      fetchTotalRecords(searchKeyword);
    } else {
      fetchTotalRecords();
    }
  }, [searchKeyword]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleMouseEnter = (event, image) => {
    setHoveredImage(image);
    const rect = event.target.getBoundingClientRect();
    setPopupPosition({
      top: rect.top,
      left: rect.right - 220,
    });
  };

  const handleMouseLeave = () => {
    setHoveredImage(null);
  };

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
    setCurrentPage(1);
  };

  const handleAddRecipe = (e) => {
    // Implement navigation to add recipe page or modal
    e.preventDefault();
    navigate('/admin/recipes/add-recipe');
  };

  const handleUpdateRecipe = (id) => {
    // Navigate to the update page with the recipe ID
    navigate(`/admin/recipes/update-recipe/${id}`);
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow fixed-height">
              <CardHeader className="border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">Dish Recipe</h3>
                  <Button
                    color="success"
                    onClick={handleAddRecipe}
                    className="mb-3"
                  >
                    Add Recipe
                  </Button>
                </div>
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  className="mt-3"
                />
              </CardHeader>
              <div className="fixed-table-container">
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Image</th>
                      <th scope="col">Status</th>
                      <th scope="col">Summary</th>
                      <th scope="col">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="skeleton-row">
                          <td><div className="skeleton skeleton-text" /></td>
                          <td><div className="skeleton skeleton-image" /></td>
                          <td><div className="skeleton skeleton-text" /></td>
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
                                  src={`${apiDomain}/api/file/get-file/recipes/${item.image}`}
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "5px",
                                  }}
                                  onMouseEnter={(e) => handleMouseEnter(e, `${apiDomain}/api/file/get-file/recipes/${item.image}`)}
                                  onMouseLeave={handleMouseLeave}
                                />
                              </a>
                            </Media>
                          </td>
                          <td>{item.status}</td>
                          <td>{item.summary}</td>
                          <td>
                            <Button
                              color="primary"
                              size="sm"
                              onClick={() => handleUpdateRecipe(item.id_recipe)}
                            >
                              Update
                            </Button>
                          </td>
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
              </div>
              <CardFooter className="py-4 fixed-footer">
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

      {hoveredImage && (
        <div
          className="popup"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <img src={hoveredImage} alt="Popup" className="popup-image" />
        </div>
      )}

      <style jsx>{`
        .fixed-height {
          height: 60vh;
          display: flex;
          flex-direction: column;
        }

        .fixed-table-container {
          flex: 1;
          overflow-y: auto;
        }

        .fixed-footer {
          position: sticky;
          bottom: 0;
          background: white;
          z-index: 10;
        }

        .popup {
          position: absolute;
          z-index: 1000;
          border: 1px solid #ccc;
          background-color: #fff;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 10px;
          border-radius: 5px;
        }

        .popup-image {
          width: 200px;
          height: 200px;
        }

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

export default Recipes;
