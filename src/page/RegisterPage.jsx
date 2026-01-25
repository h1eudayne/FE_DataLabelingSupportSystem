import React from "react";
import { Carousel } from "react-bootstrap";

const RegisterPage = () => {
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
      <div className="bg-overlay" />
      <div className="auth-page-content overflow-hidden pt-lg-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="card overflow-hidden m-0">
                <div className="row justify-content-center g-0">
                  <div className="col-lg-6">
                    <div className="p-lg-5 p-4 auth-one-bg h-100">
                      <div className="bg-overlay" />
                      <div className="position-relative h-100 d-flex flex-column">
                        <div className="mb-4">
                          <a href="index.html" className="d-block">
                            <img
                              src="assets/images/logo-light.png"
                              alt
                              height={18}
                            />
                          </a>
                        </div>
                        <div className="mt-auto">
                          <div className="mb-3">
                            <i className="ri-double-quotes-l display-4 text-success" />
                          </div>
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
                            <div className="carousel-indicators">
                              <button
                                type="button"
                                data-bs-target="#qoutescarouselIndicators"
                                data-bs-slide-to={0}
                                className="active"
                                aria-current="true"
                                aria-label="Slide 1"
                              />
                              <button
                                type="button"
                                data-bs-target="#qoutescarouselIndicators"
                                data-bs-slide-to={1}
                                aria-label="Slide 2"
                              />
                              <button
                                type="button"
                                data-bs-target="#qoutescarouselIndicators"
                                data-bs-slide-to={2}
                                aria-label="Slide 3"
                              />
                            </div>
                            <div className="carousel-inner text-center text-white-50 pb-5">
                              <div className="carousel-item active">
                                <p className="fs-15 fst-italic">
                                  " Great! Clean code, clean design, easy for
                                  customization. Thanks very much! "
                                </p>
                              </div>
                              <div className="carousel-item">
                                <p className="fs-15 fst-italic">
                                  " The theme is really great with an amazing
                                  customer support."
                                </p>
                              </div>
                              <div className="carousel-item">
                                <p className="fs-15 fst-italic">
                                  " Great! Clean code, clean design, easy for
                                  customization. Thanks very much! "
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="p-lg-5 p-4">
                      <div>
                        <h5 className="text-primary">Register Account</h5>
                        <p className="text-muted">
                          Get your Free Velzon account now.
                        </p>
                      </div>
                      <div className="mt-4">
                        <form
                          className="needs-validation"
                          noValidate
                          action="https://themesbrand.com/velzon/html/default/index.html"
                        >
                          <div className="mb-3">
                            <label htmlFor="useremail" className="form-label">
                              Email <span className="text-danger">*</span>
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="useremail"
                              placeholder="Enter email address"
                              required
                            />
                            <div className="invalid-feedback">
                              Please enter email
                            </div>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="username" className="form-label">
                              Username <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="username"
                              placeholder="Enter username"
                              required
                            />
                            <div className="invalid-feedback">
                              Please enter username
                            </div>
                          </div>
                          <div className="mb-3">
                            <label
                              className="form-label"
                              htmlFor="password-input"
                            >
                              Password
                            </label>
                            <div className="position-relative auth-pass-inputgroup">
                              <input
                                type="password"
                                className="form-control pe-5 password-input"
                                onpaste="return false"
                                placeholder="Enter password"
                                id="password-input"
                                aria-describedby="passwordInput"
                                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                required
                              />
                              <button
                                className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
                                type="button"
                                id="password-addon"
                              >
                                <i className="ri-eye-fill align-middle" />
                              </button>
                              <div className="invalid-feedback">
                                Please enter password
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="mb-0 fs-12 text-muted fst-italic">
                              By registering you agree to the Velzon
                              <a
                                href="#"
                                className="text-primary text-decoration-underline fst-normal fw-medium"
                              >
                                Terms of Use
                              </a>
                            </p>
                          </div>
                          <div
                            id="password-contain"
                            className="p-3 bg-light mb-2 rounded"
                          >
                            <h5 className="fs-13">Password must contain:</h5>
                            <p id="pass-length" className="invalid fs-12 mb-2">
                              Minimum <b>8 characters</b>
                            </p>
                            <p id="pass-lower" className="invalid fs-12 mb-2">
                              At <b>lowercase</b> letter (a-z)
                            </p>
                            <p id="pass-upper" className="invalid fs-12 mb-2">
                              At least <b>uppercase</b> letter (A-Z)
                            </p>
                            <p id="pass-number" className="invalid fs-12 mb-0">
                              A least <b>number</b> (0-9)
                            </p>
                          </div>
                          <div className="mt-4">
                            <button
                              className="btn btn-success w-100"
                              type="submit"
                            >
                              Sign Up
                            </button>
                          </div>
                          <div className="mt-4 text-center">
                            <div className="signin-other-title">
                              <h5 className="fs-13 mb-4 title text-muted">
                                Create account with
                              </h5>
                            </div>
                            <div>
                              <button
                                type="button"
                                className="btn btn-primary btn-icon waves-effect waves-light"
                              >
                                <i className="ri-facebook-fill fs-16" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-icon waves-effect waves-light"
                              >
                                <i className="ri-google-fill fs-16" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-dark btn-icon waves-effect waves-light"
                              >
                                <i className="ri-github-fill fs-16" />
                              </button>
                              <button
                                type="button"
                                className="btn btn-info btn-icon waves-effect waves-light"
                              >
                                <i className="ri-twitter-fill fs-16" />
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                      <div className="mt-5 text-center">
                        <p className="mb-0">
                          Already have an account ?
                          <a
                            href="/login"
                            className="fw-semibold text-primary text-decoration-underline"
                          >
                            Signin
                          </a>
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
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <p className="mb-0">
                  © Velzon. Crafted with
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

export default RegisterPage;
