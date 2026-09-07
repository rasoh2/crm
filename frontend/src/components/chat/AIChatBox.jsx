import { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { BsSend, BsStars, BsPerson, BsBuilding, BsChatText, BsLightningCharge } from 'react-icons/bs';
import { chatApi, opportunityApi } from '../../services/api';
import ReactMarkdown from 'react-markdown';

export default function AIChatBox() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Bienvenido al **Copilot Comercial**. Puedo asistirte en el análisis de oportunidades, generación de informes ejecutivos y consulta de especificaciones técnicas mediante RAG.\n\nUsa el panel de la derecha para seleccionar **Plantillas con [Empresa]**, explorar **Empresas del Pipeline** o realiza tu consulta directamente:',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const messagesEndRef = useRef(null);

  const templateQuestions = [
    { label: '🔍 Estado de [Empresa]', template: '¿Cuál es el estado y detalles de la oportunidad de [Empresa]?' },
    { label: '📝 Última interacción', template: 'Resume la última interacción registrada con [Empresa]' },
    { label: '🤖 Recomendación IA', template: '¿Qué recomendación estratégica hay para cerrar el negocio con [Empresa]?' },
    { label: '📄 Documentos y SLA', template: 'Busca las especificaciones técnicas, cifrado y SLA de [Empresa]' },
  ];

  const quickQueries = [
    { label: '📊 Resumen ejecutivo', query: 'Genera un resumen ejecutivo del pipeline comercial' },
    { label: '⭐ Mayor probabilidad', query: '¿Cuáles son las oportunidades con mayor probabilidad de cierre?' },
    { label: '📅 Seguimiento semanal', query: '¿Qué clientes necesitan seguimiento esta semana?' },
    { label: '🚨 Oportunidades críticas', query: '¿Qué oportunidades son de prioridad crítica?' },
  ];

  // Cargar empresas activas del CRM
  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoadingCompanies(true);
        const res = await opportunityApi.getAll();
        const uniqueCompanies = [...new Set(res.data?.data?.map((o) => o.company_name).filter(Boolean))];
        setCompanies(uniqueCompanies);
      } catch (err) {
        console.error('Error al cargar la lista de empresas en el chat:', err);
      } finally {
        setLoadingCompanies(false);
      }
    }
    loadCompanies();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageText = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatApi.sendMessage(userMessage, history);
      const aiResponse = res.data.data.message;

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiResponse },
      ]);
    } catch (err) {
      console.error('Error al enviar mensaje al chat:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Ocurrió un inconveniente al procesar la solicitud. Por favor reintente en unos instantes.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (q) => {
    if (q.template) {
      setInput(q.template);
    } else if (q.query) {
      sendMessageText(q.query);
    }
  };

  const handleSelectCompany = (companyName) => {
    if (input.includes('[Empresa]')) {
      setInput((prev) => prev.replace('[Empresa]', companyName));
    } else if (!input.trim()) {
      setInput(`¿Cuál es el estado comercial y recomendación para ${companyName}?`);
    } else {
      setInput((prev) => `${prev} ${companyName}`);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessageText(input);
  };

  return (
    <>
      <div className="d-flex align-items-center mb-1">
        <BsStars className="me-2 text-warning fs-4" />
        <h2 className="mb-0 fw-bold tracking-tight">Copilot Comercial</h2>
      </div>
      <p className="text-muted small mb-3">
        Asistente analítico con Function Calling y RAG. Utiliza la barra lateral para explorar empresas y plantillas.
      </p>

      <Row className="g-3">
        {/* Columna Principal: Área de Chat e Input */}
        <Col lg={8} xl={9}>
          <Card className="shadow-sm border-0 chat-card-container" style={{ minHeight: '65vh', height: '76vh' }}>
            {/* Mensajes del Chat */}
            <Card.Body className="overflow-auto bg-light bg-opacity-50 p-4" style={{ flex: 1 }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`d-flex mb-3 ${
                    msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-3 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white border text-dark'
                    }`}
                    style={{ maxWidth: '85%' }}
                  >
                    <div className="d-flex align-items-center mb-1">
                      {msg.role === 'user' ? (
                        <BsPerson className="me-2 opacity-75" />
                      ) : (
                        <BsStars className="me-2 text-warning" />
                      )}
                      <small className={`fw-bold ${msg.role === 'user' ? 'text-white-50' : 'text-secondary'}`}>
                        {msg.role === 'user' ? 'Usuario' : 'Copilot Comercial'}
                      </small>
                    </div>
                    <div className="chat-content" style={{ fontSize: '0.95rem' }}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="d-flex justify-content-start mb-3">
                  <div className="bg-light border p-3 rounded-3">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Consultando datos...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </Card.Body>

            {/* Input Form Footer */}
            <Card.Footer className="bg-white border-top p-3">
              <Form onSubmit={handleSend} className="d-flex gap-2">
                <Form.Control
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu consulta o selecciona una empresa/plantilla en la barra lateral..."
                  disabled={loading}
                  autoFocus
                />
                <Button type="submit" variant="primary" disabled={loading || !input.trim()}>
                  <BsSend />
                </Button>
              </Form>
            </Card.Footer>
          </Card>
        </Col>

        {/* Columna Lateral (Sidebar): Guía, Plantillas y Lista de Empresas */}
        <Col lg={4} xl={3}>
          <Card className="shadow-sm border-0 h-100" style={{ maxHeight: '76vh' }}>
            <Card.Header className="bg-white border-bottom fw-bold py-3 text-secondary d-flex align-items-center">
              <BsChatText className="me-2 text-primary" />
              <span>Guía del Copilot</span>
            </Card.Header>
            <Card.Body className="overflow-auto p-3">
              {/* Sección 1: Plantillas con [Empresa] */}
              <div className="mb-4">
                <small className="text-uppercase fw-bold text-muted d-block mb-2 fs-8">
                  📌 Plantillas (Rellena [Empresa]):
                </small>
                <div className="d-grid gap-2">
                  {templateQuestions.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline-secondary"
                      size="sm"
                      className="text-start text-truncate rounded-3 py-1 px-2"
                      style={{ fontSize: '0.8rem' }}
                      disabled={loading}
                      onClick={() => handleSelectTemplate(q)}
                      title={`Rellenar input con: "${q.template}"`}
                    >
                      {q.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sección 2: Empresas en el Pipeline */}
              <div className="mb-4">
                <small className="text-uppercase fw-bold text-muted d-block mb-2 fs-8">
                  🏢 Empresas en Pipeline ({companies.length}):
                </small>
                {loadingCompanies ? (
                  <small className="text-muted">Cargando empresas...</small>
                ) : (
                  <div className="d-flex flex-wrap gap-1 overflow-auto pe-1" style={{ maxHeight: '180px' }}>
                    {companies.map((compName, idx) => (
                      <Badge
                        key={idx}
                        bg="light"
                        text="dark"
                        className="border text-truncate px-2 py-1 shadow-2xs hover-shadow"
                        style={{ cursor: 'pointer', fontSize: '0.76rem', maxWidth: '100%' }}
                        onClick={() => handleSelectCompany(compName)}
                        title={`Haz clic para reemplazar [Empresa] con "${compName}"`}
                      >
                        🏢 {compName}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección 3: Consultas Rápidas Directas */}
              <div>
                <small className="text-uppercase fw-bold text-muted d-block mb-2 fs-8">
                  <BsLightningCharge className="me-1 text-warning" /> Consultas Rápidas Directas:
                </small>
                <div className="d-grid gap-2">
                  {quickQueries.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="outline-primary"
                      size="sm"
                      className="text-start text-truncate rounded-3 py-1 px-2"
                      style={{ fontSize: '0.78rem' }}
                      disabled={loading}
                      onClick={() => handleSelectTemplate(q)}
                    >
                      {q.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
