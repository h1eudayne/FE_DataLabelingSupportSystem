export const EXPORT_FORMATS = [
  {
    value: "json",
    label: "JSON",
    desc: ".json",
    mime: "application/json",
    ext: ".json",
  },
  {
    value: "csv",
    label: "CSV",
    desc: ".csv",
    mime: "text/csv",
    ext: ".csv",
  },
  {
    value: "xml",
    label: "XML",
    desc: ".xml",
    mime: "application/xml",
    ext: ".xml",
  },
];

export const computeProjectExportEligibility = (stats = {}, disputes = []) => {
  const totalItems = Number(stats?.totalItems ?? 0);
  const approvedItems = Number(stats?.completedItems ?? 0);
  const pendingDisputes = Array.isArray(disputes)
    ? disputes.filter((dispute) => dispute?.status === "Pending")
    : [];
  const hasDataItems = totalItems > 0;
  const allApproved = hasDataItems && approvedItems === totalItems;
  const noPendingDisputes = pendingDisputes.length === 0;

  return {
    checking: false,
    ready: hasDataItems && allApproved && noPendingDisputes,
    hasDataItems,
    allApproved,
    noPendingDisputes,
    totalItems,
    approvedItems,
    pendingDisputeCount: pendingDisputes.length,
  };
};

const normalizeExportRows = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.Items)) {
    return payload.Items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.Data)) {
    return payload.Data;
  }

  if (typeof payload === "object") {
    return [payload];
  }

  return [];
};

const flattenRow = (value, prefix = "") => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {
      [prefix]: Array.isArray(value) ? JSON.stringify(value) : value,
    };
  }

  return Object.keys(value).reduce((accumulator, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const nextValue = value[key];

    if (
      nextValue !== null &&
      typeof nextValue === "object" &&
      !Array.isArray(nextValue)
    ) {
      return {
        ...accumulator,
        ...flattenRow(nextValue, fullKey),
      };
    }

    return {
      ...accumulator,
      [fullKey]: Array.isArray(nextValue) ? JSON.stringify(nextValue) : nextValue,
    };
  }, {});
};

export const convertExportToCSV = (payload) => {
  const rows = normalizeExportRows(payload);
  if (rows.length === 0) {
    return "";
  }

  const flattenedRows = rows.map((row) => flattenRow(row));
  const headers = [...new Set(flattenedRows.flatMap((row) => Object.keys(row)))];
  const csvRows = [headers.join(",")];

  flattenedRows.forEach((row) => {
    const values = headers.map((header) => {
      const rawValue = row[header] ?? "";
      const stringValue = String(rawValue);
      return stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    });

    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
};

export const convertExportToXML = (payload, rootName = "projectExport") => {
  const escapeXml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const toXml = (value, tag = "item") => {
    if (Array.isArray(value)) {
      return value.map((item) => toXml(item, tag)).join("\n");
    }

    if (value !== null && typeof value === "object") {
      const inner = Object.entries(value)
        .map(([key, nextValue]) => toXml(nextValue, key))
        .join("\n");
      return `<${tag}>\n${inner}\n</${tag}>`;
    }

    return `<${tag}>${escapeXml(value ?? "")}</${tag}>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${toXml(payload, "item")}\n</${rootName}>`;
};

const readBlobAsText = async (blob) => {
  if (blob && typeof blob.text === "function") {
    return blob.text();
  }

  if (typeof FileReader !== "undefined") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(reader.error || new Error("Failed to read blob payload."));
      reader.readAsText(blob);
    });
  }

  throw new Error("Unable to read blob payload.");
};

export const parseExportPayload = async (payload) => {
  if (payload == null) {
    return null;
  }

  if (typeof Blob !== "undefined" && payload instanceof Blob) {
    const text = await readBlobAsText(payload);
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }

  return payload;
};

export const buildExportFileContent = async (payload, format = "json") => {
  const parsedPayload = await parseExportPayload(payload);

  switch (format) {
    case "csv":
      return {
        parsedPayload,
        content: convertExportToCSV(parsedPayload),
      };
    case "xml":
      return {
        parsedPayload,
        content: convertExportToXML(parsedPayload, "projectExport"),
      };
    default:
      return {
        parsedPayload,
        content:
          typeof parsedPayload === "string"
            ? parsedPayload
            : JSON.stringify(parsedPayload ?? {}, null, 2),
      };
  }
};

export const extractExportErrorMessage = async (error, fallbackMessage) => {
  const parsedError = await parseExportPayload(error?.response?.data ?? error?.data);

  if (
    parsedError &&
    typeof parsedError === "object" &&
    !Array.isArray(parsedError) &&
    typeof parsedError.message === "string" &&
    parsedError.message.trim()
  ) {
    return parsedError.message;
  }

  if (typeof parsedError === "string" && parsedError.trim()) {
    return parsedError;
  }

  return fallbackMessage;
};
