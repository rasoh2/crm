import { useState, useRef, useMemo } from 'react';
import { Button, Modal, Dropdown, ButtonGroup, Form, Badge } from 'react-bootstrap';
import {
  BsArrowsFullscreen,
  BsFullscreenExit,
  BsDownload,
  BsFileEarmarkExcel,
  BsFileEarmarkWord,
  BsFileEarmarkText,
  BsClipboard,
  BsCheck2,
  BsSearch,
} from 'react-icons/bs';

/**
 * Componente ChatTable
 * Renderiza tablas de Markdown en el chat con:
 * 1. Botón para expandir a Pantalla Completa (Modal interactivo con buscador).
 * 2. Menú desplegable para descargar en Excel (.xls), Word (.doc) y CSV (.csv).
 * 3. Copiado directo al portapapeles en formato TSV (para pegar en Excel / Sheets).
 */
export default function ChatTable({ children, ...props }) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const tableRef = useRef(null);

  // Extrae encabezados y datos de la tabla montada en el DOM
  const getTableData = () => {
    if (!tableRef.current) return { headers: [], rows: [] };
    const thElements = Array.from(
      tableRef.current.querySelectorAll('thead th, thead td')
    );
    const headers = thElements.map((th) => th.innerText.trim());

    const trElements = Array.from(tableRef.current.querySelectorAll('tbody tr'));
    const rows = trElements.map((tr) =>
      Array.from(tr.querySelectorAll('td, th')).map((td) => td.innerText.trim())
    );

    return { headers, rows };
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Exportar a Excel (.xls estructurado con compatibilidad XML nativa de MS Office)
  const handleExportExcel = () => {
    const { headers, rows } = getTableData();
    if (!headers.length && !rows.length) return;

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Reporte CRM</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 8px; mso-number-format:"\\@"; }
        </style>
      </head>
      <body>
        <h2 style="font-family: Arial; color: #1e3a8a;">Reporte de Oportunidades Comercial — CRM AI</h2>
        <p style="font-family: Arial; color: #64748b; font-size: 11px;">Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}</p>
        <table border="1">
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + html], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    });
    triggerDownload(blob, `crm_tabla_excel_${Date.now()}.xls`);
  };

  // 2. Exportar a Microsoft Word (.doc con estilos y maquetación ejecutiva)
  const handleExportWord = () => {
    const { headers, rows } = getTableData();
    if (!headers.length && !rows.length) return;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Reporte Comercial CRM</title>
        <style>
          body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; margin: 30px; }
          h2 { color: #1d4ed8; margin-bottom: 4px; }
          p.subtitle { color: #64748b; font-size: 10pt; margin-top: 0; margin-bottom: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 15px; }
          th { background-color: #2563eb; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #1e40af; text-align: left; font-size: 10pt; }
          td { padding: 8px 12px; border: 1px solid #cbd5e1; font-size: 9.5pt; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 30px; font-size: 9pt; color: #94a3b8; text-align: right; }
        </style>
      </head>
      <body>
        <h2>Reporte Comercial — Asistente Copilot CRM</h2>
        <p class="subtitle">Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}</p>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <p class="footer">CRM AI Platform &bull; Información Confidencial</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + html], {
      type: 'application/msword;charset=utf-8',
    });
    triggerDownload(blob, `crm_tabla_word_${Date.now()}.doc`);
  };

  // 3. Exportar a CSV compatible universal
  const handleExportCSV = () => {
    const { headers, rows } = getTableData();
    if (!headers.length && !rows.length) return;

    const escapeCSV = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
    const content =
      '\uFEFF' +
      [
        headers.map(escapeCSV).join(','),
        ...rows.map((r) => r.map(escapeCSV).join(',')),
      ].join('\r\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `crm_tabla_${Date.now()}.csv`);
  };

  // 4. Copiar al Portapapeles en formato TSV (para pegar en Excel / Google Sheets)
  const handleCopy = () => {
    const { headers, rows } = getTableData();
    if (!headers.length && !rows.length) return;

    const tsv = [
      headers.join('\t'),
      ...rows.map((r) => r.join('\t')),
    ].join('\n');

    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  // Filtrado reactivo en pantalla completa
  const modalData = useMemo(() => {
    if (!showFullscreen) return { headers: [], rows: [] };
    const { headers, rows } = getTableData();
    if (!searchTerm.trim()) return { headers, rows };

    const term = searchTerm.toLowerCase();
    const filteredRows = rows.filter((row) =>
      row.some((cell) => cell.toLowerCase().includes(term))
    );
    return { headers, rows: filteredRows };
  }, [showFullscreen, searchTerm]);

  return (
    <div className="chat-table-wrapper my-3 border rounded-3 bg-white shadow-2xs overflow-hidden">
      {/* Barra superior de herramientas de la tabla */}
      <div className="d-flex justify-content-between align-items-center bg-light px-3 py-2 border-bottom flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <Badge bg="primary" className="fw-normal px-2 py-1 fs-8">
            📊 Tabla de Datos
          </Badge>
          <small className="text-muted d-none d-sm-inline" style={{ fontSize: '0.8rem' }}>
            Vista estructurada
          </small>
        </div>

        <div className="d-flex align-items-center gap-1">
          {/* Botón Copiar al Portapapeles */}
          <Button
            variant="outline-secondary"
            size="sm"
            className="py-1 px-2 d-flex align-items-center gap-1 rounded-2"
            style={{ fontSize: '0.78rem' }}
            onClick={handleCopy}
            title="Copiar contenido para pegar directamente en Excel o Google Sheets"
          >
            {copied ? (
              <>
                <BsCheck2 className="text-success" />
                <span className="text-success fw-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <BsClipboard />
                <span className="d-none d-md-inline">Copiar</span>
              </>
            )}
          </Button>

          {/* Menú Desplegable de Exportación en Múltiples Formatos */}
          <Dropdown as={ButtonGroup} size="sm">
            <Button
              variant="outline-success"
              size="sm"
              className="py-1 px-2 d-flex align-items-center gap-1 rounded-start-2"
              style={{ fontSize: '0.78rem' }}
              onClick={handleExportExcel}
              title="Descargar como archivo de Excel (.xls)"
            >
              <BsFileEarmarkExcel />
              <span className="d-none d-md-inline">Excel</span>
            </Button>

            <Dropdown.Toggle
              split
              variant="outline-success"
              size="sm"
              className="px-2 rounded-end-2"
              title="Más formatos de descarga"
            />

            <Dropdown.Menu align="end" className="shadow-sm py-1 border-0" style={{ fontSize: '0.82rem' }}>
              <Dropdown.Header className="text-uppercase fs-9 py-1 text-muted">
                Formatos de Descarga
              </Dropdown.Header>

              <Dropdown.Item onClick={handleExportExcel} className="d-flex align-items-center py-2">
                <BsFileEarmarkExcel className="text-success me-2 fs-6" />
                <div>
                  <div className="fw-semibold">Microsoft Excel (.xls)</div>
                  <small className="text-muted fs-8">Abre directamente con formato</small>
                </div>
              </Dropdown.Item>

              <Dropdown.Item onClick={handleExportWord} className="d-flex align-items-center py-2">
                <BsFileEarmarkWord className="text-primary me-2 fs-6" />
                <div>
                  <div className="fw-semibold">Microsoft Word (.doc)</div>
                  <small className="text-muted fs-8">Documento estructurado con portada</small>
                </div>
              </Dropdown.Item>

              <Dropdown.Item onClick={handleExportCSV} className="d-flex align-items-center py-2">
                <BsFileEarmarkText className="text-secondary me-2 fs-6" />
                <div>
                  <div className="fw-semibold">Archivo CSV (.csv)</div>
                  <small className="text-muted fs-8">Separado por comas / universal</small>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Botón de Pantalla Completa */}
          <Button
            variant="outline-primary"
            size="sm"
            className="py-1 px-2 d-flex align-items-center gap-1 rounded-2 ms-1"
            style={{ fontSize: '0.78rem' }}
            onClick={() => setShowFullscreen(true)}
            title="Expandir tabla en pantalla completa para mejor lectura y análisis"
          >
            <BsArrowsFullscreen />
            <span className="d-none d-sm-inline">Pantalla Completa</span>
          </Button>
        </div>
      </div>

      {/* Contenedor responsivo con la tabla */}
      <div className="table-responsive" style={{ maxHeight: '420px' }}>
        <table
          ref={tableRef}
          className="table table-sm table-hover align-middle mb-0"
          style={{ fontSize: '0.85rem' }}
          {...props}
        >
          {children}
        </table>
      </div>

      {/* Modal de Pantalla Completa / Vista Ejecutiva */}
      <Modal
        show={showFullscreen}
        onHide={() => {
          setShowFullscreen(false);
          setSearchTerm('');
        }}
        size="xl"
        fullscreen="lg-down"
        centered
        className="chat-table-fullscreen-modal"
      >
        <Modal.Header closeButton className="bg-light py-3 border-bottom">
          <div className="d-flex align-items-center justify-content-between w-100 me-3 flex-wrap gap-2">
            <div>
              <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
                <BsArrowsFullscreen className="text-primary" />
                <span>Vista en Pantalla Completa — Tabla CRM</span>
              </Modal.Title>
              <small className="text-muted">
                Visualización detallada y herramientas de exportación rápida
              </small>
            </div>

            {/* Buscador dentro de la tabla */}
            <div className="d-flex align-items-center gap-2" style={{ maxWidth: '320px', flex: 1 }}>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <BsSearch className="text-muted" />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Filtrar en esta tabla..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </div>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="p-0 overflow-auto" style={{ maxHeight: '72vh' }}>
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
              <thead className="table-dark sticky-top text-nowrap">
                <tr>
                  {modalData.headers.map((h, i) => (
                    <th key={i} className="py-2 px-3 fw-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modalData.rows.length > 0 ? (
                  modalData.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={modalData.headers.length || 1} className="text-center py-4 text-muted">
                      No se encontraron filas que coincidan con &ldquo;{searchTerm}&rdquo;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>

        <Modal.Footer className="bg-light py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="text-muted small">
            Mostrando <strong>{modalData.rows.length}</strong> fila(s)
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleCopy}
              className="d-flex align-items-center gap-1"
            >
              {copied ? <BsCheck2 className="text-success" /> : <BsClipboard />}
              <span>{copied ? '¡Copiado!' : 'Copiar TSV'}</span>
            </Button>

            <Button
              variant="success"
              size="sm"
              onClick={handleExportExcel}
              className="d-flex align-items-center gap-1"
            >
              <BsFileEarmarkExcel />
              <span>Descargar Excel</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportWord}
              className="d-flex align-items-center gap-1"
            >
              <BsFileEarmarkWord />
              <span>Descargar Word</span>
            </Button>

            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => {
                setShowFullscreen(false);
                setSearchTerm('');
              }}
              className="d-flex align-items-center gap-1 ms-2"
            >
              <BsFullscreenExit />
              <span>Cerrar</span>
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
