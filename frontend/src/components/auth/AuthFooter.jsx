const AuthFooter = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <p className="mb-0 text-muted">
                &copy; {new Date().getFullYear()} Velzon. Crafted with
                <i className="mdi mdi-heart text-danger" /> by Themesbrand
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;
