import React from "react";

const WorkplaceReviewTaskPage = () => {
  return (
    <>
      <div>
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0">Tasks List</h4>
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="javascript: void(0);">Tasks</a>
                  </li>
                  <li className="breadcrumb-item active">Tasks List</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xxl-3 col-sm-6">
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="fw-medium text-muted mb-0">Total Tasks</p>
                    <h2 className="mt-4 ff-secondary fw-semibold">
                      <span className="counter-value" data-target={234}>
                        0
                      </span>
                      k
                    </h2>
                    <p className="mb-0 text-muted">
                      <span className="badge bg-light text-success mb-0">
                        <i className="ri-arrow-up-line align-middle" /> 17.32 %
                      </span>
                      vs. previous month
                    </p>
                  </div>
                  <div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-info-subtle text-info rounded-circle fs-4">
                        <i className="ri-ticket-2-line" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-3 col-sm-6">
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="fw-medium text-muted mb-0">Pending Tasks</p>
                    <h2 className="mt-4 ff-secondary fw-semibold">
                      <span className="counter-value" data-target="64.5">
                        0
                      </span>
                      k
                    </h2>
                    <p className="mb-0 text-muted">
                      <span className="badge bg-light text-danger mb-0">
                        <i className="ri-arrow-down-line align-middle" /> 0.87 %
                      </span>
                      vs. previous month
                    </p>
                  </div>
                  <div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-warning-subtle text-warning rounded-circle fs-4">
                        <i className="mdi mdi-timer-sand" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-3 col-sm-6">
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="fw-medium text-muted mb-0">Completed Tasks</p>
                    <h2 className="mt-4 ff-secondary fw-semibold">
                      <span className="counter-value" data-target="116.21">
                        0
                      </span>
                      K
                    </h2>
                    <p className="mb-0 text-muted">
                      <span className="badge bg-light text-danger mb-0">
                        <i className="ri-arrow-down-line align-middle" /> 2.52 %
                      </span>
                      vs. previous month
                    </p>
                  </div>
                  <div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-success-subtle text-success rounded-circle fs-4">
                        <i className="ri-checkbox-circle-line" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xxl-3 col-sm-6">
            <div className="card card-animate">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="fw-medium text-muted mb-0">Deleted Tasks</p>
                    <h2 className="mt-4 ff-secondary fw-semibold">
                      <span className="counter-value" data-target="14.84">
                        0
                      </span>
                      %
                    </h2>
                    <p className="mb-0 text-muted">
                      <span className="badge bg-light text-success mb-0">
                        <i className="ri-arrow-up-line align-middle" /> 0.63 %
                      </span>
                      vs. previous month
                    </p>
                  </div>
                  <div>
                    <div className="avatar-sm flex-shrink-0">
                      <span className="avatar-title bg-danger-subtle text-danger rounded-circle fs-4">
                        <i className="ri-delete-bin-line" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="card" id="tasksList">
              <div className="card-header border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">All Tasks</h5>
                  <div className="flex-shrink-0">
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-danger add-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#showModal"
                      >
                        <i className="ri-add-line align-bottom me-1" /> Create
                        Task
                      </button>
                      <button
                        className="btn btn-soft-danger"
                        id="remove-actions"
                        onclick="deleteMultiple()"
                      >
                        <i className="ri-delete-bin-2-line" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body border border-dashed border-end-0 border-start-0">
                <form>
                  <div className="row g-3">
                    <div className="col-xxl-5 col-sm-12">
                      <div className="search-box">
                        <input
                          type="text"
                          className="form-control search bg-light border-light"
                          placeholder="Search for tasks or something..."
                        />
                        <i className="ri-search-line search-icon" />
                      </div>
                    </div>
                    <div className="col-xxl-3 col-sm-4">
                      <input
                        type="text"
                        className="form-control bg-light border-light"
                        id="demo-datepicker"
                        data-provider="flatpickr"
                        data-date-format="d M, Y"
                        data-range-date="true"
                        placeholder="Select date range"
                      />
                    </div>
                    <div className="col-xxl-3 col-sm-4">
                      <div className="input-light">
                        <select
                          className="form-control"
                          data-choices
                          data-choices-search-false
                          name="choices-single-default"
                          id="idStatus"
                        >
                          <option value>Status</option>
                          <option value="all" selected>
                            All
                          </option>
                          <option value="New">New</option>
                          <option value="Pending">Pending</option>
                          <option value="Inprogress">Inprogress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-xxl-1 col-sm-4">
                      <button
                        type="button"
                        className="btn btn-primary w-100"
                        onclick="SearchData();"
                      >
                        <i className="ri-equalizer-fill me-1 align-bottom" />
                        Filters
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="card-body">
                <div className="table-responsive table-card mb-4">
                  <table
                    className="table align-middle table-nowrap mb-0"
                    id="tasksTable"
                  >
                    <thead className="table-light text-muted">
                      <tr>
                        <th scope="col" style={{ width: 40 }}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="checkAll"
                              defaultValue="option"
                            />
                          </div>
                        </th>
                        <th className="sort" data-sort="id">
                          ID
                        </th>
                        <th className="sort" data-sort="project_name">
                          Project
                        </th>
                        <th className="sort" data-sort="tasks_name">
                          Task
                        </th>
                        <th className="sort" data-sort="client_name">
                          Client Name
                        </th>
                        <th className="sort" data-sort="assignedto">
                          Assigned To
                        </th>
                        <th className="sort" data-sort="due_date">
                          Due Date
                        </th>
                        <th className="sort" data-sort="status">
                          Status
                        </th>
                        <th className="sort" data-sort="priority">
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody className="list form-check-all">
                      <tr>
                        <th scope="row">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="chk_child"
                              defaultValue="option1"
                            />
                          </div>
                        </th>
                        <td className="id">
                          <a
                            href="apps-tasks-details.html"
                            className="fw-medium link-primary"
                          >
                            #VLZ501
                          </a>
                        </td>
                        <td className="project_name">
                          <a
                            href="apps-projects-overview.html"
                            className="fw-medium link-primary"
                          >
                            Velzon - v1.0.0
                          </a>
                        </td>
                        <td>
                          <div className="d-flex">
                            <div className="flex-grow-1 tasks_name">
                              Profile Page Satructure
                            </div>
                            <div className="flex-shrink-0 ms-4">
                              <ul className="list-inline tasks-list-menu mb-0">
                                <li className="list-inline-item">
                                  <a href="apps-tasks-details.html">
                                    <i className="ri-eye-fill align-bottom me-2 text-muted" />
                                  </a>
                                </li>
                                <li className="list-inline-item">
                                  <a
                                    className="edit-item-btn"
                                    href="#showModal"
                                    data-bs-toggle="modal"
                                  >
                                    <i className="ri-pencil-fill align-bottom me-2 text-muted" />
                                  </a>
                                </li>
                                <li className="list-inline-item">
                                  <a
                                    className="remove-item-btn"
                                    data-bs-toggle="modal"
                                    href="#deleteOrder"
                                  >
                                    <i className="ri-delete-bin-fill align-bottom me-2 text-muted" />
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                        <td className="client_name">Robert McMahon</td>
                        <td className="assignedto">
                          <div className="avatar-group">
                            <a
                              href="javascript: void(0);"
                              className="avatar-group-item"
                              data-bs-toggle="tooltip"
                              data-bs-trigger="hover"
                              data-bs-placement="top"
                              title="Frank"
                            >
                              <img
                                src="assets/images/users/avatar-3.jpg"
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
                              title="Anna"
                            >
                              <img
                                src="assets/images/users/avatar-1.jpg"
                                alt
                                className="rounded-circle avatar-xxs"
                              />
                            </a>
                          </div>
                        </td>
                        <td className="due_date">25 Jan, 2022</td>
                        <td className="status">
                          <span className="badge bg-secondary-subtle text-secondary text-uppercase">
                            Inprogress
                          </span>
                        </td>
                        <td className="priority">
                          <span className="badge bg-danger text-uppercase">
                            High
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="noresult" style={{ display: "none" }}>
                    <div className="text-center">
                      <lord-icon
                        src="https://cdn.lordicon.com/msoeawqm.json"
                        trigger="loop"
                        colors="primary:#121331,secondary:#08a88a"
                        style={{ width: 75, height: 75 }}
                      />
                      <h5 className="mt-2">Sorry! No Result Found</h5>
                      <p className="text-muted mb-0">
                        We've searched more than 200k+ tasks We did not find any
                        tasks for you search.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-2">
                  <div className="pagination-wrap hstack gap-2">
                    <a className="page-item pagination-prev disabled" href="#">
                      Previous
                    </a>
                    <ul className="pagination listjs-pagination mb-0" />
                    <a className="page-item pagination-next" href="#">
                      Next
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="modal fade flip"
          id="deleteOrder"
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body p-5 text-center">
                <lord-icon
                  src="https://cdn.lordicon.com/gsqxdxog.json"
                  trigger="loop"
                  colors="primary:#405189,secondary:#f06548"
                  style={{ width: 90, height: 90 }}
                />
                <div className="mt-4 text-center">
                  <h4>You are about to delete a task ?</h4>
                  <p className="text-muted fs-14 mb-4">
                    Deleting your task will remove all of your information from
                    our database.
                  </p>
                  <div className="hstack gap-2 justify-content-center remove">
                    <button
                      className="btn btn-link btn-ghost-success fw-medium text-decoration-none"
                      id="deleteRecord-close"
                      data-bs-dismiss="modal"
                    >
                      <i className="ri-close-line me-1 align-middle" /> Close
                    </button>
                    <button className="btn btn-danger" id="delete-record">
                      Yes, Delete It
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="modal fade zoomIn"
          id="showModal"
          tabIndex={-1}
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0">
              <div className="modal-header p-3 bg-info-subtle">
                <h5 className="modal-title" id="exampleModalLabel">
                  Create Task
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  id="close-modal"
                />
              </div>
              <form className="tablelist-form" autoComplete="off">
                <div className="modal-body">
                  <input type="hidden" id="tasksId" />
                  <div className="row g-3">
                    <div className="col-lg-12">
                      <label htmlFor="projectName-field" className="form-label">
                        Project Name
                      </label>
                      <input
                        type="text"
                        id="projectName-field"
                        className="form-control"
                        placeholder="Project name"
                        required
                      />
                    </div>
                    <div className="col-lg-12">
                      <div>
                        <label
                          htmlFor="tasksTitle-field"
                          className="form-label"
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          id="tasksTitle-field"
                          className="form-control"
                          placeholder="Title"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <label htmlFor="clientName-field" className="form-label">
                        Client Name
                      </label>
                      <input
                        type="text"
                        id="clientName-field"
                        className="form-control"
                        placeholder="Client name"
                        required
                      />
                    </div>
                    <div className="col-lg-12">
                      <label className="form-label">Assigned To</label>
                      <div data-simplebar style={{ height: 95 }}>
                        <ul className="list-unstyled vstack gap-2 mb-0">
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-2.jpg"
                                id="james-forbes"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="james-forbes"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-2.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  James Forbes
                                </span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-3.jpg"
                                id="john-robles"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="john-robles"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-3.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  John Robles
                                </span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-4.jpg"
                                id="mary-gant"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="mary-gant"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-4.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  Mary Gant
                                </span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-1.jpg"
                                id="curtis-saenz"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="curtis-saenz"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-1.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  Curtis Saenz
                                </span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-5.jpg"
                                id="virgie-price"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="virgie-price"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-5.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  Virgie Price
                                </span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-10.jpg"
                                id="anthony-mills"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="anthony-mills"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-10.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  Anthony Mills
                                </span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-6.jpg"
                                id="marian-angel"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="marian-angel"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-6.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  Marian Angel
                                </span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-10.jpg"
                                id="johnnie-walton"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="johnnie-walton"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-7.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  Johnnie Walton
                                </span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-8.jpg"
                                id="donna-weston"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="donna-weston"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-8.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  Donna Weston
                                </span>
                              </label>
                            </div>
                          </li>
                          <li>
                            <div className="form-check d-flex align-items-center">
                              <input
                                className="form-check-input me-3"
                                type="checkbox"
                                name="assignedTo[]"
                                defaultValue="avatar-9.jpg"
                                id="diego-norris"
                              />
                              <label
                                className="form-check-label d-flex align-items-center"
                                htmlFor="diego-norris"
                              >
                                <span className="flex-shrink-0">
                                  <img
                                    src="assets/images/users/avatar-9.jpg"
                                    alt
                                    className="avatar-xxs rounded-circle"
                                  />
                                </span>
                                <span className="flex-grow-1 ms-2">
                                  Diego Norris
                                </span>
                              </label>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label htmlFor="duedate-field" className="form-label">
                        Due Date
                      </label>
                      <input
                        type="text"
                        id="duedate-field"
                        className="form-control"
                        data-provider="flatpickr"
                        placeholder="Due date"
                        required
                      />
                    </div>
                    <div className="col-lg-6">
                      <label htmlFor="ticket-status" className="form-label">
                        Status
                      </label>
                      <select className="form-control" id="ticket-status">
                        <option value>Status</option>
                        <option value="New">New</option>
                        <option value="Inprogress">Inprogress</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="col-lg-12">
                      <label htmlFor="priority-field" className="form-label">
                        Priority
                      </label>
                      <select className="form-control" id="priority-field">
                        <option value>Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="hstack gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-light"
                      id="close-modal"
                      data-bs-dismiss="modal"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      id="add-btn"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkplaceReviewTaskPage;
