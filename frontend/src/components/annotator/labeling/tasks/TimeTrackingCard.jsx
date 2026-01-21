import React from "react";

const TimeTrackingCard = ({ time, taskTitle }) => {
  return (
    <div className="card">
      <div className="card-body text-center">
        <h6 className="card-title mb-3 text-start text-uppercase fs-12">
          Time Tracking
        </h6>
        <div className="mb-2">
          <lord-icon
            src="https://cdn.lordicon.com/kbtmbyzy.json"
            trigger="loop"
            colors="primary:#405189,secondary:#02a8b5"
            style={{ width: "90px", height: "90px" }}
          />
        </div>
        <h3 className="mb-1">{time}</h3>
        <h5 className="fs-14 mb-4 text-muted">{taskTitle}</h5>
        <div className="hstack gap-2 justify-content-center">
          <button className="btn btn-danger btn-sm">
            <i className="ri-stop-circle-line me-1" /> Stop
          </button>
          <button className="btn btn-success btn-sm">
            <i className="ri-play-circle-line me-1" /> Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingCard;
