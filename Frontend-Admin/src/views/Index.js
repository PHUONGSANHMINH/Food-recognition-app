import { useState, useEffect } from "react";
import classnames from "classnames";
import Chart from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
import AsyncStorage from "../AsyncStorageHelper";

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
  const [chartData, setChartData] = useState({});
  const [calorieData, setCalorieData] = useState({});
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [userStatuses, setUserStatuses] = useState([]);
  // Dữ liệu biểu đồ calo
  const apiDomain = process.env.REACT_APP_PUBLIC_DOMAIN;

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
        const accessToken = await AsyncStorage.getItem('access_token');
        if (!accessToken) return;

        const response = await fetch(`${apiDomain}/api/recipe/stats`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        setChartData({
          labels: ['Approved', 'Pending', 'Rejected'],
          datasets: [
            {
              data: [data.approved, data.pending, data.rejected],
              backgroundColor: ['#2dce89', '#ff9f43', '#f5365c'],
              hoverBackgroundColor: ['#2dce89', '#ff9f43', '#f5365c'],
              borderWidth: 0,
            },
          ],
          stats: data // Save raw data for legend display
        });
      } catch (error) {
        console.error("There was an error fetching the chart data:", error);
      }
    };

    const fetchCalorieData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        if (!accessToken) return;

        const response = await fetch(`${apiDomain}/admin/calorie-observation`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        setCalorieData({
          labels: data.labels.map(l => l.split('-').slice(1).join('/')), // MM/DD format
          datasets: [
            {
              label: 'Actual Calories',
              data: data.intake_data,
              backgroundColor: '#2dce89',
              borderRadius: 5,
              barPercentage: 0.6,
              categoryPercentage: 0.5,
            },
            {
              label: 'Recommended Calories',
              data: data.goal_data,
              backgroundColor: '#e1f99aff',
              borderRadius: 5,
              barPercentage: 0.6,
              categoryPercentage: 0.5,
            }
          ],
        });
      } catch (error) {
        console.error("Error fetching calorie data:", error);
      }
    };

    fetchUnapprovedRecipes();
    const fetchRecentData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        if (!accessToken) return;

        const [recipesRes, usersRes] = await Promise.all([
          fetch(`${apiDomain}/admin/recent-contributions`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${apiDomain}/admin/user-status`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        ]);

        if (recipesRes.ok) setRecentRecipes(await recipesRes.json());
        if (usersRes.ok) setUserStatuses(await usersRes.json());
      } catch (error) {
        console.error("Error fetching recent data:", error);
      }
    };

    fetchChartData();
    fetchCalorieData();
    fetchRecentData();
  }, [apiDomain]);

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
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="shadow">
              <CardHeader className="bg-transparent border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h2 className="mb-0 font-weight-bold">Daily Average Calories</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: '400px' }}>
                  {calorieData.labels ? (
                    <Bar
                      data={calorieData}
                      options={{
                        maintainAspectRatio: false,
                        layout: {
                          padding: {
                            left: -10,
                            right: 0,
                            top: 0,
                            bottom: 0
                          }
                        },
                        scales: {
                          yAxes: [{
                            ticks: {
                              beginAtZero: true,
                              padding: 10,
                              stepSize: 600,
                              fontColor: '#8898aa',
                              callback: function (value) {
                                if (value % 600 === 0) return value;
                              }
                            },
                            gridLines: {
                              color: '#e9ecef',
                              borderDash: [2],
                              borderDashOffset: [2],
                              drawBorder: false,
                              drawTicks: false,
                              zeroLineColor: 'transparent'
                            }
                          }],
                          xAxes: [{
                            gridLines: {
                              display: false,
                              drawBorder: false
                            },
                            ticks: {
                              padding: 20,
                              fontColor: '#8898aa'
                            }
                          }]
                        },
                        legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            fontColor: '#8898aa'
                          }
                        },
                        tooltips: {
                          mode: 'index',
                          intersect: false,
                        }
                      }}
                    />
                  ) : (
                    <p className="text-center mt-5">Loading observation data...</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h2 className="mb-0 font-weight-bold">Recipe Status</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                  {chartData.labels ? (
                    <Doughnut
                      data={chartData}
                      options={{
                        maintainAspectRatio: false,
                        cutoutPercentage: 70,
                        legend: {
                          display: false
                        },
                        tooltips: {
                          enabled: true,
                          mode: 'index',
                          intersect: false,
                        }
                      }}
                    />
                  ) : (
                    <p className="text-center">Loading chart data...</p>
                  )}
                </div>
                {chartData.stats && (
                  <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted"><i className="fas fa-circle mr-2" style={{ color: '#2dce89' }}></i> Approved</span>
                      <span className="font-weight-bold text-dark">{chartData.stats.approved}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted"><i className="fas fa-circle mr-2" style={{ color: '#ff9f43' }}></i> Pending</span>
                      <span className="font-weight-bold text-dark">{chartData.stats.pending}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted"><i className="fas fa-circle mr-2" style={{ color: '#f5365c' }}></i> Rejected</span>
                      <span className="font-weight-bold text-dark">{chartData.stats.rejected}</span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col xl="8" className="mb-5 mb-xl-0">
            <Card className="shadow pb-2">
              <CardHeader className="bg-transparent border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h2 className="mb-0 font-weight-bold" style={{ borderLeft: '4px solid #2dce89', paddingLeft: '15px' }}>Recent Recipes</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="pt-0">
                {recentRecipes.map((recipe, index) => (
                  <div key={index} className="p-3 mb-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9fe', borderRadius: '12px' }}>
                    <div>
                      <h4 className="mb-0 font-weight-bold">{recipe.name_recipe}</h4>
                      <small className="text-muted"> {recipe.username}</small>
                    </div>
                    <div
                      className="px-3 py-1"
                      style={{
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        backgroundColor: recipe.status === 'Approved' ? '#e1f99aff' : (recipe.status === 'Rejected' ? '#ffdada' : '#fff4d1'),
                        color: recipe.status === 'Approved' ? '#2d6a4f' : (recipe.status === 'Rejected' ? '#c92a2a' : '#927c36')
                      }}
                    >
                      {recipe.status}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow pb-2">
              <CardHeader className="bg-transparent border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h2 className="mb-0 font-weight-bold" style={{ borderLeft: '4px solid #2dce89', paddingLeft: '15px' }}>User Status</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="pt-0">
                {userStatuses.map((user, index) => (
                  <div key={index} className="p-3 mb-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9fe', borderRadius: '12px' }}>
                    <h4 className="mb-0 font-weight-bold">{user.username}</h4>
                    <div className="d-flex align-items-center">
                      <span className="mr-2" style={{ height: '10px', width: '10px', borderRadius: '50%', backgroundColor: user.status === 'Online' ? '#2dce89' : '#adb5bd', display: 'inline-block' }}></span>
                      <div
                        className="px-2 py-1"
                        style={{
                          borderRadius: '15px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: user.status === 'Online' ? '#e2f9ed' : '#f1f3f7',
                          color: user.status === 'Online' ? '#2dce89' : '#8898aa'
                        }}
                      >
                        <span style={{ marginRight: '5px', height: '12px', width: '12px', borderRadius: '50%', background: user.status === 'Online' ? 'radial-gradient(circle, #2dce89 0%, #1a9e66 100%)' : '#adb5bd' }}></span>
                        {user.status}
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;
