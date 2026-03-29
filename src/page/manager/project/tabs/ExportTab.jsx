import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Spinner, Alert } from "reactstrap";
import analyticsService from "../../../../services/manager/analytics/analyticsService";
import datasetService from "../../../../services/manager/dataset/datasetService";
import disputeService from "../../../../services/manager/dispute/disputeService";

const EXPORT_FORMATS = [
  { value: "json", label: "JSON", desc: ".json", mime: "application/json", ext: ".json" },
  { value: "csv", label: "CSV", desc: ".csv", mime: "text/csv", ext: ".csv" },
  { value: "xml", label: "XML", desc: ".xml", mime: "application/xml", ext: ".xml" },
];

const convertToCSV = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    if (typeof data === "object" && !Array.isArray(data)) data = [data];
    else return "";
  }
  const flattenObj = (obj, prefix = "") => {
    const result = {};
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObj(obj[key], fullKey));
      } else {
        result[fullKey] = Array.isArray(obj[key]) ? JSON.stringify(obj[key]) : obj[key];
      }
    }
    return result;
  };
  const flatData = data.map((item) => flattenObj(item));
  const headers = [...new Set(flatData.flatMap((d) => Object.keys(d)))];
  const csvRows = [headers.join(",")];
  for (const row of flatData) {
    const values = headers.map((h) => {
      const val = row[h] ?? "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
};

const convertToXML = (data, rootName = "export") => {
  const escapeXml = (str) =>
    String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const toXml = (obj, tag = "item") => {
    if (Array.isArray(obj)) return obj.map((item) => toXml(item, tag)).join("\n");
    if (typeof obj === "object" && obj !== null) {
      const inner = Object.entries(obj).map(([key, val]) => toXml(val, key)).join("\n");
      return `<${tag}>\n${inner}\n</${tag}>`;
    }
    return `<${tag}>${escapeXml(obj)}</${tag}>`;
  };
  const items = Array.isArray(data) ? data : [data];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${items.map((item) => toXml(item, "item")).join("\n")}\n</${rootName}>`;
};

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
        const stats = statsRes.data;
        const disputes = disputesRes.data || [];
        const totalTasks = stats.totalAssignments ?? 0;
        const approved = stats.approvedAssignments ?? 0;
        const allApproved = totalTasks > 0 && approved === totalTasks;
        const pendingDisputes = disputes.filter((d) => d.status === "Pending");
        const noPendingDisputes = pendingDisputes.length === 0;

        setEligibility({
          checking: false,
          ready: allApproved && noPendingDisputes,
          allApproved,
          noPendingDisputes,
          totalTasks,
          approved,
          pendingDisputeCount: pendingDisputes.length,
        });
      } catch {
        setEligibility({ checking: false, ready: false, allApproved: false, noPendingDisputes: false });
      }
    };
    checkEligibility();
  }, [projectId]);

  const handleExport = async () => {
    if (!eligibility.ready) {
      toast.error(t("exportPage.cannotExport"), { autoClose: 5000 });
      return;
    }
    setExporting(true);
    try {
      const res = await datasetService.exportData(projectId);
      const format = EXPORT_FORMATS.find((f) => f.value === selectedFormat);
      let rawData = res.data;
      if (typeof rawData === "string") { try { rawData = JSON.parse(rawData); } catch {} }

      let content;
      switch (selectedFormat) {
        case "csv": content = convertToCSV(rawData); break;
        case "xml": content = convertToXML(rawData, "projectExport"); break;
        default: content = typeof rawData === "string" ? rawData : JSON.stringify(rawData, null, 2);
      }

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
    } catch {
      toast.error(t("exportPage.exportError"));
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
                  {eligibility.allApproved
                    ? t("exportPage.allApproved")
                    : `${(eligibility.totalTasks || 0) - (eligibility.approved || 0)} ${t("exportPage.taskNotApproved")}`}
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
            disabled={exporting || eligibility.checking}
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
