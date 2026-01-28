import { Navbar, Container, Nav, Button } from "react-bootstrap";

const LandingNavbar = ({ onLogin }) => (
  <Navbar
    className="py-3 sticky-top bg-white bg-opacity-75 border-bottom"
    style={{
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    }}
  >
    <Container>
      <Navbar.Brand
        href="/"
        className="fw-extrabold fs-3 d-flex align-items-center"
        style={{ letterSpacing: "-1px" }}
      >
        <span className="text-primary-custom">AI</span>
        <span style={{ color: "#0f172a" }}>LABEL</span>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />

      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto align-items-center gap-2">
          <Button
            variant="link"
            className="text-decoration-none fw-semibold px-4"
            style={{ color: "#475569" }}
            onClick={onLogin}
          >
            Đăng nhập
          </Button>

          <Button
            className="bg-primary-custom border-0 fw-bold px-4 py-2 shadow-sm"
            onClick={onLogin}
            style={{ borderRadius: "10px" }}
          >
            Bắt đầu ngay
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default LandingNavbar;
