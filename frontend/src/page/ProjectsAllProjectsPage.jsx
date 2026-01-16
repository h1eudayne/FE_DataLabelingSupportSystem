import React from "react";

const ProjectsAllProjectPage = () => {
  return (
    <>
      <div>
        {/* start page title */}
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">All Projects</h4>
            </div>
          </div>
        </div>
        {/* end page title */}
        <div className="row g-4 mb-3">
          <div className="col-sm-auto">
            <div>
              <a href="apps-projects-create.html" className="btn btn-success">
                <i className="ri-add-line align-bottom me-1" /> Add New
              </a>
            </div>
          </div>
          <div className="col-sm">
            <div className="d-flex justify-content-sm-end gap-2">
              <div className="search-box ms-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                />
                <i className="ri-search-line search-icon" />
              </div>
              <select
                className="form-control w-md"
                data-choices
                data-choices-search-false
              >
                <option value="All">All</option>
                <option value="Today">Today</option>
                <option value="Yesterday" selected>
                  Yesterday
                </option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Month">This Month</option>
                <option value="Last Year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card card-height-100">
              <div className="card-body">
                <div className="d-flex flex-column h-100">
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-4">Updated 3hrs ago</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-1 align-items-center">
                        <button
                          type="button"
                          className="btn avatar-xs mt-n1 p-0 favourite-btn"
                        >
                          <span className="avatar-title bg-transparent fs-15">
                            <i className="ri-star-fill" />
                          </span>
                        </button>
                        <div className="dropdown">
                          <button
                            className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true"
                          >
                            <i
                              data-feather="more-horizontal"
                              className="icon-sm"
                            />
                          </button>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a
                              className="dropdown-item"
                              href="apps-projects-overview.html"
                            >
                              <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                              View
                            </a>
                            <a
                              className="dropdown-item"
                              href="apps-projects-create.html"
                            >
                              <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                              Edit
                            </a>
                            <div className="dropdown-divider" />
                            <a
                              className="dropdown-item"
                              href="#"
                              data-bs-toggle="modal"
                              data-bs-target="#removeProjectModal"
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                              Remove
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex mb-2">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <span className="avatar-title bg-warning-subtle rounded p-2">
                          <img
                            src="assets/images/brands/slack.png"
                            alt
                            className="img-fluid p-1"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fs-15">
                        <a
                          href="apps-projects-overview.html"
                          className="text-body"
                        >
                          Slack brand logo design
                        </a>
                      </h5>
                      <p className="text-muted text-truncate-two-lines mb-3">
                        Create a Brand logo design for a velzon admin.
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="d-flex mb-2">
                      <div className="flex-grow-1">
                        <div>Tasks</div>
                      </div>
                      <div className="flex-shrink-0">
                        <div>
                          <i className="ri-list-check align-bottom me-1 text-muted" />{" "}
                          18/42
                        </div>
                      </div>
                    </div>
                    <div className="progress progress-sm animated-progress">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        aria-valuenow={34}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: "34%" }}
                      />
                      {/* /.progress-bar */}
                    </div>
                    {/* /.progress */}
                  </div>
                </div>
              </div>
              {/* end card body */}
              <div className="card-footer bg-transparent border-top-dashed py-2">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Darline Williams"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-2.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-muted">
                      <i className="ri-calendar-event-fill me-1 align-bottom" />{" "}
                      10 Jul, 2021
                    </div>
                  </div>
                </div>
              </div>
              {/* end card footer */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card card-height-100">
              <div className="card-body">
                <div className="d-flex flex-column h-100">
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-4">Last update : 08 May</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-1 align-items-center">
                        <button
                          type="button"
                          className="btn avatar-xs mt-n1 p-0 favourite-btn active"
                        >
                          <span className="avatar-title bg-transparent fs-15">
                            <i className="ri-star-fill" />
                          </span>
                        </button>
                        <div className="dropdown">
                          <button
                            className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true"
                          >
                            <i
                              data-feather="more-horizontal"
                              className="icon-sm"
                            />
                          </button>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a
                              className="dropdown-item"
                              href="apps-projects-overview.html"
                            >
                              <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                              View
                            </a>
                            <a
                              className="dropdown-item"
                              href="apps-projects-create.html"
                            >
                              <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                              Edit
                            </a>
                            <div className="dropdown-divider" />
                            <a
                              className="dropdown-item"
                              href="#"
                              data-bs-toggle="modal"
                              data-bs-target="#removeProjectModal"
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                              Remove
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex mb-2">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <span className="avatar-title bg-danger-subtle rounded p-2">
                          <img
                            src="assets/images/brands/dribbble.png"
                            alt
                            className="img-fluid p-1"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fs-15">
                        <a
                          href="apps-projects-overview.html"
                          className="text-body"
                        >
                          Redesign - Landing page
                        </a>
                      </h5>
                      <p className="text-muted text-truncate-two-lines mb-3">
                        Resign a landing page design. as per abc minimal design.
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="d-flex mb-2">
                      <div className="flex-grow-1">
                        <div>Tasks</div>
                      </div>
                      <div className="flex-shrink-0">
                        <div>
                          <i className="ri-list-check align-bottom me-1 text-muted" />{" "}
                          22/56
                        </div>
                      </div>
                    </div>
                    <div className="progress progress-sm animated-progress">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        aria-valuenow={54}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: "54%" }}
                      />
                      {/* /.progress-bar */}
                    </div>
                    {/* /.progress */}
                  </div>
                </div>
              </div>
              {/* end card body */}
              <div className="card-footer bg-transparent border-top-dashed py-2">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Brent Gonzalez"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-3.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Sylvia Wright"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title rounded-circle bg-secondary">
                            S
                          </div>
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Ellen Smith"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-4.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-muted">
                      <i className="ri-calendar-event-fill me-1 align-bottom" />{" "}
                      18 May, 2021
                    </div>
                  </div>
                </div>
              </div>
              {/* end card footer */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card card-height-100">
              <div className="card-body">
                <div className="d-flex flex-column h-100">
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-4">Updated 2hrs ago</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-1 align-items-center">
                        <button
                          type="button"
                          className="btn avatar-xs mt-n1 p-0 favourite-btn active"
                        >
                          <span className="avatar-title bg-transparent fs-15">
                            <i className="ri-star-fill" />
                          </span>
                        </button>
                        <div className="dropdown">
                          <button
                            className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true"
                          >
                            <i
                              data-feather="more-horizontal"
                              className="icon-sm"
                            />
                          </button>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a
                              className="dropdown-item"
                              href="apps-projects-overview.html"
                            >
                              <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                              View
                            </a>
                            <a
                              className="dropdown-item"
                              href="apps-projects-create.html"
                            >
                              <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                              Edit
                            </a>
                            <div className="dropdown-divider" />
                            <a
                              className="dropdown-item"
                              href="#"
                              data-bs-toggle="modal"
                              data-bs-target="#removeProjectModal"
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                              Remove
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex mb-2">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <span className="avatar-title bg-success-subtle rounded p-2">
                          <img
                            src="assets/images/brands/mail_chimp.png"
                            alt
                            className="img-fluid p-1"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fs-15">
                        <a
                          href="apps-projects-overview.html"
                          className="text-body"
                        >
                          Chat Application
                        </a>
                      </h5>
                      <p className="text-muted text-truncate-two-lines mb-3">
                        Create a Chat application for business messaging needs.
                        Collaborate efficiently with secure direct messages and
                        group chats.
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="d-flex mb-2">
                      <div className="flex-grow-1">
                        <div>Tasks</div>
                      </div>
                      <div className="flex-shrink-0">
                        <div>
                          <i className="ri-list-check align-bottom me-1 text-muted" />{" "}
                          14/20
                        </div>
                      </div>
                    </div>
                    <div className="progress progress-sm animated-progress">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        aria-valuenow={65}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: "65%" }}
                      />
                      {/* /.progress-bar */}
                    </div>
                    {/* /.progress */}
                  </div>
                </div>
              </div>
              {/* end card body */}
              <div className="card-footer bg-transparent border-top-dashed py-2">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Jeffrey Salazar"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-5.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Mark Williams"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title rounded-circle bg-warning">
                            M
                          </div>
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-muted">
                      <i className="ri-calendar-event-fill me-1 align-bottom" />{" "}
                      21 Feb, 2021
                    </div>
                  </div>
                </div>
              </div>
              {/* end card footer */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card card-height-100">
              <div className="card-body">
                <div className="d-flex flex-column h-100">
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-4">Last update : 21 Jun</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-1 align-items-center">
                        <button
                          type="button"
                          className="btn avatar-xs mt-n1 p-0 favourite-btn"
                        >
                          <span className="avatar-title bg-transparent fs-15">
                            <i className="ri-star-fill" />
                          </span>
                        </button>
                        <div className="dropdown">
                          <button
                            className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true"
                          >
                            <i
                              data-feather="more-horizontal"
                              className="icon-sm"
                            />
                          </button>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a
                              className="dropdown-item"
                              href="apps-projects-overview.html"
                            >
                              <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                              View
                            </a>
                            <a
                              className="dropdown-item"
                              href="apps-projects-create.html"
                            >
                              <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                              Edit
                            </a>
                            <div className="dropdown-divider" />
                            <a
                              className="dropdown-item"
                              href="#"
                              data-bs-toggle="modal"
                              data-bs-target="#removeProjectModal"
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                              Remove
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex mb-2">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar-sm">
                        <span className="avatar-title bg-info-subtle rounded p-2">
                          <img
                            src="assets/images/brands/dropbox.png"
                            alt
                            className="img-fluid p-1"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fs-15">
                        <a
                          href="apps-projects-overview.html"
                          className="text-body"
                        >
                          Project App
                        </a>
                      </h5>
                      <p className="text-muted text-truncate-two-lines mb-3">
                        Create a project application for a project management
                        and task management.
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="d-flex mb-2">
                      <div className="flex-grow-1">
                        <div>Tasks</div>
                      </div>
                      <div className="flex-shrink-0">
                        <div>
                          <i className="ri-list-check align-bottom me-1 text-muted" />{" "}
                          20/34
                        </div>
                      </div>
                    </div>
                    <div className="progress progress-sm animated-progress">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        aria-valuenow={78}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ width: "78%" }}
                      />
                      {/* /.progress-bar */}
                    </div>
                    {/* /.progress */}
                  </div>
                </div>
              </div>
              {/* end card body */}
              <div className="card-footer bg-transparent border-top-dashed py-2">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Kristin Turpin"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title rounded-circle bg-info">
                            K
                          </div>
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Mary Leavitt"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title rounded-circle bg-danger">
                            M
                          </div>
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-muted">
                      <i className="ri-calendar-event-fill me-1 align-bottom" />{" "}
                      03 Aug, 2021
                    </div>
                  </div>
                </div>
              </div>
              {/* end card footer */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card">
              <div className="card-body">
                <div className="p-3 mt-n3 mx-n3 bg-danger-subtle rounded-top">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h5 className="mb-0 fs-14">
                        <a
                          href="apps-projects-overview.html"
                          className="text-body"
                        >
                          Multipurpose landing template
                        </a>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-1 align-items-center my-n2">
                        <button
                          type="button"
                          className="btn avatar-xs p-0 favourite-btn active"
                        >
                          <span className="avatar-title bg-transparent fs-15">
                            <i className="ri-star-fill" />
                          </span>
                        </button>
                        <div className="dropdown">
                          <button
                            className="btn btn-link text-muted p-1 mt-n1 py-0 text-decoration-none fs-15"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true"
                          >
                            <i
                              data-feather="more-horizontal"
                              className="icon-sm"
                            />
                          </button>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a
                              className="dropdown-item"
                              href="apps-projects-overview.html"
                            >
                              <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                              View
                            </a>
                            <a
                              className="dropdown-item"
                              href="apps-projects-create.html"
                            >
                              <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                              Edit
                            </a>
                            <div className="dropdown-divider" />
                            <a
                              className="dropdown-item"
                              href="#"
                              data-bs-toggle="modal"
                              data-bs-target="#removeProjectModal"
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                              Remove
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-3">
                  <div className="row gy-3">
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Status</p>
                        <div className="badge bg-warning-subtle text-warning fs-12">
                          Inprogress
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Deadline</p>
                        <h5 className="fs-14">18 Sep, 2021</h5>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="text-muted mb-0 me-2">Team :</p>
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Donna Kline"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title rounded-circle bg-danger">
                            D
                          </div>
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Lee Winton"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-5.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Johnny Shorter"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-6.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="d-flex mb-2">
                    <div className="flex-grow-1">
                      <div>Progress</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div>50%</div>
                    </div>
                  </div>
                  <div className="progress progress-sm animated-progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      aria-valuenow={50}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "50%" }}
                    ></div>
                    {/* /.progress-bar */}
                  </div>
                  {/* /.progress */}
                </div>
              </div>
              {/* end card body */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card">
              <div className="card-body">
                <div className="p-3 mt-n3 mx-n3 bg-warning-subtle rounded-top">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h5 className="mb-0 fs-14">
                        <a
                          href="apps-projects-overview.html"
                          className="text-body"
                        >
                          Dashboard UI
                        </a>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-1 align-items-center my-n2">
                        <button
                          type="button"
                          className="btn avatar-xs p-0 favourite-btn active"
                        >
                          <span className="avatar-title bg-transparent fs-15">
                            <i className="ri-star-fill" />
                          </span>
                        </button>
                        <div className="dropdown">
                          <button
                            className="btn btn-link text-muted p-1 mt-n1 py-0 text-decoration-none fs-15"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true"
                          >
                            <i
                              data-feather="more-horizontal"
                              className="icon-sm"
                            />
                          </button>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a
                              className="dropdown-item"
                              href="apps-projects-overview.html"
                            >
                              <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                              View
                            </a>
                            <a
                              className="dropdown-item"
                              href="apps-projects-create.html"
                            >
                              <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                              Edit
                            </a>
                            <div className="dropdown-divider" />
                            <a
                              className="dropdown-item"
                              href="#"
                              data-bs-toggle="modal"
                              data-bs-target="#removeProjectModal"
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                              Remove
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-3">
                  <div className="row gy-3">
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Status</p>
                        <div className="badge bg-success-subtle text-success fs-12">
                          Completed
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Deadline</p>
                        <h5 className="fs-14"> 10 Jun, 2021</h5>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="text-muted mb-0 me-2">Team :</p>
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Bonnie Haynes"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-7.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Della Wilson"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-8.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="d-flex mb-2">
                    <div className="flex-grow-1">
                      <div>Progress</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div>95%</div>
                    </div>
                  </div>
                  <div className="progress progress-sm animated-progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      aria-valuenow={95}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "95%" }}
                    />
                    {/* /.progress-bar */}
                  </div>
                  {/* /.progress */}
                </div>
              </div>
              {/* end card body */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card">
              <div className="card-body">
                <div className="p-3 mt-n3 mx-n3 bg-info-subtle rounded-top">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h5 className="mb-0 fs-14">
                        <a
                          href="apps-projects-overview.html"
                          className="text-body"
                        >
                          Vector Images
                        </a>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-1 align-items-center my-n2">
                        <button
                          type="button"
                          className="btn avatar-xs p-0 favourite-btn"
                        >
                          <span className="avatar-title bg-transparent fs-15">
                            <i className="ri-star-fill" />
                          </span>
                        </button>
                        <div className="dropdown">
                          <button
                            className="btn btn-link text-muted p-1 mt-n1 py-0 text-decoration-none fs-15"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true"
                          >
                            <i
                              data-feather="more-horizontal"
                              className="icon-sm"
                            />
                          </button>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a
                              className="dropdown-item"
                              href="apps-projects-overview.html"
                            >
                              <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                              View
                            </a>
                            <a
                              className="dropdown-item"
                              href="apps-projects-create.html"
                            >
                              <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                              Edit
                            </a>
                            <div className="dropdown-divider" />
                            <a
                              className="dropdown-item"
                              href="#"
                              data-bs-toggle="modal"
                              data-bs-target="#removeProjectModal"
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                              Remove
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-3">
                  <div className="row gy-3">
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Status</p>
                        <div className="badge bg-warning-subtle text-warning fs-12">
                          Inprogress
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Deadline</p>
                        <h5 className="fs-14">08 Apr, 2021</h5>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="text-muted mb-0 me-2">Team :</p>
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Chet Diaz"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title rounded-circle bg-info">
                            C
                          </div>
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="d-flex mb-2">
                    <div className="flex-grow-1">
                      <div>Progress</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div>41%</div>
                    </div>
                  </div>
                  <div className="progress progress-sm animated-progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      aria-valuenow={41}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "41%" }}
                    />
                    {/* /.progress-bar */}
                  </div>
                  {/* /.progress */}
                </div>
              </div>
              {/* end card body */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card">
              <div className="card-body">
                <div className="p-3 mt-n3 mx-n3 bg-success-subtle rounded-top">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h5 className="mb-0 fs-14">
                        <a
                          href="apps-projects-overview.html"
                          className="text-body"
                        >
                          Authentication
                        </a>
                      </h5>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-1 align-items-center my-n2">
                        <button
                          type="button"
                          className="btn avatar-xs p-0 favourite-btn active"
                        >
                          <span className="avatar-title bg-transparent fs-15">
                            <i className="ri-star-fill" />
                          </span>
                        </button>
                        <div className="dropdown">
                          <button
                            className="btn btn-link text-muted p-1 mt-n1 py-0 text-decoration-none fs-15"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="true"
                          >
                            <i
                              data-feather="more-horizontal"
                              className="icon-sm"
                            />
                          </button>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a
                              className="dropdown-item"
                              href="apps-projects-overview.html"
                            >
                              <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                              View
                            </a>
                            <a
                              className="dropdown-item"
                              href="apps-projects-create.html"
                            >
                              <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                              Edit
                            </a>
                            <div className="dropdown-divider" />
                            <a
                              className="dropdown-item"
                              href="#"
                              data-bs-toggle="modal"
                              data-bs-target="#removeProjectModal"
                            >
                              <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                              Remove
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-3">
                  <div className="row gy-3">
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Status</p>
                        <div className="badge bg-warning-subtle text-warning fs-12">
                          Inprogress
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Deadline</p>
                        <h5 className="fs-14">22 Nov, 2021</h5>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="text-muted mb-0 me-2">Team :</p>
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Virginia Wall"
                      >
                        <img
                          src="assets/images/users/avatar-8.jpg"
                          alt
                          className="rounded-circle avatar-xxs"
                        />
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="d-flex mb-2">
                    <div className="flex-grow-1">
                      <div>Progress</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div>35%</div>
                    </div>
                  </div>
                  <div className="progress progress-sm animated-progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      aria-valuenow={35}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "35%" }}
                    />
                    {/* /.progress-bar */}
                  </div>
                  {/* /.progress */}
                </div>
              </div>
              {/* end card body */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row">
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card">
              <div className="card-body">
                <div className="p-3 mt-n3 mx-n3 bg-secondary-subtle rounded-top">
                  <div className="d-flex gap-1 align-items-center justify-content-end my-n2">
                    <button
                      type="button"
                      className="btn avatar-xs p-0 favourite-btn active"
                    >
                      <span className="avatar-title bg-transparent fs-15">
                        <i className="ri-star-fill" />
                      </span>
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn btn-link text-muted p-1 mt-n1 py-0 text-decoration-none fs-15"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="true"
                      >
                        <i data-feather="more-horizontal" className="icon-sm" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a
                          className="dropdown-item"
                          href="apps-projects-overview.html"
                        >
                          <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                          View
                        </a>
                        <a
                          className="dropdown-item"
                          href="apps-projects-create.html"
                        >
                          <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                          Edit
                        </a>
                        <div className="dropdown-divider" />
                        <a
                          className="dropdown-item"
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#removeProjectModal"
                        >
                          <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                          Remove
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="text-center pb-3">
                    <img
                      src="assets/images/brands/dribbble.png"
                      alt
                      height={32}
                    />
                  </div>
                </div>
                <div className="py-3">
                  <h5 className="fs-14 mb-3">
                    <a href="apps-projects-overview.html" className="text-body">
                      Kanban Board
                    </a>
                  </h5>
                  <div className="row gy-3">
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Status</p>
                        <div className="badge bg-warning-subtle text-warning fs-12">
                          Inprogress
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Deadline</p>
                        <h5 className="fs-14">08 Dec, 2021</h5>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="text-muted mb-0 me-2">Team :</p>
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Terry Moberly"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title rounded-circle bg-danger">
                            T
                          </div>
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Ruby Miller"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-5.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="d-flex mb-2">
                    <div className="flex-grow-1">
                      <div>Tasks</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div>
                        <i className="ri-list-check align-bottom me-1 text-muted" />{" "}
                        17/20{" "}
                      </div>
                    </div>
                  </div>
                  <div className="progress progress-sm animated-progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      aria-valuenow={71}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "71%" }}
                    />
                    {/* /.progress-bar */}
                  </div>
                  {/* /.progress */}
                </div>
              </div>
              {/* end card body */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card">
              <div className="card-body">
                <div className="p-3 mt-n3 mx-n3 bg-light rounded-top">
                  <div className="d-flex gap-1 align-items-center justify-content-end my-n2">
                    <button
                      type="button"
                      className="btn avatar-xs p-0 favourite-btn"
                    >
                      <span className="avatar-title bg-transparent fs-15">
                        <i className="ri-star-fill" />
                      </span>
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn btn-link text-muted p-1 mt-n1 py-0 text-decoration-none fs-15"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="true"
                      >
                        <i data-feather="more-horizontal" className="icon-sm" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a
                          className="dropdown-item"
                          href="apps-projects-overview.html"
                        >
                          <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                          View
                        </a>
                        <a
                          className="dropdown-item"
                          href="apps-projects-create.html"
                        >
                          <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                          Edit
                        </a>
                        <div className="dropdown-divider" />
                        <a
                          className="dropdown-item"
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#removeProjectModal"
                        >
                          <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                          Remove
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="text-center pb-3">
                    <img src="assets/images/brands/slack.png" alt height={32} />
                  </div>
                </div>
                <div className="py-3">
                  <h5 className="mb-3 fs-14">
                    <a href="apps-projects-overview.html" className="text-body">
                      Ecommerce app
                    </a>
                  </h5>
                  <div className="row gy-3">
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Status</p>
                        <div className="badge bg-warning-subtle text-warning fs-12">
                          Inprogress
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Deadline</p>
                        <h5 className="fs-14">20 Nov, 2021</h5>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="text-muted mb-0 me-2">Team :</p>
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Irma Metz"
                      >
                        <img
                          src="assets/images/users/avatar-9.jpg"
                          alt
                          className="rounded-circle avatar-xxs"
                        />
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="James Clem"
                      >
                        <img
                          src="assets/images/users/avatar-10.jpg"
                          alt
                          className="rounded-circle avatar-xxs"
                        />
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="d-flex mb-2">
                    <div className="flex-grow-1">
                      <div>Tasks</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div>
                        <i className="ri-list-check align-bottom me-1 text-muted" />{" "}
                        11/45
                      </div>
                    </div>
                  </div>
                  <div className="progress progress-sm animated-progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      aria-valuenow={20}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "20%" }}
                    />
                    {/* /.progress-bar */}
                  </div>
                  {/* /.progress */}
                </div>
              </div>
              {/* end card body */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card">
              <div className="card-body">
                <div className="p-3 mt-n3 mx-n3 bg-primary-subtle rounded-top">
                  <div className="d-flex gap-1 align-items-center justify-content-end my-n2">
                    <button
                      type="button"
                      className="btn avatar-xs p-0 favourite-btn"
                    >
                      <span className="avatar-title bg-transparent fs-15">
                        <i className="ri-star-fill" />
                      </span>
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn btn-link text-muted p-1 mt-n1 py-0 text-decoration-none fs-15"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="true"
                      >
                        <i data-feather="more-horizontal" className="icon-sm" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a
                          className="dropdown-item"
                          href="apps-projects-overview.html"
                        >
                          <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                          View
                        </a>
                        <a
                          className="dropdown-item"
                          href="apps-projects-create.html"
                        >
                          <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                          Edit
                        </a>
                        <div className="dropdown-divider" />
                        <a
                          className="dropdown-item"
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#removeProjectModal"
                        >
                          <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                          Remove
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="text-center pb-3">
                    <img
                      src="assets/images/brands/dropbox.png"
                      alt
                      height={32}
                    />
                  </div>
                </div>
                <div className="py-3">
                  <h5 className="mb-3 fs-14">
                    <a href="apps-projects-overview.html" className="text-body">
                      Redesign - Landing page
                    </a>
                  </h5>
                  <div className="row gy-3">
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Status</p>
                        <div className="badge bg-warning-subtle text-warning fs-12">
                          Inprogress
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Deadline</p>
                        <h5 className="fs-14">10 Jul, 2021</h5>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="text-muted mb-0 me-2">Team :</p>
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Brent Gonzalez"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-3.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Sylvia Wright"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title rounded-circle bg-secondary">
                            S
                          </div>
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Ellen Smith"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-4.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="d-flex mb-2">
                    <div className="flex-grow-1">
                      <div>Tasks</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div>
                        <i className="ri-list-check align-bottom me-1 text-muted" />{" "}
                        13/26
                      </div>
                    </div>
                  </div>
                  <div className="progress progress-sm animated-progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      aria-valuenow={54}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "54%" }}
                    />
                    {/* /.progress-bar */}
                  </div>
                  {/* /.progress */}
                </div>
              </div>
              {/* end card body */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
          <div className="col-xxl-3 col-sm-6 project-card">
            <div className="card">
              <div className="card-body">
                <div className="p-3 mt-n3 mx-n3 bg-danger-subtle rounded-top">
                  <div className="d-flex gap-1 align-items-center justify-content-end my-n2">
                    <button
                      type="button"
                      className="btn avatar-xs p-0 favourite-btn active"
                    >
                      <span className="avatar-title bg-transparent fs-15">
                        <i className="ri-star-fill" />
                      </span>
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn btn-link text-muted p-1 mt-n1 py-0 text-decoration-none fs-15"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="true"
                      >
                        <i data-feather="more-horizontal" className="icon-sm" />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a
                          className="dropdown-item"
                          href="apps-projects-overview.html"
                        >
                          <i className="ri-eye-fill align-bottom me-2 text-muted" />{" "}
                          View
                        </a>
                        <a
                          className="dropdown-item"
                          href="apps-projects-create.html"
                        >
                          <i className="ri-pencil-fill align-bottom me-2 text-muted" />{" "}
                          Edit
                        </a>
                        <div className="dropdown-divider" />
                        <a
                          className="dropdown-item"
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#removeProjectModal"
                        >
                          <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />{" "}
                          Remove
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="text-center pb-3">
                    <img
                      src="assets/images/brands/mail_chimp.png"
                      alt
                      height={32}
                    />
                  </div>
                </div>
                <div className="py-3">
                  <h5 className="mb-3 fs-14">
                    <a href="apps-projects-overview.html" className="text-body">
                      Multipurpose landing template
                    </a>
                  </h5>
                  <div className="row gy-3">
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Status</p>
                        <div className="badge bg-success-subtle text-success fs-12">
                          Completed
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div>
                        <p className="text-muted mb-1">Deadline</p>
                        <h5 className="fs-14">18 Sep, 2021</h5>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="text-muted mb-0 me-2">Team :</p>
                    <div className="avatar-group">
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Donna Kline"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title rounded-circle bg-danger">
                            D
                          </div>
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Lee Winton"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-5.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Johnny Shorter"
                      >
                        <div className="avatar-xxs">
                          <img
                            src="assets/images/users/avatar-6.jpg"
                            alt
                            className="rounded-circle img-fluid"
                          />
                        </div>
                      </a>
                      <a
                        href="javascript: void(0);"
                        className="avatar-group-item"
                        data-bs-toggle="tooltip"
                        data-bs-trigger="hover"
                        data-bs-placement="top"
                        title="Add Members"
                      >
                        <div className="avatar-xxs">
                          <div className="avatar-title fs-16 rounded-circle bg-light border-dashed border text-primary">
                            +
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="d-flex mb-2">
                    <div className="flex-grow-1">
                      <div>Tasks</div>
                    </div>
                    <div className="flex-shrink-0">
                      <div>
                        <i className="ri-list-check align-bottom me-1 text-muted" />{" "}
                        25/32
                      </div>
                    </div>
                  </div>
                  <div className="progress progress-sm animated-progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      aria-valuenow={75}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "75%" }}
                    />
                    {/* /.progress-bar */}
                  </div>
                  {/* /.progress */}
                </div>
              </div>
              {/* end card body */}
            </div>
            {/* end card */}
          </div>
          {/* end col */}
        </div>
        {/* end row */}
        <div className="row g-0 text-center text-sm-start align-items-center mb-4">
          <div className="col-sm-6">
            <div>
              <p className="mb-sm-0 text-muted">
                Showing <span className="fw-semibold">1</span> to{" "}
                <span className="fw-semibold">10</span> of{" "}
                <span className="fw-semibold text-decoration-underline">
                  12
                </span>{" "}
                entries
              </p>
            </div>
          </div>
          {/* end col */}
          <div className="col-sm-6">
            <ul className="pagination pagination-separated justify-content-center justify-content-sm-end mb-sm-0">
              <li className="page-item disabled">
                <a href="#" className="page-link">
                  Previous
                </a>
              </li>
              <li className="page-item active">
                <a href="#" className="page-link">
                  1
                </a>
              </li>
              <li className="page-item ">
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
                  4
                </a>
              </li>
              <li className="page-item">
                <a href="#" className="page-link">
                  5
                </a>
              </li>
              <li className="page-item">
                <a href="#" className="page-link">
                  Next
                </a>
              </li>
            </ul>
          </div>
          {/* end col */}
        </div>
        {/* end row */}
      </div>
    </>
  );
};

export default ProjectsAllProjectPage;
