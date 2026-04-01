import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Spinner } from "reactstrap";
import analyticsService from "../../../../services/manager/analytics/analyticsService";
import datasetService from "../../../../services/manager/dataset/datasetService";
import disputeService from "../../../../services/manager/dispute/disputeService";
import {
  EXPORT_FORMATS,
  buildExportFileContent,
  computeProjectExportEligibility,
  extractExportErrorMessage,
} from "../../../../utils/projectExport";

const ExportTab = ({ projectId, project }) => {
  const { t } = useTranslation();
  const [selectedFormat, setSelectedFormat] = useState("json");
  const [exporting, setExporting] = useState(false);
  const [eligibility, setEligibility] = useState({ checking: true, ready: false });

  useEffect(() => {
    const checkEligibility = async () => {
      if (!projectId) return;
      try {
        const [statsRes, disputesRes] = await Promise.all([
          analyticsService.getProjectStats(projectId),
          disputeService.getDisputes(projectId),
        ]);
        setEligibility(
          computeProjectExportEligibility(statsRes.data, disputesRes.data || []),
        );
      } catch {
        setEligibility({
          checking: false,
          hasDataItems: false,
          ready: false,
          allApproved: false,
          noPendingDisputes: false,
          totalItems: 0,
          approvedItems: 0,
          pendingDisputeCount: 0,
        });
      }
    };
    checkEligibility();
  }, [projectId]);

  const handleExport = async () => {
    if (!eligibility.ready) {
      const reasons = [];
      if (!eligibility.hasDataItems) {
        reasons.push(t("exportPage.noDataReason"));
      } else if (!eligibility.allApproved) {
        reasons.push(
          t("exportPage.taskNotApprovedReason", {
            count: (eligibility.totalItems || 0) - (eligibility.approvedItems || 0),
          }),
        );
      }
      if (!eligibility.noPendingDisputes) {
        reasons.push(
          t("exportPage.disputePendingReason", {
            count: eligibility.pendingDisputeCount || 0,
          }),
        );
      }
      toast.error(
        reasons.length > 0
          ? `${t("exportPage.cannotExport")} ${reasons.join(". ")}.`
          : t("exportPage.cannotExport"),
        { autoClose: 5000 },
      );
      return;
    }
    setExporting(true);
    try {
      const res = await datasetService.exportData(projectId);
      const format = EXPORT_FORMATS.find((f) => f.value === selectedFormat);
      const { content } = await buildExportFileContent(res.data, selectedFormat);

      const blob = new Blob([content], { type: format.mime });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project_${projectId}_export_${new Date().toISOString().slice(0, 10)}${format.ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t("exportPage.exportSuccess", { name: project?.name, format: format.label }));
    } catch (error) {
      toast.error(await extractExportErrorMessage(error, t("exportPage.exportError")));
    } finally {
      setExporting(false);
    }
  };

  const currentFormat = EXPORT_FORMATS.find((f) => f.value === selectedFormat);

  return (
    <div className="d-flex justify-content-center py-3">
      <div className="export-tab-card">
        <div className="export-header">
          <div className="export-icon">
            <i className="ri-file-download-line"></i>
          </div>
          <div className="export-title">
            {t("exportPage.title")}
          </div>
          <div className="export-desc">
            {t("exportPage.exportDesc")}
          </div>
        </div>

        <div className="export-section">
          <div className="export-section-title">
            <i className="ri-checkbox-circle-line"></i>
            {t("exportPage.colEligibility")}
          </div>
          {eligibility.checking ? (
            <div className="text-center py-3">
              <Spinner size="sm" color="primary" className="me-2" />
              <span style={{ color: "var(--pd-text-secondary)" }}>
                {t("exportPage.checking")}
              </span>
            </div>
          ) : (
            <>
              <div className={`eligibility-item ${eligibility.allApproved ? "passed" : "failed"}`}>
                <i className={`fs-5 ${eligibility.allApproved ? "ri-checkbox-circle-fill" : "ri-close-circle-fill"}`}></i>
                <span>
                  {!eligibility.hasDataItems
                    ? t("exportPage.noDataHint")
                    : eligibility.allApproved
                    ? t("exportPage.allApproved")
                    : `${(eligibility.totalItems || 0) - (eligibility.approvedItems || 0)} ${t("exportPage.taskNotApproved")}`}
                </span>
              </div>
              <div className={`eligibility-item ${eligibility.noPendingDisputes ? "passed" : "failed"}`}>
                <i className={`fs-5 ${eligibility.noPendingDisputes ? "ri-checkbox-circle-fill" : "ri-close-circle-fill"}`}></i>
                <span>
                  {eligibility.noPendingDisputes
                    ? t("exportPage.noDisputes")
                    : `${eligibility.pendingDisputeCount} ${t("exportPage.disputePending")}`}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="export-section">
          <div className="export-section-title">
            <i className="ri-settings-3-line"></i>
            {t("exportPage.format")}
          </div>
          <div className="format-btn-group">
            {EXPORT_FORMATS.map((f) => (
              <button
                key={f.value}
                className={`format-btn ${selectedFormat === f.value ? "active" : ""}`}
                onClick={() => setSelectedFormat(f.value)}
              >
                {f.label} ({f.desc})
              </button>
            ))}
          </div>
        </div>

        <div className="export-action">
          <button
            className={`btn-export ${eligibility.ready ? "ready" : "locked"}`}
            onClick={handleExport}
            disabled={exporting || eligibility.checking || !eligibility.ready}
          >
            {exporting ? (
              <>
                <Spinner size="sm" className="me-2" />
                {t("exportPage.exporting")}
              </>
            ) : !eligibility.ready ? (
              <>
                <i className="ri-lock-line me-2"></i>
                {t("exportPage.locked")}
              </>
            ) : (
              <>
                <i className="ri-file-download-line me-2"></i>
                Export {currentFormat?.label}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportTab;
