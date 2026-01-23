import React, { useEffect } from "react";
import "../assets/css/bootstrap.min.css";
import "../assets/css/icons.min.css";
import "../assets/css/app.min.css";
import "../assets/css/custom.min.css";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import Chart from "react-apexcharts";

import Collapse from "react-bootstrap/Collapse";
const HomePage = () => {
  const chartOptions = {
    labels: ["Direct", "Social", "Email", "Other", "Referrals"],
    chart: {
      type: "donut",
      height: 315,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Visits",
              formatter: function () {
                return "25.3k";
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontWeight: 500,
      fontSize: "13px",
      markers: {
        width: 10,
        height: 10,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    stroke: {
      show: false,
    },
    colors: ["#405189", "#0ab39c", "#f7b84b", "#f06548", "#299cdb"],
  };

  const chartSeries = [44, 55, 41, 17, 15];
  const salesForecastData = {
    series: [
      {
        name: "Actual Sales",
        type: "column",
        data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
      },
      {
        name: "Projected Forecast",
        type: "area",
        data: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        toolbar: { show: false },
        fontFamily: "Inter, sans-serif",
      },
      stroke: {
        curve: "smooth",
        width: [0, 2],
      },
      colors: ["#405189", "rgba(10, 179, 156, 0.3)"],
      plotOptions: {
        bar: {
          columnWidth: "35%",
          borderRadius: 4,
        },
      },
      fill: {
        type: ["solid", "gradient"],
        gradient: {
          shade: "light",
          type: "vertical",
          opacityFrom: 0.5,
          opacityTo: 0.1,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        tickAmount: 5,
        labels: {
          formatter: (val) => val + "k",
        },
      },
      grid: {
        borderColor: "#f1f1f1",
        strokeDashArray: 5,
        padding: { top: 0, right: 0, bottom: 0, left: 10 },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        fontWeight: 500,
      },
    },
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-layout", "vertical");
    document.documentElement.setAttribute("data-sidebar", "dark");
    document.documentElement.setAttribute("data-topbar", "light");
    document.documentElement.setAttribute("data-sidebar-size", "lg");

    sessionStorage.setItem("data-sidebar", "dark");
  }, []);

  return (
    <>
      <div id="layout-wrapper">
        <div
          id="removeNotificationModal"
          className="modal fade zoomIn"
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  id="NotificationModalbtn-close"
                />
              </div>
              <div className="modal-body">
                <div className="mt-2 text-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/gsqxdxog.json"
                    trigger="loop"
                    colors="primary:#f7b84b,secondary:#f06548"
                    style={{ width: 100, height: 100 }}
                  />
                  <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                    <h4>Are you sure ?</h4>
                    <p className="text-muted mx-4 mb-0">
                      Are you sure you want to remove this Notification ?
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                  <button
                    type="button"
                    className="btn w-sm btn-light"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn w-sm btn-danger"
                    id="delete-notification"
                  >
                    Yes, Delete It!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="vertical-overlay" />
        <div className="row">
          <div className="col">
            <div className="h-100">
              <div className="row mb-3 pb-1">
                <div className="col-12">
                  <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                    <div className="flex-grow-1">
                      <h4 className="fs-16 mb-1">Good Morning, Anna!</h4>
                      <p className="text-muted mb-0">
                        Here's what's happening with your store today.
                      </p>
                    </div>
                    <div className="mt-3 mt-lg-0">
                      <form action="javascript:void(0);">
                        <div className="row g-3 mb-0 align-items-center">
                          <div className="col-sm-auto">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control border-0 dash-filter-picker shadow"
                                data-provider="flatpickr"
                                data-range-date="true"
                                data-date-format="d M, Y"
                                data-deafult-date="01 Jan 2022 to 31 Jan 2022"
                              />
                              <div className="input-group-text bg-primary border-primary text-white">
                                <i className="ri-calendar-2-line" />
                              </div>
                            </div>
                          </div>

                          <div className="col-auto">
                            <button
                              type="button"
                              className="btn btn-soft-success"
                            >
                              <i className="ri-add-circle-line align-middle me-1" />
                              Add Product
                            </button>
                          </div>

                          <div className="col-auto">
                            <button
                              type="button"
                              className="btn btn-soft-info btn-icon waves-effect waves-light layout-rightside-btn"
                            >
                              <i className="ri-pulse-line" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-3 col-md-6">
                  <div className="card card-animate">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1 overflow-hidden">
                          <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                            Total Earnings
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <h5 className="text-success fs-14 mb-0">
                            <i className="ri-arrow-right-up-line fs-13 align-middle" />
                            +16.24 %
                          </h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between mt-4">
                        <div>
                          <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                            $
                            <span
                              className="counter-value"
                              data-target="559.25"
                            >
                              0
                            </span>
                            k
                          </h4>
                          <a href="#" className="text-decoration-underline">
                            View net earnings
                          </a>
                        </div>
                        <div className="avatar-sm flex-shrink-0">
                          <span className="avatar-title bg-success-subtle rounded fs-3">
                            <i className="bx bx-dollar-circle text-success" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-md-6">
                  <div className="card card-animate">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1 overflow-hidden">
                          <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                            Orders
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <h5 className="text-danger fs-14 mb-0">
                            <i className="ri-arrow-right-down-line fs-13 align-middle" />
                            -3.57 %
                          </h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between mt-4">
                        <div>
                          <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                            <span className="counter-value" data-target={36894}>
                              0
                            </span>
                          </h4>
                          <a href="#" className="text-decoration-underline">
                            View all orders
                          </a>
                        </div>
                        <div className="avatar-sm flex-shrink-0">
                          <span className="avatar-title bg-info-subtle rounded fs-3">
                            <i className="bx bx-shopping-bag text-info" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-md-6">
                  <div className="card card-animate">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1 overflow-hidden">
                          <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                            Customers
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <h5 className="text-success fs-14 mb-0">
                            <i className="ri-arrow-right-up-line fs-13 align-middle" />
                            +29.08 %
                          </h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between mt-4">
                        <div>
                          <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                            <span
                              className="counter-value"
                              data-target="183.35"
                            >
                              0
                            </span>
                            M
                          </h4>
                          <a href="#" className="text-decoration-underline">
                            See details
                          </a>
                        </div>
                        <div className="avatar-sm flex-shrink-0">
                          <span className="avatar-title bg-warning-subtle rounded fs-3">
                            <i className="bx bx-user-circle text-warning" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-md-6">
                  <div className="card card-animate">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1 overflow-hidden">
                          <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                            My Balance
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <h5 className="text-muted fs-14 mb-0">+0.00 %</h5>
                        </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between mt-4">
                        <div>
                          <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                            $
                            <span
                              className="counter-value"
                              data-target="165.89"
                            >
                              0
                            </span>
                            k
                          </h4>
                          <a href="#" className="text-decoration-underline">
                            Withdraw money
                          </a>
                        </div>
                        <div className="avatar-sm flex-shrink-0">
                          <span className="avatar-title bg-primary-subtle rounded fs-3">
                            <i className="bx bx-wallet text-primary" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-8">
                  <div className="card card-height-100">
                    <div className="card-header border-0 align-items-center d-flex">
                      <h4 className="card-title mb-0 flex-grow-1">
                        Sales Forecast
                      </h4>
                      <div>
                        <button
                          type="button"
                          className="btn btn-soft-primary btn-sm mx-1"
                        >
                          1M
                        </button>
                        <button
                          type="button"
                          className="btn btn-soft-secondary btn-sm"
                        >
                          6M
                        </button>
                      </div>
                    </div>
                    <div className="card-body p-0 pb-2">
                      <div className="w-100">
                        <Chart
                          options={salesForecastData.options}
                          series={salesForecastData.series}
                          type="line"
                          height={370}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-4">
                  <div className="card card-height-100">
                    <div className="card-header align-items-center d-flex">
                      <h4 className="card-title mb-0 flex-grow-1">
                        Sales by Locations
                      </h4>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          className="btn btn-soft-primary btn-sm"
                        >
                          Export
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div
                        className="text-center mb-4"
                        style={{ height: "170px", position: "relative" }}
                      >
                        <div
                          className="w-100 h-100"
                          style={{
                            backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/c/c4/Earth_map_fixed.svg')`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            opacity: 0.1,
                          }}
                        ></div>
                        <div
                          style={{
                            position: "absolute",
                            top: "30%",
                            left: "25%",
                          }}
                        >
                          <i className="ri-map-pin-fill text-primary fs-18"></i>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "60%",
                          }}
                        >
                          <i className="ri-map-pin-fill text-success fs-18"></i>
                        </div>
                      </div>

                      <div className="mt-2">
                        {[
                          {
                            country: "Canada",
                            percentage: "75%",
                            color: "primary",
                          },
                          {
                            country: "Greenland",
                            percentage: "47%",
                            color: "success",
                          },
                          {
                            country: "Russia",
                            percentage: "82%",
                            color: "info",
                          },
                        ].map((item, index) => (
                          <div className="mb-4" key={index}>
                            <div className="d-flex align-items-center mb-2">
                              <div className="flex-grow-1">
                                <h6 className="mb-0 fs-13">{item.country}</h6>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="text-muted fs-12 fw-medium">
                                  {item.percentage}
                                </span>
                              </div>
                            </div>
                            <div
                              className="progress progress-sm animated-progess"
                              style={{ height: "5px" }}
                            >
                              <div
                                className={`progress-bar bg-${item.color}`}
                                role="progressbar"
                                style={{ width: item.percentage }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-6">
                  <div className="card card-height-100">
                    <div className="card-header align-items-center d-flex">
                      <h4 className="card-title mb-0 flex-grow-1">
                        Best Selling Products
                      </h4>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          className="btn btn-soft-primary btn-sm"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive table-card">
                        <table className="table table-hover table-centered align-middle table-nowrap mb-0">
                          <thead className="table-light text-muted">
                            <tr>
                              <th>Product</th>
                              <th>Orders</th>
                              <th>Stock</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                name: "Branded T-Shirts",
                                orders: "62",
                                stock: "In Stock",
                                amt: "$1,798",
                                color: "success",
                              },
                              {
                                name: "Bentwood Chair",
                                orders: "35",
                                stock: "Out of Stock",
                                amt: "$2,975",
                                color: "danger",
                              },
                              {
                                name: "OnePlus 7 Pro",
                                orders: "15",
                                stock: "In Stock",
                                amt: "$8,235",
                                color: "success",
                              },
                              {
                                name: "Borosil Paper Cup",
                                orders: "80",
                                stock: "Low Stock",
                                amt: "$1,120",
                                color: "warning",
                              },
                            ].map((item, idx) => (
                              <tr key={idx}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-sm bg-light rounded p-1 me-2 text-center">
                                      <i className="ri-shopping-bag-line fs-16 text-primary"></i>
                                    </div>
                                    <h6 className="fs-13 mb-0">{item.name}</h6>
                                  </div>
                                </td>
                                <td>{item.orders}</td>
                                <td>
                                  <span
                                    className={`badge bg-${item.color}-subtle text-${item.color}`}
                                  >
                                    {item.stock}
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-medium">{item.amt}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-6">
                  <div className="card card-height-100">
                    <div className="card-header align-items-center d-flex">
                      <h4 className="card-title mb-0 flex-grow-1">
                        Top Sellers
                      </h4>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          className="btn btn-soft-info btn-sm"
                        >
                          View All
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive table-card">
                        <table className="table table-hover table-centered align-middle table-nowrap mb-0">
                          <thead className="table-light text-muted">
                            <tr>
                              <th>Seller</th>
                              <th>Product</th>
                              <th>Stock</th>
                              <th>Wallet</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                name: "iTest Factory",
                                shop: "Gadgets",
                                stock: "245",
                                wallet: "$12,500",
                                img: "ri-store-2-line",
                              },
                              {
                                name: "Digitech Galaxy",
                                shop: "Electronics",
                                stock: "160",
                                wallet: "$8,200",
                                img: "ri-global-line",
                              },
                              {
                                name: "Zoetic Fashion",
                                shop: "Clothes",
                                stock: "310",
                                wallet: "$15,400",
                                img: "ri-user-star-line",
                              },
                              {
                                name: "Luxury Stores",
                                shop: "Furniture",
                                stock: "085",
                                wallet: "$4,500",
                                img: "ri-vip-diamond-line",
                              },
                            ].map((item, idx) => (
                              <tr key={idx}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-sm bg-light rounded-circle p-1 me-2 text-center">
                                      <i
                                        className={`${item.img} fs-16 text-info`}
                                      ></i>
                                    </div>
                                    <div>
                                      <h6 className="fs-13 mb-0">
                                        {item.name}
                                      </h6>
                                      <small className="text-muted">
                                        {item.shop}
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td>{item.shop}</td>
                                <td>{item.stock}</td>
                                <td>
                                  <span className="fw-medium text-success">
                                    {item.wallet}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-4">
                  <div className="card card-height-100">
                    <div className="card-header align-items-center d-flex">
                      <h4 className="card-title mb-0 flex-grow-1">
                        Store Visits by Source
                      </h4>
                      <div className="flex-shrink-0">
                        <div className="dropdown card-header-dropdown">
                          <a
                            className="text-reset dropdown-btn"
                            href="#"
                            data-bs-toggle="dropdown"
                          >
                            <span className="text-muted">
                              Report <i className="mdi mdi-chevron-down ms-1" />
                            </span>
                          </a>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a className="dropdown-item" href="#">
                              Download Report
                            </a>
                            <a className="dropdown-item" href="#">
                              Export
                            </a>
                            <a className="dropdown-item" href="#">
                              Import
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div
                        id="store-visits-source"
                        className="apex-charts"
                        dir="ltr"
                      >
                        <Chart
                          options={chartOptions}
                          series={chartSeries}
                          type="donut"
                          height={315}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-8">
                  <div className="card card-height-100">
                    <div className="card-header align-items-center d-flex">
                      <h4 className="card-title mb-0 flex-grow-1">
                        Recent Orders
                      </h4>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          className="btn btn-soft-info btn-sm"
                        >
                          <i className="ri-file-list-3-line align-middle me-1" />
                          Generate Report
                        </button>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="table-responsive table-card">
                        <table className="table table-borderless table-centered align-middle table-nowrap mb-0">
                          <thead className="text-muted table-light">
                            <tr>
                              <th scope="col">Order ID</th>
                              <th scope="col">Customer</th>
                              <th scope="col">Product</th>
                              <th scope="col">Amount</th>
                              <th scope="col">Vendor</th>
                              <th scope="col">Status</th>
                              <th scope="col">Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                id: "#VZ2112",
                                name: "Alex Smith",
                                type: "Clothes",
                                amt: "$109.00",
                                vendor: "Zoetic Fashion",
                                status: "Paid",
                                color: "success",
                                rate: "5.0",
                                votes: "61",
                              },
                              {
                                id: "#VZ2111",
                                name: "Jansh Brown",
                                type: "Kitchen Storage",
                                amt: "$149.00",
                                vendor: "Micro Design",
                                status: "Pending",
                                color: "warning",
                                rate: "4.5",
                                votes: "61",
                              },
                              {
                                id: "#VZ2109",
                                name: "Ayaan Bowen",
                                type: "Bike Accessories",
                                amt: "$215.00",
                                vendor: "Nesta Technologies",
                                status: "Paid",
                                color: "success",
                                rate: "4.9",
                                votes: "89",
                              },
                              {
                                id: "#VZ2108",
                                name: "Prezy Mark",
                                type: "Furniture",
                                amt: "$199.00",
                                vendor: "Syntyce Solutions",
                                status: "Unpaid",
                                color: "danger",
                                rate: "4.3",
                                votes: "47",
                              },
                              {
                                id: "#VZ2107",
                                name: "Vihan Hudda",
                                type: "Bags and Wallets",
                                amt: "$330.00",
                                vendor: "iTest Factory",
                                status: "Paid",
                                color: "success",
                                rate: "4.7",
                                votes: "161",
                              },
                            ].map((order, index) => (
                              <tr key={index}>
                                <td>
                                  <a
                                    href="#"
                                    className="fw-medium link-primary"
                                  >
                                    {order.id}
                                  </a>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0 me-2">
                                      <div className="avatar-xs">
                                        <div className="avatar-title rounded-circle bg-light text-primary">
                                          {order.name.charAt(0)}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex-grow-1">
                                      {order.name}
                                    </div>
                                  </div>
                                </td>
                                <td>{order.type}</td>
                                <td className="text-success">{order.amt}</td>
                                <td>{order.vendor}</td>
                                <td>
                                  <span
                                    className={`badge bg-${order.color}-subtle text-${order.color}`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td>
                                  <h5 className="fs-14 fw-medium mb-0">
                                    {order.rate}
                                    <span className="text-muted fs-11 ms-1">
                                      ({order.votes} votes)
                                    </span>
                                  </h5>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-auto layout-rightside-col">
            <div className="overlay" />
            <div className="layout-rightside">
              <div className="card h-100 rounded-0">
                <div className="card-body p-0">
                  <div className="p-3">
                    <h6 className="text-muted mb-0 text-uppercase fw-semibold">
                      Recent Activity
                    </h6>
                  </div>
                  <div
                    data-simplebar
                    style={{ maxHeight: 410 }}
                    className="p-3 pt-0"
                  >
                    <div className="acitivity-timeline acitivity-main">
                      <div className="acitivity-item d-flex">
                        <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                          <div className="avatar-title bg-success-subtle text-success rounded-circle">
                            <i className="ri-shopping-cart-2-line" />
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 lh-base">
                            Purchase by James Price
                          </h6>
                          <p className="text-muted mb-1">
                            Product noise evolve smartwatch
                          </p>
                          <small className="mb-0 text-muted">
                            02:14 PM Today
                          </small>
                        </div>
                      </div>
                      <div className="acitivity-item py-3 d-flex">
                        <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                          <div className="avatar-title bg-danger-subtle text-danger rounded-circle">
                            <i className="ri-stack-fill" />
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 lh-base">
                            Added new
                            <span className="fw-semibold">
                              style collection
                            </span>
                          </h6>
                          <p className="text-muted mb-1">
                            By Nesta Technologies
                          </p>
                          <div className="d-inline-flex gap-2 border border-dashed p-2 mb-2">
                            <a
                              href="apps-ecommerce-product-details.html"
                              className="bg-light rounded p-1"
                            >
                              <img
                                src="assets/images/products/img-8.png"
                                alt
                                className="img-fluid d-block"
                              />
                            </a>
                            <a
                              href="apps-ecommerce-product-details.html"
                              className="bg-light rounded p-1"
                            >
                              <img
                                src="assets/images/products/img-2.png"
                                alt
                                className="img-fluid d-block"
                              />
                            </a>
                            <a
                              href="apps-ecommerce-product-details.html"
                              className="bg-light rounded p-1"
                            >
                              <img
                                src="assets/images/products/img-10.png"
                                alt
                                className="img-fluid d-block"
                              />
                            </a>
                          </div>
                          <p className="mb-0 text-muted">
                            <small>9:47 PM Yesterday</small>
                          </p>
                        </div>
                      </div>
                      <div className="acitivity-item py-3 d-flex">
                        <div className="flex-shrink-0">
                          <img
                            src="assets/images/users/avatar-2.jpg"
                            alt
                            className="avatar-xs rounded-circle acitivity-avatar"
                          />
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 lh-base">
                            Natasha Carey have liked the products
                          </h6>
                          <p className="text-muted mb-1">
                            Allow users to like products in your WooCommerce
                            store.
                          </p>
                          <small className="mb-0 text-muted">
                            25 Dec, 2021
                          </small>
                        </div>
                      </div>
                      <div className="acitivity-item py-3 d-flex">
                        <div className="flex-shrink-0">
                          <div className="avatar-xs acitivity-avatar">
                            <div className="avatar-title rounded-circle bg-secondary">
                              <i className="mdi mdi-sale fs-14" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 lh-base">
                            Today offers by
                            <a
                              href="apps-ecommerce-seller-details.html"
                              className="link-secondary"
                            >
                              Digitech Galaxy
                            </a>
                          </h6>
                          <p className="text-muted mb-2">
                            Offer is valid on orders of Rs.500 Or above for
                            selected products only.
                          </p>
                          <small className="mb-0 text-muted">
                            12 Dec, 2021
                          </small>
                        </div>
                      </div>
                      <div className="acitivity-item py-3 d-flex">
                        <div className="flex-shrink-0">
                          <div className="avatar-xs acitivity-avatar">
                            <div className="avatar-title rounded-circle bg-danger-subtle text-danger">
                              <i className="ri-bookmark-fill" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 lh-base">Favorite Product</h6>
                          <p className="text-muted mb-2">
                            Esther James have Favorite product.
                          </p>
                          <small className="mb-0 text-muted">
                            25 Nov, 2021
                          </small>
                        </div>
                      </div>
                      <div className="acitivity-item py-3 d-flex">
                        <div className="flex-shrink-0">
                          <div className="avatar-xs acitivity-avatar">
                            <div className="avatar-title rounded-circle bg-secondary">
                              <i className="mdi mdi-sale fs-14" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 lh-base">
                            Flash sale starting
                            <span className="text-primary">Tomorrow.</span>
                          </h6>
                          <p className="text-muted mb-0">
                            Flash sale by
                            <a
                              href="javascript:void(0);"
                              className="link-secondary fw-medium"
                            >
                              Zoetic Fashion
                            </a>
                          </p>
                          <small className="mb-0 text-muted">
                            22 Oct, 2021
                          </small>
                        </div>
                      </div>
                      <div className="acitivity-item py-3 d-flex">
                        <div className="flex-shrink-0">
                          <div className="avatar-xs acitivity-avatar">
                            <div className="avatar-title rounded-circle bg-info-subtle text-info">
                              <i className="ri-line-chart-line" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 lh-base">Monthly sales report</h6>
                          <p className="text-muted mb-2">
                            <span className="text-danger">2 days left</span>
                            notification to submit the monthly sales report.
                            <a
                              href="javascript:void(0);"
                              className="link-warning text-decoration-underline"
                            >
                              Reports Builder
                            </a>
                          </p>
                          <small className="mb-0 text-muted">15 Oct</small>
                        </div>
                      </div>
                      <div className="acitivity-item d-flex">
                        <div className="flex-shrink-0">
                          <img
                            src="assets/images/users/avatar-3.jpg"
                            alt
                            className="avatar-xs rounded-circle acitivity-avatar"
                          />
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className="mb-1 lh-base">Frank Hook Commented</h6>
                          <p className="text-muted mb-2 fst-italic">
                            " A product that has reviews is more likable to be
                            sold than a product. "
                          </p>
                          <small className="mb-0 text-muted">
                            26 Aug, 2021
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 mt-2">
                    <h6 className="text-muted mb-3 text-uppercase fw-semibold">
                      Top 10 Categories
                    </h6>
                    <ol className="ps-3 text-muted">
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Mobile &amp; Accessories
                          <span className="float-end">(10,294)</span>
                        </a>
                      </li>
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Desktop <span className="float-end">(6,256)</span>
                        </a>
                      </li>
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Electronics <span className="float-end">(3,479)</span>
                        </a>
                      </li>
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Home &amp; Furniture
                          <span className="float-end">(2,275)</span>
                        </a>
                      </li>
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Grocery <span className="float-end">(1,950)</span>
                        </a>
                      </li>
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Fashion <span className="float-end">(1,582)</span>
                        </a>
                      </li>
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Appliances <span className="float-end">(1,037)</span>
                        </a>
                      </li>
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Beauty, Toys &amp; More
                          <span className="float-end">(924)</span>
                        </a>
                      </li>
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Food &amp; Drinks
                          <span className="float-end">(701)</span>
                        </a>
                      </li>
                      <li className="py-1">
                        <a href="#" className="text-muted">
                          Toys &amp; Games
                          <span className="float-end">(239)</span>
                        </a>
                      </li>
                    </ol>
                    <div className="mt-3 text-center">
                      <a
                        href="javascript:void(0);"
                        className="text-muted text-decoration-underline"
                      >
                        View all Categories
                      </a>
                    </div>
                  </div>
                  <div className="p-3">
                    <h6 className="text-muted mb-3 text-uppercase fw-semibold">
                      Products Reviews
                    </h6>
                    <div
                      className="swiper vertical-swiper"
                      style={{ height: 250 }}
                    >
                      <div className="swiper-wrapper">
                        <div className="swiper-slide">
                          <div className="card border border-dashed shadow-none">
                            <div className="card-body">
                              <div className="d-flex">
                                <div className="flex-shrink-0 avatar-sm">
                                  <div className="avatar-title bg-light rounded">
                                    <img
                                      src="assets/images/companies/img-1.png"
                                      alt
                                      height={30}
                                    />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div>
                                    <p className="text-muted mb-1 fst-italic text-truncate-two-lines">
                                      " Great product and looks great, lots of
                                      features. "
                                    </p>
                                    <div className="fs-11 align-middle text-warning">
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                    </div>
                                  </div>
                                  <div className="text-end mb-0 text-muted">
                                    - by
                                    <cite title="Source Title">
                                      Force Medicines
                                    </cite>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="swiper-slide">
                          <div className="card border border-dashed shadow-none">
                            <div className="card-body">
                              <div className="d-flex">
                                <div className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-3.jpg"
                                    alt
                                    className="avatar-sm rounded"
                                  />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div>
                                    <p className="text-muted mb-1 fst-italic text-truncate-two-lines">
                                      " Amazing template, very easy to
                                      understand and manipulate. "
                                    </p>
                                    <div className="fs-11 align-middle text-warning">
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-half-fill" />
                                    </div>
                                  </div>
                                  <div className="text-end mb-0 text-muted">
                                    - by
                                    <cite title="Source Title">
                                      Henry Baird
                                    </cite>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="swiper-slide">
                          <div className="card border border-dashed shadow-none">
                            <div className="card-body">
                              <div className="d-flex">
                                <div className="flex-shrink-0 avatar-sm">
                                  <div className="avatar-title bg-light rounded">
                                    <img
                                      src="assets/images/companies/img-8.png"
                                      alt
                                      height={30}
                                    />
                                  </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div>
                                    <p className="text-muted mb-1 fst-italic text-truncate-two-lines">
                                      "Very beautiful product and Very helpful
                                      customer service."
                                    </p>
                                    <div className="fs-11 align-middle text-warning">
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-line" />
                                      <i className="ri-star-line" />
                                    </div>
                                  </div>
                                  <div className="text-end mb-0 text-muted">
                                    - by
                                    <cite title="Source Title">
                                      Zoetic Fashion
                                    </cite>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="swiper-slide">
                          <div className="card border border-dashed shadow-none">
                            <div className="card-body">
                              <div className="d-flex">
                                <div className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-2.jpg"
                                    alt
                                    className="avatar-sm rounded"
                                  />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                  <div>
                                    <p className="text-muted mb-1 fst-italic text-truncate-two-lines">
                                      " The product is very beautiful. I like
                                      it. "
                                    </p>
                                    <div className="fs-11 align-middle text-warning">
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-fill" />
                                      <i className="ri-star-half-fill" />
                                      <i className="ri-star-line" />
                                    </div>
                                  </div>
                                  <div className="text-end mb-0 text-muted">
                                    - by
                                    <cite title="Source Title">
                                      Nancy Martino
                                    </cite>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h6 className="text-muted mb-3 text-uppercase fw-semibold">
                      Customer Reviews
                    </h6>
                    <div className="bg-light px-3 py-2 rounded-2 mb-2">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <div className="fs-16 align-middle text-warning">
                            <i className="ri-star-fill" />
                            <i className="ri-star-fill" />
                            <i className="ri-star-fill" />
                            <i className="ri-star-fill" />
                            <i className="ri-star-half-fill" />
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <h6 className="mb-0">4.5 out of 5</h6>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted">
                        Total <span className="fw-medium">5.50k</span> reviews
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="row align-items-center g-2">
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0">5 star</h6>
                          </div>
                        </div>
                        <div className="col">
                          <div className="p-1">
                            <div className="progress animated-progress progress-sm">
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: "50.16%" }}
                                aria-valuenow="50.16"
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0 text-muted">2758</h6>
                          </div>
                        </div>
                      </div>
                      <div className="row align-items-center g-2">
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0">4 star</h6>
                          </div>
                        </div>
                        <div className="col">
                          <div className="p-1">
                            <div className="progress animated-progress progress-sm">
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: "29.32%" }}
                                aria-valuenow="29.32"
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0 text-muted">1063</h6>
                          </div>
                        </div>
                      </div>
                      <div className="row align-items-center g-2">
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0">3 star</h6>
                          </div>
                        </div>
                        <div className="col">
                          <div className="p-1">
                            <div className="progress animated-progress progress-sm">
                              <div
                                className="progress-bar bg-warning"
                                role="progressbar"
                                style={{ width: "18.12%" }}
                                aria-valuenow="18.12"
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0 text-muted">997</h6>
                          </div>
                        </div>
                      </div>
                      <div className="row align-items-center g-2">
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0">2 star</h6>
                          </div>
                        </div>
                        <div className="col">
                          <div className="p-1">
                            <div className="progress animated-progress progress-sm">
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: "4.98%" }}
                                aria-valuenow="4.98"
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0 text-muted">227</h6>
                          </div>
                        </div>
                      </div>
                      <div className="row align-items-center g-2">
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0">1 star</h6>
                          </div>
                        </div>
                        <div className="col">
                          <div className="p-1">
                            <div className="progress animated-progress progress-sm">
                              <div
                                className="progress-bar bg-danger"
                                role="progressbar"
                                style={{ width: "7.42%" }}
                                aria-valuenow="7.42"
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="p-1">
                            <h6 className="mb-0 text-muted">408</h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card sidebar-alert bg-light border-0 text-center mx-4 mb-0 mt-3">
                    <div className="card-body">
                      <img src="assets/images/giftbox.png" alt />
                      <div className="mt-4">
                        <h5>Invite New Seller</h5>
                        <p className="text-muted lh-base">
                          Refer a new seller to us and earn $100 per refer.
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary btn-label rounded-pill"
                        >
                          <i className="ri-mail-fill label-icon align-middle rounded-pill fs-16 me-2" />
                          Invite Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="footer">
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-6">© Velzon.</div>
              <div className="col-sm-6">
                <div className="text-sm-end d-none d-sm-block">
                  Design &amp; Develop by Themesbrand
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <button
        onClick="topFunction()"
        className="btn btn-danger btn-icon"
        id="back-to-top"
      >
        <i className="ri-arrow-up-line" />
      </button>

      <div className="customizer-setting d-none d-md-block">
        <div
          className="btn-info rounded-pill shadow-lg btn btn-icon btn-lg p-2"
          data-bs-toggle="offcanvas"
          data-bs-target="#theme-settings-offcanvas"
          aria-controls="theme-settings-offcanvas"
        >
          <i className="mdi mdi-spin mdi-cog-outline fs-22" />
        </div>
      </div>
      <div
        className="offcanvas offcanvas-end border-0"
        tabIndex={-1}
        id="theme-settings-offcanvas"
      >
        <div className="d-flex align-items-center bg-primary bg-gradient p-3 offcanvas-header">
          <h5 className="m-0 me-2 text-white">Theme Customizer</h5>
          <button
            type="button"
            className="btn-close btn-close-white ms-auto"
            id="customizerclose-btn"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body p-0">
          <div data-simplebar className="h-100">
            <div className="p-4">
              <h6 className="mb-0 fw-semibold text-uppercase">Layout</h6>
              <p className="text-muted">Choose your layout</p>
              <div className="row gy-3">
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      id="customizer-layout01"
                      name="data-layout"
                      type="radio"
                      defaultValue="vertical"
                      className="form-check-input"
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="customizer-layout01"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column">
                            <span className="bg-light d-block p-1" />
                            <span className="bg-light d-block p-1 mt-auto" />
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Vertical</h5>
                </div>
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      id="customizer-layout02"
                      name="data-layout"
                      type="radio"
                      defaultValue="horizontal"
                      className="form-check-input"
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="customizer-layout02"
                    >
                      <span className="d-flex h-100 flex-column gap-1">
                        <span className="bg-light d-flex p-1 gap-1 align-items-center">
                          <span className="d-block p-1 bg-primary-subtle rounded me-1" />
                          <span className="d-block p-1 pb-0 px-2 bg-primary-subtle ms-auto" />
                          <span className="d-block p-1 pb-0 px-2 bg-primary-subtle" />
                        </span>
                        <span className="bg-light d-block p-1" />
                        <span className="bg-light d-block p-1 mt-auto" />
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Horizontal</h5>
                </div>
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      id="customizer-layout03"
                      name="data-layout"
                      type="radio"
                      defaultValue="twocolumn"
                      className="form-check-input"
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="customizer-layout03"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1">
                            <span className="d-block p-1 bg-primary-subtle mb-2" />
                            <span className="d-block p-1 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 pb-0 bg-primary-subtle" />
                          </span>
                        </span>
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column">
                            <span className="bg-light d-block p-1" />
                            <span className="bg-light d-block p-1 mt-auto" />
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Two Column</h5>
                </div>

                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      id="customizer-layout04"
                      name="data-layout"
                      type="radio"
                      defaultValue="semibox"
                      className="form-check-input"
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="customizer-layout04"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0 p-1">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column pt-1 pe-2">
                            <span className="bg-light d-block p-1" />
                            <span className="bg-light d-block p-1 mt-auto" />
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Semi Box</h5>
                </div>
              </div>
              <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                Color Scheme
              </h6>
              <p className="text-muted">Choose Light or Dark Scheme.</p>
              <div className="colorscheme-cardradio">
                <div className="row">
                  <div className="col-4">
                    <div className="form-check card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-bs-theme"
                        id="layout-mode-light"
                        defaultValue="light"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="layout-mode-light"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Light</h5>
                  </div>
                  <div className="col-4">
                    <div className="form-check card-radio dark">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-bs-theme"
                        id="layout-mode-dark"
                        defaultValue="dark"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100 bg-dark"
                        htmlFor="layout-mode-dark"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-white bg-opacity-10 d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10" />
                              <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10" />
                              <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-white bg-opacity-10 d-block p-1" />
                              <span className="bg-white bg-opacity-10 d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Dark</h5>
                  </div>
                </div>
              </div>
              <div id="sidebar-visibility">
                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                  Sidebar Visibility
                </h6>
                <p className="text-muted">Choose show or Hidden sidebar.</p>
                <div className="row">
                  <div className="col-4">
                    <div className="form-check card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar-visibility"
                        id="sidebar-visibility-show"
                        defaultValue="show"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="sidebar-visibility-show"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0 p-1">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column pt-1 pe-2">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Show</h5>
                  </div>
                  <div className="col-4">
                    <div className="form-check card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar-visibility"
                        id="sidebar-visibility-hidden"
                        defaultValue="hidden"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100 px-2"
                        htmlFor="sidebar-visibility-hidden"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column pt-1 px-2">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Hidden</h5>
                  </div>
                </div>
              </div>
              <div id="layout-width">
                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                  Layout Width
                </h6>
                <p className="text-muted">Choose Fluid or Boxed layout.</p>
                <div className="row">
                  <div className="col-4">
                    <div className="form-check card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-layout-width"
                        id="layout-width-fluid"
                        defaultValue="fluid"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="layout-width-fluid"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Fluid</h5>
                  </div>
                  <div className="col-4">
                    <div className="form-check card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-layout-width"
                        id="layout-width-boxed"
                        defaultValue="boxed"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100 px-2"
                        htmlFor="layout-width-boxed"
                      >
                        <span className="d-flex gap-1 h-100 border-start border-end">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Boxed</h5>
                  </div>
                </div>
              </div>
              <div id="layout-position">
                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                  Layout Position
                </h6>
                <p className="text-muted">
                  Choose Fixed or Scrollable Layout Position.
                </p>
                <div className="btn-group radio" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="data-layout-position"
                    id="layout-position-fixed"
                    defaultValue="fixed"
                  />
                  <label
                    className="btn btn-light w-sm"
                    htmlFor="layout-position-fixed"
                  >
                    Fixed
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name="data-layout-position"
                    id="layout-position-scrollable"
                    defaultValue="scrollable"
                  />
                  <label
                    className="btn btn-light w-sm ms-0"
                    htmlFor="layout-position-scrollable"
                  >
                    Scrollable
                  </label>
                </div>
              </div>
              <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                Topbar Color
              </h6>
              <p className="text-muted">Choose Light or Dark Topbar Color.</p>
              <div className="row">
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="data-topbar"
                      id="topbar-color-light"
                      defaultValue="light"
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="topbar-color-light"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column">
                            <span className="bg-light d-block p-1" />
                            <span className="bg-light d-block p-1 mt-auto" />
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Light</h5>
                </div>
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="data-topbar"
                      id="topbar-color-dark"
                      defaultValue="dark"
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="topbar-color-dark"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column">
                            <span className="bg-primary d-block p-1" />
                            <span className="bg-light d-block p-1 mt-auto" />
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Dark</h5>
                </div>
              </div>
              <div id="sidebar-size">
                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                  Sidebar Size
                </h6>
                <p className="text-muted">Choose a size of Sidebar.</p>
                <div className="row">
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar-size"
                        id="sidebar-size-default"
                        defaultValue="lg"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="sidebar-size-default"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Default</h5>
                  </div>
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar-size"
                        id="sidebar-size-compact"
                        defaultValue="md"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="sidebar-size-compact"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Compact</h5>
                  </div>
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar-size"
                        id="sidebar-size-small"
                        defaultValue="sm"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="sidebar-size-small"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1">
                              <span className="d-block p-1 bg-primary-subtle mb-2" />
                              <span className="d-block p-1 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">
                      Small (Icon View)
                    </h5>
                  </div>
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar-size"
                        id="sidebar-size-small-hover"
                        defaultValue="sm-hover"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="sidebar-size-small-hover"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1">
                              <span className="d-block p-1 bg-primary-subtle mb-2" />
                              <span className="d-block p-1 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Small Hover View</h5>
                  </div>
                </div>
              </div>
              <div id="sidebar-view">
                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                  Sidebar View
                </h6>
                <p className="text-muted">
                  Choose Default or Detached Sidebar view.
                </p>
                <div className="row">
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-layout-style"
                        id="sidebar-view-default"
                        defaultValue="default"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="sidebar-view-default"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Default</h5>
                  </div>
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-layout-style"
                        id="sidebar-view-detached"
                        defaultValue="detached"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="sidebar-view-detached"
                      >
                        <span className="d-flex h-100 flex-column">
                          <span className="bg-light d-flex p-1 gap-1 align-items-center px-2">
                            <span className="d-block p-1 bg-primary-subtle rounded me-1" />
                            <span className="d-block p-1 pb-0 px-2 bg-primary-subtle ms-auto" />
                            <span className="d-block p-1 pb-0 px-2 bg-primary-subtle" />
                          </span>
                          <span className="d-flex gap-1 h-100 p-1 px-2">
                            <span className="flex-shrink-0">
                              <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              </span>
                            </span>
                          </span>
                          <span className="bg-light d-block p-1 mt-auto px-2" />
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Detached</h5>
                  </div>
                </div>
              </div>
              <div id="sidebar-color">
                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                  Sidebar Color
                </h6>
                <p className="text-muted">Choose a color of Sidebar.</p>
                <div className="row">
                  <div className="col-4">
                    <div
                      className="form-check sidebar-setting card-radio"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseBgGradient.show"
                    >
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar"
                        id="sidebar-color-light"
                        defaultValue="light"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="sidebar-color-light"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-white border-end d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Light</h5>
                  </div>
                  <div className="col-4">
                    <div
                      className="form-check sidebar-setting card-radio"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseBgGradient.show"
                    >
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar"
                        id="sidebar-color-dark"
                        defaultValue="dark"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="sidebar-color-dark"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-primary d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10" />
                              <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10" />
                              <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Dark</h5>
                  </div>
                  <div className="col-4">
                    <button
                      className="btn btn-link avatar-md w-100 p-0 overflow-hidden border collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseBgGradient"
                      aria-expanded="false"
                      aria-controls="collapseBgGradient"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                          <span className="bg-vertical-gradient d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2" />
                            <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10" />
                            <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10" />
                            <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10" />
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column">
                            <span className="bg-light d-block p-1" />
                            <span className="bg-light d-block p-1 mt-auto" />
                          </span>
                        </span>
                      </span>
                    </button>
                    <h5 className="fs-13 text-center mt-2">Gradient</h5>
                  </div>
                </div>
                <div className="collapse" id="collapseBgGradient">
                  <div className="d-flex gap-2 flex-wrap img-switch p-2 px-3 bg-light rounded">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar"
                        id="sidebar-color-gradient"
                        defaultValue="gradient"
                      />
                      <label
                        className="form-check-label p-0 avatar-xs rounded-circle"
                        htmlFor="sidebar-color-gradient"
                      >
                        <span className="avatar-title rounded-circle bg-vertical-gradient" />
                      </label>
                    </div>
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar"
                        id="sidebar-color-gradient-2"
                        defaultValue="gradient-2"
                      />
                      <label
                        className="form-check-label p-0 avatar-xs rounded-circle"
                        htmlFor="sidebar-color-gradient-2"
                      >
                        <span className="avatar-title rounded-circle bg-vertical-gradient-2" />
                      </label>
                    </div>
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar"
                        id="sidebar-color-gradient-3"
                        defaultValue="gradient-3"
                      />
                      <label
                        className="form-check-label p-0 avatar-xs rounded-circle"
                        htmlFor="sidebar-color-gradient-3"
                      >
                        <span className="avatar-title rounded-circle bg-vertical-gradient-3" />
                      </label>
                    </div>
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-sidebar"
                        id="sidebar-color-gradient-4"
                        defaultValue="gradient-4"
                      />
                      <label
                        className="form-check-label p-0 avatar-xs rounded-circle"
                        htmlFor="sidebar-color-gradient-4"
                      >
                        <span className="avatar-title rounded-circle bg-vertical-gradient-4" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div id="sidebar-img">
                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                  Sidebar Images
                </h6>
                <p className="text-muted">Choose a image of Sidebar.</p>
                <div className="d-flex gap-2 flex-wrap img-switch">
                  <div className="form-check sidebar-setting card-radio">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="data-sidebar-image"
                      id="sidebarimg-none"
                      defaultValue="none"
                    />
                    <label
                      className="form-check-label p-0 avatar-sm h-auto"
                      htmlFor="sidebarimg-none"
                    >
                      <span className="avatar-md w-auto bg-light d-flex align-items-center justify-content-center">
                        <i className="ri-close-fill fs-20" />
                      </span>
                    </label>
                  </div>
                  <div className="form-check sidebar-setting card-radio">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="data-sidebar-image"
                      id="sidebarimg-01"
                      defaultValue="img-1"
                    />
                    <label
                      className="form-check-label p-0 avatar-sm h-auto"
                      htmlFor="sidebarimg-01"
                    >
                      <img
                        src="assets/images/sidebar/img-1.jpg"
                        alt
                        className="avatar-md w-auto object-fit-cover"
                      />
                    </label>
                  </div>
                  <div className="form-check sidebar-setting card-radio">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="data-sidebar-image"
                      id="sidebarimg-02"
                      defaultValue="img-2"
                    />
                    <label
                      className="form-check-label p-0 avatar-sm h-auto"
                      htmlFor="sidebarimg-02"
                    >
                      <img
                        src="assets/images/sidebar/img-2.jpg"
                        alt
                        className="avatar-md w-auto object-fit-cover"
                      />
                    </label>
                  </div>
                  <div className="form-check sidebar-setting card-radio">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="data-sidebar-image"
                      id="sidebarimg-03"
                      defaultValue="img-3"
                    />
                    <label
                      className="form-check-label p-0 avatar-sm h-auto"
                      htmlFor="sidebarimg-03"
                    >
                      <img
                        src="assets/images/sidebar/img-3.jpg"
                        alt
                        className="avatar-md w-auto object-fit-cover"
                      />
                    </label>
                  </div>
                  <div className="form-check sidebar-setting card-radio">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="data-sidebar-image"
                      id="sidebarimg-04"
                      defaultValue="img-4"
                    />
                    <label
                      className="form-check-label p-0 avatar-sm h-auto"
                      htmlFor="sidebarimg-04"
                    >
                      <img
                        src="assets/images/sidebar/img-4.jpg"
                        alt
                        className="avatar-md w-auto object-fit-cover"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div id="preloader-menu">
                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                  Preloader
                </h6>
                <p className="text-muted">Choose a preloader.</p>
                <div className="row">
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-preloader"
                        id="preloader-view-custom"
                        defaultValue="enable"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="preloader-view-custom"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                        <div
                          id="status"
                          className="d-flex align-items-center justify-content-center"
                        >
                          <div
                            className="spinner-border text-primary avatar-xxs m-auto"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Enable</h5>
                  </div>
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-preloader"
                        id="preloader-view-none"
                        defaultValue="disable"
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="preloader-view-none"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle" />
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1" />
                              <span className="bg-light d-block p-1 mt-auto" />
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Disable</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="offcanvas-footer border-top p-3 text-center">
          <div className="row">
            <div className="col-6">
              <button
                type="button"
                className="btn btn-light w-100"
                id="reset-layout"
              >
                Reset
              </button>
            </div>
            <div className="col-6">
              <a
                href="https://1.envato.market/velzon-admin"
                target="_blank"
                className="btn btn-primary w-100"
              >
                Buy Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
