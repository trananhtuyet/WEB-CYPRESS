import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="container page-section">
      <h1>Page not found</h1>
      <Link to="/" className="primary-button">
        Go back home
      </Link>
    </section>
  );
}

export default NotFound;

