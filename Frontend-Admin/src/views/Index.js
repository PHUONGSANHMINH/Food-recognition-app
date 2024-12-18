import { useState, useEffect } from "react";
import classnames from "classnames";
import Chart from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2,
} from "variables/charts.js";

import Header from "components/Headers/Header.js";

const Index = () => {
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");
  const [unapprovedRecipes, setUnapprovedRecipes] = useState([]);
  const [chartData, setChartData] = useState({}); // Dữ liệu biểu đồ
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN; // Đảm bảo biến môi trường này đúng

  useEffect(() => {
    const fetchUnapprovedRecipes = async () => {
      try {
        // Lấy access token từ AsyncStorage
        const accessToken = await AsyncStorage.getItem('access_token');
        if (!accessToken) {
          console.error("No access token found");
          return;
        }

        // Gọi API để lấy danh sách công thức chưa duyệt
        const response = await fetch(`${apiDomain}/api/recipe/get-recipes-unapproved?page=1&limit=5`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setUnapprovedRecipes(data);
      } catch (error) {
        console.error("There was an error fetching the unapproved recipes:", error);
      }
    };

    const fetchChartData = async () => {
      try {
        // Lấy access token từ AsyncStorage
        const accessToken = await AsyncStorage.getItem('access_token');
        if (!accessToken) {
          console.error("No access token found");
          return;
        }

        // Gọi API để lấy dữ liệu thống kê (ví dụ: số lượng đóng góp theo tháng)
        const response = await fetch(`${apiDomain}/admin/contribution-analysis`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // Cập nhật dữ liệu cho biểu đồ
        const months = data.map(item => item.month);
        const contributions = data.map(item => item.contributions);

        setChartData({
          labels: months,
          datasets: [
            {
              label: 'Contributions',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              borderColor: 'rgba(53, 162, 235, 1)',
              data: contributions,
            },
          ],
        });
      } catch (error) {
        console.error("There was an error fetching the chart data:", error);
      }
    };

    fetchUnapprovedRecipes();
    fetchChartData();
  }, []); // Chạy mỗi khi component mount

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <Col className="mb-5 mb-xl-4" xl="8">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Unapproved Contributions</h3>
                  </div>
                  <div className="col text-right">
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive style={{ minHeight: '430px', overflowY: 'auto' }}>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Recipe Name</th>
                    <th scope="col">Image</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {unapprovedRecipes.length > 0 ? (
                    unapprovedRecipes.map((recipe) => (
                      <tr key={recipe.id_recipe}>
                        <th scope="row">{recipe.name_recipe}</th>
                        <td>
                          <img
                            src={`${apiDomain}/api/file/get-file/recipes/${recipe.image}`}
                            alt={recipe.name_recipe}
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                          />
                        </td>
                        <td>{recipe.type}</td>
                        <td>{recipe.status}</td>
                        <td>{recipe.summary}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No unapproved recipes available</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Performance
                    </h6>
                    <h2 className="mb-0">Recipes Contributions</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Chart */}
                <div className="chart" style={{ minHeight: '382px'}}>
                  {chartData.labels ? (
                    <Bar
                      data={chartData}
                      options={{
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: 'Month',
                            },
                          },
                          y: {
                            title: {
                              display: true,
                              text: 'Contributions',
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p>Loading chart data...</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;
