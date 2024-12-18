import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

const AdminNavbar = (props) => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserName = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserName(decoded.sub); // Giả sử tên người dùng được lưu trong thuộc tính `name` của JWT
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    // Xóa access token và refresh token từ AsyncStorage
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");

    // Điều hướng người dùng về trang đăng nhập
    navigate("/auth/login");
  };

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Link
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            to="/"
          >
            {props.brandText}
          </Link>
          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="..."
                      src={require("../../assets/img/theme/chef.png")}
                    />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {userName}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem href="#pablo" onClick={handleLogout}>
                  <i className="ni ni-bold-left text-danger" />
                  <span>Logout</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
