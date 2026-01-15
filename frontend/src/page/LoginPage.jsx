import React from "react";
import { Link } from "react-router-dom";
import { Carousel } from "react-bootstrap";

// Nếu bạn để ảnh trong src/assets thì import như sau, nếu để trong public thì giữ nguyên đường dẫn chuỗi
import logoLight from "../assets/images/logo-light.png";

const LoginPage = () => {
  const quotes = [
    {
      text: "Great things never come from comfort zones.",
      author: "Admin",
    },
    {
      text: "Experience is the simply name we give our mistakes.",
      author: "Oscar Wilde",
    },
    {
      text: "The web as I envisaged it, we have not seen it yet. The future is still so much bigger than the past.",
      author: "Tim Berners-Lee",
    },
  ];
  return (
    <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
      {" "}
      <div className="bg-overlay" />
      <div className="auth-page-content overflow-hidden pt-lg-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="card overflow-hidden card-bg-fill border-0 card-border-effect-none">
                <div className="row g-0">
                  {/* PHẦN BÊN TRÁI: BACKGROUND & QUOTES */}
                  <div className="col-lg-6">
                    <div className="p-lg-5 p-4 auth-one-bg h-100">
                      <div className="bg-overlay" />
                      <div className="position-relative h-100 d-flex flex-column">
                        <div className="mb-4">
                          <a to="/" className="d-block">
                            <img src={logoLight} alt="logo" height={18} />
                          </a>
                        </div>
                        <div className="mt-auto">
                          <div className="mb-3">
                            <i className="ri-double-quotes-l display-4 text-success" />
                          </div>
                          {/* Chữ chạy */}
                          <Carousel
                            indicators={true}
                            controls={false}
                            interval={2000}
                            fade={true}
                            id="qoutescarouselIndicators"
                          >
                            {quotes.map((quote, index) => (
                              <Carousel.Item
                                key={index}
                                className="text-center text-white pb-5"
                              >
                                <p className="fs-15 fst-italic">
                                  "{quote.text}"
                                </p>
                                <span className="text-white-50 small">
                                  - {quote.author}
                                </span>
                              </Carousel.Item>
                            ))}
                          </Carousel>
                          <div
                            id="qoutescarouselIndicators"
                            className="carousel slide"
                            data-bs-ride="carousel"
                          >
                            <div className="carousel-inner text-center text-white pb-5">
                              <div className="carousel-item active">
                                <p className="fs-15 fst-italic">
                                  " Great things never come from comfort zones.
                                  "
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PHẦN BÊN PHẢI: FORM ĐĂNG NHẬP */}
                  <div className="col-lg-6">
                    <div className="p-lg-5 p-4">
                      <div>
                        <h5 className="text-primary">Welcome Back !</h5>
                        <p className="text-muted">
                          Sign in to continue to Velzon.
                        </p>
                      </div>
                      <div className="mt-4">
                        <form action="/">
                          <div className="mb-3">
                            <label htmlFor="username" className="form-label">
                              Username
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="username"
                              placeholder="Enter username"
                            />
                          </div>
                          <div className="mb-3">
                            <div className="float-end">
                              <Link
                                to="/forgot-password"
                                title="Forgot password"
                                className="text-muted"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <label
                              className="form-label"
                              htmlFor="password-input"
                            >
                              Password
                            </label>
                            <div className="position-relative auth-pass-inputgroup mb-3">
                              <input
                                type="password"
                                className="form-control pe-5 password-input"
                                placeholder="Enter password"
                                id="password-input"
                              />
                              <button
                                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                                type="button"
                              >
                                <i className="ri-eye-fill align-middle" />
                              </button>
                            </div>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="auth-remember-check"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="auth-remember-check"
                            >
                              Remember me
                            </label>
                          </div>
                          <div className="mt-4">
                            <button
                              className="btn btn-success w-100"
                              type="submit"
                            >
                              Sign In
                            </button>
                          </div>

                          {/* SOCIAL LOGIN */}
                          <div className="mt-4 text-center">
                            <div className="signin-other-title">
                              <h5 className="fs-13 mb-4 title">Sign In with</h5>
                            </div>
                            <div>
                              <button
                                type="button"
                                className="btn btn-primary btn-icon waves-effect waves-light"
                              >
                                <i className="ri-facebook-fill fs-16" />
                              </button>{" "}
                              <button
                                type="button"
                                className="btn btn-danger btn-icon waves-effect waves-light"
                              >
                                <i className="ri-google-fill fs-16" />
                              </button>{" "}
                              <button
                                type="button"
                                className="btn btn-dark btn-icon waves-effect waves-light"
                              >
                                <i className="ri-github-fill fs-16" />
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                      <div className="mt-5 text-center">
                        <p className="mb-0">
                          Don't have an account ?{" "}
                          <Link
                            to="/register"
                            className="fw-semibold text-primary text-decoration-underline"
                          >
                            Signup
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <p className="mb-0 text-muted">
                  &copy; {new Date().getFullYear()} Velzon. Crafted with{" "}
                  <i className="mdi mdi-heart text-danger" /> by Themesbrand
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
