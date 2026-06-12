import {
  Card,
  CardHeader,
  CardFooter,
  Table,
  Container,
  Row,
  Col,
  Input,
  Button,
  Badge,
  CardBody,
  Pagination,
  PaginationItem,
  PaginationLink,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
} from "reactstrap";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AsyncStorage from "../AsyncStorageHelper";
import Header from "components/Headers/HeaderRecipeList.js";

const Recipes = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [hoveredImage, setHoveredImage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;
  const navigate = useNavigate();

  const fetchTotalRecords = async (keyword = '', status = "all") => {
    try {
      let url = `${apiDomain}/api/recipe/total?search=${keyword}`;
      if (status !== "all") {
        url += `&status=${status}`;
      }
      const response = await fetch(url);
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
  };

  const fetchData = async (page = 1, limit = itemsPerPage, keyword = '', status = "all") => {
    setLoading(true);
    setError(null);
    try {
      let url = `${apiDomain}/api/recipe/?page=${page}&limit=${limit}&search=${keyword}`;
      if (status !== "all") {
        url += `&status=${status}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Lỗi khi lấy dữ liệu");
      }
      const result = await response.json();
      setData(result || []);

      fetchTotalRecords(keyword, status);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchKeyword, filterStatus);
  }, [currentPage, itemsPerPage, searchKeyword, filterStatus]);

  useEffect(() => {
    fetchTotalRecords(searchKeyword, filterStatus);
  }, [searchKeyword, filterStatus]);

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

  const handleDeleteRecipe = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this recipe?");
    if (!isConfirmed) return;

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${apiDomain}/api/recipe/delete/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        window.alert("Can't delete this recipe. Please try again");
      } else {
        window.alert("Recipe deleted successfully");
        fetchData(currentPage, itemsPerPage, searchKeyword);
      }
    } catch (error) {
      console.error("Error deleting recipe: ", error);
      setError("Failed to delete recipe");
    }
  };

  const handleApproveRecipe = async (id) => {
    try {
      const response = await fetch(`${apiDomain}/api/recipe/approve-recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipes: [id] }),
      });

      if (!response.ok) {
        throw new Error("Error while approving recipe");
      }
      window.alert("Recipe approved successfully!");
      fetchData(currentPage, itemsPerPage, searchKeyword);
    } catch (error) {
      console.error("Error approving recipe: ", error);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow ">
              <CardHeader className="border-0 bg-white">
                <Row className="align-items-center">
                  <div className="col">
                    <h2 className="mb-0 font-weight-bold">Recipe Management</h2>
                    <p className="text-muted small mb-0">Create, update, and approve food recipes for the app</p>
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
                          placeholder="Search recipes..."
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
                  <Col md="3">
                    <UncontrolledDropdown>
                      <DropdownToggle
                        caret
                        style={{
                          borderRadius: '10px',
                          height: '45px',
                          border: '1px solid #e9ecef',
                          width: '170%',
                          backgroundColor: '#fff',
                          color: '#495057',
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        {filterStatus === "all" ? "All Recipes" :
                          filterStatus === 1 ? "Approved" :
                            filterStatus === 0 ? "Pending Review" : "All Recipes"}
                      </DropdownToggle>
                      <DropdownMenu
                        style={{
                          borderRadius: '10px',
                          padding: '0',
                          overflow: 'hidden',
                          border: '1px solid #e9ecef',
                          width: '170%'
                        }}
                      >
                        <DropdownItem
                          className="custom-dropdown-item"
                          onClick={() => { setFilterStatus("all"); setCurrentPage(1); }}
                        >
                          All Recipes
                        </DropdownItem>
                        <DropdownItem
                          className="custom-dropdown-item"
                          onClick={() => { setFilterStatus(1); setCurrentPage(1); }}
                        >
                          Approved
                        </DropdownItem>
                        <DropdownItem
                          className="custom-dropdown-item"
                          onClick={() => { setFilterStatus(0); setCurrentPage(1); }}
                        >
                          Pending Review
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </Col>
                  <Col md="3" className="text-right">
                    <Button
                      color="success"
                      onClick={handleAddRecipe}
                      className="btn-icon btn-2 w-100"
                      style={{ borderRadius: '10px', height: '45px' }}
                    >
                      <span className="btn-inner--icon">
                        <i className="fas fa-plus mr-2" />
                      </span>
                      <span className="btn-inner--text">Add Recipe</span>
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <div className="fixed-table-container">
                <Table className="align-items-center table-flush" responsive>
                  <thead style={{ backgroundColor: '#2dce89', color: 'white' }}>
                    <tr>
                      <th scope="col" className="text-white">Recipe Name</th>
                      <th scope="col" className="text-white">Cuisine</th>
                      <th scope="col" className="text-white">Author</th>
                      <th scope="col" className="text-white">Status</th>
                      <th scope="col" className="text-white">Date</th>
                      <th scope="col" className="text-white text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 10 }).map((_, index) => (
                        <tr key={index} className="skeleton-row">
                          <td><div className="skeleton skeleton-text" /></td>
                          <td><div className="skeleton skeleton-text" /></td>
                          <td><div className="skeleton skeleton-text" /></td>
                          <td><div className="skeleton skeleton-text" /></td>
                          <td><div className="skeleton skeleton-text" /></td>
                          <td className="text-right"><div className="skeleton skeleton-text" /></td>
                        </tr>
                      ))
                    ) : error ? (
                      <tr>
                        <td colSpan="6" className="text-center text-danger">
                          {error}
                        </td>
                      </tr>
                    ) : data && data.length > 0 ? (
                      data.map((item) => (
                        <tr key={item.id_recipe}>
                          <td className="font-weight-bold">{item.name_recipe}</td>
                          <td>{item.type || "General"}</td>
                          <td className="text-muted">{item.author || "Admin"}</td>
                          <td>
                            {item.accept_contribution === 1 ? (
                              <Badge color="success" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#dcfce7', color: '#166534', border: 'none' }}>
                                Approved
                              </Badge>
                            ) : (
                              <Badge color="warning" pill style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#fef9c3', color: '#854d0e', border: 'none' }}>
                                Pending Review
                              </Badge>
                            )}
                          </td>
                          <td className="text-muted">{item.date}</td>
                          <td className="text-right">
                            {item.accept_contribution === 0 && (
                              <>
                                <Button
                                  className="btn-icon btn-2 btn-sm"
                                  color="success"
                                  type="button"
                                  onClick={() => handleApproveRecipe(item.id_recipe)}
                                  style={{ backgroundColor: 'transparent', border: 'none', color: '#2dce89' }}
                                >
                                  <i className="fas fa-check" />
                                </Button>
                                <Button
                                  className="btn-icon btn-2 btn-sm"
                                  color="danger"
                                  type="button"
                                  onClick={() => handleDeleteRecipe(item.id_recipe)}
                                  style={{ backgroundColor: 'transparent', border: 'none', color: '#f5365c' }}
                                >
                                  <i className="fas fa-times" />
                                </Button>
                              </>
                            )}
                            <Button
                              className="btn-icon btn-2 btn-sm"
                              color="info"
                              type="button"
                              onClick={() => handleUpdateRecipe(item.id_recipe)}
                              style={{ backgroundColor: 'transparent', border: 'none', color: '#11cdef' }}
                            >
                              <i className="fas fa-edit" />
                            </Button>
                            <Button
                              className="btn-icon btn-2 btn-sm"
                              color="danger"
                              type="button"
                              onClick={() => handleDeleteRecipe(item.id_recipe)}
                              style={{ backgroundColor: 'transparent', border: 'none', color: '#f5365c' }}
                            >
                              <i className="fas fa-trash" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
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

      <style>{`
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

        /* Custom Dropdown Item Hover Effect */
        .custom-dropdown-item {
          padding: 12px 20px !important;
          transition: all 0.2s !important;
          cursor: pointer !important;
        }

        .custom-dropdown-item:hover {
          background-color: #2dce89 !important;
          color: white !important;
        }

        .custom-dropdown-item:active {
          background-color: #26af74 !important;
        }
      `}</style>
    </>
  );
};

export default Recipes;
