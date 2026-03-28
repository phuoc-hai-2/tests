export default function Footer() {
  return (
    <footer className="ds-footer mt-auto">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <h6 className="mb-1" style={{ fontSize: "1.2rem" }}>
              💎 Digital Store
            </h6>
            <small>Nền tảng mua sắm số #1 Việt Nam</small>
          </div>
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <small>Sản phẩm số • Tài khoản • Phần mềm</small>
          </div>
          <div className="col-md-4 text-center text-md-end">
            <small>
              &copy; {new Date().getFullYear()} Digital Store. All rights
              reserved.
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
}
