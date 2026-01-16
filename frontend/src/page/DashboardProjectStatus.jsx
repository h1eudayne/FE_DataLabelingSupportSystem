import React from "react";

const DashboardProjectStatus = () => {
  return (
    <div class="container-fluid">
      <div>
        {/* start page title */}
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Projects</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="javascript: void(0);">Dashboards</a>
                  </li>
                  <li className="breadcrumb-item active">Projects</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        {/* end page title */}
        <div className="row project-wrapper">
          <div className="col-xxl-8">
            <div className="row">
              <div className="col-xl-4">
                <div className="card card-animate">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm flex-shrink-0">
                        <span className="avatar-title bg-primary-subtle text-primary rounded-2 fs-2">
                          <i
                            data-feather="briefcase"
                            className="text-primary"
                          />
                        </span>
                      </div>
                      <div className="flex-grow-1 overflow-hidden ms-3">
                        <p className="text-uppercase fw-medium text-muted text-truncate mb-3">
                          Active Projects
                        </p>
                        <div className="d-flex align-items-center mb-3">
                          <h4 className="fs-4 flex-grow-1 mb-0">
                            <span className="counter-value" data-target={825}>
                              0
                            </span>
                          </h4>
                          <span className="badge bg-danger-subtle text-danger fs-12">
                            <i className="ri-arrow-down-s-line fs-13 align-middle me-1" />
                            5.02 %
                          </span>
                        </div>
                        <p className="text-muted text-truncate mb-0">
                          Projects this month
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* end card body */}
                </div>
              </div>
              {/* end col */}
              <div className="col-xl-4">
                <div className="card card-animate">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm flex-shrink-0">
                        <span className="avatar-title bg-warning-subtle text-warning rounded-2 fs-2">
                          <i data-feather="award" className="text-warning" />
                        </span>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <p className="text-uppercase fw-medium text-muted mb-3">
                          New Leads
                        </p>
                        <div className="d-flex align-items-center mb-3">
                          <h4 className="fs-4 flex-grow-1 mb-0">
                            <span className="counter-value" data-target={7522}>
                              0
                            </span>
                          </h4>
                          <span className="badge bg-success-subtle text-success fs-12">
                            <i className="ri-arrow-up-s-line fs-13 align-middle me-1" />
                            3.58 %
                          </span>
                        </div>
                        <p className="text-muted mb-0">Leads this month</p>
                      </div>
                    </div>
                  </div>
                  {/* end card body */}
                </div>
              </div>
              {/* end col */}
              <div className="col-xl-4">
                <div className="card card-animate">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm flex-shrink-0">
                        <span className="avatar-title bg-info-subtle text-info rounded-2 fs-2">
                          <i data-feather="clock" className="text-info" />
                        </span>
                      </div>
                      <div className="flex-grow-1 overflow-hidden ms-3">
                        <p className="text-uppercase fw-medium text-muted text-truncate mb-3">
                          Total Hours
                        </p>
                        <div className="d-flex align-items-center mb-3">
                          <h4 className="fs-4 flex-grow-1 mb-0">
                            <span className="counter-value" data-target={168}>
                              0
                            </span>
                            h{" "}
                            <span className="counter-value" data-target={40}>
                              0
                            </span>
                            m
                          </h4>
                          <span className="badge bg-danger-subtle text-danger fs-12">
                            <i className="ri-arrow-down-s-line fs-13 align-middle me-1" />
                            10.35 %
                          </span>
                        </div>
                        <p className="text-muted text-truncate mb-0">
                          Work this month
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* end card body */}
                </div>
              </div>
              {/* end col */}
            </div>
            {/* end row */}
            <div className="row">
              <div className="col-xl-12">
                <div className="card">
                  <div className="card-header border-0 align-items-center d-flex">
                    <h4 className="card-title mb-0 flex-grow-1">
                      Projects Overview
                    </h4>
                    <div>
                      <button
                        type="button"
                        className="btn btn-soft-secondary btn-sm"
                      >
                        ALL
                      </button>
                      <button
                        type="button"
                        className="btn btn-soft-secondary btn-sm"
                      >
                        1M
                      </button>
                      <button
                        type="button"
                        className="btn btn-soft-secondary btn-sm"
                      >
                        6M
                      </button>
                      <button
                        type="button"
                        className="btn btn-soft-primary btn-sm"
                      >
                        1Y
                      </button>
                    </div>
                  </div>
                  {/* end card header */}
                  <div className="card-header p-0 border-0 bg-light-subtle">
                    <div className="row g-0 text-center">
                      <div className="col-6 col-sm-3">
                        <div className="p-3 border border-dashed border-start-0">
                          <h5 className="mb-1">
                            <span className="counter-value" data-target={9851}>
                              0
                            </span>
                          </h5>
                          <p className="text-muted mb-0">Number of Projects</p>
                        </div>
                      </div>
                      {/*end col*/}
                      <div className="col-6 col-sm-3">
                        <div className="p-3 border border-dashed border-start-0">
                          <h5 className="mb-1">
                            <span className="counter-value" data-target={1026}>
                              0
                            </span>
                          </h5>
                          <p className="text-muted mb-0">Active Projects</p>
                        </div>
                      </div>
                      {/*end col*/}
                      <div className="col-6 col-sm-3">
                        <div className="p-3 border border-dashed border-start-0">
                          <h5 className="mb-1">
                            $
                            <span
                              className="counter-value"
                              data-target="228.89"
                            >
                              0
                            </span>
                            k
                          </h5>
                          <p className="text-muted mb-0">Revenue</p>
                        </div>
                      </div>
                      {/*end col*/}
                      <div className="col-6 col-sm-3">
                        <div className="p-3 border border-dashed border-start-0 border-end-0">
                          <h5 className="mb-1 text-success">
                            <span className="counter-value" data-target={10589}>
                              0
                            </span>
                            h
                          </h5>
                          <p className="text-muted mb-0">Working Hours</p>
                        </div>
                      </div>
                      {/*end col*/}
                    </div>
                  </div>
                  {/* end card header */}
                  <div className="card-body p-0 pb-2">
                    <div>
                      <div
                        id="projects-overview-chart"
                        data-colors='["--vz-primary", "--vz-warning", "--vz-success"]'
                        dir="ltr"
                        className="apex-charts"
                      />
                    </div>
                  </div>
                  {/* end card body */}
                </div>
                {/* end card */}
              </div>
              {/* end col */}
            </div>
            {/* end row */}
          </div>
          {/* end col */}
          <div className="col-xxl-4">
            <div className="card">
              <div className="card-header border-0">
                <h4 className="card-title mb-0">Upcoming Schedules</h4>
              </div>
              {/* end cardheader */}
              <div className="card-body pt-0">
                <div className="upcoming-scheduled">
                  <input
                    type="text"
                    className="form-control"
                    data-provider="flatpickr"
                    data-date-format="d M, Y"
                    data-deafult-date="today"
                    data-inline-date="true"
                  />
                </div>
                <h6 className="text-uppercase fw-semibold mt-4 mb-3 text-muted">
                  Events:
                </h6>
                <div className="mini-stats-wid d-flex align-items-center mt-3">
                  <div className="flex-shrink-0 avatar-sm">
                    <span className="mini-stat-icon avatar-title rounded-circle text-success bg-success-subtle fs-4">
                      09
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1">Development planning</h6>
                    <p className="text-muted mb-0">iTest Factory </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-muted mb-0">
                      9:20 <span className="text-uppercase">am</span>
                    </p>
                  </div>
                </div>
                {/* end */}
                <div className="mini-stats-wid d-flex align-items-center mt-3">
                  <div className="flex-shrink-0 avatar-sm">
                    <span className="mini-stat-icon avatar-title rounded-circle text-success bg-success-subtle fs-4">
                      12
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1">Design new UI and check sales</h6>
                    <p className="text-muted mb-0">Meta4Systems</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-muted mb-0">
                      11:30 <span className="text-uppercase">am</span>
                    </p>
                  </div>
                </div>
                {/* end */}
                <div className="mini-stats-wid d-flex align-items-center mt-3">
                  <div className="flex-shrink-0 avatar-sm">
                    <span className="mini-stat-icon avatar-title rounded-circle text-success bg-success-subtle fs-4">
                      25
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1">Weekly catch-up </h6>
                    <p className="text-muted mb-0">Nesta Technologies</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-muted mb-0">
                      02:00 <span className="text-uppercase">pm</span>
                    </p>
                  </div>
                </div>
                {/* end */}
                <div className="mini-stats-wid d-flex align-items-center mt-3">
                  <div className="flex-shrink-0 avatar-sm">
                    <span className="mini-stat-icon avatar-title rounded-circle text-success bg-success-subtle fs-4">
                      27
                    </span>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="mb-1">James Bangs (Client) Meeting</h6>
                    <p className="text-muted mb-0">Nesta Technologies</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-muted mb-0">
                      03:45 <span className="text-uppercase">pm</span>
                    </p>
                  </div>
                </div>
                {/* end */}
                <div className="mt-3 text-center">
                  <a
                    href="javascript:void(0);"
                    className="text-muted text-decoration-underline"
                  >
                    View all Events
                  </a>
                </div>
              </div>
              {/* end cardbody */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col-xl-7">
            <div className="card card-height-100">
              <div className="card-header d-flex align-items-center">
                <h4 className="card-title flex-grow-1 mb-0">Active Projects</h4>
                <div className="flex-shrink-0">
                  <a
                    href="javascript:void(0);"
                    className="btn btn-soft-info btn-sm"
                  >
                    Export Report
                  </a>
                </div>
              </div>
              {/* end cardheader */}
              <div className="card-body">
                <div className="table-responsive table-card">
                  <table className="table table-nowrap table-centered align-middle">
                    <thead className="bg-light text-muted">
                      <tr>
                        <th scope="col">Project Name</th>
                        <th scope="col">Project Lead</th>
                        <th scope="col">Progress</th>
                        <th scope="col">Assignee</th>
                        <th scope="col">Status</th>
                        <th scope="col" style={{ width: "10%" }}>
                          Due Date
                        </th>
                      </tr>
                      {/* end tr */}
                    </thead>
                    {/* thead */}
                    <tbody>
                      <tr>
                        <td className="fw-medium">Brand Logo Design</td>
                        <td>
                          <img
                            src="assets/images/users/avatar-1.jpg"
                            className="avatar-xxs rounded-circle me-1"
                            alt
                          />
                          <a href="javascript: void(0);" className="text-reset">
                            Donald Risher
                          </a>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 me-1 text-muted fs-13">
                              53%
                            </div>
                            <div
                              className="progress progress-sm  flex-grow-1"
                              style={{ width: "68%" }}
                            >
                              <div
                                className="progress-bar bg-primary rounded"
                                role="progressbar"
                                style={{ width: "53%" }}
                                aria-valuenow={53}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="avatar-group flex-nowrap">
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-1.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-2.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-3.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-warning-subtle text-warning">
                            Inprogress
                          </span>
                        </td>
                        <td className="text-muted">06 Sep 2021</td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="fw-medium">Redesign - Landing Page</td>
                        <td>
                          <img
                            src="assets/images/users/avatar-2.jpg"
                            className="avatar-xxs rounded-circle me-1"
                            alt
                          />
                          <a href="javascript: void(0);" className="text-reset">
                            Prezy William
                          </a>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 text-muted me-1">
                              0%
                            </div>
                            <div
                              className="progress progress-sm flex-grow-1"
                              style={{ width: "68%" }}
                            >
                              <div
                                className="progress-bar bg-primary rounded"
                                role="progressbar"
                                style={{ width: "0%" }}
                                aria-valuenow={0}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="avatar-group">
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-5.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-6.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-danger-subtle text-danger">
                            Pending
                          </span>
                        </td>
                        <td className="text-muted">13 Nov 2021</td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="fw-medium">
                          Multipurpose Landing Template
                        </td>
                        <td>
                          <img
                            src="assets/images/users/avatar-3.jpg"
                            className="avatar-xxs rounded-circle me-1"
                            alt
                          />
                          <a href="javascript: void(0);" className="text-reset">
                            Boonie Hoynas
                          </a>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 text-muted me-1">
                              100%
                            </div>
                            <div
                              className="progress progress-sm flex-grow-1"
                              style={{ width: "68%" }}
                            >
                              <div
                                className="progress-bar bg-primary rounded"
                                role="progressbar"
                                style={{ width: "100%" }}
                                aria-valuenow={100}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="avatar-group">
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-7.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-8.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success">
                            Completed
                          </span>
                        </td>
                        <td className="text-muted">26 Nov 2021</td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="fw-medium">Chat Application</td>
                        <td>
                          <img
                            src="assets/images/users/avatar-5.jpg"
                            className="avatar-xxs rounded-circle me-1"
                            alt
                          />
                          <a href="javascript: void(0);" className="text-reset">
                            Pauline Moll
                          </a>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 text-muted me-1">
                              64%
                            </div>
                            <div
                              className="progress flex-grow-1 progress-sm"
                              style={{ width: "68%" }}
                            >
                              <div
                                className="progress-bar bg-primary rounded"
                                role="progressbar"
                                style={{ width: "64%" }}
                                aria-valuenow={64}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="avatar-group">
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-2.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-warning-subtle text-warning">
                            Progress
                          </span>
                        </td>
                        <td className="text-muted">15 Dec 2021</td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="fw-medium">Create Wireframe</td>
                        <td>
                          <img
                            src="assets/images/users/avatar-6.jpg"
                            className="avatar-xxs rounded-circle me-1"
                            alt
                          />
                          <a href="javascript: void(0);" className="text-reset">
                            James Bangs
                          </a>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0 text-muted me-1">
                              77%
                            </div>
                            <div
                              className="progress flex-grow-1 progress-sm"
                              style={{ width: "68%" }}
                            >
                              <div
                                className="progress-bar bg-primary rounded"
                                role="progressbar"
                                style={{ width: "77%" }}
                                aria-valuenow={77}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="avatar-group">
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-1.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-6.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                            <div className="avatar-group-item">
                              <a
                                href="javascript: void(0);"
                                className="d-inline-block"
                              >
                                <img
                                  src="assets/images/users/avatar-4.jpg"
                                  alt
                                  className="rounded-circle avatar-xxs"
                                />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-warning-subtle text-warning">
                            Progress
                          </span>
                        </td>
                        <td className="text-muted">21 Dec 2021</td>
                      </tr>
                      {/* end tr */}
                    </tbody>
                    {/* end tbody */}
                  </table>
                  {/* end table */}
                </div>
                <div className="align-items-center mt-xl-3 mt-4 justify-content-between d-flex">
                  <div className="flex-shrink-0">
                    <div className="text-muted">
                      Showing <span className="fw-semibold">5</span> of{" "}
                      <span className="fw-semibold">25</span> Results{" "}
                    </div>
                  </div>
                  <ul className="pagination pagination-separated pagination-sm mb-0">
                    <li className="page-item disabled">
                      <a href="#" className="page-link">
                        ←
                      </a>
                    </li>
                    <li className="page-item">
                      <a href="#" className="page-link">
                        1
                      </a>
                    </li>
                    <li className="page-item active">
                      <a href="#" className="page-link">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a href="#" className="page-link">
                        3
                      </a>
                    </li>
                    <li className="page-item">
                      <a href="#" className="page-link">
                        →
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              {/* end card body */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xl-5">
            <div className="card card-height-100">
              <div className="card-header align-items-center d-flex">
                <h4 className="card-title mb-0 flex-grow-1 py-1">My Tasks</h4>
                <div className="flex-shrink-0">
                  <div className="dropdown card-header-dropdown">
                    <a
                      className="text-reset dropdown-btn"
                      href="#"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <span className="text-muted">
                        All Tasks <i className="mdi mdi-chevron-down ms-1" />
                      </span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a className="dropdown-item" href="#">
                        All Tasks
                      </a>
                      <a className="dropdown-item" href="#">
                        Completed{" "}
                      </a>
                      <a className="dropdown-item" href="#">
                        Inprogress
                      </a>
                      <a className="dropdown-item" href="#">
                        Pending
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* end card header */}
              <div className="card-body">
                <div className="table-responsive table-card">
                  <table className="table table-borderless table-nowrap table-centered align-middle mb-0">
                    <thead className="table-light text-muted">
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Dedline</th>
                        <th scope="col">Status</th>
                        <th scope="col">Assignee</th>
                      </tr>
                    </thead>
                    {/* end thead */}
                    <tbody>
                      <tr>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input fs-15"
                              type="checkbox"
                              defaultValue
                              id="checkTask1"
                            />
                            <label
                              className="form-check-label ms-1"
                              htmlFor="checkTask1"
                            >
                              Create new Admin Template
                            </label>
                          </div>
                        </td>
                        <td className="text-muted">03 Nov 2021</td>
                        <td>
                          <span className="badge bg-success-subtle text-success">
                            Completed
                          </span>
                        </td>
                        <td>
                          <a
                            href="javascript: void(0);"
                            className="d-inline-block"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title
                            data-bs-original-title="Mary Stoner"
                          >
                            <img
                              src="assets/images/users/avatar-2.jpg"
                              alt
                              className="rounded-circle avatar-xxs"
                            />
                          </a>
                        </td>
                      </tr>
                      {/* end */}
                      <tr>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input fs-15"
                              type="checkbox"
                              defaultValue
                              id="checkTask2"
                            />
                            <label
                              className="form-check-label ms-1"
                              htmlFor="checkTask2"
                            >
                              Marketing Coordinator
                            </label>
                          </div>
                        </td>
                        <td className="text-muted">17 Nov 2021</td>
                        <td>
                          <span className="badge bg-warning-subtle text-warning">
                            Progress
                          </span>
                        </td>
                        <td>
                          <a
                            href="javascript: void(0);"
                            className="d-inline-block"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title
                            data-bs-original-title="Den Davis"
                          >
                            <img
                              src="assets/images/users/avatar-7.jpg"
                              alt
                              className="rounded-circle avatar-xxs"
                            />
                          </a>
                        </td>
                      </tr>
                      {/* end */}
                      <tr>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input fs-15"
                              type="checkbox"
                              defaultValue
                              id="checkTask3"
                            />
                            <label
                              className="form-check-label ms-1"
                              htmlFor="checkTask3"
                            >
                              Administrative Analyst
                            </label>
                          </div>
                        </td>
                        <td className="text-muted">26 Nov 2021</td>
                        <td>
                          <span className="badge bg-success-subtle text-success">
                            Completed
                          </span>
                        </td>
                        <td>
                          <a
                            href="javascript: void(0);"
                            className="d-inline-block"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title
                            data-bs-original-title="Alex Brown"
                          >
                            <img
                              src="assets/images/users/avatar-6.jpg"
                              alt
                              className="rounded-circle avatar-xxs"
                            />
                          </a>
                        </td>
                      </tr>
                      {/* end */}
                      <tr>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input fs-15"
                              type="checkbox"
                              defaultValue
                              id="checkTask4"
                            />
                            <label
                              className="form-check-label ms-1"
                              htmlFor="checkTask4"
                            >
                              E-commerce Landing Page
                            </label>
                          </div>
                        </td>
                        <td className="text-muted">10 Dec 2021</td>
                        <td>
                          <span className="badge bg-danger-subtle text-danger">
                            Pending
                          </span>
                        </td>
                        <td>
                          <a
                            href="javascript: void(0);"
                            className="d-inline-block"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title
                            data-bs-original-title="Prezy Morin"
                          >
                            <img
                              src="assets/images/users/avatar-5.jpg"
                              alt
                              className="rounded-circle avatar-xxs"
                            />
                          </a>
                        </td>
                      </tr>
                      {/* end */}
                      <tr>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input fs-15"
                              type="checkbox"
                              defaultValue
                              id="checkTask5"
                            />
                            <label
                              className="form-check-label ms-1"
                              htmlFor="checkTask5"
                            >
                              UI/UX Design
                            </label>
                          </div>
                        </td>
                        <td className="text-muted">22 Dec 2021</td>
                        <td>
                          <span className="badge bg-warning-subtle text-warning">
                            Progress
                          </span>
                        </td>
                        <td>
                          <a
                            href="javascript: void(0);"
                            className="d-inline-block"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title
                            data-bs-original-title="Stine Nielsen"
                          >
                            <img
                              src="assets/images/users/avatar-1.jpg"
                              alt
                              className="rounded-circle avatar-xxs"
                            />
                          </a>
                        </td>
                      </tr>
                      {/* end */}
                      <tr>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input fs-15"
                              type="checkbox"
                              defaultValue
                              id="checkTask6"
                            />
                            <label
                              className="form-check-label ms-1"
                              htmlFor="checkTask6"
                            >
                              Projects Design
                            </label>
                          </div>
                        </td>
                        <td className="text-muted">31 Dec 2021</td>
                        <td>
                          <span className="badge bg-danger-subtle text-danger">
                            Pending
                          </span>
                        </td>
                        <td>
                          <a
                            href="javascript: void(0);"
                            className="d-inline-block"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title
                            data-bs-original-title="Jansh William"
                          >
                            <img
                              src="assets/images/users/avatar-4.jpg"
                              alt
                              className="rounded-circle avatar-xxs"
                            />
                          </a>
                        </td>
                      </tr>
                      {/* end */}
                    </tbody>
                    {/* end tbody */}
                  </table>
                  {/* end table */}
                </div>
                <div className="mt-3 text-center">
                  <a
                    href="javascript:void(0);"
                    className="text-muted text-decoration-underline"
                  >
                    Load More
                  </a>
                </div>
              </div>
              {/* end cardbody */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col-xxl-4">
            <div className="card card-height-100">
              <div className="card-header align-items-center d-flex">
                <h4 className="card-title mb-0 flex-grow-1">Team Members</h4>
                <div className="flex-shrink-0">
                  <div className="dropdown card-header-dropdown">
                    <a
                      className="text-reset dropdown-btn"
                      href="#"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <span className="fw-semibold text-uppercase fs-12">
                        Sort by:{" "}
                      </span>
                      <span className="text-muted">
                        Last 30 Days
                        <i className="mdi mdi-chevron-down ms-1" />
                      </span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a className="dropdown-item" href="#">
                        Today
                      </a>
                      <a className="dropdown-item" href="#">
                        Yesterday
                      </a>
                      <a className="dropdown-item" href="#">
                        Last 7 Days
                      </a>
                      <a className="dropdown-item" href="#">
                        Last 30 Days
                      </a>
                      <a className="dropdown-item" href="#">
                        This Month
                      </a>
                      <a className="dropdown-item" href="#">
                        Last Month
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* end card header */}
              <div className="card-body">
                <div className="table-responsive table-card">
                  <table className="table table-borderless table-nowrap align-middle mb-0">
                    <thead className="table-light text-muted">
                      <tr>
                        <th scope="col">Member</th>
                        <th scope="col">Hours</th>
                        <th scope="col">Tasks</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="d-flex">
                          <img
                            src="assets/images/users/avatar-1.jpg"
                            alt
                            className="avatar-xs rounded-3 me-2"
                          />
                          <div>
                            <h5 className="fs-13 mb-0">Donald Risher</h5>
                            <p className="fs-12 mb-0 text-muted">
                              Product Manager
                            </p>
                          </div>
                        </td>
                        <td>
                          <h6 className="mb-0">
                            110h : <span className="text-muted">150h</span>
                          </h6>
                        </td>
                        <td>258</td>
                        <td style={{ width: "5%" }}>
                          <div
                            id="radialBar_chart_1"
                            data-colors='["--vz-primary"]'
                            data-chart-series={50}
                            className="apex-charts"
                            dir="ltr"
                          />
                        </td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="d-flex">
                          <img
                            src="assets/images/users/avatar-2.jpg"
                            alt
                            className="avatar-xs rounded-3 me-2"
                          />
                          <div>
                            <h5 className="fs-13 mb-0">Jansh Brown</h5>
                            <p className="fs-12 mb-0 text-muted">
                              Lead Developer
                            </p>
                          </div>
                        </td>
                        <td>
                          <h6 className="mb-0">
                            83h : <span className="text-muted">150h</span>
                          </h6>
                        </td>
                        <td>105</td>
                        <td>
                          <div
                            id="radialBar_chart_2"
                            data-colors='["--vz-primary"]'
                            data-chart-series={45}
                            className="apex-charts"
                            dir="ltr"
                          />
                        </td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="d-flex">
                          <img
                            src="assets/images/users/avatar-7.jpg"
                            alt
                            className="avatar-xs rounded-3 me-2"
                          />
                          <div>
                            <h5 className="fs-13 mb-0">Carroll Adams</h5>
                            <p className="fs-12 mb-0 text-muted">
                              Lead Designer
                            </p>
                          </div>
                        </td>
                        <td>
                          <h6 className="mb-0">
                            58h : <span className="text-muted">150h</span>
                          </h6>
                        </td>
                        <td>75</td>
                        <td>
                          <div
                            id="radialBar_chart_3"
                            data-colors='["--vz-primary"]'
                            data-chart-series={75}
                            className="apex-charts"
                            dir="ltr"
                          />
                        </td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="d-flex">
                          <img
                            src="assets/images/users/avatar-4.jpg"
                            alt
                            className="avatar-xs rounded-3 me-2"
                          />
                          <div>
                            <h5 className="fs-13 mb-0">William Pinto</h5>
                            <p className="fs-12 mb-0 text-muted">
                              UI/UX Designer
                            </p>
                          </div>
                        </td>
                        <td>
                          <h6 className="mb-0">
                            96h : <span className="text-muted">150h</span>
                          </h6>
                        </td>
                        <td>85</td>
                        <td>
                          <div
                            id="radialBar_chart_4"
                            data-colors='["--vz-warning"]'
                            data-chart-series={25}
                            className="apex-charts"
                            dir="ltr"
                          />
                        </td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="d-flex">
                          <img
                            src="assets/images/users/avatar-6.jpg"
                            alt
                            className="avatar-xs rounded-3 me-2"
                          />
                          <div>
                            <h5 className="fs-13 mb-0">Garry Fournier</h5>
                            <p className="fs-12 mb-0 text-muted">
                              Web Designer
                            </p>
                          </div>
                        </td>
                        <td>
                          <h6 className="mb-0">
                            76h : <span className="text-muted">150h</span>
                          </h6>
                        </td>
                        <td>69</td>
                        <td>
                          <div
                            id="radialBar_chart_5"
                            data-colors='["--vz-primary"]'
                            data-chart-series={60}
                            className="apex-charts"
                            dir="ltr"
                          />
                        </td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="d-flex">
                          <img
                            src="assets/images/users/avatar-5.jpg"
                            alt
                            className="avatar-xs rounded-3 me-2"
                          />
                          <div>
                            <h5 className="fs-13 mb-0">Susan Denton</h5>
                            <p className="fs-12 mb-0 text-muted">
                              Lead Designer
                            </p>
                          </div>
                        </td>
                        <td>
                          <h6 className="mb-0">
                            123h : <span className="text-muted">150h</span>
                          </h6>
                        </td>
                        <td>658</td>
                        <td>
                          <div
                            id="radialBar_chart_6"
                            data-colors='["--vz-success"]'
                            data-chart-series={85}
                            className="apex-charts"
                            dir="ltr"
                          />
                        </td>
                      </tr>
                      {/* end tr */}
                      <tr>
                        <td className="d-flex">
                          <img
                            src="assets/images/users/avatar-3.jpg"
                            alt
                            className="avatar-xs rounded-3 me-2"
                          />
                          <div>
                            <h5 className="fs-13 mb-0">Joseph Jackson</h5>
                            <p className="fs-12 mb-0 text-muted">
                              React Developer
                            </p>
                          </div>
                        </td>
                        <td>
                          <h6 className="mb-0">
                            117h : <span className="text-muted">150h</span>
                          </h6>
                        </td>
                        <td>125</td>
                        <td>
                          <div
                            id="radialBar_chart_7"
                            data-colors='["--vz-primary"]'
                            data-chart-series={70}
                            className="apex-charts"
                            dir="ltr"
                          />
                        </td>
                      </tr>
                      {/* end tr */}
                    </tbody>
                    {/* end tbody */}
                  </table>
                  {/* end table */}
                </div>
              </div>
              {/* end cardbody */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-4 col-lg-6">
            <div className="card card-height-100">
              <div className="card-header align-items-center d-flex">
                <h4 className="card-title mb-0 flex-grow-1">Chat</h4>
                <div className="flex-shrink-0">
                  <div className="dropdown card-header-dropdown">
                    <a
                      className="text-reset dropdown-btn"
                      href="#"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <span className="text-muted">
                        <i className="ri-settings-4-line align-middle me-1" />
                        Setting <i className="mdi mdi-chevron-down ms-1" />
                      </span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a className="dropdown-item" href="#">
                        <i className="ri-user-2-fill align-bottom text-muted me-2" />{" "}
                        View Profile
                      </a>
                      <a className="dropdown-item" href="#">
                        <i className="ri-inbox-archive-line align-bottom text-muted me-2" />{" "}
                        Archive
                      </a>
                      <a className="dropdown-item" href="#">
                        <i className="ri-mic-off-line align-bottom text-muted me-2" />{" "}
                        Muted
                      </a>
                      <a className="dropdown-item" href="#">
                        <i className="ri-delete-bin-5-line align-bottom text-muted me-2" />{" "}
                        Delete
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* end card header */}
              <div className="card-body p-0">
                <div id="users-chat">
                  <div
                    className="chat-conversation p-3"
                    id="chat-conversation"
                    data-simplebar
                    style={{ height: 400 }}
                  >
                    <ul
                      className="list-unstyled chat-conversation-list chat-sm"
                      id="users-conversation"
                    >
                      <li className="chat-list left">
                        <div className="conversation-list">
                          <div className="chat-avatar">
                            <img src="assets/images/users/avatar-2.jpg" alt />
                          </div>
                          <div className="user-chat-content">
                            <div className="ctext-wrap">
                              <div className="ctext-wrap-content">
                                <p className="mb-0 ctext-content">
                                  Good morning 😊
                                </p>
                              </div>
                              <div className="dropdown align-self-start message-box-drop">
                                <a
                                  className="dropdown-toggle"
                                  href="#"
                                  role="button"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="ri-more-2-fill" />
                                </a>
                                <div className="dropdown-menu">
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-reply-line me-2 text-muted align-bottom" />
                                    Reply
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-share-line me-2 text-muted align-bottom" />
                                    Forward
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-file-copy-line me-2 text-muted align-bottom" />
                                    Copy
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-bookmark-line me-2 text-muted align-bottom" />
                                    Bookmark
                                  </a>
                                  <a
                                    className="dropdown-item delete-item"
                                    href="#"
                                  >
                                    <i className="ri-delete-bin-5-line me-2 text-muted align-bottom" />
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="conversation-name">
                              <small className="text-muted time">
                                09:07 am
                              </small>{" "}
                              <span className="text-success check-message-icon">
                                <i className="ri-check-double-line align-bottom" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                      {/* chat-list */}
                      <li className="chat-list right">
                        <div className="conversation-list">
                          <div className="user-chat-content">
                            <div className="ctext-wrap">
                              <div className="ctext-wrap-content">
                                <p className="mb-0 ctext-content">
                                  Good morning, How are you? What about our next
                                  meeting?
                                </p>
                              </div>
                              <div className="dropdown align-self-start message-box-drop">
                                <a
                                  className="dropdown-toggle"
                                  href="#"
                                  role="button"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="ri-more-2-fill" />
                                </a>
                                <div className="dropdown-menu">
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-reply-line me-2 text-muted align-bottom" />
                                    Reply
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-share-line me-2 text-muted align-bottom" />
                                    Forward
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-file-copy-line me-2 text-muted align-bottom" />
                                    Copy
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-bookmark-line me-2 text-muted align-bottom" />
                                    Bookmark
                                  </a>
                                  <a
                                    className="dropdown-item delete-item"
                                    href="#"
                                  >
                                    <i className="ri-delete-bin-5-line me-2 text-muted align-bottom" />
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="conversation-name">
                              <small className="text-muted time">
                                09:08 am
                              </small>{" "}
                              <span className="text-success check-message-icon">
                                <i className="ri-check-double-line align-bottom" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                      {/* chat-list */}
                      <li className="chat-list left">
                        <div className="conversation-list">
                          <div className="chat-avatar">
                            <img src="assets/images/users/avatar-2.jpg" alt />
                          </div>
                          <div className="user-chat-content">
                            <div className="ctext-wrap">
                              <div className="ctext-wrap-content">
                                <p className="mb-0 ctext-content">
                                  Yeah everything is fine. Our next meeting
                                  tomorrow at 10.00 AM
                                </p>
                              </div>
                              <div className="dropdown align-self-start message-box-drop">
                                <a
                                  className="dropdown-toggle"
                                  href="#"
                                  role="button"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="ri-more-2-fill" />
                                </a>
                                <div className="dropdown-menu">
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-reply-line me-2 text-muted align-bottom" />
                                    Reply
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-share-line me-2 text-muted align-bottom" />
                                    Forward
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-file-copy-line me-2 text-muted align-bottom" />
                                    Copy
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-bookmark-line me-2 text-muted align-bottom" />
                                    Bookmark
                                  </a>
                                  <a
                                    className="dropdown-item delete-item"
                                    href="#"
                                  >
                                    <i className="ri-delete-bin-5-line me-2 text-muted align-bottom" />
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="ctext-wrap">
                              <div className="ctext-wrap-content">
                                <p className="mb-0 ctext-content">
                                  Hey, I'm going to meet a friend of mine at the
                                  department store. I have to buy some presents
                                  for my parents 🎁.
                                </p>
                              </div>
                              <div className="dropdown align-self-start message-box-drop">
                                <a
                                  className="dropdown-toggle"
                                  href="#"
                                  role="button"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="ri-more-2-fill" />
                                </a>
                                <div className="dropdown-menu">
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-reply-line me-2 text-muted align-bottom" />
                                    Reply
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-share-line me-2 text-muted align-bottom" />
                                    Forward
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-file-copy-line me-2 text-muted align-bottom" />
                                    Copy
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-bookmark-line me-2 text-muted align-bottom" />
                                    Bookmark
                                  </a>
                                  <a
                                    className="dropdown-item delete-item"
                                    href="#"
                                  >
                                    <i className="ri-delete-bin-5-line me-2 text-muted align-bottom" />
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="conversation-name">
                              <small className="text-muted time">
                                09:10 am
                              </small>{" "}
                              <span className="text-success check-message-icon">
                                <i className="ri-check-double-line align-bottom" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                      {/* chat-list */}
                      <li className="chat-list right">
                        <div className="conversation-list">
                          <div className="user-chat-content">
                            <div className="ctext-wrap">
                              <div className="ctext-wrap-content">
                                <p className="mb-0 ctext-content">
                                  Wow that's great
                                </p>
                              </div>
                              <div className="dropdown align-self-start message-box-drop">
                                <a
                                  className="dropdown-toggle"
                                  href="#"
                                  role="button"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="ri-more-2-fill" />
                                </a>
                                <div className="dropdown-menu">
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-reply-line me-2 text-muted align-bottom" />
                                    Reply
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-share-line me-2 text-muted align-bottom" />
                                    Forward
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-file-copy-line me-2 text-muted align-bottom" />
                                    Copy
                                  </a>
                                  <a className="dropdown-item" href="#">
                                    <i className="ri-bookmark-line me-2 text-muted align-bottom" />
                                    Bookmark
                                  </a>
                                  <a
                                    className="dropdown-item delete-item"
                                    href="#"
                                  >
                                    <i className="ri-delete-bin-5-line me-2 text-muted align-bottom" />
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="conversation-name">
                              <small className="text-muted time">
                                09:12 am
                              </small>{" "}
                              <span className="text-success check-message-icon">
                                <i className="ri-check-double-line align-bottom" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                      {/* chat-list */}
                      <li className="chat-list left">
                        <div className="conversation-list">
                          <div className="chat-avatar">
                            <img src="assets/images/users/avatar-2.jpg" alt />
                          </div>
                          <div className="user-chat-content">
                            <div className="ctext-wrap">
                              <div className="message-img mb-0">
                                <div className="message-img-list">
                                  <div>
                                    <a
                                      className="popup-img d-inline-block"
                                      href="assets/images/small/img-1.jpg"
                                    >
                                      <img
                                        src="assets/images/small/img-1.jpg"
                                        alt
                                        className="rounded border"
                                      />
                                    </a>
                                  </div>
                                  <div className="message-img-link">
                                    <ul className="list-inline mb-0">
                                      <li className="list-inline-item dropdown">
                                        <a
                                          className="dropdown-toggle"
                                          href="#"
                                          role="button"
                                          data-bs-toggle="dropdown"
                                          aria-haspopup="true"
                                          aria-expanded="false"
                                        >
                                          <i className="ri-more-fill" />
                                        </a>
                                        <div className="dropdown-menu">
                                          <a
                                            className="dropdown-item"
                                            href="assets/images/small/img-1.jpg"
                                            download
                                          >
                                            <i className="ri-download-2-line me-2 text-muted align-bottom" />
                                            Download
                                          </a>
                                          <a className="dropdown-item" href="#">
                                            <i className="ri-reply-line me-2 text-muted align-bottom" />
                                            Reply
                                          </a>
                                          <a className="dropdown-item" href="#">
                                            <i className="ri-share-line me-2 text-muted align-bottom" />
                                            Forward
                                          </a>
                                          <a className="dropdown-item" href="#">
                                            <i className="ri-bookmark-line me-2 text-muted align-bottom" />
                                            Bookmark
                                          </a>
                                          <a
                                            className="dropdown-item delete-item"
                                            href="#"
                                          >
                                            <i className="ri-delete-bin-5-line me-2 text-muted align-bottom" />
                                            Delete
                                          </a>
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="message-img-list">
                                  <div>
                                    <a
                                      className="popup-img d-inline-block"
                                      href="assets/images/small/img-2.jpg"
                                    >
                                      <img
                                        src="assets/images/small/img-2.jpg"
                                        alt
                                        className="rounded border"
                                      />
                                    </a>
                                  </div>
                                  <div className="message-img-link">
                                    <ul className="list-inline mb-0">
                                      <li className="list-inline-item dropdown">
                                        <a
                                          className="dropdown-toggle"
                                          href="#"
                                          role="button"
                                          data-bs-toggle="dropdown"
                                          aria-haspopup="true"
                                          aria-expanded="false"
                                        >
                                          <i className="ri-more-fill" />
                                        </a>
                                        <div className="dropdown-menu">
                                          <a
                                            className="dropdown-item"
                                            href="assets/images/small/img-2.jpg"
                                            download
                                          >
                                            <i className="ri-download-2-line me-2 text-muted align-bottom" />
                                            Download
                                          </a>
                                          <a className="dropdown-item" href="#">
                                            <i className="ri-reply-line me-2 text-muted align-bottom" />
                                            Reply
                                          </a>
                                          <a className="dropdown-item" href="#">
                                            <i className="ri-share-line me-2 text-muted align-bottom" />
                                            Forward
                                          </a>
                                          <a className="dropdown-item" href="#">
                                            <i className="ri-bookmark-line me-2 text-muted align-bottom" />
                                            Bookmark
                                          </a>
                                          <a
                                            className="dropdown-item delete-item"
                                            href="#"
                                          >
                                            <i className="ri-delete-bin-5-line me-2 text-muted align-bottom" />
                                            Delete
                                          </a>
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="conversation-name">
                              <small className="text-muted time">
                                09:30 am
                              </small>{" "}
                              <span className="text-success check-message-icon">
                                <i className="ri-check-double-line align-bottom" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                      {/* chat-list */}
                    </ul>
                  </div>
                </div>
                <div className="border-top border-top-dashed">
                  <div className="row g-2 mx-3 mt-2 mb-3">
                    <div className="col">
                      <div className="position-relative">
                        <input
                          type="text"
                          className="form-control border-light bg-light"
                          placeholder="Enter Message..."
                        />
                      </div>
                    </div>
                    {/* end col */}
                    <div className="col-auto">
                      <button type="submit" className="btn btn-info">
                        <span className="d-none d-sm-inline-block me-2">
                          Send
                        </span>{" "}
                        <i className="mdi mdi-send float-end" />
                      </button>
                    </div>
                    {/* end col */}
                  </div>
                  {/* end row */}
                </div>
              </div>
              {/* end cardbody */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-4 col-lg-6">
            <div className="card card-height-100">
              <div className="card-header align-items-center d-flex">
                <h4 className="card-title mb-0 flex-grow-1">Projects Status</h4>
                <div className="flex-shrink-0">
                  <div className="dropdown card-header-dropdown">
                    <a
                      className="dropdown-btn text-muted"
                      href="#"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      All Time <i className="mdi mdi-chevron-down ms-1" />
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a className="dropdown-item" href="#">
                        All Time
                      </a>
                      <a className="dropdown-item" href="#">
                        Last 7 Days
                      </a>
                      <a className="dropdown-item" href="#">
                        Last 30 Days
                      </a>
                      <a className="dropdown-item" href="#">
                        Last 90 Days
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* end card header */}
              <div className="card-body">
                <div
                  id="prjects-status"
                  data-colors='["--vz-success", "--vz-primary", "--vz-warning", "--vz-danger"]'
                  className="apex-charts"
                  dir="ltr"
                />
                <div className="mt-3">
                  <div className="d-flex justify-content-center align-items-center mb-4">
                    <h2 className="me-3 ff-secondary mb-0">258</h2>
                    <div>
                      <p className="text-muted mb-0">Total Projects</p>
                      <p className="text-success fw-medium mb-0">
                        <span className="badge bg-success-subtle text-success p-1 rounded-circle">
                          <i className="ri-arrow-right-up-line" />
                        </span>{" "}
                        +3 New
                      </p>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
                    <p className="fw-medium mb-0">
                      <i className="ri-checkbox-blank-circle-fill text-success align-middle me-2" />{" "}
                      Completed
                    </p>
                    <div>
                      <span className="text-muted pe-5">125 Projects</span>
                      <span className="text-success fw-medium fs-12">
                        15870hrs
                      </span>
                    </div>
                  </div>
                  {/* end */}
                  <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
                    <p className="fw-medium mb-0">
                      <i className="ri-checkbox-blank-circle-fill text-primary align-middle me-2" />{" "}
                      In Progress
                    </p>
                    <div>
                      <span className="text-muted pe-5">42 Projects</span>
                      <span className="text-success fw-medium fs-12">
                        243hrs
                      </span>
                    </div>
                  </div>
                  {/* end */}
                  <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
                    <p className="fw-medium mb-0">
                      <i className="ri-checkbox-blank-circle-fill text-warning align-middle me-2" />{" "}
                      Yet to Start
                    </p>
                    <div>
                      <span className="text-muted pe-5">58 Projects</span>
                      <span className="text-success fw-medium fs-12">
                        ~2050hrs
                      </span>
                    </div>
                  </div>
                  {/* end */}
                  <div className="d-flex justify-content-between py-2">
                    <p className="fw-medium mb-0">
                      <i className="ri-checkbox-blank-circle-fill text-danger align-middle me-2" />{" "}
                      Cancelled
                    </p>
                    <div>
                      <span className="text-muted pe-5">89 Projects</span>
                      <span className="text-success fw-medium fs-12">
                        ~900hrs
                      </span>
                    </div>
                  </div>
                  {/* end */}
                </div>
              </div>
              {/* end cardbody */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
        </div>
        {/* end row */}
      </div>
    </div>
  );
};

export default DashboardProjectStatus;
