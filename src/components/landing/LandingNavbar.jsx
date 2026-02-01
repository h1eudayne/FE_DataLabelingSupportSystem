import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const LandingNavbar = ({ onLogin }) => (
  <Navbar
    expand="lg"
    className="py-0 sticky-top bg-white bg-opacity-75 border-bottom"
    style={{
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      zIndex: 1050,
    }}
  >
    <Container>
      <Navbar.Brand
        as={Link}
        to="/"
        className="fw-extrabold fs-3 d-flex align-items-center"
        style={{ letterSpacing: "-1px" }}
      >
        <img
          src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842054/logo-1_jc0rul.png"
          alt="logo"
          height={60}
        />
      </Navbar.Brand>

      <Navbar.Toggle
        aria-controls="basic-navbar-nav"
        className="border-0 shadow-none"
      >
        <span className="material-icons-round">menu</span>
      </Navbar.Toggle>

      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto align-items-center gap-2 pt-3 pt-lg-0">
          <Button
            variant="link"
            className="text-dark fw-bold text-decoration-none px-4 py-2 w-100 w-lg-auto"
            onClick={onLogin}
          >
            Đăng nhập
          </Button>
          <Button
            className="bg-primary-custom border-0 fw-bold px-4 py-2 shadow-sm w-100 w-lg-auto"
            onClick={onLogin}
            style={{ borderRadius: "12px" }}
          >
            Bắt đầu ngay
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default LandingNavbar;
