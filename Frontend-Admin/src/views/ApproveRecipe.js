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
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "components/Headers/HeaderUnapproved.js";

const AcceptRecipes = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hoveredImage, setHoveredImage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
  const navigate = useNavigate();
  const [selectedRecipes, setSelectedRecipes] = useState([]);

  const handleSelectRecipe = (id) => {
    if (selectedRecipes.includes(id)) {
      setSelectedRecipes(selectedRecipes.filter((recipeId) => recipeId !== id));
    } else {
      setSelectedRecipes([...selectedRecipes, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRecipes(data.map((item) => item.id_recipe));
    } else {
      setSelectedRecipes([]);
    }
  };

  const handleSubmitSelectedRecipes = async () => {
    if (selectedRecipes.length === 0) {
      alert("No recipes selected!");
      return;
    }
    try {
      const response = await fetch(`${apiDomain}/api/recipe/approve-recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipes: selectedRecipes }),
      });

      if (!response.ok) {
        throw new Error("Error while importing recipes");
      }
      alert("Recipes imported successfully!");
      fetchData(currentPage, itemsPerPage, searchKeyword);
    } catch (error) {
      console.error("Error importing recipes: ", error);
    }
  };

  const fetchTotalRecords = useCallback(async (keyword = '') => {
    try {
      const response = await fetch(`${apiDomain}/api/recipe/total-unapproved?search=${keyword}`);
      if (!response.ok) {
        throw new Error("Lỗi khi lấy tổng số bản ghi");
      }
      const result = await response.json();
      setTotalPages(Math.ceil(result.total / itemsPerPage));
      console.log(result.total)
      console.log(itemsPerPage)
      console.log(totalPages)
    } catch (error) {
      console.error("Error fetching total records: ", error);
      setError(error.message);
    }
  }, [apiDomain, itemsPerPage, totalPages]);

  const fetchData = useCallback(async (page = 1, limit = itemsPerPage, keyword = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiDomain}/api/recipe/get-recipes-unapproved?page=${page}&limit=${limit}&search=${keyword}`
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
  }, [apiDomain, fetchTotalRecords, itemsPerPage]);

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchKeyword);
  }, [currentPage, itemsPerPage, searchKeyword, fetchData]);

  useEffect(() => {
    if (searchKeyword) {
      fetchTotalRecords(searchKeyword);
    } else {
      fetchTotalRecords();
    }
  }, [searchKeyword, fetchTotalRecords]);

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
            <Card className="shadow ">
              <CardHeader className="border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">Unapproved Recipes</h3>
                  <Button color="success" onClick={handleSubmitSelectedRecipes}>
                    Approve Recipes
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
                      <th scope="col">
                        <Input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={selectedRecipes.length === data.length}
                        />
                      </th>
                      <th scope="col">Name</th>
                      <th scope="col">Image</th>
                      <th scope="col">Status</th>
                      <th scope="col">Summary</th>
                      <th scope="col">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 10 }).map((_, index) => (
                        <tr key={index} className="skeleton-row">
                          <td><div className="skeleton skeleton-text" /></td>
                          <td><div className="skeleton skeleton-image" /></td>
                          <td><div className="skeleton skeleton-text" /></td>
                          <td><div className="skeleton skeleton-text" /></td>
                          <td><div className="skeleton skeleton-text" /></td>
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
                          <td><Input
                            type="checkbox"
                            checked={selectedRecipes.includes(item.id_recipe)}
                            onChange={() => handleSelectRecipe(item.id_recipe)}
                          /></td>
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
                        <td colSpan="10" className="text-center">
                          There is no data to display
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
        th input[type="checkbox"], 
        td input[type="checkbox"] {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
          position: relative;
          transform: translateY(-10%);
        }
      `}</style>
    </>
  );
};

export default AcceptRecipes;
