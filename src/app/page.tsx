"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  Play, 
  Download, 
  Settings, 
  RefreshCw, 
  Globe, 
  Database,
  AlertCircle,
  Map,
  ShieldCheck,
  User,
  Link as LinkIcon
} from "lucide-react";

import UserLinksModal from "@/components/UserLinksModal";

interface AuthUser {
  username: string;
  role: "admin" | "user";
}


interface RowData {
  [key: string]: any;
}

export default function SheetGrabberApp() {
  const router = useRouter();

  // Auth state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [linksModalOpen, setLinksModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setCurrentUser(d.user); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<RowData[]>([]);
  
  // Column mapping state
  const [latColumn, setLatColumn] = useState<string>("");
  const [lngColumn, setLngColumn] = useState<string>("");
  const [nameColumn, setNameColumn] = useState<string>("");
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [statusLog, setStatusLog] = useState<string>("");
  
  // Statistics
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failCount, setFailCount] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  
  // Final processed data
  const [processedData, setProcessedData] = useState<RowData[] | null>(null);
  
  // Export choices
  const [selectedOriginalCols, setSelectedOriginalCols] = useState<string[]>([]);
  const [selectedNewCols, setSelectedNewCols] = useState<string[]>([
    "commune", "municipality", "town", "district", "suburb", 
    "full_address", "country", "state", "city", "postcode", "geocoding_status"
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // New location columns definition
  const newLocationColumns = [
    "commune", "municipality", "town", "district", "suburb", 
    "full_address", "country", "state", "city", "postcode", "geocoding_status"
  ];

  // Helper to format file size
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Auto-detect lat/lng headers
  const autoDetectColumns = (cols: string[]) => {
    const latCandidates = cols.filter(col => {
      const c = col.toLowerCase();
      return c === "lat" || c === "latitude" || c === "y";
    });
    
    const lngCandidates = cols.filter(col => {
      const c = col.toLowerCase();
      return c === "lng" || c === "lon" || c === "long" || c === "longitude" || c === "x";
    });

    const nameCandidates = cols.filter(col => {
      const c = col.toLowerCase();
      return c.includes("nom") || c.includes("name") || c.includes("prenom") || c.includes("client") || c.includes("fullname") || c.includes("full_name");
    });

    if (latCandidates.length > 0) setLatColumn(latCandidates[0]);
    else if (cols.length > 0) setLatColumn(cols[0]);

    if (lngCandidates.length > 0) setLngColumn(lngCandidates[0]);
    else if (cols.length > 1) setLngColumn(cols[1]);
    else if (cols.length > 0) setLngColumn(cols[0]);

    if (nameCandidates.length > 0) setNameColumn(nameCandidates[0]);
    else if (cols.length > 0) setNameColumn(cols[0]);
  };

  // Handle file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary", cellDates: true, cellText: false, cellNF: false });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Read headers and raw rows as strings to preserve phone numbers and decimals
        const jsonData = XLSX.utils.sheet_to_json<RowData>(ws, { raw: false, defval: "" });
        
        if (jsonData.length === 0) {
          alert("The uploaded sheet is empty.");
          return;
        }

        const firstRow = jsonData[0];
        const sheetHeaders = Object.keys(firstRow);
        
        setHeaders(sheetHeaders);
        setData(jsonData);
        setSelectedOriginalCols(sheetHeaders);
        autoDetectColumns(sheetHeaders);
        
        // Reset old process results
        setProcessedData(null);
        setSuccessCount(0);
        setFailCount(0);
        setSkippedCount(0);
        setProgress(0);
        setCurrentRow(0);
        setStatusLog("");
      } catch (err: any) {
        alert("Failed to parse Excel file: " + err.message);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  // Drag and Drop support
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Rate-limited reverse geocode loop
  const startProcessing = async () => {
    if (!latColumn || !lngColumn) return;
    
    setIsProcessing(true);
    setSuccessCount(0);
    setFailCount(0);
    setSkippedCount(0);
    setProgress(0);
    
    const totalRows = data.length;
    const workingData = data.map(row => ({ ...row }));
    
    // Add empty result columns
    newLocationColumns.forEach(col => {
      workingData.forEach(row => {
        row[col] = "";
      });
    });

    for (let i = 0; i < totalRows; i++) {
      setCurrentRow(i + 1);
      const row = workingData[i];
      const latVal = String(row[latColumn]).trim();
      const lngVal = String(row[lngColumn]).trim();

      // Check if coordinate is missing or invalid
      if (!latVal || !lngVal || latVal.toLowerCase() === "nan" || lngVal.toLowerCase() === "nan") {
        row["geocoding_status"] = "skipped";
        row["commune"] = "Invalid Coordinates";
        setSkippedCount(prev => prev + 1);
        setStatusLog(`Row ${i + 1}: Skipped (empty or NaN coordinates)`);
        setProgress(Math.round(((i + 1) / totalRows) * 100));
        continue;
      }

      const lat = parseFloat(latVal);
      const lng = parseFloat(lngVal);

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        row["geocoding_status"] = "skipped";
        row["commune"] = "Invalid Coordinates";
        setSkippedCount(prev => prev + 1);
        setStatusLog(`Row ${i + 1}: Skipped (zero or malformed coordinates)`);
        setProgress(Math.round(((i + 1) / totalRows) * 100));
        continue;
      }

      setStatusLog(`Row ${i + 1}: Geocoding coordinates (${lat}, ${lng})...`);

      try {
        const response = await fetch("/api/geocode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lat, lng }),
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.status === "success") {
            newLocationColumns.forEach(col => {
              row[col] = resData[col] || "";
            });
            row["geocoding_status"] = "success";
            setSuccessCount(prev => prev + 1);
          } else {
            row["geocoding_status"] = "error";
            row["commune"] = "API Error";
            row["full_address"] = resData.full_address || "API Error";
            setFailCount(prev => prev + 1);
          }
        } else {
          row["geocoding_status"] = "error";
          row["commune"] = "HTTP Error";
          setFailCount(prev => prev + 1);
        }
      } catch (err: any) {
        row["geocoding_status"] = "error";
        row["commune"] = "Network Error";
        setFailCount(prev => prev + 1);
      }

      setProgress(Math.round(((i + 1) / totalRows) * 100));

      // Delay to respect LocationIQ 1 req/sec rate limit
      if (i < totalRows - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setProcessedData(workingData);
    setIsProcessing(false);
    setStatusLog("Processing complete!");
  };

  // Phone processing & Export XLSX
  const exportToExcel = () => {
    if (!processedData) return;

    // Filter columns based on user preferences
    const exportColumns = [...selectedOriginalCols, ...selectedNewCols];
    
    const exportRows = processedData.map(row => {
      const formattedRow: RowData = {};
      
      exportColumns.forEach(col => {
        let val = row[col] === undefined || row[col] === null ? "" : row[col];
        
        // Match phone columns and format according to requirements
        const colLower = col.toLowerCase();
        const isPhoneCol = ["tél", "tel", "phone", "portable", "mobile", "telephone"].some(term => colLower.includes(term));
        
        if (isPhoneCol && typeof val === "string") {
          const trimmedVal = val.trim();
          if (trimmedVal.startsWith("0") && trimmedVal.length >= 9 && /^\d+$/.test(trimmedVal)) {
            // Apply prefix f"+213{x[1:]}"
            val = `+213${trimmedVal.substring(1)}`;
          }
        }
        
        formattedRow[col] = val;
      });
      
      return formattedRow;
    });

    // Create Excel Workbook
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Processed Addresses");
    
    // Save file
    const timestamp = new Date().toISOString().slice(0,10).replace(/-/g,"");
    XLSX.writeFile(wb, `processed_addresses_${timestamp}.xlsx`);
  };

  // Toggle checkboxes for column select
  const toggleOriginalCol = (colName: string) => {
    if (selectedOriginalCols.includes(colName)) {
      setSelectedOriginalCols(selectedOriginalCols.filter(c => c !== colName));
    } else {
      setSelectedOriginalCols([...selectedOriginalCols, colName]);
    }
  };

  const toggleNewCol = (colName: string) => {
    if (selectedNewCols.includes(colName)) {
      setSelectedNewCols(selectedNewCols.filter(c => c !== colName));
    } else {
      setSelectedNewCols([...selectedNewCols, colName]);
    }
  };

  const successRate = successCount + failCount > 0 
    ? ((successCount / (successCount + failCount)) * 100).toFixed(1) 
    : "0.0";

  // Build client map data from current data and selected columns
  const mapClients = useMemo(() => {
    if (!latColumn || !lngColumn || !nameColumn || data.length === 0) return [];
    return data
      .map(row => ({
        lat: parseFloat(String(row[latColumn]).trim()),
        lng: parseFloat(String(row[lngColumn]).trim()),
        name: String(row[nameColumn] || "").trim(),
      }))
      .filter(c => !isNaN(c.lat) && !isNaN(c.lng) && c.lat !== 0 && c.lng !== 0);
  }, [data, latColumn, lngColumn, nameColumn]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">📍</div>
          <div>
            <h1 className="brand-title">SheetGrabber</h1>
            <p className="brand-subtitle">Reverse Geocode coordinates from Excel files locally</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Globe size={16} /> API Connected
          </span>
          {currentUser && (
            <>
              {currentUser.role === "admin" && (
                <a
                  href="/admin"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.35rem",
                    fontSize: "0.78rem", color: "#fbbf24",
                    background: "rgba(251,191,36,0.1)", padding: "0.35rem 0.7rem",
                    borderRadius: "6px", border: "1px solid rgba(251,191,36,0.25)",
                    textDecoration: "none",
                  }}
                >
                  <ShieldCheck size={13} /> Admin
                </a>
              )}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
                fontSize: "0.78rem", color: "#94a3b8",
                background: "rgba(255,255,255,0.05)", padding: "0.35rem 0.7rem",
                borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <User size={13} /> {currentUser.username}
              </span>
              <button
                onClick={() => setLinksModalOpen(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.35rem",
                  fontSize: "0.78rem", color: "#4facfe",
                  background: "rgba(79,172,254,0.1)", padding: "0.35rem 0.7rem",
                  borderRadius: "6px", border: "1px solid rgba(79,172,254,0.2)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <LinkIcon size={13} /> Mes Liens
              </button>
              <button
                onClick={handleLogout}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.35rem",
                  fontSize: "0.78rem", color: "#ef4444",
                  background: "rgba(239,68,68,0.08)", padding: "0.35rem 0.7rem",
                  borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <LogOut size={13} /> Déconnexion
              </button>
            </>
          )}
        </div>
      </header>

      {/* Grid */}
      <div className="grid-two-cols">
        {/* Left column: Setup & File Upload */}
        <div>
          <div className="glass-card">
            <h2 className="section-title"><Upload size={18} /> Import Excel File</h2>
            
            <div 
              className={`upload-zone ${dragActive ? "drag-active" : ""}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div className="upload-icon">
                <FileSpreadsheet size={40} />
              </div>
              <div className="upload-title">
                {file ? "Change Excel file" : "Choose Excel file"}
              </div>
              <p className="upload-text">Drag and drop file here, or click to browse</p>
            </div>

            {file && (
              <div className="file-details">
                <div className="file-info">
                  <Database size={16} style={{ color: "var(--accent-primary)" }} />
                  <div>
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatBytes(file.size)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {data.length > 0 && (
            <div className="glass-card">
              <h2 className="section-title"><Settings size={18} /> Coordinate Mapping</h2>
              
              <div className="form-group">
                <label className="form-label">Latitude Column</label>
                <select 
                  className="form-select"
                  value={latColumn}
                  onChange={(e) => setLatColumn(e.target.value)}
                  disabled={isProcessing}
                >
                  <option value="">-- Choose latitude column --</option>
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Longitude Column</label>
                <select 
                  className="form-select"
                  value={lngColumn}
                  onChange={(e) => setLngColumn(e.target.value)}
                  disabled={isProcessing}
                >
                  <option value="">-- Choose longitude column --</option>
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Client Name Column</label>
                <select 
                  className="form-select"
                  value={nameColumn}
                  onChange={(e) => setNameColumn(e.target.value)}
                  disabled={isProcessing}
                >
                  <option value="">-- Choose name column --</option>
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {latColumn && lngColumn && (
                <button 
                  className="btn btn-primary"
                  onClick={startProcessing}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      Processing Row {currentRow}/{data.length}
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Start Geocoding
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right column: Results & Export */}
        <div>
          {/* Default view when no file is loaded */}
          {!file && (
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "350px", textAlign: "center", color: "var(--text-secondary)" }}>
              <Globe size={48} style={{ color: "var(--text-muted)", marginBottom: "1.5rem", opacity: 0.5 }} />
              <h3>Welcome to SheetGrabber</h3>
              <p style={{ maxWidth: "380px", textAlign: "center", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                Upload an Excel sheet containing coordinates to reverse geocode and add commune, city, state, zip and address information.
              </p>
            </div>
          )}

          {/* Metrics & Progress when file is loaded */}
          {file && (
            <div className="glass-card">
              <h2 className="section-title"><CheckCircle2 size={18} /> Processing Status</h2>
              
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-label">Total Rows</div>
                  <div className="metric-value">{data.length}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Success</div>
                  <div className="metric-value success">{successCount}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Failed</div>
                  <div className="metric-value warning">{failCount}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Skipped</div>
                  <div className="metric-value info">{skippedCount}</div>
                </div>
              </div>

              {(isProcessing || progress > 0) && (
                <div className="progress-container">
                  <div className="progress-header">
                    <span>Geocoding progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="status-log">
                    {statusLog || "Initializing geocoder..."}
                  </div>
                </div>
              )}

              {successCount > 0 && !isProcessing && (
                <div className="alert alert-info" style={{ marginTop: "1rem" }}>
                  <AlertCircle size={18} />
                  <div>
                    Geocoding is complete. {successCount} coordinates mapped with {successRate}% success rate.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export Options and preview */}
          {processedData && !isProcessing && (
            <div className="glass-card">
              <h2 className="section-title"><Download size={18} /> Export Processed Sheet</h2>
              
              <div className="form-group">
                <label className="form-label">Select original columns to retain:</label>
                <div className="multiselect-container">
                  {headers.map(col => (
                    <label key={col} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        className="checkbox-input"
                        checked={selectedOriginalCols.includes(col)}
                        onChange={() => toggleOriginalCol(col)}
                      />
                      {col}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select new geocoded columns to add:</label>
                <div className="multiselect-container">
                  {newLocationColumns.map(col => (
                    <label key={col} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        className="checkbox-input"
                        checked={selectedNewCols.includes(col)}
                        onChange={() => toggleNewCol(col)}
                      />
                      {col}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button 
                  className="btn btn-primary"
                  onClick={exportToExcel}
                >
                  <Download size={16} /> Download Processed Excel File
                </button>
              </div>
            </div>
          )}

          {/* Data preview (initial state or processed state) */}
          {data.length > 0 && !isProcessing && (
            <div className="glass-card">
              <h2 className="section-title"><Database size={18} /> Data Preview (First 10 rows)</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {processedData 
                        ? [...selectedOriginalCols, ...selectedNewCols.filter(col => col === "commune" || col === "full_address" || col === "geocoding_status")].map(h => <th key={h}>{h}</th>)
                        : headers.map(h => <th key={h}>{h}</th>)
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {(processedData || data).slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        {processedData 
                          ? [...selectedOriginalCols, ...selectedNewCols.filter(col => col === "commune" || col === "full_address" || col === "geocoding_status")].map(col => {
                              const cellVal = row[col];
                              if (col === "geocoding_status") {
                                return (
                                  <td key={col}>
                                    <span className={`status-badge ${cellVal}`}>
                                      {cellVal}
                                    </span>
                                  </td>
                                );
                              }
                              return <td key={col} title={cellVal}>{cellVal}</td>;
                            })
                          : headers.map(col => <td key={col} title={row[col]}>{row[col]}</td>)
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Open Full Map Button */}
          {mapClients.length > 0 && latColumn && lngColumn && nameColumn && (
            <div className="glass-card map-section">
              <h2 className="section-title"><Map size={18} /> Visualisation Carte</h2>
              <div className="map-stats">
                <span className="map-stat-badge">
                  <span className="dot"></span>
                  {mapClients.length} client{mapClients.length !== 1 ? "s" : ""} localisés
                </span>
                <span className="map-stat-badge" style={{ color: "var(--text-muted)" }}>
                  Nom: <strong style={{ color: "var(--accent-secondary)", marginLeft: 4 }}>{nameColumn}</strong>
                </span>
              </div>
              <div style={{ 
                background: "rgba(13,19,33,0.6)", border: "1px solid rgba(255,255,255,0.07)", 
                borderRadius: "10px", padding: "2rem", textAlign: "center"
              }}>
                <Map size={40} style={{ color: "var(--accent-primary)", marginBottom: "1rem", opacity: 0.7 }} />
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", maxWidth: 340, margin: "0 auto 1.25rem" }}>
                  Ouvrez la carte en plein écran pour visualiser tous vos clients avec leur nom complet.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: "auto", padding: "0.75rem 2rem" }}
                  onClick={() => {
                    sessionStorage.setItem("mapClients", JSON.stringify(mapClients));
                    router.push("/map");
                  }}
                >
                  <Map size={16} /> Ouvrir la carte en plein écran
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="app-footer">
        <p>SheetGrabber — Built for rapid local address parsing and geocoding.</p>
        <p style={{ marginTop: "0.4rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          Développé par{" "}
          <span style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>AOUATI Abdellatif Skander</span>
        </p>
      </footer>

      {/* User Links Modal */}
      {linksModalOpen && (
        <UserLinksModal onClose={() => setLinksModalOpen(false)} />
      )}
    </div>
  );
}
